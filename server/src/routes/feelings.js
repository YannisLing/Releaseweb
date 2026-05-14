import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

router.get('/event/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;
    const db = getDatabase();
    
    db.all(
      `SELECT f.* FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE e.user_id = ? AND f.event_id = ? 
       ORDER BY f.created_at`,
      [userId, eventId],
      (err, feelings) => {
        if (err) {
          console.error('Error fetching feelings:', err);
          return res.status(500).json({ error: 'Failed to fetch feelings' });
        }
        res.json(feelings);
      }
    );
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

    db.get('SELECT * FROM events WHERE id = ? AND user_id = ?', [eventId, userId], (err, event) => {
      if (err) {
        console.error('Error checking event:', err);
        return res.status(500).json({ error: 'Failed to create feeling' });
      }
      if (!event) {
        return res.status(403).json({ error: 'Unauthorized: Event does not belong to user' });
      }

      db.run(
        'INSERT INTO feelings (event_id, name) VALUES (?, ?)',
        [eventId, name],
        function(err) {
          if (err) {
            console.error('Error creating feeling:', err);
            return res.status(500).json({ error: 'Failed to create feeling' });
          }
          res.json({ id: this.lastID, eventId, name, released: false, feelingGood: false });
        }
      );
    });
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

    db.get(
      `SELECT * FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE f.id = ? AND e.user_id = ?`,
      [id, userId],
      (err, feeling) => {
        if (err) {
          console.error('Error checking feeling:', err);
          return res.status(500).json({ error: 'Failed to update feeling' });
        }
        if (!feeling) {
          return res.status(403).json({ error: 'Unauthorized: Feeling does not belong to user' });
        }

        db.run(
          'UPDATE feelings SET released = ?, feeling_good = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [released ? 1 : 0, feelingGood ? 1 : 0, id],
          function(err) {
            if (err) {
              console.error('Error updating feeling:', err);
              return res.status(500).json({ error: 'Failed to update feeling' });
            }
            res.json({ success: true, feelingId: id });
          }
        );
      }
    );
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

    db.get(
      `SELECT * FROM feelings f 
       JOIN events e ON f.event_id = e.id 
       WHERE f.id = ? AND e.user_id = ?`,
      [id, userId],
      (err, feeling) => {
        if (err) {
          console.error('Error checking feeling:', err);
          return res.status(500).json({ error: 'Failed to delete feeling' });
        }
        if (!feeling) {
          return res.status(403).json({ error: 'Unauthorized: Feeling does not belong to user' });
        }

        db.run('DELETE FROM feelings WHERE id = ?', [id], function(err) {
          if (err) {
            console.error('Error deleting feeling:', err);
            return res.status(500).json({ error: 'Failed to delete feeling' });
          }
          res.json({ success: true });
        });
      }
    );
  } catch (error) {
    console.error('Error deleting feeling:', error);
    res.status(500).json({ error: 'Failed to delete feeling' });
  }
});

export default router;
