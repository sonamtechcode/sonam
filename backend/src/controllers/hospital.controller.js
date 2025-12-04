const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all hospitals/clinics
exports.getAllHospitals = async (req, res) => {
  try {
    const [hospitals] = await db.query(
      `SELECT h.*, 
        (SELECT COUNT(*) FROM users WHERE hospital_id = h.id) as user_count,
        (SELECT COUNT(*) FROM patients WHERE hospital_id = h.id) as patient_count,
        (SELECT COUNT(*) FROM doctors WHERE hospital_id = h.id) as doctor_count
       FROM hospitals h 
       ORDER BY h.created_at DESC`
    );

    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single hospital
exports.getHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const [hospitals] = await db.query('SELECT * FROM hospitals WHERE id = ?', [id]);

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Get clinic settings
    const [settings] = await db.query('SELECT * FROM clinic_settings WHERE hospital_id = ?', [id]);

    res.json({ 
      success: true, 
      data: {
        ...hospitals[0],
        settings: settings[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new hospital/clinic
exports.createHospital = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      name, address, city, state, pincode, phone, email, registration_no,
      admin_name, admin_email, admin_phone, admin_password,
      logo_url, primary_color, secondary_color, header_text, footer_text
    } = req.body;

    // Validate required fields
    if (!name || !email || !admin_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hospital name, email, and admin email are required' 
      });
    }

    // Check if email already exists
    const [existingHospital] = await connection.query(
      'SELECT id FROM hospitals WHERE email = ?',
      [email]
    );

    if (existingHospital.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Hospital with this email already exists' 
      });
    }

    // Check if admin email already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [admin_email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Admin email already exists' 
      });
    }

    // Insert hospital
    const [hospitalResult] = await connection.query(
      `INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, address, city, state, pincode, phone, email, registration_no]
    );

    const hospitalId = hospitalResult.insertId;

    // Create admin user
    const hashedPassword = await bcrypt.hash(admin_password || 'admin123', 10);
    await connection.query(
      `INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) 
       VALUES (?, ?, ?, ?, 'admin', ?, 1)`,
      [hospitalId, admin_email, hashedPassword, admin_name, admin_phone]
    );

    // Create clinic settings
    await connection.query(
      `INSERT INTO clinic_settings (hospital_id, clinic_name, logo_url, primary_color, secondary_color, header_text, footer_text) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        hospitalId, 
        name, 
        logo_url || null, 
        primary_color || '#3b82f6', 
        secondary_color || '#1d4ed8',
        header_text || null,
        footer_text || null
      ]
    );

    // Create default departments
    const departments = [
      'General Medicine', 'Pediatrics', 'Orthopedics', 'Cardiology',
      'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology', 'Dentistry', 'Emergency'
    ];

    for (const dept of departments) {
      await connection.query(
        'INSERT INTO departments (hospital_id, name, is_active) VALUES (?, ?, 1)',
        [hospitalId, dept]
      );
    }

    // Create default wards
    const wards = [
      ['General Ward', 'general', 20],
      ['ICU', 'icu', 10],
      ['Private Ward', 'private', 5]
    ];

    for (const [wardName, type, beds] of wards) {
      await connection.query(
        'INSERT INTO wards (hospital_id, name, ward_type, total_beds, is_active) VALUES (?, ?, ?, ?, 1)',
        [hospitalId, wardName, type, beds]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: {
        id: hospitalId,
        name,
        admin_email,
        admin_password: admin_password || 'admin123'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create hospital error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    await db.query('UPDATE hospitals SET ? WHERE id = ?', [updateData, id]);

    res.json({ success: true, message: 'Hospital updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's the last hospital
    const [hospitals] = await db.query('SELECT COUNT(*) as count FROM hospitals');
    if (hospitals[0].count <= 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete the last hospital' 
      });
    }

    await db.query('DELETE FROM hospitals WHERE id = ?', [id]);

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle hospital active status
exports.toggleHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await db.query('UPDATE hospitals SET is_active = ? WHERE id = ?', [is_active, id]);

    res.json({ 
      success: true, 
      message: `Hospital ${is_active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get hospital statistics
exports.getHospitalStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [stats] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM patients WHERE hospital_id = ?) as total_patients,
        (SELECT COUNT(*) FROM doctors WHERE hospital_id = ?) as total_doctors,
        (SELECT COUNT(*) FROM users WHERE hospital_id = ?) as total_users,
        (SELECT COUNT(*) FROM appointments WHERE hospital_id = ?) as total_appointments,
        (SELECT COUNT(*) FROM departments WHERE hospital_id = ?) as total_departments,
        (SELECT COUNT(*) FROM beds WHERE hospital_id = ?) as total_beds,
        (SELECT COUNT(*) FROM beds WHERE hospital_id = ? AND status = 'available') as available_beds,
        (SELECT SUM(total_amount) FROM billing WHERE hospital_id = ?) as total_revenue`,
      [id, id, id, id, id, id, id, id]
    );

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
