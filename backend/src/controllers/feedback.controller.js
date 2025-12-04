const db = require('../config/database');

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { rating, status } = req.query;

    let query = `
      SELECT f.*, p.name as patient_name, d.name as doctor_name
      FROM patient_feedback f
      JOIN patients p ON f.patient_id = p.id
      LEFT JOIN doctors d ON f.doctor_id = d.id
      WHERE f.hospital_id = ?
    `;
    const params = [hospitalId];

    if (rating) {
      query += ' AND f.rating = ?';
      params.push(rating);
    }

    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
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
    const { hospitalId } = req.user;
    const {
      patient_id,
      doctor_id,
      appointment_id,
      rating,
      comments,
      service_quality,
      cleanliness,
      staff_behavior
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO patient_feedback (
        patient_id, hospital_id, doctor_id, appointment_id,
        rating, comments, service_quality, cleanliness,
        staff_behavior, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      patient_id, hospitalId, doctor_id, appointment_id,
      rating, comments, service_quality, cleanliness, staff_behavior
    ]);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const { hospitalId } = req.user;

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        AVG(service_quality) as avg_service_quality,
        AVG(cleanliness) as avg_cleanliness,
        AVG(staff_behavior) as avg_staff_behavior,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_feedback
      FROM patient_feedback
      WHERE hospital_id = ? AND status = 'active'
    `, [hospitalId]);

    // Rating distribution
    const [distribution] = await db.query(`
      SELECT rating, COUNT(*) as count
      FROM patient_feedback
      WHERE hospital_id = ? AND status = 'active'
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
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;
    const { status, response } = req.body;

    await db.query(`
      UPDATE patient_feedback 
      SET status = ?, response = ?, responded_at = NOW()
      WHERE id = ? AND hospital_id = ?
    `, [status, response, id, hospitalId]);

    res.json({ message: 'Feedback status updated successfully' });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ message: 'Error updating feedback status', error: error.message });
  }
};
