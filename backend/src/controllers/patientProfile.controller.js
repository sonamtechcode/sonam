const db = require('../config/database');

// NOTE: this controller originally targeted a much larger MySQL schema than the real
// Supabase Postgres DB actually has. Tables that never existed in the real schema
// (patient_medical_details, patient_visits, patient_procedures, lab_bookings, lab_tests,
// patient_documents, patient_ledger, patient_followups, patient_consents) are substituted
// with the closest real table where a reasonable one exists (e.g. appointments for
// "visits", billing+payment for the financial ledger, patients' own columns for
// "medical details"), and return an empty result (reads) or a 501 (writes) where no
// reasonable substitute exists, rather than crashing with a raw DB error or inventing a
// schema. This is flagged in detail in the final report.
//
// The original code also used MySQL's `INSERT/UPDATE ... SET ?` object-shorthand syntax,
// which Postgres has no equivalent for (the `?` placeholder can't bind a whole object).
// All writes below use an explicit, whitelisted column list instead.

// Build a parameterized UPDATE from only the allowed columns present in `data`.
const buildUpdateFields = (data, allowedColumns) => {
  const cols = [];
  const values = [];
  for (const col of allowedColumns) {
    if (Object.prototype.hasOwnProperty.call(data, col)) {
      cols.push(col);
      values.push(data[col]);
    }
  }
  return { cols, values };
};

