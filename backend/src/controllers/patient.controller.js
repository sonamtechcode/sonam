const db = require('../config/database');

// NOTE: the real `patients` table has no name/age/patient_id/medical_history/
// emergency_contact columns. name -> first_name + last_name, patient_id ->
// patient_id_number, emergency_contact -> emergency_contact_phone. There's no
// date_of_birth-free "age" concept either — age is approximated to a Jan 1 birth
// year on write, and computed back from date_of_birth on read so the frontend's
// `age` column keeps working. `medical_history` (a single freeform text field
// from PatientAdd.jsx) has no matching column on patients (the closest columns —
// allergies/chronic_conditions/current_medications — are structured fields for a
// different purpose, and there's a separate patient_medical_history table for
// visit-based records), so it is accepted but not persisted here; flagged in the
// final report as a real schema gap rather than guessed at.

exports.getAllPatients = async (req, res) => {
  try {
    const { hospital_id, search, page = 1, limit = 20, gender, blood_group, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT *, patient_id_number as patient_id,
                   (first_name || ' ' || last_name) as name,
                   EXTRACT(YEAR FROM AGE(date_of_birth))::int as age,
                   emergency_contact_phone as emergency_contact
                 FROM patients WHERE 1=1`;
    const params = [];

    if (hospital_id) {
      query += ' AND hospital_id = ?';
      params.push(hospital_id);
    }

    if (search) {
      query += ' AND ((first_name || \' \' || last_name) LIKE ? OR patient_id_number LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
    }

    if (blood_group) {
      query += ' AND blood_group = ?';
      params.push(blood_group);
    }

    if (start_date && end_date) {
      query += ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

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
      countQuery += ' AND ((first_name || \' \' || last_name) LIKE ? OR patient_id_number LIKE ? OR phone LIKE ? OR email LIKE ?)';
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
    const [patients] = await db.query(
      `SELECT *, patient_id_number as patient_id,
         (first_name || ' ' || last_name) as name,
         EXTRACT(YEAR FROM AGE(date_of_birth))::int as age,
         emergency_contact_phone as emergency_contact
       FROM patients WHERE id = ?`,
      [req.params.id]
    );

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
      emergency_contact, emergency_contact_name
    } = req.body;

    const nameParts = String(name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || name || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '-';

    // No date_of_birth is collected by the frontend, only age; approximate a
    // birth date so the column (which the real schema uses instead of age) is populated.
    let dateOfBirth = null;
    if (age !== undefined && age !== null && age !== '') {
      const birthYear = new Date().getFullYear() - parseInt(age, 10);
      dateOfBirth = `${birthYear}-01-01`;
    }

    // Generate patient ID
    const [lastPatient] = await db.query(
      'SELECT patient_id_number FROM patients WHERE hospital_id = ? ORDER BY id DESC LIMIT 1',
      [hospital_id]
    );

    let patientId = `PAT${hospital_id}0001`;
    if (lastPatient.length > 0 && lastPatient[0].patient_id_number) {
      const lastNum = parseInt(lastPatient[0].patient_id_number.slice(-4), 10) || 0;
      patientId = `PAT${hospital_id}${String(lastNum + 1).padStart(4, '0')}`;
    }

    const [result] = await db.query(
      `INSERT INTO patients (hospital_id, patient_id_number, first_name, last_name, date_of_birth, gender, phone, email, address,
       blood_group, emergency_contact_name, emergency_contact_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active') RETURNING id`,
      [hospital_id, patientId, firstName, lastName, dateOfBirth, gender, phone, email, address,
       blood_group, emergency_contact_name, emergency_contact]
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patientId: result[0]?.id,
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
      emergency_contact, emergency_contact_name
    } = req.body;

    let firstName, lastName;
    if (name) {
      const nameParts = String(name).trim().split(/\s+/);
      firstName = nameParts[0] || name;
      lastName = nameParts.slice(1).join(' ') || '-';
    }

    let dateOfBirth;
    if (age !== undefined && age !== null && age !== '') {
      const birthYear = new Date().getFullYear() - parseInt(age, 10);
      dateOfBirth = `${birthYear}-01-01`;
    }

    await db.query(
      `UPDATE patients SET
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         date_of_birth = COALESCE(?, date_of_birth),
         gender = COALESCE(?, gender),
         phone = COALESCE(?, phone),
         email = COALESCE(?, email),
         address = COALESCE(?, address),
         blood_group = COALESCE(?, blood_group),
         emergency_contact_name = COALESCE(?, emergency_contact_name),
         emergency_contact_phone = COALESCE(?, emergency_contact_phone),
         updated_at = NOW()
       WHERE id = ?`,
      [firstName, lastName, dateOfBirth, gender, phone, email, address, blood_group,
       emergency_contact_name, emergency_contact, req.params.id]
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
