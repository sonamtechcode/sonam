const db = require('../config/database');

exports.getByPatient = async (req, res) => {
  try {
    const [prescriptions] = await db.query(
      `SELECT p.*, d.name as doctor_name 
       FROM prescriptions p 
       LEFT JOIN doctors d ON p.doctor_id = d.id 
       WHERE p.patient_id = ? 
       ORDER BY p.created_at DESC`,
      [req.params.patientId]
    );
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { patient_id, doctor_id, medication, dosage, duration, notes } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, duration, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, medication, dosage, duration, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { medication, dosage, duration, notes } = req.body;
    
    await db.query(
      `UPDATE prescriptions SET medication = ?, dosage = ?, duration = ?, notes = ? 
       WHERE id = ?`,
      [medication, dosage, duration, notes, req.params.id]
    );

    res.json({ success: true, message: 'Prescription updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM prescriptions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
