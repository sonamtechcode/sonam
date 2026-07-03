const db = require('../config/database');

// Get all vitals for a patient
exports.getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const hospitalId = req.user.hospital_id;

    const [vitals] = await db.query(`
      SELECT v.*, (u.first_name || ' ' || u.last_name) as recorded_by_name
      FROM patient_vitals v
      LEFT JOIN users u ON v.recorded_by = u.id
      WHERE v.patient_id = ? AND v.hospital_id = ?
      ORDER BY v.recorded_at DESC
    `, [patientId, hospitalId]);

    res.json(vitals);
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ message: 'Error fetching vitals', error: error.message });
  }
};

// Add new vital record
exports.addVitals = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const userId = req.user.id;
    const {
      patient_id,
      temperature,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      pulse_rate, // frontend (PatientVitals.jsx) sends `pulse_rate`; maps to the `heart_rate` column
      respiratory_rate,
      oxygen_saturation,
      weight,
      height,
      bmi,
      blood_sugar,
      notes
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO patient_vitals (
        patient_id, hospital_id, temperature, blood_pressure_systolic,
        blood_pressure_diastolic, heart_rate, respiratory_rate,
        oxygen_saturation, weight, height, bmi, blood_glucose,
        notes, recorded_by, recorded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id
    `, [
      patient_id, hospitalId, temperature, blood_pressure_systolic,
      blood_pressure_diastolic, heart_rate ?? pulse_rate ?? null, respiratory_rate,
      oxygen_saturation, weight, height, bmi, blood_sugar,
      notes, userId
    ]);

    res.status(201).json({
      message: 'Vitals recorded successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Add vitals error:', error);
    res.status(500).json({ message: 'Error recording vitals', error: error.message });
  }
};

// Get latest vitals for a patient
exports.getLatestVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const hospitalId = req.user.hospital_id;

    const [vitals] = await db.query(`
      SELECT v.*, (u.first_name || ' ' || u.last_name) as recorded_by_name
      FROM patient_vitals v
      LEFT JOIN users u ON v.recorded_by = u.id
      WHERE v.patient_id = ? AND v.hospital_id = ?
      ORDER BY v.recorded_at DESC
      LIMIT 1
    `, [patientId, hospitalId]);

    res.json(vitals[0] || null);
  } catch (error) {
    console.error('Get latest vitals error:', error);
    res.status(500).json({ message: 'Error fetching latest vitals', error: error.message });
  }
};

// Update vital record
exports.updateVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;
    const updates = req.body;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), hospitalId, id];

    await db.query(`
      UPDATE patient_vitals 
      SET ${fields}
      WHERE hospital_id = ? AND id = ?
    `, values);

    res.json({ message: 'Vitals updated successfully' });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ message: 'Error updating vitals', error: error.message });
  }
};

// Delete vital record
exports.deleteVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    await db.query('DELETE FROM patient_vitals WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Vitals deleted successfully' });
  } catch (error) {
    console.error('Delete vitals error:', error);
    res.status(500).json({ message: 'Error deleting vitals', error: error.message });
  }
};
