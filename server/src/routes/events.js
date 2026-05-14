import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    console.log('=== EVENT CREATE REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body));
    console.log('User ID from auth:', req.userId);

    const { practiceId, exerciseId, situation } = req.body;
    const userId = req.userId;

    if (!userId) {
      console.error('ERROR: userId is undefined/null');
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!practiceId || !exerciseId) {
      console.error('ERROR: Missing required fields - practiceId:', practiceId, 'exerciseId:', exerciseId);
      return res.status(400).json({ error: 'Practice ID and exercise ID are required' });
    }

    console.log('Attempting to get database connection...');
    const db = getDatabase();
    console.log('Database connection obtained successfully');

    const situationText = situation || '';

    console.log('Preparing SQL statement...');
    const stmt = db.prepare(
      'INSERT INTO events (user_id, practice_id, exercise_id, situation) VALUES (?, ?, ?, ?)'
    );
    console.log('SQL statement prepared:', stmt);

    console.log('Executing SQL with params:', [userId, practiceId, exerciseId, situationText]);
    const result = stmt.run(userId, practiceId, exerciseId, situationText);
    
    console.log('SQL execution result:', result);
    console.log('Event created successfully - lastInsertRowid:', result.lastInsertRowid);
    
    console.log('=== EVENT CREATE REQUEST END ===');
    res.json({ id: result.lastInsertRowid, practiceId, exerciseId, situation: situationText });
    
  } catch (error) {
    console.error('=== EVENT CREATE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===');
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.userId;

    const events = db.prepare('SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    console.error('Error stack:', error.stack);
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch events' });
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
    console.error('Error stack:', error.stack);
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
