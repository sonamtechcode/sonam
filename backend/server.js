require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/hospitals', require('./src/routes/hospital.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/permissions', require('./src/routes/permission.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));
app.use('/api/patients', require('./src/routes/patient.routes'));
app.use('/api/patient-profile', require('./src/routes/patientProfile.routes'));
app.use('/api/prescriptions', require('./src/routes/prescription.routes'));
app.use('/api/patient-reports', require('./src/routes/report.routes'));
app.use('/api/patient-payments', require('./src/routes/payment.routes'));
app.use('/api/doctors', require('./src/routes/doctor.routes'));
app.use('/api/appointments', require('./src/routes/appointment.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/beds', require('./src/routes/bed.routes'));
app.use('/api/billing', require('./src/routes/billing.routes'));
app.use('/api/pharmacy', require('./src/routes/pharmacy.routes'));
app.use('/api/laboratory', require('./src/routes/laboratory.routes'));
app.use('/api/staff', require('./src/routes/staff.routes'));
app.use('/api/inventory', require('./src/routes/inventory.routes'));
app.use('/api/emergency', require('./src/routes/emergency.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));

// New advanced features routes
app.use('/api/analytics', require('./src/routes/analytics.routes'));
app.use('/api/vitals', require('./src/routes/vitals.routes'));
app.use('/api/doctor-schedules', require('./src/routes/doctorSchedule.routes'));
app.use('/api/doctor-leaves', require('./src/routes/doctorLeave.routes'));
app.use('/api/medical-history', require('./src/routes/medicalHistory.routes'));
app.use('/api/lab-reports', require('./src/routes/labReport.routes'));
app.use('/api/feedback', require('./src/routes/feedback.routes'));
app.use('/api/ambulances', require('./src/routes/ambulance.routes'));
app.use('/api/audit-logs', require('./src/routes/auditLog.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hospital Management API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start WhatsApp service on server start
const { connectWhatsApp } = require('./src/utils/whatsappBaileys');

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Database connected successfully');
  
  // Connect WhatsApp
  console.log('\n🔌 Connecting WhatsApp service...');
  try {
    await connectWhatsApp();
    console.log('✅ WhatsApp service ready!\n');
  } catch (error) {
    console.log('⚠️  WhatsApp service not connected. Messages will be in demo mode.');
    console.log('💡 To enable WhatsApp: Keep whatsapp-start.js running\n');
  }
});
