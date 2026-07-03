const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const { hospital_id } = req.query;

    // Total counts
    const [patients] = await db.query('SELECT COUNT(*) as count FROM patients WHERE hospital_id = ?', [hospital_id]);
    const [doctors] = await db.query(
      `SELECT COUNT(*) as count FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.hospital_id = ? AND u.is_active = true`,
      [hospital_id]
    );
    const [appointments] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE hospital_id = ? AND DATE(appointment_date) = CURRENT_DATE', [hospital_id]);
    const [beds] = await db.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied FROM beds WHERE hospital_id = ?", [hospital_id]);

    // Revenue today
    const [revenue] = await db.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE hospital_id = ? AND DATE(created_at) = CURRENT_DATE', [hospital_id]);

    // Appointments by status
    const [appointmentStats] = await db.query(
      'SELECT status, COUNT(*) as count FROM appointments WHERE hospital_id = ? AND DATE(appointment_date) = CURRENT_DATE GROUP BY status',
      [hospital_id]
    );

    // Recent appointments
    const [recentAppointments] = await db.query(
      `SELECT a.*, (p.first_name || ' ' || p.last_name) as patient_name, (du.first_name || ' ' || du.last_name) as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users du ON d.user_id = du.id
       WHERE a.hospital_id = ?
       ORDER BY a.created_at DESC LIMIT 5`,
      [hospital_id]
    );

    // Department-wise appointment count for today. Doctors have no department_id FK
    // in this schema, so we match on d.specialization = department name (best-effort,
    // not a real relation) rather than fabricate a join that doesn't exist.
    const [departmentStats] = await db.query(
      `SELECT dep.name, COUNT(a.id) as count
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN departments dep ON dep.hospital_id = a.hospital_id AND dep.name = d.specialization
       WHERE a.hospital_id = ? AND DATE(a.appointment_date) = CURRENT_DATE
       GROUP BY dep.id, dep.name`,
      [hospital_id]
    );

    const bedsRow = beds[0] || { total: 0, occupied: 0 };
    const totalBeds = Number(bedsRow.total) || 0;
    const occupiedBeds = Number(bedsRow.occupied) || 0;

    res.json({
      success: true,
      data: {
        totalPatients: Number(patients[0]?.count) || 0,
        totalDoctors: Number(doctors[0]?.count) || 0,
        todayAppointments: Number(appointments[0]?.count) || 0,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        todayRevenue: Number(revenue[0]?.total) || 0,
        appointmentStats,
        recentAppointments,
        departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
