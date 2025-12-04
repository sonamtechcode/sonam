const db = require('../config/database');

// Get all audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { userId, action, module, startDate, endDate } = req.query;

    let query = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.hospital_id = ?
    `;
    const params = [hospitalId];

    if (userId) {
      query += ' AND al.user_id = ?';
      params.push(userId);
    }

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }

    if (module) {
      query += ' AND al.module = ?';
      params.push(module);
    }

    if (startDate) {
      query += ' AND DATE(al.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(al.created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY al.created_at DESC LIMIT 1000';

    const [logs] = await db.query(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

// Create audit log (utility function)
exports.createAuditLog = async (hospitalId, userId, action, module, details, ipAddress) => {
  try {
    await db.query(`
      INSERT INTO audit_logs (
        hospital_id, user_id, action, module, details, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [hospitalId, userId, action, module, JSON.stringify(details), ipAddress]);
  } catch (error) {
    console.error('Create audit log error:', error);
  }
};

// Get audit statistics
exports.getAuditStats = async (req, res) => {
  try {
    const { hospitalId } = req.user;

    // Action distribution
    const [actionStats] = await db.query(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE hospital_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY action
      ORDER BY count DESC
    `, [hospitalId]);

    // Module distribution
    const [moduleStats] = await db.query(`
      SELECT module, COUNT(*) as count
      FROM audit_logs
      WHERE hospital_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY module
      ORDER BY count DESC
    `, [hospitalId]);

    // Most active users
    const [userStats] = await db.query(`
      SELECT u.name, u.email, COUNT(al.id) as activity_count
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.hospital_id = ?
      AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id
      ORDER BY activity_count DESC
      LIMIT 10
    `, [hospitalId]);

    // Daily activity
    const [dailyActivity] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM audit_logs
      WHERE hospital_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [hospitalId]);

    res.json({
      actionStats,
      moduleStats,
      userStats,
      dailyActivity
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ message: 'Error fetching audit statistics', error: error.message });
  }
};

// Export audit logs
exports.exportAuditLogs = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        al.created_at,
        u.name as user_name,
        u.email as user_email,
        al.action,
        al.module,
        al.details,
        al.ip_address
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.hospital_id = ?
    `;
    const params = [hospitalId];

    if (startDate) {
      query += ' AND DATE(al.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(al.created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY al.created_at DESC';

    const [logs] = await db.query(query, params);

    res.json({
      message: 'Audit logs exported successfully',
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ message: 'Error exporting audit logs', error: error.message });
  }
};
