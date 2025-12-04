const db = require('../config/database');

exports.getAllPatients = async (req, res) => {
  try {
    const { hospital_id, search, page = 1, limit = 20, status, plan, start_date, end_date, gender, blood_group } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (hospital_id) {
      query += ' AND hospital_id = ?';
      params.push(hospital_id);
    }

    if (search) {
      query += ' AND (name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter by gender
    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }

    // Filter by blood group
    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    // Filter by date range
    if (start_date && end_date) {
      query += ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    // Note: status and plan filters would need corresponding columns in the database
    // For now, we'll ignore them as they don't exist in the current schema

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [patients] = await db.query(query, params);
    
    // Count query with same filters
    let countQuery = 'SELECT COUNT(*) as total FROM patients WHERE 1=1';
    const countParams = [];
    
    if (hospital_id) {
      countQuery += ' AND hospital_id = ?';
      countParams.push(hospital_id);
    }
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (gender) {
      countQuery += ' AND gender = ?';
      countParams.push(gender);
    }
    
    if (blood_group) {
      countQuery += ' AND blood_group = ?';
      countParams.push(blood_group);
    }
    
    if (start_date && end_date) {
      countQuery += ' AND DATE(created_at) BETWEEN ? AND ?';
      countParams.push(start_date, end_date);
    }

    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: patients,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    
    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patients[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const {
      hospital_id, name, age, gender, phone, email, address, blood_group,
      emergency_contact, emergency_contact_name, medical_history
    } = req.body;

    // Generate patient ID
    const [lastPatient] = await db.query(
      'SELECT patient_id FROM patients WHERE hospital_id = ? ORDER BY id DESC LIMIT 1',
      [hospital_id]
    );

    let patientId = `PAT${hospital_id}0001`;
    if (lastPatient.length > 0) {
      const lastNum = parseInt(lastPatient[0].patient_id.slice(-4));
      patientId = `PAT${hospital_id}${String(lastNum + 1).padStart(4, '0')}`;
    }

    const [result] = await db.query(
      `INSERT INTO patients (hospital_id, patient_id, name, age, gender, phone, email, address, 
       blood_group, emergency_contact, emergency_contact_name, medical_history) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hospital_id, patientId, name, age, gender, phone, email, address, blood_group,
       emergency_contact, emergency_contact_name, medical_history]
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patientId: result.insertId,
      patient_number: patientId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const {
      name, age, gender, phone, email, address, blood_group,
      emergency_contact, emergency_contact_name, medical_history
    } = req.body;

    await db.query(
      `UPDATE patients SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, 
       blood_group = ?, emergency_contact = ?, emergency_contact_name = ?, medical_history = ? 
       WHERE id = ?`,
      [name, age, gender, phone, email, address, blood_group, emergency_contact,
       emergency_contact_name, medical_history, req.params.id]
    );

    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await db.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
