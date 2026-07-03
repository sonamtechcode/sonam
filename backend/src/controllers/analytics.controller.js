const db = require('../config/database');

// Get analytics dashboard data
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { startDate, endDate } = req.query;

    // Revenue analytics
    const revenueQuery = `
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as transactions
      FROM billing
      WHERE hospital_id = ?
      ${startDate ? 'AND DATE(created_at) >= ?' : ''}
      ${endDate ? 'AND DATE(created_at) <= ?' : ''}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const params = [hospitalId];
    if (startDate) params.push(startDate);
    if (endDate) params.push(endDate);
    
    const [revenue] = await db.query(revenueQuery, params);

    // Patient statistics
    const [patientStats] = await db.query(`
      SELECT
        COUNT(*) as total_patients,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_patients,
        COUNT(CASE WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) THEN 1 END) as month_patients
      FROM patients
      WHERE hospital_id = ?
    `, [hospitalId]);

    // Appointment statistics
    const [appointmentStats] = await db.query(`
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN DATE(appointment_date) = CURRENT_DATE THEN 1 END) as today_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
      WHERE hospital_id = ?
    `, [hospitalId]);

    // Department-wise patient distribution. Doctors have no department_id FK in this
    // schema, so we match on d.specialization = department name (best-effort, not a
    // real relation), same heuristic used in dashboard.controller.js.
    const [departmentStats] = await db.query(`
      SELECT
        d.name as department,
        COUNT(a.id) as patient_count
      FROM departments d
      LEFT JOIN doctors doc ON doc.hospital_id = d.hospital_id AND doc.specialization = d.name
      LEFT JOIN appointments a ON doc.id = a.doctor_id
      WHERE d.hospital_id = ?
      GROUP BY d.id, d.name
      ORDER BY patient_count DESC
    `, [hospitalId]);

    // Top doctors by appointments
    const [topDoctors] = await db.query(`
      SELECT
        (u.first_name || ' ' || u.last_name) as name,
        doc.specialization,
        COUNT(a.id) as appointment_count,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM doctors doc
      JOIN users u ON doc.user_id = u.id
      LEFT JOIN appointments a ON doc.id = a.doctor_id
      WHERE doc.hospital_id = ?
      GROUP BY doc.id, u.first_name, u.last_name
      ORDER BY appointment_count DESC
      LIMIT 10
    `, [hospitalId]);

    res.json({
      revenue,
      patientStats: patientStats[0],
      appointmentStats: appointmentStats[0],
      departmentStats,
      topDoctors
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const hospitalId = req.user.hospital_id;
    const { period = 'month' } = req.query;

    // billing has no paid_amount column in the real schema; "paid" revenue is derived
    // from total_amount filtered by payment_status instead.
    let groupBy = 'DATE(created_at)';
    let limit = 30;

    if (period === 'year') {
      groupBy = 'EXTRACT(MONTH FROM created_at)';
      limit = 12;
    } else if (period === 'week') {
      groupBy = 'DATE(created_at)';
      limit = 7;
    }

    const [revenue] = await db.query(`
      SELECT
        ${groupBy} as period,
        SUM(total_amount) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status != 'paid' THEN total_amount ELSE 0 END) as pending_revenue,
        COUNT(*) as transaction_count
      FROM billing
      WHERE hospital_id = ?
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT ?
    `, [hospitalId, limit]);

    // Payment method breakdown
    const [paymentMethods] = await db.query(`
      SELECT
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM billing
      WHERE hospital_id = ? AND payment_status = 'paid'
      GROUP BY payment_method
    `, [hospitalId]);

    res.json({ revenue, paymentMethods });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics', error: error.message });
  }
};
