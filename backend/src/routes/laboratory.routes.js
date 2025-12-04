const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/tests', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [tests] = await db.query('SELECT * FROM lab_tests WHERE hospital_id = ? AND is_active = 1', [hospital_id]);
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tests', authenticate, async (req, res) => {
  try {
    const { hospital_id, test_name, test_code, price, normal_range } = req.body;
    const [result] = await db.query(
      'INSERT INTO lab_tests (hospital_id, test_name, test_code, price, normal_range) VALUES (?, ?, ?, ?, ?)',
      [hospital_id, test_name, test_code, price, normal_range]
    );
    res.status(201).json({ success: true, message: 'Test added', testId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bookings', authenticate, async (req, res) => {
  try {
    const { hospital_id, patient_id, search } = req.query;
    let query = `SELECT lb.*, p.name as patient_name, lt.test_name, lt.price as cost
                 FROM lab_bookings lb 
                 JOIN patients p ON lb.patient_id = p.id 
                 JOIN lab_tests lt ON lb.test_id = lt.id 
                 WHERE lb.hospital_id = ?`;
    const params = [hospital_id];

    if (patient_id) {
      query += ' AND lb.patient_id = ?';
      params.push(patient_id);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR lt.test_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY lb.created_at DESC';
    const [bookings] = await db.query(query, params);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/bookings', authenticate, async (req, res) => {
  try {
    const { hospital_id, patient_id, test_name, doctor_id } = req.body;
    
    // First, find or create the test in lab_tests
    let test_id;
    const [existingTests] = await db.query(
      'SELECT id FROM lab_tests WHERE hospital_id = ? AND test_name = ?',
      [hospital_id, test_name]
    );
    
    if (existingTests.length > 0) {
      test_id = existingTests[0].id;
    } else {
      // Create new test
      const [newTest] = await db.query(
        'INSERT INTO lab_tests (hospital_id, test_name, test_code, price) VALUES (?, ?, ?, ?)',
        [hospital_id, test_name, test_name.substring(0, 10).toUpperCase(), 0]
      );
      test_id = newTest.insertId;
    }
    
    // Now create the booking
    const [result] = await db.query(
      'INSERT INTO lab_bookings (hospital_id, patient_id, test_id, doctor_id, status) VALUES (?, ?, ?, ?, ?)',
      [hospital_id, patient_id, test_id, doctor_id, 'pending']
    );
    
    res.status(201).json({ success: true, message: 'Lab test booked', bookingId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bookings/:id', authenticate, async (req, res) => {
  try {
    const { status, result_value, report_url } = req.body;
    await db.query(
      'UPDATE lab_bookings SET status = ?, result_value = ?, report_url = ? WHERE id = ?',
      [status, result_value, report_url, req.params.id]
    );
    res.json({ success: true, message: 'Lab booking updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
