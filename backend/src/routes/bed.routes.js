const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, ward_id, status } = req.query;
    let query = 'SELECT b.*, w.name as ward_name FROM beds b JOIN wards w ON b.ward_id = w.id WHERE 1=1';
    const params = [];

    if (hospital_id) {
      query += ' AND b.hospital_id = ?';
      params.push(hospital_id);
    }
    if (ward_id) {
      query += ' AND b.ward_id = ?';
      params.push(ward_id);
    }
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    const [beds] = await db.query(query, params);
    res.json({ success: true, data: beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, ward_id, bed_number, bed_type } = req.body;
    const [result] = await db.query(
      'INSERT INTO beds (hospital_id, ward_id, bed_number, bed_type, status) VALUES (?, ?, ?, ?, ?)',
      [hospital_id, ward_id, bed_number, bed_type, 'available']
    );
    res.status(201).json({ success: true, message: 'Bed created', bedId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, patient_id } = req.body;
    await db.query('UPDATE beds SET status = ?, patient_id = ? WHERE id = ?', [status, patient_id, req.params.id]);
    res.json({ success: true, message: 'Bed status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
