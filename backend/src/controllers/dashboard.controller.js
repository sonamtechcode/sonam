const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const { hospital_id } = req.query;

    // Total counts
    const [patients] = await db.query('SELECT COUNT(*) as count FROM patients WHERE hospital_id = ?', [hospital_id]);
    const [doctors] = await db.query('SELECT COUNT(*) as count FROM doctors WHERE hospital_id = ? AND is_active = 1', [hospital_id]);
    const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE hospital_id = ? AND DATE(appointment_date) = CURDATE()', [hospital_id]);
    const [beds] = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "occupied" THEN 1 ELSE 0 END) as occupied FROM beds WHERE hospital_id = ?', [hospital_id]);

    // Revenue today
    const [revenue] = await db.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE hospital_id = ? AND DATE(created_at) = CURDATE()', [hospital_id]);

    // Appointments by status
    const [appointmentStats] = await db.query(
      'SELECT status, COUNT(*) as count FROM appointments WHERE hospital_id = ? AND DATE(appointment_date) = CURDATE() GROUP BY status',
      [hospital_id]
    );

    // Recent appointments
    const [recentAppointments] = await db.query(
      `SELECT a.*, p.name as patient_name, d.name as doctor_name 
       FROM appointments a 
       JOIN patients p ON a.patient_id = p.id 
       JOIN doctors d ON a.doctor_id = d.id 
       WHERE a.hospital_id = ? 
       ORDER BY a.created_at DESC LIMIT 5`,
      [hospital_id]
    );

    // Department-wise patient count
    const [departmentStats] = await db.query(
      `SELECT dep.name, COUNT(a.id) as count 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.id 
       JOIN departments dep ON d.department_id = dep.id 
       WHERE a.hospital_id = ? AND DATE(a.appointment_date) = CURDATE() 
       GROUP BY dep.id`,
      [hospital_id]
    );

    res.json({
      success: true,
      data: {
        totalPatients: patients[0].count,
        totalDoctors: doctors[0].count,
        todayAppointments: appointments[0].count,
        totalBeds: beds[0].total,
        occupiedBeds: beds[0].occupied || 0,
        availableBeds: beds[0].total - (beds[0].occupied || 0),
        todayRevenue: revenue[0].total,
        appointmentStats,
        recentAppointments,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
