const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [staff] = await db.query('SELECT id, name, email, role, phone, is_active FROM users WHERE hospital_id = ?', [hospital_id]);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { is_active } = req.body;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    res.json({ success: true, message: 'Staff status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
