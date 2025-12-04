const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/medicines', authenticate, async (req, res) => {
  try {
    const { hospital_id, search } = req.query;
    let query = 'SELECT * FROM medicines WHERE hospital_id = ?';
    const params = [hospital_id];

    if (search) {
      query += ' AND (name LIKE ? OR generic_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [medicines] = await db.query(query, params);
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/medicines', authenticate, async (req, res) => {
  try {
    const { 
      hospital_id, name, generic_name, manufacturer, batch_no, 
      expiry_date, quantity, price, reorder_level, category, 
      rack_number, description 
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO medicines (
        hospital_id, name, generic_name, manufacturer, batch_no, 
        expiry_date, quantity, price, reorder_level, category, 
        rack_number, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hospital_id, name, generic_name, manufacturer, batch_no, 
        expiry_date, quantity, price, reorder_level, category, 
        rack_number, description
      ]
    );

    res.status(201).json({ success: true, message: 'Medicine added', medicineId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/medicines/:id', authenticate, async (req, res) => {
  try {
    const { quantity, price } = req.body;
    await db.query('UPDATE medicines SET quantity = ?, price = ? WHERE id = ?', [quantity, price, req.params.id]);
    res.json({ success: true, message: 'Medicine updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [medicines] = await db.query(
      'SELECT * FROM medicines WHERE hospital_id = ? AND quantity <= reorder_level',
      [hospital_id]
    );
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
