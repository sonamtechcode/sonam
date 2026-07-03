const db = require('../config/database');

// Get medical history for a patient
// NOTE: the real schema's `patient_medical_history` table has no doctor_id, visit_date,
// symptoms, allergies, chronic_conditions, or family_history columns (it only has
// condition_name, diagnosis_date, status, treatment_details, medications, notes). The
// frontend (MedicalHistory.jsx) was built against a richer shape than the DB supports.
// Rather than inventing columns, we alias what maps cleanly (diagnosis_date -> visit_date,
// condition_name -> diagnosis, treatment_details -> treatment) and drop/no-op the fields
// that have no home in the schema. This is a real product/schema gap, not something
// fixable purely in SQL — flagged in the final report.
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const hospitalId = req.user.hospital_id;

    const [history] = await db.query(`
      SELECT mh.*, mh.diagnosis_date as visit_date, mh.condition_name as diagnosis,
             mh.treatment_details as treatment
      FROM patient_medical_history mh
      WHERE mh.patient_id = ? AND mh.hospital_id = ?
      ORDER BY mh.diagnosis_date DESC
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
    const hospitalId = req.user.hospital_id;
    const {
      patient_id,
      visit_date,
      diagnosis,
      treatment,
      medications,
      status,
      notes
      // doctor_id, symptoms, allergies, chronic_conditions, family_history are accepted
      // by the frontend form but have no corresponding column on patient_medical_history
      // in the real schema, so they cannot be persisted here.
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO patient_medical_history (
        patient_id, hospital_id, condition_name, diagnosis_date,
        treatment_details, medications, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id
    `, [
      patient_id, hospitalId, diagnosis, visit_date,
      treatment, medications, status || 'active', notes
    ]);

    res.status(201).json({
      message: 'Medical history added successfully',
      id: result[0]?.id
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
    const hospitalId = req.user.hospital_id;

    // Map the frontend's field names to real patient_medical_history columns, and drop
    // fields that have no column in the real schema (doctor_id, symptoms, allergies,
    // chronic_conditions, family_history).
    const fieldMap = {
      visit_date: 'diagnosis_date',
      diagnosis: 'condition_name',
      treatment: 'treatment_details',
      medications: 'medications',
      status: 'status',
      notes: 'notes'
    };

    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (fieldMap[key]) {
        updates[fieldMap[key]] = value;
      }
    }

    const columns = Object.keys(updates);
    if (columns.length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const fields = columns.map(key => `${key} = ?`).join(', ');
    const values = [...columns.map(key => updates[key]), hospitalId, id];

    await db.query(`
      UPDATE patient_medical_history
      SET ${fields}, updated_at = NOW()
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
    const hospitalId = req.user.hospital_id;

    await db.query('DELETE FROM patient_medical_history WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

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
    const hospitalId = req.user.hospital_id;

    // Latest medical history
    const [latestHistory] = await db.query(`
      SELECT *, diagnosis_date as visit_date, condition_name as diagnosis,
             treatment_details as treatment
      FROM patient_medical_history
      WHERE patient_id = ? AND hospital_id = ?
      ORDER BY diagnosis_date DESC
      LIMIT 1
    `, [patientId, hospitalId]);

    // Latest vitals
    const [latestVitals] = await db.query(`
      SELECT * FROM patient_vitals
      WHERE patient_id = ? AND hospital_id = ?
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [patientId, hospitalId]);

    // Active prescriptions (duration_days is a column, so it needs the interval built
    // dynamically rather than a literal INTERVAL)
    const [activePrescriptions] = await db.query(`
      SELECT * FROM digital_prescriptions
      WHERE patient_id = ? AND hospital_id = ?
      AND (prescription_date + (duration_days || ' days')::interval) >= CURRENT_DATE
      ORDER BY prescription_date DESC
    `, [patientId, hospitalId]);

    // Upcoming appointments
    const [upcomingAppointments] = await db.query(`
      SELECT a.*, (u.first_name || ' ' || u.last_name) as doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ? AND a.hospital_id = ?
      AND a.appointment_date >= CURRENT_DATE
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
