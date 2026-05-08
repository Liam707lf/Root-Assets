require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();
// Configurable port: Uses Replit's default (5000) or falls back to 3000 for local testing
const PORT = process.env.PORT || 5000 || 3000;
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

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
}

// Helper functions for user management
function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading users.json:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing to users.json:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = readUsers();
  const existing = users.find(u => u.username === username);

  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    username,
    password,
    createdAt: new Date().toISOString(),
    games: [],  // Initialize gameplay history
    wins: 0,
    losses: 0
  };
  users.push(newUser);
  writeUsers(users);

  res.json({ created: true, user: { username: newUser.username } });
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
    return res.json({ created: false, user: { username: existing.username, wins: existing.wins, losses: existing.losses } });
  }

  const newUser = { username, password, createdAt: new Date().toISOString(), games: [], wins: 0, losses: 0 };
  users.push(newUser);
  writeUsers(users);
  req.session.userId = newUser.username;
  return res.json({ created: true, user: { username: newUser.username, wins: newUser.wins, losses: newUser.losses } });
});

// Update user stats endpoint
app.post('/api/update-stats', (req, res) => {
  const { username, result } = req.body;
  if (!username || !result) {
    return res.status(400).json({ error: 'Username and result are required' });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user stats
  users[userIndex].games = users[userIndex].games || [];
  users[userIndex].games.push({ result, date: new Date().toISOString() });
  users[userIndex].wins = (users[userIndex].wins || 0) + (result === 'win' ? 1 : 0);
  users[userIndex].losses = (users[userIndex].losses || 0) + (result === 'loss' ? 1 : 0);

  writeUsers(users);
  res.json({ success: true, user: users[userIndex] });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Get current user endpoint
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const users = readUsers();
  const user = users.find(u => u.username === req.session.userId);
  if (!user) return res.json({ user: null });
  res.json({ user: { username: user.username, wins: user.wins, losses: user.losses } });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});