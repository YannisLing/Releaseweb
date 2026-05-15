import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/event/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    const db = getDatabase();
    
    const feelings = db.prepare(
      `SELECT f.* FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE e.user_id = ? AND f.event_id = ? 
       ORDER BY f.created_at`
    ).all(userId, eventId);
    
    res.json(feelings);
  } catch (error) {
    console.error('Error fetching feelings:', error);
    res.status(500).json({ error: 'Failed to fetch feelings' });
  }
});

router.post('/', (req, res) => {
  try {
    const { eventId, name } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    if (!eventId || !name) {
      return res.status(400).json({ error: 'Event ID and feeling name are required' });
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ? AND user_id = ?').get(eventId, userId);
    if (!event) {
      return res.status(403).json({ error: 'Unauthorized: Event does not belong to user' });
    }

    const result = db.prepare(
      'INSERT INTO feelings (event_id, name) VALUES (?, ?)'
    ).run(eventId, name);
    
    const feelingId = Number(result.lastInsertRowid);
    res.json({ id: feelingId, eventId, name, released: false, feelingGood: false });
  } catch (error) {
    console.error('Error creating feeling:', error);
    res.status(500).json({ error: 'Failed to create feeling' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { released, feelingGood } = req.body;
    const userId = req.userId;
    const db = getDatabase();

    const feeling = db.prepare(
      `SELECT * FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE f.id = ? AND e.user_id = ?`
    ).get(id, userId);
    
    if (!feeling) {
      return res.status(403).json({ error: 'Unauthorized: Feeling does not belong to user' });
    }

    db.prepare(
      'UPDATE feelings SET released = ?, feeling_good = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(released ? 1 : 0, feelingGood ? 1 : 0, id);
    
    res.json({ success: true, feelingId: id });
  } catch (error) {
    console.error('Error updating feeling:', error);
    res.status(500).json({ error: 'Failed to update feeling' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const db = getDatabase();

    const feeling = db.prepare(
      `SELECT * FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE f.id = ? AND e.user_id = ?`
    ).get(id, userId);
    
    if (!feeling) {
      return res.status(403).json({ error: 'Unauthorized: Feeling does not belong to user' });
    }

    db.prepare('DELETE FROM feelings WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feeling:', error);
    res.status(500).json({ error: 'Failed to delete feeling' });
  }
});

export default router;