// Get Complete Patient Profile
exports.getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id } = req.query;

    // 1. Basic Patient Info
    const [patients] = await db.query(
      `SELECT p.*, (p.first_name || ' ' || p.last_name) as name, p.patient_id_number as patient_id,
              p.emergency_contact_phone as emergency_contact, h.name as hospital_name
       FROM patients p
       LEFT JOIN hospitals h ON p.hospital_id = h.id
       WHERE p.id = ? AND p.hospital_id = ?`,
      [patientId, hospital_id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patient = patients[0];

    // Calculate age from date_of_birth
    if (patient.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(patient.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      patient.calculated_age = age;
    }

    // 2. Medical Details — there's no separate patient_medical_details table; the real
    // schema keeps these fields directly on patients.
    const medicalDetails = {
      height: patient.height,
      weight: patient.weight,
      bmi: patient.bmi,
      allergies: patient.allergies,
      chronic_conditions: patient.chronic_conditions,
      current_medications: patient.current_medications,
      insurance_provider: patient.insurance_provider,
      insurance_policy_number: patient.insurance_policy_number,
      insurance_expiry_date: patient.insurance_expiry_date
    };

    // 3. Latest Vitals
    const [latestVitals] = await db.query(
      `SELECT * FROM patient_vitals
       WHERE patient_id = ? AND hospital_id = ?
       ORDER BY recorded_at DESC LIMIT 1`,
      [patientId, hospital_id]
    );

    // 4. Visit History — no patient_visits table; appointments is the closest real
    // equivalent, so it's used as a best-effort substitute.
    const [visits] = await db.query(
      `SELECT a.*, a.appointment_date as visit_date, a.appointment_time as visit_time,
              a.reason_for_visit as reason, (u.first_name || ' ' || u.last_name) as doctor_name,
              d.specialization
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = ? AND a.hospital_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [patientId, hospital_id]
    );

    // 5. Prescriptions
    const [prescriptions] = await db.query(
      `SELECT p.*, (u.first_name || ' ' || u.last_name) as doctor_name
       FROM digital_prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       LEFT JOIN users u ON d.user_id = u.id
       WHERE p.patient_id = ? AND p.hospital_id = ?
       ORDER BY p.prescription_date DESC`,
      [patientId, hospital_id]
    );

    // 6. Procedures/Treatments — no equivalent table in the real schema.
    const procedures = [];

    // 7. Lab Reports
    const [labReports] = await db.query(
      `SELECT lr.*, (u.first_name || ' ' || u.last_name) as doctor_name
       FROM lab_reports lr
       LEFT JOIN users u ON lr.ordered_by = u.id
       WHERE lr.patient_id = ? AND lr.hospital_id = ?
       ORDER BY lr.created_at DESC`,
      [patientId, hospital_id]
    );

    // 8. Documents — no equivalent table in the real schema.
    const documents = [];

    // 9. Billing Summary — no patient_ledger table; derived from billing + payment.
    const [billingTotals] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_amount
       FROM billing WHERE patient_id = ? AND hospital_id = ?`,
      [patientId, hospital_id]
    );
    const [paymentTotals] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as paid_amount
       FROM payment WHERE patient_id = ? AND hospital_id = ? AND status = 'completed'`,
      [patientId, hospital_id]
    );
    const totalAmount = parseFloat(billingTotals[0].total_amount) || 0;
    const paidAmount = parseFloat(paymentTotals[0].paid_amount) || 0;
    const billingSummary = {
      total_amount: totalAmount,
      paid_amount: paidAmount,
      due_amount: totalAmount - paidAmount
    };

    // 10. Recent Transactions
    const [transactions] = await db.query(
      `SELECT * FROM payment
       WHERE patient_id = ? AND hospital_id = ?
       ORDER BY payment_date DESC LIMIT 10`,
      [patientId, hospital_id]
    );

    // 11. Follow-ups — no equivalent table in the real schema.
    const followups = [];

    // 12. Communication Logs
    const [communications] = await db.query(
      `SELECT * FROM patient_communication_log
       WHERE patient_id = ? AND hospital_id = ?
       ORDER BY sent_at DESC LIMIT 20`,
      [patientId, hospital_id]
    );

    // 13. Consents — no equivalent table in the real schema.
    const consents = [];

    // 14. Feedback
    const [feedback] = await db.query(
      'SELECT * FROM patient_feedback WHERE patient_id = ? AND hospital_id = ? ORDER BY created_at DESC',
      [patientId, hospital_id]
    );

    res.json({
      success: true,
      data: {
        basicInfo: patient,
        medicalDetails,
        latestVitals: latestVitals[0] || null,
        visits,
        prescriptions,
        procedures,
        labReports,
        documents,
        billingSummary,
        recentTransactions: transactions,
        followups,
        communications,
        consents,
        feedback
      }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Patient Basic Info
exports.updatePatientBasicInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      const parts = String(updateData.name).trim().split(/\s+/);
      updateData.first_name = parts[0];
      updateData.last_name = parts.slice(1).join(' ') || '-';
    }
    if (updateData.age !== undefined && updateData.age !== null && updateData.age !== '') {
      updateData.date_of_birth = `${new Date().getFullYear() - parseInt(updateData.age, 10)}-01-01`;
    }

    const allowedColumns = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group', 'phone', 'email',
      'address', 'city', 'state', 'country', 'postal_code', 'emergency_contact_name',
      'emergency_contact_phone', 'emergency_contact_relation', 'insurance_provider',
      'insurance_policy_number', 'insurance_expiry_date', 'allergies', 'chronic_conditions',
      'current_medications', 'height', 'weight', 'bmi', 'status'
    ];
    const { cols, values } = buildUpdateFields(updateData, allowedColumns);

    if (cols.length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const setClause = cols.map(c => `${c} = ?`).join(', ');
    await db.query(`UPDATE patients SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, patientId]);

    res.json({ success: true, message: 'Patient info updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Medical Details — there's no patient_medical_details table; this now updates
// the equivalent columns directly on patients.
exports.updateMedicalDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, ...medicalData } = req.body;

    if (medicalData.height && medicalData.weight) {
      const heightInMeters = medicalData.height / 100;
      medicalData.bmi = (medicalData.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const allowedColumns = [
      'height', 'weight', 'bmi', 'allergies', 'chronic_conditions', 'current_medications',
      'insurance_provider', 'insurance_policy_number', 'insurance_expiry_date'
    ];
    const { cols, values } = buildUpdateFields(medicalData, allowedColumns);

    if (cols.length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    const setClause = cols.map(c => `${c} = ?`).join(', ');
    await db.query(
      `UPDATE patients SET ${setClause}, updated_at = NOW() WHERE id = ? AND hospital_id = ?`,
      [...values, patientId, hospital_id]
    );

    res.json({ success: true, message: 'Medical details updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Vitals
exports.addVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = { ...req.body, patient_id: patientId, recorded_by: req.user.id };

    const allowedColumns = [
      'patient_id', 'hospital_id', 'recorded_by', 'temperature', 'blood_pressure_systolic',
      'blood_pressure_diastolic', 'heart_rate', 'respiratory_rate', 'oxygen_saturation',
      'blood_glucose', 'weight', 'height', 'bmi', 'notes'
    ];
    const { cols, values } = buildUpdateFields(data, allowedColumns);
    if (!cols.includes('patient_id')) { cols.unshift('patient_id'); values.unshift(patientId); }

    const placeholders = cols.map(() => '?').join(', ');
    const [result] = await db.query(
      `INSERT INTO patient_vitals (${cols.join(', ')}, recorded_at) VALUES (${placeholders}, NOW()) RETURNING id`,
      values
    );

    res.json({ success: true, message: 'Vitals recorded successfully', id: result[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Visit — no patient_visits table in the real schema; there's no reasonable
// substitute for an arbitrary "create a visit" write (appointments have their own
// dedicated create flow under /appointments), so this is left unsupported rather than
// silently writing to the wrong table.
exports.createVisit = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Visit records are not supported by the current database schema. Use the Appointments API instead.'
  });
};

exports.updateVisit = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Visit records are not supported by the current database schema. Use the Appointments API instead.'
  });
};

// Add Prescription
exports.addPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, doctor_id, medicine_name, dosage, frequency, duration_days, instructions } = req.body;

    const [result] = await db.query(
      `INSERT INTO digital_prescriptions (patient_id, hospital_id, doctor_id, medicine_name, dosage, frequency, duration_days, instructions, prescription_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'active') RETURNING id`,
      [patientId, hospital_id, doctor_id, medicine_name, dosage, frequency, duration_days, instructions]
    );

    res.json({ success: true, message: 'Prescription added successfully', id: result[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Procedure — no patient_procedures table in the real schema.
exports.addProcedure = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Procedure records are not supported by the current database schema.'
  });
};

// Upload Document — no patient_documents table in the real schema.
exports.uploadDocument = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Document storage is not supported by the current database schema.'
  });
};

