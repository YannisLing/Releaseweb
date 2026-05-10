import express from 'express';
import { getDatabase } from '../database.js';

const router = express.Router();

// 获取事件的所有感受
router.get('/event/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const db = getDatabase();
    
    db.all(
      'SELECT * FROM feelings WHERE event_id = ? ORDER BY created_at',
      [eventId],
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

// 创建感受
router.post('/', (req, res) => {
  try {
    const { eventId, name } = req.body;
    const db = getDatabase();

    if (!eventId || !name) {
      return res.status(400).json({ error: 'Event ID and feeling name are required' });
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
  } catch (error) {
    console.error('Error creating feeling:', error);
    res.status(500).json({ error: 'Failed to create feeling' });
  }
});

// 更新感受状态
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { released, feelingGood } = req.body;
    const db = getDatabase();

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
  } catch (error) {
    console.error('Error updating feeling:', error);
    res.status(500).json({ error: 'Failed to update feeling' });
  }
});

// 删除感受
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    db.run('DELETE FROM feelings WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting feeling:', err);
        return res.status(500).json({ error: 'Failed to delete feeling' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error deleting feeling:', error);
    res.status(500).json({ error: 'Failed to delete feeling' });
  }
});

export default router;