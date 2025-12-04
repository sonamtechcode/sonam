const db = require('../config/database');

exports.getAllDoctors = async (req, res) => {
  try {
    const { hospital_id, department_id } = req.query;
    let query = `SELECT d.*, dep.name as department_name 
                 FROM doctors d 
                 LEFT JOIN departments dep ON d.department_id = dep.id 
                 WHERE d.is_active = 1`;
    const params = [];

    if (hospital_id) {
      query += ' AND d.hospital_id = ?';
      params.push(hospital_id);
    }

    if (department_id) {
      query += ' AND d.department_id = ?';
      params.push(department_id);
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
      `SELECT d.*, dep.name as department_name 
       FROM doctors d 
       LEFT JOIN departments dep ON d.department_id = dep.id 
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
      hospital_id, department_id, name, specialization, qualification,
      phone, email, experience, consultation_fee, availability
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO doctors (hospital_id, department_id, name, specialization, qualification, 
       phone, email, experience, consultation_fee, availability) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hospital_id, department_id, name, specialization, qualification, phone, email,
       experience, consultation_fee, JSON.stringify(availability)]
    );

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctorId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      department_id, name, specialization, qualification,
      phone, email, experience, consultation_fee, availability
    } = req.body;

    await db.query(
      `UPDATE doctors SET department_id = ?, name = ?, specialization = ?, qualification = ?, 
       phone = ?, email = ?, experience = ?, consultation_fee = ?, availability = ? 
       WHERE id = ?`,
      [department_id, name, specialization, qualification, phone, email, experience,
       consultation_fee, JSON.stringify(availability), req.params.id]
    );

    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    await db.query('UPDATE doctors SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
