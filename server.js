require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Changed from 5000 to 3000
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for user management
function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readUsers();
  const existing = users.find((u) => u.username === username);

  if (existing) {
    if (existing.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    req.session.userId = existing.username;
    return res.json({ created: false, user: { username: existing.username } });
  }

  const newUser = { username, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  writeUsers(users);
  req.session.userId = newUser.username;
  return res.json({ created: true, user: { username: newUser.username } });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Get current user endpoint
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: { username: req.session.userId } });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});