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

export default router;
