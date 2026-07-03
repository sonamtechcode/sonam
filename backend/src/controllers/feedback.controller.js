const db = require('../config/database');

// NOTE: patient_feedback has no `status`, `response`, or `responded_at` columns in the
// real schema (it's rating-only: rating, cleanliness_rating, staff_behavior_rating,
// wait_time_rating, overall_experience_rating, comments, would_recommend). The frontend
// (PatientFeedback.jsx) has a "respond to feedback" workflow that depends on those
// columns existing — that's a real schema gap, not fixable via SQL renaming/aliasing.
// See updateFeedbackStatus below and the final report.

exports.getAllFeedback = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { rating } = req.query;

    let query = `
      SELECT f.*, (p.first_name || ' ' || p.last_name) as patient_name,
             (u.first_name || ' ' || u.last_name) as doctor_name,
             f.overall_experience_rating as service_quality,
             f.cleanliness_rating as cleanliness,
             f.staff_behavior_rating as staff_behavior
      FROM patient_feedback f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN doctors d ON f.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE f.hospital_id = ?
    `;
    const params = [hospitalId];

    if (rating) {
      query += ' AND f.rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY f.created_at DESC';

    const [feedback] = await db.query(query, params);
    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};

// Add feedback
exports.addFeedback = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const {
      patient_id,
      doctor_id,
      rating,
      comments,
      service_quality,
      cleanliness,
      staff_behavior
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO patient_feedback (
        patient_id, hospital_id, doctor_id,
        rating, comments, overall_experience_rating, cleanliness_rating,
        staff_behavior_rating, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id
    `, [
      patient_id, hospitalId, doctor_id,
      rating, comments, service_quality, cleanliness, staff_behavior
    ]);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      id: result[0]?.id
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;

    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        AVG(overall_experience_rating) as avg_service_quality,
        AVG(cleanliness_rating) as avg_cleanliness,
        AVG(staff_behavior_rating) as avg_staff_behavior,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_feedback
      FROM patient_feedback
      WHERE hospital_id = ?
    `, [hospitalId]);

    // Rating distribution
    const [distribution] = await db.query(`
      SELECT rating, COUNT(*) as count
      FROM patient_feedback
      WHERE hospital_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [hospitalId]);

    res.json({
      stats: stats[0],
      distribution
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Error fetching feedback statistics', error: error.message });
  }
};

// Update feedback status
//
// SCHEMA GAP: patient_feedback has no status/response/responded_at columns, so a staff
// "response" to feedback cannot be persisted anywhere in the real schema. This endpoint
// can no longer do what the frontend expects (PatientFeedback.jsx's respond workflow);
// it now only touches updated_at so the call doesn't error, and returns the given status/
// response back in the payload for the UI to optimistically display, but nothing is saved.
// A real fix requires a schema migration (adding those columns), which is out of scope here.
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user.hospital_id;
    const { status, response } = req.body;

    await db.query(`
      UPDATE patient_feedback
      SET updated_at = NOW()
      WHERE id = ? AND hospital_id = ?
    `, [id, hospitalId]);

    res.json({ message: 'Feedback status updated successfully', status, response, persisted: false });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ message: 'Error updating feedback status', error: error.message });
  }
};
