const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user data
router.get('/:userId', verifyToken, (req, res) => {
  const { userId } = req.params;

  // Verify user is accessing their own data
  if (parseInt(userId) !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get daily missions for user
    db.all(
      `SELECT id, mission_name as name, completed, xp_value as xp FROM daily_missions WHERE user_id = ?`,
      [userId],
      (err, missions) => {
        if (err) {
          missions = [];
        }

        // Check if missions should be reset (new day)
        const today = new Date().toDateString();
        const lastActiveDate = user.last_active_date ? new Date(user.last_active_date).toDateString() : null;

        if (lastActiveDate !== today) {
          // Reset missions for new day
          db.run('UPDATE daily_missions SET completed = 0 WHERE user_id = ?', [userId]);
          missions = missions.map(m => ({ ...m, completed: false }));
        }

        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
          streak: user.streak,
          total_xp: user.total_xp,
          last_active_date: user.last_active_date,
          notifications_enabled: user.notifications_enabled,
          daily_missions: missions
        });
      }
    );
  });
});

// Update notification preference
router.patch('/:userId/notifications', verifyToken, (req, res) => {
  const { userId } = req.params;
  const { enabled } = req.body;

  if (parseInt(userId) !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.run(
    'UPDATE users SET notifications_enabled = ? WHERE id = ?',
    [enabled ? 1 : 0, userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Update failed' });
      }
      res.json({ success: true, notifications_enabled: enabled });
    }
  );
});

module.exports = router;