import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.userId;
    
    db.all('SELECT * FROM release_records WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, records) => {
      if (err) {
        console.error('Error fetching records:', err);
        return res.status(500).json({ error: 'Failed to fetch records' });
      }

      const today = new Date().toDateString();
      const todayCount = records.filter(r => new Date(r.created_at).toDateString() === today).length;

      const avgIntensity = records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.intensity, 0) / records.length * 10) / 10
        : 0;

      res.json({
        records,
        stats: {
          total: records.length,
          today: todayCount,
          avgIntensity
        }
      });
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.post('/', (req, res) => {
  try {
    const { feelingName, intensity, note } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    if (!feelingName) {
      return res.status(400).json({ error: 'Feeling name is required' });
    }

    db.run(
      'INSERT INTO release_records (user_id, feeling_name, intensity, note) VALUES (?, ?, ?, ?)',
      [userId, feelingName, intensity || 5, note || ''],
      function(err) {
        if (err) {
          console.error('Error saving record:', err);
          return res.status(500).json({ error: 'Failed to save record' });
        }

        res.json({
          id: this.lastID,
          feelingName,
          intensity: intensity || 5,
          note: note || '',
          createdAt: new Date().toISOString()
        });
      }
    );
  } catch (error) {
    console.error('Error saving record:', error);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = getDatabase();

    db.run('DELETE FROM release_records WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        console.error('Error deleting record:', err);
        return res.status(500).json({ error: 'Failed to delete record' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

router.delete('/', (req, res) => {
  try {
    const userId = req.userId;
    const db = getDatabase();

    db.run('DELETE FROM release_records WHERE user_id = ?', [userId], function(err) {
      if (err) {
        console.error('Error clearing records:', err);
        return res.status(500).json({ error: 'Failed to clear records' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error clearing records:', error);
    res.status(500).json({ error: 'Failed to clear records' });
  }
});

export default router;
