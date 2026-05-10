import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// 获取所有释放记录
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    
    db.all('SELECT * FROM release_records ORDER BY created_at DESC', (err, records) => {
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

// 保存释放记录
router.post('/', (req, res) => {
  try {
    const { feelingName, intensity, note } = req.body;
    const db = getDatabase();

    if (!feelingName) {
      return res.status(400).json({ error: 'Feeling name is required' });
    }

    db.run(
      'INSERT INTO release_records (user_id, feeling_name, intensity, note) VALUES (?, ?, ?, ?)',
      [1, feelingName, intensity || 5, note || ''],
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

// 删除释放记录
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    db.run('DELETE FROM release_records WHERE id = ?', [id], function(err) {
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

// 清空所有释放记录
router.delete('/', (req, res) => {
  try {
    const db = getDatabase();

    db.run('DELETE FROM release_records WHERE user_id = 1', function(err) {
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