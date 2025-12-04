const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');
const { sendAppointmentConfirmation, sendDoctorNotification, sendQueueUpdate, sendYourTurnNotification } = require('../utils/notificationService');

// Get all appointments
router.get('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, doctor_id, patient_id, date, status, start_date, end_date, search } = req.query;
    let query = `SELECT a.*, p.name as patient_name, d.name as doctor_name 
                 FROM appointments a 
                 JOIN patients p ON a.patient_id = p.id 
                 JOIN doctors d ON a.doctor_id = d.id WHERE 1=1`;
    const params = [];

    if (hospital_id) {
      query += ' AND a.hospital_id = ?';
      params.push(hospital_id);
    }
    if (doctor_id) {
      query += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }
    if (patient_id) {
      query += ' AND a.patient_id = ?';
      params.push(patient_id);
    }
    if (date) {
      query += ' AND DATE(a.appointment_date) = ?';
      params.push(date);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (start_date && end_date) {
      query += ' AND DATE(a.appointment_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR d.name LIKE ? OR a.reason LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY a.appointment_date DESC';
    const [appointments] = await db.query(query, params);
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create appointment with queue management
router.post('/', authenticate, async (req, res) => {
  try {
    const { hospital_id, patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    // Calculate token number (count of appointments for this doctor today + 1)
    const [tokenCount] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = DATE(?) AND status IN ("scheduled", "rescheduled")',
      [doctor_id, appointment_date]
    );
    const tokenNumber = tokenCount[0].count + 1;

    // Insert appointment with token
    const [result] = await db.query(
      'INSERT INTO appointments (hospital_id, patient_id, doctor_id, appointment_date, appointment_time, token_number, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [hospital_id, patient_id, doctor_id, appointment_date, appointment_time, tokenNumber, reason, 'scheduled']
    );

    // Calculate queue position (patients ahead)
    const [queueCount] = await db.query(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = DATE(?) AND token_number < ? AND status IN ("scheduled", "rescheduled")',
      [doctor_id, appointment_date, tokenNumber]
    );
    const patientsAhead = queueCount[0].count;

    // Estimate wait time (15 minutes per patient)
    const estimatedWaitTime = patientsAhead * 15;

    // Get patient and doctor details
    const [patients] = await db.query('SELECT name, phone FROM patients WHERE id = ?', [patient_id]);
    const [doctors] = await db.query('SELECT name, phone FROM doctors WHERE id = ?', [doctor_id]);

    // Send notifications (non-blocking)
    if (patients.length > 0 && doctors.length > 0) {
      const patient = patients[0];
      const doctor = doctors[0];

      const formattedDate = new Date(appointment_date).toLocaleDateString('en-IN');
      const formattedTime = appointment_time;

      setImmediate(async () => {
        try {
          console.log('\n🔔 Sending appointment notifications with queue info...\n');

          // Send to patient with queue info
          console.log('📱 Sending WhatsApp to patient:', patient.phone);
          console.log(`   Token: ${tokenNumber}, Ahead: ${patientsAhead}, Wait: ${estimatedWaitTime} min`);
          await sendAppointmentConfirmation(
            patient.phone, 
            patient.name, 
            doctor.name, 
            formattedDate, 
            formattedTime,
            tokenNumber,
            patientsAhead,
            estimatedWaitTime
          );

          // Send to doctor
          console.log('📱 Sending WhatsApp to doctor:', doctor.phone);
          await sendDoctorNotification(doctor.phone, doctor.name, patient.name, formattedDate, formattedTime);

          console.log('✅ Notifications sent!\n');
        } catch (notifError) {
          console.error('⚠️  Notification error:', notifError.message);
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Appointment created with queue info', 
      appointmentId: result.insertId,
      tokenNumber: tokenNumber,
      patientsAhead: patientsAhead,
      estimatedWaitTime: estimatedWaitTime
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update appointment status and notify queue
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    // Get appointment details before updating
    const [appointments] = await db.query(
      'SELECT a.*, p.name as patient_name, p.phone as patient_phone, d.name as doctor_name, d.id as doctor_id FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id WHERE a.id = ?',
      [appointmentId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Update status
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, appointmentId]);

    // If appointment completed, notify next patients in queue
    if (status === 'completed') {
      setImmediate(async () => {
        try {
          console.log('\n🔔 Appointment completed, updating queue...\n');

          // Get next 3 patients in queue for this doctor today
          const [nextPatients] = await db.query(
            `SELECT a.id, a.token_number, p.name, p.phone, d.name as doctor_name
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.doctor_id = ? 
             AND DATE(a.appointment_date) = DATE(?)
             AND a.status IN ('scheduled', 'rescheduled')
             AND a.token_number > ?
             ORDER BY a.token_number ASC
             LIMIT 3`,
            [appointment.doctor_id, appointment.appointment_date, appointment.token_number]
          );

          // Send updates to next patients
          for (let i = 0; i < nextPatients.length; i++) {
            const nextPatient = nextPatients[i];
            const patientsAhead = i;
            const estimatedWaitTime = patientsAhead * 15;

            console.log(`📱 Updating patient ${nextPatient.name} (Token ${nextPatient.token_number})`);
            console.log(`   Ahead: ${patientsAhead}, Wait: ${estimatedWaitTime} min`);

            if (patientsAhead === 0) {
              // Next patient - send "Your Turn" notification
              await sendYourTurnNotification(
                nextPatient.phone,
                nextPatient.name,
                nextPatient.token_number,
                nextPatient.doctor_name
              );
            } else {
              // Other patients - send queue update
              await sendQueueUpdate(
                nextPatient.phone,
                nextPatient.name,
                nextPatient.token_number,
                patientsAhead,
                estimatedWaitTime
              );
            }

            // Wait 2 seconds between messages to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          console.log('✅ Queue updates sent!\n');
        } catch (notifError) {
          console.error('⚠️  Queue update error:', notifError.message);
        }
      });
    }

    res.json({ success: true, message: 'Appointment status updated and queue notified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
