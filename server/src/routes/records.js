import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.userId;
    
    const records = db.prepare('SELECT * FROM release_records WHERE user_id = ? ORDER BY created_at DESC').all(userId);

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

    const result = db.prepare(
      'INSERT INTO release_records (user_id, feeling_name, intensity, note) VALUES (?, ?, ?, ?)'
    ).run(userId, feelingName, intensity || 5, note || '');

    res.json({
      id: result.lastInsertRowid,
      feelingName,
      intensity: intensity || 5,
      note: note || '',
      createdAt: new Date().toISOString()
    });
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

    db.prepare('DELETE FROM release_records WHERE id = ? AND user_id = ?').run(id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

router.delete('/', (req, res) => {
  try {
    const userId = req.userId;
    const db = getDatabase();

    db.prepare('DELETE FROM release_records WHERE user_id = ?').run(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing records:', error);
    res.status(500).json({ error: 'Failed to clear records' });
  }
});

// 批量导入释放记录
router.post('/import', (req, res) => {
  try {
    const { records } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'records must be an array' });
    }

    const insert = db.prepare(
      'INSERT INTO release_records (user_id, feeling_name, intensity, note, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    let imported = 0;
    const insertMany = db.transaction((items) => {
      for (const r of items) {
        const name = r.feelingName || r.feeling_name || r['感受'];
        if (!name) continue;
        const intensity = Number(r.intensity ?? r['强度'] ?? 5) || 5;
        const note = r.note || r['备注'] || '';
        let createdAt = r.createdAt || r.created_at || r['日期'];
        if (!createdAt) {
          createdAt = new Date().toISOString();
        } else if (!/\d{4}-\d{2}-\d{2}T/.test(createdAt)) {
          const d = new Date(createdAt);
          createdAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        insert.run(userId, name, intensity, note, createdAt);
        imported++;
      }
    });
    insertMany(records);

    res.json({ success: true, imported });
  } catch (error) {
    console.error('Error importing records:', error);
    res.status(500).json({ error: 'Failed to import records' });
  }
});

// 重置该用户的全部练习数据：事件、感受、练习进度、释放记录
router.post('/reset-practice', (req, res) => {
  try {
    const userId = req.userId;
    const db = getDatabase();

    db.prepare('DELETE FROM feelings WHERE event_id IN (SELECT id FROM events WHERE user_id = ?)').run(userId);
    db.prepare('DELETE FROM events WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM practice_progress WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM release_records WHERE user_id = ?').run(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting practice data:', error);
    res.status(500).json({ error: 'Failed to reset practice data' });
  }
});

export default router;
