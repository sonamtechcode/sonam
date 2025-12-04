const db = require('../config/database');

// Get all lab reports
exports.getLabReports = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { patientId, status } = req.query;

    let query = `
      SELECT lr.*, p.name as patient_name, p.phone as patient_phone,
             d.name as doctor_name, u.name as technician_name
      FROM lab_reports lr
      JOIN patients p ON lr.patient_id = p.id
      LEFT JOIN doctors d ON lr.doctor_id = d.id
      LEFT JOIN users u ON lr.technician_id = u.id
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
    const { hospitalId, userId } = req.user;
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
        patient_id, hospital_id, doctor_id, technician_id,
        test_name, test_type, sample_collected_at, results,
        normal_range, remarks, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      patient_id, hospitalId, doctor_id, userId,
      test_name, test_type, sample_collected_at, results,
      normal_range, remarks, status || 'pending'
    ]);

    res.status(201).json({
      message: 'Lab report added successfully',
      id: result.insertId
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
    const { hospitalId } = req.user;
    const updates = req.body;

    if (updates.status === 'completed') {
      updates.completed_at = new Date();
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), hospitalId, id];

    await db.query(`
      UPDATE lab_reports 
      SET ${fields}
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
    const { hospitalId } = req.user;

    await db.query('DELETE FROM lab_reports WHERE id = ? AND hospital_id = ?', [id, hospitalId]);

    res.json({ message: 'Lab report deleted successfully' });
  } catch (error) {
    console.error('Delete lab report error:', error);
    res.status(500).json({ message: 'Error deleting lab report', error: error.message });
  }
};
