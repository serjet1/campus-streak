const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Toggle mission completion
router.post('/:missionId/toggle', verifyToken, (req, res) => {
  const { missionId } = req.params;
  const { userId } = req.body;

  if (!userId || parseInt(userId) !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Get mission data
  db.get('SELECT * FROM daily_missions WHERE id = ? AND user_id = ?', [missionId, userId], (err, mission) => {
    if (err || !mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const today = new Date().toDateString();
    const missionDate = mission.completed_date ? new Date(mission.completed_date).toDateString() : null;

    // If mission was completed on a different day, reset it
    if (missionDate !== today && mission.completed) {
      db.run(
        'UPDATE daily_missions SET completed = 0, completed_date = NULL WHERE id = ?',
        [missionId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Update failed' });
          }

          // Get current user data
          db.get('SELECT total_xp FROM users WHERE id = ?', [userId], (err, user) => {
            res.json({ success: true, completed: false, total_xp: user.total_xp });
          });
        }
      );
      return;
    }

    // Toggle mission completion
    const newCompletedState = mission.completed ? 0 : 1;
    const completedDate = newCompletedState ? new Date().toISOString() : null;
    const xpDelta = newCompletedState ? mission.xp_value : -mission.xp_value;

    db.run(
      'UPDATE daily_missions SET completed = ?, completed_date = ? WHERE id = ?',
      [newCompletedState, completedDate, missionId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Update failed' });
        }

        // Update user XP
        db.run(
          'UPDATE users SET total_xp = total_xp + ? WHERE id = ?',
          [xpDelta, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Update failed' });
            }

            // Get updated user data
            db.get('SELECT total_xp FROM users WHERE id = ?', [userId], (err, user) => {
              if (err) {
                return res.status(500).json({ error: 'Fetch failed' });
              }

              res.json({
                success: true,
                completed: newCompletedState === 1,
                total_xp: user.total_xp,
                xp_earned: xpDelta
              });
            });
          }
        );
      }
    );
  });
});

module.exports = router;