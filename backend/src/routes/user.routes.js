const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, search, role, is_active } = req.query;
    let query = 'SELECT id, hospital_id, email, name, role, phone, is_active, created_at, updated_at FROM users WHERE hospital_id = ?';
    const params = [hospital_id];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active);
    }

    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(query, params);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, hospital_id, email, name, role, phone, is_active, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user
router.post('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, email, password, name, role, phone, is_active } = req.body;

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [hospital_id, email, hashedPassword, name, role, phone, is_active !== false ? 1 : 0]
    );

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      userId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, role, phone, is_active } = req.body;
    
    await db.query(
      'UPDATE users SET name = ?, role = ?, phone = ?, is_active = ? WHERE id = ?',
      [name, role, phone, is_active !== false ? 1 : 0, req.params.id]
    );

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
