import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.userId;
    
    db.all('SELECT * FROM practice_progress WHERE user_id = ? ORDER BY practice_id', [userId], (err, progress) => {
      if (err) {
        console.error('Error fetching practice progress:', err);
        return res.status(500).json({ error: 'Failed to fetch practice progress' });
      }
      res.json(progress);
    });
  } catch (error) {
    console.error('Error fetching practice progress:', error);
    res.status(500).json({ error: 'Failed to fetch practice progress' });
  }
});

router.get('/:practiceId', (req, res) => {
  try {
    const { practiceId } = req.params;
    const userId = req.userId;
    const db = getDatabase();
    
    db.get(
      'SELECT * FROM practice_progress WHERE user_id = ? AND practice_id = ?',
      [userId, practiceId],
      (err, progress) => {
        if (err) {
          console.error('Error fetching practice progress:', err);
          return res.status(500).json({ error: 'Failed to fetch practice progress' });
        }
        res.json(progress || null);
      }
    );
  } catch (error) {
    console.error('Error fetching practice progress:', error);
    res.status(500).json({ error: 'Failed to fetch practice progress' });
  }
});

router.put('/:practiceId', (req, res) => {
  try {
    const { practiceId } = req.params;
    const { attemptsMade, attemptsRequired, completed } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    db.run(
      `INSERT OR REPLACE INTO practice_progress 
       (user_id, practice_id, attempts_made, attempts_required, completed, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, practiceId, attemptsMade, attemptsRequired, completed ? 1 : 0],
      function(err) {
        if (err) {
          console.error('Error updating practice progress:', err);
          return res.status(500).json({ error: 'Failed to update practice progress' });
        }
        res.json({ success: true, practiceId });
      }
    );
  } catch (error) {
    console.error('Error updating practice progress:', error);
    res.status(500).json({ error: 'Failed to update practice progress' });
  }
});

router.delete('/', (req, res) => {
  try {
    const userId = req.userId;
    const db = getDatabase();

    db.run('DELETE FROM practice_progress WHERE user_id = ?', [userId], function(err) {
      if (err) {
        console.error('Error resetting practice progress:', err);
        return res.status(500).json({ error: 'Failed to reset practice progress' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error resetting practice progress:', error);
    res.status(500).json({ error: 'Failed to reset practice progress' });
  }
});

export default router;
