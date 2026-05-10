import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// 获取所有练习进度
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    
    db.all('SELECT * FROM practice_progress ORDER BY practice_id', (err, progress) => {
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

// 获取单个练习进度
router.get('/:practiceId', (req, res) => {
  try {
    const { practiceId } = req.params;
    const db = getDatabase();
    
    db.get(
      'SELECT * FROM practice_progress WHERE practice_id = ?',
      [practiceId],
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

// 更新练习进度
router.put('/:practiceId', (req, res) => {
  try {
    const { practiceId } = req.params;
    const { attemptsMade, attemptsRequired, completed } = req.body;
    const db = getDatabase();

    db.run(
      `INSERT OR REPLACE INTO practice_progress 
       (user_id, practice_id, attempts_made, attempts_required, completed, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [1, practiceId, attemptsMade, attemptsRequired, completed ? 1 : 0],
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

// 重置所有练习进度
router.delete('/', (req, res) => {
  try {
    const db = getDatabase();

    db.run('DELETE FROM practice_progress WHERE user_id = 1', function(err) {
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