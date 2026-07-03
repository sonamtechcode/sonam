const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    const notifications = result.rows;
    
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    const unreadCount = countResult.rows[0].count;

    res.json({ 
      success: true, 
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create notification (internal use)
router.post('/create', authenticate, async (req, res) => {
  try {
    const { user_id, hospital_id, title, message, type, link } = req.body;
    
    await db.query(
      `INSERT INTO notifications (user_id, hospital_id, title, message, type, link) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id, hospital_id, title, message, type || 'info', link]
    );

    res.json({ success: true, message: 'Notification created' });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
