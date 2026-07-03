const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all hospitals/clinics
exports.getAllHospitals = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*,
        (SELECT COUNT(*) FROM users WHERE hospital_id = h.id) as user_count,
        (SELECT COUNT(*) FROM patients WHERE hospital_id = h.id) as patient_count,
        (SELECT COUNT(*) FROM doctors WHERE hospital_id = h.id) as doctor_count
       FROM hospitals h
       ORDER BY h.created_at DESC`
    );
    const hospitals = result.rows.map(h => ({ ...h, is_active: h.status === 'active' }));

    res.json({ success: true, data: hospitals });
  } catch (error) {
    console.error('Get all hospitals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single hospital
exports.getHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM hospitals WHERE id = $1', [id]);
    const hospitals = result.rows;

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospital = { ...hospitals[0], is_active: hospitals[0].status === 'active' };

    // Get clinic settings - if they exist
    try {
      const settingsResult = await db.query('SELECT * FROM clinic_settings WHERE hospital_id = $1', [id]);
      const settings = settingsResult.rows[0] || null;

      res.json({
        success: true,
        data: {
          ...hospital,
          settings
        }
      });
    } catch (err) {
      // Clinic settings table might not exist, just return hospital data
      res.json({
        success: true,
        data: hospital
      });
    }
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new hospital/clinic
exports.createHospital = async (req, res) => {
  try {
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
    const existingHospital = await db.query('SELECT id FROM hospitals WHERE email = $1', [email]);
    if (existingHospital.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with this email already exists'
      });
    }

    // Check if admin email already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists'
      });
    }

    // Insert hospital
    const hospitalInsert = await db.query(
      `INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active') RETURNING id`,
      [name, address, city, state, pincode, phone, email, registration_no]
    );

    const hospitalId = hospitalInsert.rows[0].id;

    // Create admin user
    const username = (admin_email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'admin') + hospitalId;
    const hashedPassword = await bcrypt.hash(admin_password || 'admin123', 10);
    await db.query(
      `INSERT INTO users (hospital_id, username, email, password_hash, first_name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, 'admin', $6, true)`,
      [hospitalId, username, admin_email, hashedPassword, admin_name, admin_phone]
    );

    // Create clinic settings (best-effort: skip quietly if the table isn't provisioned yet)
    try {
      await db.query(
        `INSERT INTO clinic_settings (hospital_id, clinic_name, logo_url, primary_color, secondary_color, header_text, footer_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
    } catch (err) {
      console.warn('Skipping clinic_settings insert:', err.message);
    }

    // Create default departments
    const departments = [
      'General Medicine', 'Pediatrics', 'Orthopedics', 'Cardiology',
      'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology', 'Dentistry', 'Emergency'
    ];

    for (const dept of departments) {
      await db.query(
        'INSERT INTO departments (hospital_id, name) VALUES ($1, $2)',
        [hospitalId, dept]
      );
    }

    // Create default wards (best-effort: skip quietly if the table isn't provisioned yet)
    const wards = [
      ['General Ward', 'general', 20],
      ['ICU', 'icu', 10],
      ['Private Ward', 'private', 5]
    ];

    for (const [wardName, type, beds] of wards) {
      try {
        await db.query(
          'INSERT INTO wards (hospital_id, name, ward_type, total_beds) VALUES ($1, $2, $3, $4)',
          [hospitalId, wardName, type, beds]
        );
      } catch (err) {
        console.warn('Skipping ward insert:', err.message);
      }
    }

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
    console.error('Create hospital error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.is_active; // derived from `status`, not a real column

    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const values = columns.map(col => updateData[col]);

    await db.query(
      `UPDATE hospitals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${columns.length + 1}`,
      [...values, id]
    );

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

    await db.query('UPDATE hospitals SET status = ? WHERE id = ?', [is_active ? 'active' : 'inactive', id]);

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
