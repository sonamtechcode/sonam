const db = require('../config/database');

// Get Complete Patient Profile
exports.getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id } = req.query;

    // 1. Basic Patient Info
    const [patients] = await db.query(
      `SELECT p.*, h.name as hospital_name 
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

    // 2. Medical Details
    const [medicalDetails] = await db.query(
      'SELECT * FROM patient_medical_details WHERE patient_id = ? AND hospital_id = ?',
      [patientId, hospital_id]
    );

    // 3. Latest Vitals
    const [latestVitals] = await db.query(
      `SELECT * FROM patient_vitals 
       WHERE patient_id = ? AND hospital_id = ? 
       ORDER BY recorded_at DESC LIMIT 1`,
      [patientId, hospital_id]
    );

    // 4. Visit History
    const [visits] = await db.query(
      `SELECT v.*, d.name as doctor_name, d.specialization 
       FROM patient_visits v 
       LEFT JOIN doctors d ON v.doctor_id = d.id 
       WHERE v.patient_id = ? AND v.hospital_id = ? 
       ORDER BY v.visit_date DESC, v.visit_time DESC`,
      [patientId, hospital_id]
    );

    // 5. Prescriptions
    const [prescriptions] = await db.query(
      `SELECT p.*, d.name as doctor_name 
       FROM prescriptions p 
       LEFT JOIN doctors d ON p.doctor_id = d.id 
       WHERE p.patient_id = ? AND p.hospital_id = ? 
       ORDER BY p.prescription_date DESC`,
      [patientId, hospital_id]
    );

    // 6. Procedures/Treatments
    const [procedures] = await db.query(
      `SELECT pp.*, d.name as doctor_name 
       FROM patient_procedures pp 
       LEFT JOIN doctors d ON pp.doctor_id = d.id 
       WHERE pp.patient_id = ? AND pp.hospital_id = ? 
       ORDER BY pp.procedure_date DESC`,
      [patientId, hospital_id]
    );

    // 7. Lab Reports
    const [labReports] = await db.query(
      `SELECT lb.*, lt.test_name, lt.test_code, d.name as doctor_name 
       FROM lab_bookings lb 
       LEFT JOIN lab_tests lt ON lb.test_id = lt.id 
       LEFT JOIN doctors d ON lb.doctor_id = d.id 
       WHERE lb.patient_id = ? AND lb.hospital_id = ? 
       ORDER BY lb.created_at DESC`,
      [patientId, hospital_id]
    );

    // 8. Documents
    const [documents] = await db.query(
      'SELECT * FROM patient_documents WHERE patient_id = ? AND hospital_id = ? ORDER BY upload_date DESC',
      [patientId, hospital_id]
    );

    // 9. Billing Summary
    const [billingSummary] = await db.query(
      `SELECT 
        SUM(debit) as total_amount,
        SUM(credit) as paid_amount,
        (SUM(debit) - SUM(credit)) as due_amount
       FROM patient_ledger 
       WHERE patient_id = ? AND hospital_id = ?`,
      [patientId, hospital_id]
    );

    // 10. Recent Transactions
    const [transactions] = await db.query(
      `SELECT * FROM patient_ledger 
       WHERE patient_id = ? AND hospital_id = ? 
       ORDER BY transaction_date DESC LIMIT 10`,
      [patientId, hospital_id]
    );

    // 11. Follow-ups
    const [followups] = await db.query(
      `SELECT * FROM patient_followups 
       WHERE patient_id = ? AND hospital_id = ? AND status = 'pending'
       ORDER BY followup_date ASC`,
      [patientId, hospital_id]
    );

    // 12. Communication Logs
    const [communications] = await db.query(
      `SELECT * FROM patient_communications 
       WHERE patient_id = ? AND hospital_id = ? 
       ORDER BY sent_at DESC LIMIT 20`,
      [patientId, hospital_id]
    );

    // 13. Consents
    const [consents] = await db.query(
      'SELECT * FROM patient_consents WHERE patient_id = ? AND hospital_id = ? ORDER BY consent_date DESC',
      [patientId, hospital_id]
    );

    // 14. Feedback
    const [feedback] = await db.query(
      'SELECT * FROM patient_feedback WHERE patient_id = ? AND hospital_id = ? ORDER BY feedback_date DESC',
      [patientId, hospital_id]
    );

    res.json({
      success: true,
      data: {
        basicInfo: patient,
        medicalDetails: medicalDetails[0] || null,
        latestVitals: latestVitals[0] || null,
        visits: visits,
        prescriptions: prescriptions,
        procedures: procedures,
        labReports: labReports,
        documents: documents,
        billingSummary: billingSummary[0],
        recentTransactions: transactions,
        followups: followups,
        communications: communications,
        consents: consents,
        feedback: feedback
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
    const updateData = req.body;

    await db.query('UPDATE patients SET ? WHERE id = ?', [updateData, patientId]);

    res.json({ success: true, message: 'Patient info updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update/Create Medical Details
exports.updateMedicalDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, ...medicalData } = req.body;

    // Calculate BMI if height and weight provided
    if (medicalData.height && medicalData.weight) {
      const heightInMeters = medicalData.height / 100;
      medicalData.bmi = (medicalData.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const [existing] = await db.query(
      'SELECT id FROM patient_medical_details WHERE patient_id = ? AND hospital_id = ?',
      [patientId, hospital_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE patient_medical_details SET ? WHERE patient_id = ? AND hospital_id = ?',
        [medicalData, patientId, hospital_id]
      );
    } else {
      await db.query(
        'INSERT INTO patient_medical_details SET ?',
        [{ patient_id: patientId, hospital_id, ...medicalData }]
      );
    }

    res.json({ success: true, message: 'Medical details updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Vitals
exports.addVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const vitalsData = { ...req.body, patient_id: patientId, recorded_by: req.user.id };

    const [result] = await db.query('INSERT INTO patient_vitals SET ?', [vitalsData]);

    res.json({ success: true, message: 'Vitals recorded successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Visit
exports.createVisit = async (req, res) => {
  try {
    const { patientId } = req.params;
    const visitData = { ...req.body, patient_id: patientId };

    const [result] = await db.query('INSERT INTO patient_visits SET ?', [visitData]);

    res.json({ success: true, message: 'Visit created successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Visit
exports.updateVisit = async (req, res) => {
  try {
    const { visitId } = req.params;
    const updateData = req.body;

    await db.query('UPDATE patient_visits SET ? WHERE id = ?', [updateData, visitId]);

    res.json({ success: true, message: 'Visit updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Prescription
exports.addPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptionData = { ...req.body, patient_id: patientId };

    // Convert medicines array to JSON
    if (Array.isArray(prescriptionData.medicines)) {
      prescriptionData.medicines = JSON.stringify(prescriptionData.medicines);
    }

    const [result] = await db.query('INSERT INTO prescriptions SET ?', [prescriptionData]);

    res.json({ success: true, message: 'Prescription added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Procedure
exports.addProcedure = async (req, res) => {
  try {
    const { patientId } = req.params;
    const procedureData = { ...req.body, patient_id: patientId };

    // Convert arrays to JSON
    if (procedureData.pre_images) procedureData.pre_images = JSON.stringify(procedureData.pre_images);
    if (procedureData.post_images) procedureData.post_images = JSON.stringify(procedureData.post_images);
    if (procedureData.consumables_used) procedureData.consumables_used = JSON.stringify(procedureData.consumables_used);

    const [result] = await db.query('INSERT INTO patient_procedures SET ?', [procedureData]);

    res.json({ success: true, message: 'Procedure added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Document
exports.uploadDocument = async (req, res) => {
  try {
    const { patientId } = req.params;
    const documentData = { ...req.body, patient_id: patientId, uploaded_by: req.user.id };

    const [result] = await db.query('INSERT INTO patient_documents SET ?', [documentData]);

    res.json({ success: true, message: 'Document uploaded successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    await db.query('DELETE FROM patient_documents WHERE id = ?', [documentId]);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Ledger Entry
exports.addLedgerEntry = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospital_id, transaction_type, debit, credit, ...otherData } = req.body;

    // Get current balance
    const [lastEntry] = await db.query(
      'SELECT balance FROM patient_ledger WHERE patient_id = ? AND hospital_id = ? ORDER BY transaction_date DESC LIMIT 1',
      [patientId, hospital_id]
    );

    const currentBalance = lastEntry.length > 0 ? parseFloat(lastEntry[0].balance) : 0;
    const newBalance = currentBalance + parseFloat(debit || 0) - parseFloat(credit || 0);

    const ledgerData = {
      patient_id: patientId,
      hospital_id,
      transaction_type,
      debit: debit || 0,
      credit: credit || 0,
      balance: newBalance,
      created_by: req.user.id,
      ...otherData
    };

    const [result] = await db.query('INSERT INTO patient_ledger SET ?', [ledgerData]);

    res.json({ success: true, message: 'Ledger entry added successfully', id: result.insertId, balance: newBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Follow-up
exports.addFollowup = async (req, res) => {
  try {
    const { patientId } = req.params;
    const followupData = { ...req.body, patient_id: patientId };

    const [result] = await db.query('INSERT INTO patient_followups SET ?', [followupData]);

    res.json({ success: true, message: 'Follow-up scheduled successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log Communication
exports.logCommunication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const commData = { ...req.body, patient_id: patientId, sent_by: req.user.id };

    const [result] = await db.query('INSERT INTO patient_communications SET ?', [commData]);

    res.json({ success: true, message: 'Communication logged successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Consent
exports.addConsent = async (req, res) => {
  try {
    const { patientId } = req.params;
    const consentData = { ...req.body, patient_id: patientId };

    const [result] = await db.query('INSERT INTO patient_consents SET ?', [consentData]);

    res.json({ success: true, message: 'Consent recorded successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Feedback
exports.addFeedback = async (req, res) => {
  try {
    const { patientId } = req.params;
    const feedbackData = { ...req.body, patient_id: patientId };

    const [result] = await db.query('INSERT INTO patient_feedback SET ?', [feedbackData]);

    res.json({ success: true, message: 'Feedback submitted successfully', id: result.insertId });
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

    const [existing] = await db.query(
      'SELECT id FROM clinic_settings WHERE hospital_id = ?',
      [hospital_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE clinic_settings SET ? WHERE hospital_id = ?',
        [settingsData, hospital_id]
      );
    } else {
      await db.query(
        'INSERT INTO clinic_settings SET ?',
        [{ hospital_id, ...settingsData }]
      );
    }

    res.json({ success: true, message: 'Clinic settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