exports.deleteDocument = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Document storage is not supported by the current database schema.'
  });
};

// Add Ledger Entry — no patient_ledger table; the closest real equivalent is a payment
// record, so a debit/credit ledger entry is recorded there when it represents a payment.
exports.addLedgerEntry = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, billing_id, credit, payment_method, notes } = req.body;

    if (!credit) {
      return res.status(400).json({
        success: false,
        message: 'Only payment (credit) ledger entries are supported by the current database schema.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO payment (hospital_id, patient_id, billing_id, amount, payment_method, status, notes, payment_date)
       VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW()) RETURNING id`,
      [hospital_id, patientId, billing_id || null, credit, payment_method || 'cash', notes || null]
    );

    res.json({ success: true, message: 'Ledger entry added successfully', id: result[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Follow-up — no patient_followups table in the real schema.
exports.addFollowup = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Follow-up scheduling is not supported by the current database schema.'
  });
};

// Log Communication
exports.logCommunication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, communication_type, subject, message, status } = req.body;

    const [result] = await db.query(
      `INSERT INTO patient_communication_log (hospital_id, patient_id, communication_type, subject, message, sent_by, sent_at, status)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?) RETURNING id`,
      [hospital_id, patientId, communication_type, subject, message, req.user.id, status || 'sent']
    );

    res.json({ success: true, message: 'Communication logged successfully', id: result[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Consent — no patient_consents table in the real schema.
exports.addConsent = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Consent records are not supported by the current database schema.'
  });
};

// Add Feedback
exports.addFeedback = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, doctor_id, rating, comments, overall_experience_rating, cleanliness_rating, staff_behavior_rating, wait_time_rating, would_recommend } = req.body;

    const [result] = await db.query(
      `INSERT INTO patient_feedback (patient_id, hospital_id, doctor_id, rating, comments, overall_experience_rating, cleanliness_rating, staff_behavior_rating, wait_time_rating, would_recommend, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id`,
      [patientId, hospital_id, doctor_id, rating, comments, overall_experience_rating, cleanliness_rating, staff_behavior_rating, wait_time_rating, would_recommend]
    );

    res.json({ success: true, message: 'Feedback submitted successfully', id: result[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Clinic Settings
exports.getClinicSettings = async (req, res) => {
  try {
    const { hospital_id } = req.query;

    const [settings] = await db.query(
      'SELECT * FROM clinic_settings WHERE hospital_id = ?',
      [hospital_id]
    );

    res.json({ success: true, data: settings[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Clinic Settings
exports.updateClinicSettings = async (req, res) => {
  try {
    const { hospital_id, ...settingsData } = req.body;

    const allowedColumns = ['clinic_name', 'logo_url', 'primary_color', 'secondary_color', 'header_text', 'footer_text'];
    const { cols, values } = buildUpdateFields(settingsData, allowedColumns);

    const [existing] = await db.query(
      'SELECT id FROM clinic_settings WHERE hospital_id = ?',
      [hospital_id]
    );

    if (cols.length === 0) {
      return res.status(400).json({ success: false, message: 'No updatable fields provided' });
    }

    if (existing.length > 0) {
      const setClause = cols.map(c => `${c} = ?`).join(', ');
      await db.query(
        `UPDATE clinic_settings SET ${setClause} WHERE hospital_id = ?`,
        [...values, hospital_id]
      );
    } else {
      const placeholders = cols.map(() => '?').join(', ');
      await db.query(
        `INSERT INTO clinic_settings (hospital_id, ${cols.join(', ')}) VALUES (?, ${placeholders})`,
        [hospital_id, ...values]
      );
    }

    res.json({ success: true, message: 'Clinic settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
