import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.userId;

    const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/practice/:practiceId', (req, res) => {
  try {
    const { practiceId } = req.params;
    const userId = req.userId;
    const db = getDatabase();

    const events = db.prepare(
      'SELECT * FROM events WHERE user_id = ? AND practice_id = ? ORDER BY created_at'
    ).all(userId, practiceId);
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', (req, res) => {
  try {
    const { practiceId, exerciseId, situation } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    if (!practiceId || !exerciseId) {
      return res.status(400).json({ error: 'Practice ID and exercise ID are required' });
    }

    const situationText = situation || '';

    const result = db.prepare(
      'INSERT INTO events (user_id, practice_id, exercise_id, situation) VALUES (?, ?, ?, ?)'
    ).run(userId, practiceId, exerciseId, situationText);
    
    res.json({ id: result.lastInsertRowid, practiceId, exerciseId, situation: situationText });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { situation, completed } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    const situationText = situation !== undefined ? situation : '';
    const completedValue = completed !== undefined ? (completed ? 1 : 0) : 0;

    db.prepare(
      'UPDATE events SET situation = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    ).run(situationText, completedValue, id, userId);
    
    res.json({ success: true, eventId: id });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = getDatabase();

    db.prepare('DELETE FROM feelings WHERE event_id = ?').run(id);
    db.prepare('DELETE FROM events WHERE id = ? AND user_id = ?').run(id, userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
