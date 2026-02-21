const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate streak
function calculateStreak(userId, callback) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get all checkins for this user
  db.all(
    'SELECT checkin_date FROM checkin_history WHERE user_id = ? ORDER BY checkin_date DESC',
    [userId],
    (err, checkins) => {
      if (err || !checkins || checkins.length === 0) {
        callback(0);
        return;
      }

      let streak = 0;
      let currentDate = new Date();

      for (const checkin of checkins) {
        const checkinDate = new Date(checkin.checkin_date);
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - streak);

        if (checkinDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      callback(streak);
    }
  );
}

// Daily check-in
router.post('/', verifyToken, (req, res) => {
  const { userId } = req.body;

  if (!userId || parseInt(userId) !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Get user data
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const today = new Date().toDateString();
    const lastActiveDate = user.last_active_date ? new Date(user.last_active_date).toDateString() : null;

    // Check if already checked in today
    if (lastActiveDate === today) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const checkinDate = new Date().toISOString();
    const newXP = user.total_xp + 10;

    // Record check-in
    db.run(
      'INSERT INTO checkin_history (user_id, checkin_date, xp_earned) VALUES (?, ?, ?)',
      [userId, checkinDate, 10],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Check-in failed' });
        }

        // Calculate new streak
        calculateStreak(userId, (streak) => {
          // Check if streak should be reset (missed a day)
          let finalStreak = streak;
          if (lastActiveDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            // If last active date is not today or yesterday, reset streak
            if (lastActiveDate !== yesterdayStr && lastActiveDate !== today) {
              finalStreak = 1;
            }
          }

          // Update user data
          db.run(
            'UPDATE users SET streak = ?, total_xp = ?, last_active_date = ? WHERE id = ?',
            [finalStreak, newXP, checkinDate, userId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Update failed' });
              }

              res.json({
                success: true,
                streak: finalStreak,
                total_xp: newXP,
                last_active_date: checkinDate,
                xp_earned: 10
              });
            }
          );
        });
      }
    );
  });
});

module.exports = router;