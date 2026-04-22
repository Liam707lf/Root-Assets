const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Loads your Groq API key from .env [cite: 30]

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Allows Express to parse JSON and form data sent from main.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all files in the /public folder (index.html, styles.css, main.js) 
app.use(express.static('public'));

// Configure sessions for login tracking [cite: 31]
app.use(session({
    secret: 'tic-tac-toe-secret', // In a real app, this would be in .env
    resave: false,
    saveUninitialized: true
}));

// --- Helper Functions for Data  ---
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

const getUsers = () => {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// --- Auth Routes (CP02-accounts) [cite: 61] ---

// 1. Sign Up
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "User already exists!" });
    }

    // Storing passwords in plaintext as per project security rules 
    users.push({ username, password }); 
    saveUsers(users);
    res.json({ message: "Account created! You can now log in." });
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = { username: user.username };
        res.json({ message: "Login successful!", user: req.session.user });
    } else {
        res.status(401).json({ message: "Invalid username or password." });
    }
});

// 3. Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out." });
});

// Start the server [cite: 39]
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});