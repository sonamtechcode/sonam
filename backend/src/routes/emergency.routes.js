const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id } = req.query;
    const [cases] = await db.query(
      'SELECT e.*, p.name as patient_name FROM emergency_cases e JOIN patients p ON e.patient_id = p.id WHERE e.hospital_id = ? ORDER BY e.created_at DESC',
      [hospital_id]
    );
    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      hospital_id, patient_id, patient_name, age, gender, contact_number,
      complaint, symptoms, severity, status, 
      blood_pressure, heart_rate, temperature, oxygen_level,
      doctor_name, initial_treatment, notes
    } = req.body;
    
    const vital_signs = {
      blood_pressure,
      heart_rate,
      temperature,
      oxygen_level
    };
    
    const [result] = await db.query(
      `INSERT INTO emergency_cases (
        hospital_id, patient_id, patient_name, age, gender, contact_number,
        complaint, symptoms, severity, status, vital_signs, 
        doctor_name, initial_treatment, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hospital_id, patient_id, patient_name, age, gender, contact_number,
        complaint, symptoms, severity, status || 'admitted', JSON.stringify(vital_signs),
        doctor_name, initial_treatment, notes
      ]
    );
    res.status(201).json({ success: true, message: 'Emergency case registered', caseId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE emergency_cases SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Emergency case status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
