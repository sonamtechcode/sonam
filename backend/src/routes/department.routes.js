const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [departments] = await db.query('SELECT * FROM departments WHERE hospital_id = ? AND is_active = 1', [hospital_id]);
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, name, code, description, head_name, contact_number, floor, total_beds } = req.body;
    const [result] = await db.query(
      'INSERT INTO departments (hospital_id, name, code, description, head_name, contact_number, floor, total_beds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [hospital_id, name, code, description, head_name, contact_number, floor, total_beds]
    );
    res.status(201).json({ success: true, message: 'Department created', departmentId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, head_doctor_id } = req.body;
    await db.query('UPDATE departments SET name = ?, description = ?, head_doctor_id = ? WHERE id = ?',
      [name, description, head_doctor_id, req.params.id]);
    res.json({ success: true, message: 'Department updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
