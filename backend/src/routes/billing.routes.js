const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, patient_id } = req.query;
    let query = 'SELECT b.*, p.name as patient_name FROM billing b JOIN patients p ON b.patient_id = p.id WHERE 1=1';
    const params = [];

    if (hospital_id) {
      query += ' AND b.hospital_id = ?';
      params.push(hospital_id);
    }
    if (patient_id) {
      query += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    query += ' ORDER BY b.created_at DESC';
    const [bills] = await db.query(query, params);
    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, patient_id, items, total_amount, discount, tax, payment_method, payment_status } = req.body;
    
    // Auto-generate bill number
    const billNumber = `BILL-${hospital_id}-${Date.now()}`;
    
    const [result] = await db.query(
      'INSERT INTO billing (hospital_id, patient_id, bill_number, items, total_amount, discount, tax, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [hospital_id, patient_id, billNumber, JSON.stringify(items), total_amount, discount || 0, tax || 0, payment_method, payment_status || 'pending']
    );

    res.status(201).json({ success: true, message: 'Bill created', billId: result.insertId, billNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const [bills] = await db.query(
      'SELECT b.*, p.name as patient_name, p.phone, p.address FROM billing b JOIN patients p ON b.patient_id = p.id WHERE b.id = ?',
      [req.params.id]
    );
    if (bills.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.json({ success: true, data: bills[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
