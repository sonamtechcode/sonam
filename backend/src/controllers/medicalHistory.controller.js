const db = require('../config/database');

// Get medical history for a patient
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospitalId } = req.user;

    const [history] = await db.query(`
      SELECT mh.*, d.name as doctor_name, d.specialization
      FROM medical_history mh
      LEFT JOIN doctors d ON mh.doctor_id = d.id
      WHERE mh.patient_id = ? AND mh.hospital_id = ?
      ORDER BY mh.visit_date DESC
    `, [patientId, hospitalId]);

    res.json(history);
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({ message: 'Error fetching medical history', error: error.message });
  }
};

// Add medical history record
exports.addMedicalHistory = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const {
      patient_id,
      doctor_id,
      visit_date,
      diagnosis,
      symptoms,
      treatment,
      medications,
      allergies,
      chronic_conditions,
      family_history,
      notes
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO medical_history (
        patient_id, hospital_id, doctor_id, visit_date, diagnosis,
        symptoms, treatment, medications, allergies, chronic_conditions,
        family_history, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      patient_id, hospitalId, doctor_id, visit_date, diagnosis,
      symptoms, treatment, medications, allergies, chronic_conditions,
      family_history, notes
    ]);

    res.status(201).json({
      message: 'Medical history added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Add medical history error:', error);
    res.status(500).json({ message: 'Error adding medical history', error: error.message });
  }
};

// Update medical history
exports.updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), hospitalId, id];

    await db.query(`
      UPDATE medical_history 
      SET ${fields}
      WHERE hospital_id = ? AND id = ?
    `, values);

    res.json({ message: 'Medical history updated successfully' });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({ message: 'Error updating medical history', error: error.message });
  }
};

// Delete medical history
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;

    await db.query('DELETE FROM medical_history WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Medical history deleted successfully' });
  } catch (error) {
    console.error('Delete medical history error:', error);
    res.status(500).json({ message: 'Error deleting medical history', error: error.message });
  }
};

// Get patient summary (latest records)
exports.getPatientSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospitalId } = req.user;

    // Latest medical history
    const [latestHistory] = await db.query(`
      SELECT * FROM medical_history
      WHERE patient_id = ? AND hospital_id = ?
      ORDER BY visit_date DESC
      LIMIT 1
    `, [patientId, hospitalId]);

    // Latest vitals
    const [latestVitals] = await db.query(`
      SELECT * FROM patient_vitals
      WHERE patient_id = ? AND hospital_id = ?
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [patientId, hospitalId]);

    // Active prescriptions
    const [activePrescriptions] = await db.query(`
      SELECT * FROM prescriptions
      WHERE patient_id = ? AND hospital_id = ?
      AND DATE_ADD(prescription_date, INTERVAL duration_days DAY) >= CURDATE()
      ORDER BY prescription_date DESC
    `, [patientId, hospitalId]);

    // Upcoming appointments
    const [upcomingAppointments] = await db.query(`
      SELECT a.*, d.name as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ? AND a.hospital_id = ?
      AND a.appointment_date >= CURDATE()
      ORDER BY a.appointment_date, a.appointment_time
      LIMIT 5
    `, [patientId, hospitalId]);

    res.json({
      latestHistory: latestHistory[0] || null,
      latestVitals: latestVitals[0] || null,
      activePrescriptions,
      upcomingAppointments
    });
  } catch (error) {
    console.error('Get patient summary error:', error);
    res.status(500).json({ message: 'Error fetching patient summary', error: error.message });
  }
};
