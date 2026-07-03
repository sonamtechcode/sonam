const db = require('../config/database');

// NOTE: the real table is `digital_prescriptions` (not `prescriptions`), one row per
// medicine. medication -> medicine_name, duration -> duration_days, notes -> instructions.
// hospital_id and doctor_id are NOT NULL on this table.

exports.getByPatient = async (req, res) => {
  try {
    const [prescriptions] = await db.query(
      `SELECT p.*, (u.first_name || ' ' || u.last_name) as doctor_name
       FROM digital_prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       LEFT JOIN users u ON d.user_id = u.id
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
    const hospitalId = req.user.hospital_id;
    const { patient_id, doctor_id, medication, dosage, duration, notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO digital_prescriptions (hospital_id, patient_id, doctor_id, medicine_name, dosage, duration_days, instructions, prescription_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active') RETURNING id`,
      [hospitalId, patient_id, doctor_id, medication, dosage, duration, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      id: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { medication, dosage, duration, notes } = req.body;

    await db.query(
      `UPDATE digital_prescriptions SET medicine_name = ?, dosage = ?, duration_days = ?, instructions = ?, updated_at = NOW()
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
    await db.query('DELETE FROM digital_prescriptions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
