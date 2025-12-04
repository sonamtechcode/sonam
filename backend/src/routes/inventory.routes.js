const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [items] = await db.query('SELECT * FROM inventory WHERE hospital_id = ?', [hospital_id]);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      hospital_id, item_name, category, quantity, unit, 
      purchase_date, purchase_price, supplier_name, supplier_contact,
      warranty_expiry, location, serial_number, condition, 
      description, notes 
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO inventory (
        hospital_id, item_name, category, quantity, unit, 
        purchase_date, purchase_price, supplier_name, supplier_contact,
        warranty_expiry, location, serial_number, \`condition\`, 
        description, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hospital_id, item_name, category, quantity, unit, 
        purchase_date, purchase_price, supplier_name, supplier_contact,
        warranty_expiry, location, serial_number, condition, 
        description, notes
      ]
    );
    res.status(201).json({ success: true, message: 'Inventory item added', itemId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
