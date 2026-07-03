const db = require('../config/database');

// NOTE: the real `lab_reports` table has no doctor_id/technician_id/test_type/
// sample_collected_at/remarks/completed_at columns. It has a single `ordered_by`
// column (FK -> users.id, not doctors.id), `test_code` (closest fit for the
// frontend's "test_type" dropdown), `sample_collected_date`, and `notes` (closest
// fit for "remarks"). The frontend's doctor_id is a doctors.id, so it's resolved
// to the doctor's linked user_id via a subquery before being stored in ordered_by.

exports.getLabReports = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { patientId, status } = req.query;

    let query = `
      SELECT lr.*, (p.first_name || ' ' || p.last_name) as patient_name, p.phone as patient_phone,
             (u.first_name || ' ' || u.last_name) as doctor_name,
             lr.test_code as test_type, lr.sample_collected_date as sample_collected_at,
             lr.notes as remarks
      FROM lab_reports lr
      JOIN patients p ON lr.patient_id = p.id
      LEFT JOIN users u ON lr.ordered_by = u.id
      WHERE lr.hospital_id = ?
    `;
    const params = [hospitalId];

    if (patientId) {
      query += ' AND lr.patient_id = ?';
      params.push(patientId);
    }

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [reports] = await db.query(query, params);
    res.json(reports);
  } catch (error) {
    console.error('Get lab reports error:', error);
    res.status(500).json({ message: 'Error fetching lab reports', error: error.message });
  }
};

// Add lab report
exports.addLabReport = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      patient_id,
      doctor_id,
      test_name,
      test_type,
      sample_collected_at,
      results,
      normal_range,
      remarks,
      status
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO lab_reports (
        patient_id, hospital_id, ordered_by,
        test_name, test_code, sample_collected_date, results,
        normal_range, notes, status, ordered_date, created_at
      ) VALUES (?, ?, (SELECT user_id FROM doctors WHERE id = ?), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id
    `, [
      patient_id, hospitalId, doctor_id || null,
      test_name, test_type, sample_collected_at, results,
      normal_range, remarks, status || 'pending'
    ]);

    res.status(201).json({
      message: 'Lab report added successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Add lab report error:', error);
    res.status(500).json({ message: 'Error adding lab report', error: error.message });
  }
};

// Update lab report
exports.updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    // Map frontend field names to real columns; drop fields with no real home
    // (completed_at has no column on lab_reports).
    const fieldMap = {
      test_type: 'test_code',
      sample_collected_at: 'sample_collected_date',
      remarks: 'notes',
      test_name: 'test_name',
      results: 'results',
      normal_range: 'normal_range',
      status: 'status'
    };

    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (fieldMap[key]) {
        updates[fieldMap[key]] = value;
      }
    }
    if (updates.status === 'completed') {
      updates.report_date = new Date();
    }

    const columns = Object.keys(updates);
    if (columns.length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const fields = columns.map(key => `${key} = ?`).join(', ');
    const values = [...columns.map(key => updates[key]), hospitalId, id];

    await db.query(`
      UPDATE lab_reports
      SET ${fields}, updated_at = NOW()
      WHERE hospital_id = ? AND id = ?
    `, values);

    res.json({ message: 'Lab report updated successfully' });
  } catch (error) {
    console.error('Update lab report error:', error);
    res.status(500).json({ message: 'Error updating lab report', error: error.message });
  }
};

// Delete lab report
exports.deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    await db.query('DELETE FROM lab_reports WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Lab report deleted successfully' });
  } catch (error) {
    console.error('Delete lab report error:', error);
    res.status(500).json({ message: 'Error deleting lab report', error: error.message });
  }
};
