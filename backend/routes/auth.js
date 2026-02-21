const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
    [email, username, passwordHash],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email or username already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }

      const userId = this.lastID;
      const token = generateToken(userId);

      // Create initial daily missions for user
      const missions = [
        { name: 'Attended lectures today', xp: 5 },
        { name: 'Read something today', xp: 5 },
        { name: 'Didn\'t skip class', xp: 5 }
      ];

      missions.forEach(mission => {
        db.run(
          'INSERT INTO daily_missions (user_id, mission_name, xp_value) VALUES (?, ?, ?)',
          [userId, mission.name, mission.xp]
        );
      });

      res.json({ token, userId, message: 'Registration successful' });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT id, password_hash FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.json({ token, userId: user.id, message: 'Login successful' });
  });
});

module.exports = router;