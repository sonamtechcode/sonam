const db = require('../config/database');
const bcrypt = require('bcryptjs');

// NOTE: the real `doctors` table has no name/email/phone/department_id/is_active/
// availability columns. A doctor's name/email/phone live on the linked `users` row
// (doctors.user_id -> users.id), and "is active" is users.is_active. There is also no
// doctor<->department relation in the real schema, so department_name is derived with
// the same best-effort heuristic used elsewhere (departments.name = doctors.specialization)
// and department_id from the frontend form is accepted but not persisted (nowhere to
// store it). The `availability` JSON schedule concept now lives in the separate
// doctor_schedules table (a different feature) and is not written here.

exports.getAllDoctors = async (req, res) => {
  try {
    const { hospital_id } = req.query;
    let query = `SELECT d.*, (u.first_name || ' ' || u.last_name) as name, u.email, u.phone,
                   u.is_active, dep.name as department_name, d.experience_years as experience
                 FROM doctors d
                 JOIN users u ON d.user_id = u.id
                 LEFT JOIN departments dep ON dep.hospital_id = d.hospital_id AND dep.name = d.specialization
                 WHERE u.is_active = true`;
    const params = [];

    if (hospital_id) {
      query += ' AND d.hospital_id = ?';
      params.push(hospital_id);
    }

    const [doctors] = await db.query(query, params);
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT d.*, (u.first_name || ' ' || u.last_name) as name, u.email, u.phone,
              u.is_active, dep.name as department_name, d.experience_years as experience
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN departments dep ON dep.hospital_id = d.hospital_id AND dep.name = d.specialization
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctors[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const {
      hospital_id, name, specialization, qualification,
      phone, email, experience, consultation_fee, license_number
      // department_id is accepted from the form but has no column to persist to.
    } = req.body;

    if (!hospital_id || !name || !email) {
      return res.status(400).json({ success: false, message: 'hospital_id, name and email are required' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const nameParts = String(name).trim().split(/\s+/);
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || '';

    const username = (email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'doctor') + Date.now();
    const hashedPassword = await bcrypt.hash('doctor123', 10);

    const userResult = await db.query(
      `INSERT INTO users (hospital_id, username, email, password_hash, first_name, last_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'doctor', true) RETURNING id`,
      [hospital_id, username, email, hashedPassword, firstName, lastName, phone]
    );
    const userId = userResult.rows[0].id;

    const [result] = await db.query(
      `INSERT INTO doctors (hospital_id, user_id, license_number, specialization, qualification, experience_years, consultation_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [hospital_id, userId, license_number || null, specialization, qualification, experience || null, consultation_fee || null]
    );

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctorId: result[0]?.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      name, specialization, qualification,
      phone, email, experience, consultation_fee, license_number
    } = req.body;

    const [doctors] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [req.params.id]);
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const userId = doctors[0].user_id;

    if (name || email || phone) {
      const userFields = [];
      const userValues = [];

      if (name) {
        const nameParts = String(name).trim().split(/\s+/);
        userFields.push('first_name = ?', 'last_name = ?');
        userValues.push(nameParts[0] || name, nameParts.slice(1).join(' ') || '');
      }
      if (email) {
        userFields.push('email = ?');
        userValues.push(email);
      }
      if (phone) {
        userFields.push('phone = ?');
        userValues.push(phone);
      }

      await db.query(
        `UPDATE users SET ${userFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...userValues, userId]
      );
    }

    await db.query(
      `UPDATE doctors SET specialization = ?, qualification = ?, experience_years = ?, consultation_fee = ?, license_number = ?, updated_at = NOW()
       WHERE id = ?`,
      [specialization, qualification, experience, consultation_fee, license_number, req.params.id]
    );

    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await db.query(
      'UPDATE users SET is_active = false WHERE id = (SELECT user_id FROM doctors WHERE id = ?)',
      [req.params.id]
    );
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
