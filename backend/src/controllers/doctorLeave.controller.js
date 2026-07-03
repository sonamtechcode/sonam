const db = require('../config/database');

// Get all doctor leaves
exports.getDoctorLeaves = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { doctorId, status } = req.query;

    let query = `
      SELECT dl.*, (du.first_name || ' ' || du.last_name) as doctor_name, d.specialization,
             (au.first_name || ' ' || au.last_name) as approved_by_name
      FROM doctor_leaves dl
      JOIN doctors d ON dl.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      LEFT JOIN users au ON dl.approved_by = au.id
      WHERE dl.hospital_id = ?
    `;
    const params = [hospitalId];

    if (doctorId) {
      query += ' AND dl.doctor_id = ?';
      params.push(doctorId);
    }

    if (status) {
      query += ' AND dl.status = ?';
      params.push(status);
    }

    query += ' ORDER BY dl.created_at DESC';

    const [leaves] = await db.query(query, params);
    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      doctor_id,
      leave_type,
      start_date,
      end_date,
      reason
    } = req.body;

    // Check for overlapping leaves
    const [existing] = await db.query(`
      SELECT id FROM doctor_leaves
      WHERE doctor_id = ? AND hospital_id = ?
      AND status != 'rejected'
      AND (
        (leave_start_date <= ? AND leave_end_date >= ?) OR
        (leave_start_date <= ? AND leave_end_date >= ?) OR
        (leave_start_date >= ? AND leave_end_date <= ?)
      )
    `, [doctor_id, hospitalId, start_date, start_date, end_date, end_date, start_date, end_date]);

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Leave dates overlap with existing leave' });
    }

    const [result] = await db.query(`
      INSERT INTO doctor_leaves (
        doctor_id, hospital_id, leave_type, leave_start_date, leave_end_date,
        reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW()) RETURNING id
    `, [doctor_id, hospitalId, leave_type, start_date, end_date, reason]);

    res.status(201).json({
      message: 'Leave application submitted successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Error applying for leave', error: error.message });
  }
};

// Approve/Reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;
    const userId = req.user.id;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // NOTE: doctor_leaves has no approved_at/rejection_reason columns in the real schema,
    // so those can't be persisted. Only status + approved_by are stored.
    await db.query(`
      UPDATE doctor_leaves
      SET status = ?, approved_by = ?
      WHERE id = ? AND hospital_id = ?
    `, [status, userId, id, hospitalId]);

    res.json({ message: `Leave ${status} successfully` });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Error updating leave status', error: error.message });
  }
};

// Cancel leave
exports.cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;

    await db.query(`
      UPDATE doctor_leaves
      SET status = 'cancelled'
      WHERE id = ? AND hospital_id = ? AND status = 'pending'
    `, [id, hospitalId]);

    res.json({ message: 'Leave cancelled successfully' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Error cancelling leave', error: error.message });
  }
};

// Get leave balance for a doctor
exports.getLeaveBalance = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const hospitalId = req.user.hospital_id;

    const [leaves] = await db.query(`
      SELECT
        leave_type,
        COUNT(*) as count,
        SUM((leave_end_date - leave_start_date) + 1) as total_days
      FROM doctor_leaves
      WHERE doctor_id = ? AND hospital_id = ?
      AND status = 'approved'
      AND EXTRACT(YEAR FROM leave_start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY leave_type
    `, [doctorId, hospitalId]);

    // Keys must match the doctor_leaves.leave_type CHECK constraint values
    // ('sick', 'casual', 'emergency', 'vacation', 'training').
    const balance = {
      sick: { taken: 0, total: 12 },
      casual: { taken: 0, total: 15 },
      emergency: { taken: 0, total: 5 },
      vacation: { taken: 0, total: 20 },
      training: { taken: 0, total: 5 }
    };

    leaves.forEach(leave => {
      if (balance[leave.leave_type]) {
        balance[leave.leave_type].taken = leave.total_days;
        balance[leave.leave_type].remaining = balance[leave.leave_type].total - leave.total_days;
      }
    });

    res.json(balance);
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
};
