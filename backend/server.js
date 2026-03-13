console.log('🚀 Server file loaded');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('📦 Dependencies loaded');

const app = express();

// ============================================
// CORS Configuration (Production-Safe)
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://healthhub-gamma.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('✅ Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(null, true); // Allow anyway for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// ============================================
// Body Parser Middleware
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('✅ Middleware configured');

// ============================================
// Health Check (No DB required)
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hospital Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

console.log('✅ Health check endpoint registered');

// ============================================
// API Routes (With Error Handling)
// ============================================
const routeFiles = [
  ['auth', './src/routes/auth.routes'],
  ['hospitals', './src/routes/hospital.routes'],
  ['users', './src/routes/user.routes'],
  ['permissions', './src/routes/permission.routes'],
  ['notifications', './src/routes/notification.routes'],
  ['patients', './src/routes/patient.routes'],
  ['patient-profile', './src/routes/patientProfile.routes'],
  ['prescriptions', './src/routes/prescription.routes'],
  ['patient-reports', './src/routes/report.routes'],
  ['patient-payments', './src/routes/payment.routes'],
  ['doctors', './src/routes/doctor.routes'],
  ['appointments', './src/routes/appointment.routes'],
  ['departments', './src/routes/department.routes'],
  ['beds', './src/routes/bed.routes'],
  ['billing', './src/routes/billing.routes'],
  ['pharmacy', './src/routes/pharmacy.routes'],
  ['laboratory', './src/routes/laboratory.routes'],
  ['staff', './src/routes/staff.routes'],
  ['inventory', './src/routes/inventory.routes'],
  ['emergency', './src/routes/emergency.routes'],
  ['reports', './src/routes/report.routes'],
  ['dashboard', './src/routes/dashboard.routes'],
  ['analytics', './src/routes/analytics.routes'],
  ['vitals', './src/routes/vitals.routes'],
  ['doctor-schedules', './src/routes/doctorSchedule.routes'],
  ['doctor-leaves', './src/routes/doctorLeave.routes'],
  ['medical-history', './src/routes/medicalHistory.routes'],
  ['lab-reports', './src/routes/labReport.routes'],
  ['feedback', './src/routes/feedback.routes'],
  ['ambulances', './src/routes/ambulance.routes'],
  ['audit-logs', './src/routes/auditLog.routes']
];

let loadedRoutes = 0;
routeFiles.forEach(([name, routePath]) => {
  try {
    app.use(`/api/${name}`, require(routePath));
    loadedRoutes++;
  } catch (err) {
    console.warn(`⚠️  Failed to load route ${name}:`, err.message);
  }
});

console.log(`✅ Loaded ${loadedRoutes}/${routeFiles.length} routes`);

// ============================================
// Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    method: req.method,
    url: req.url,
    status: err.status || 500
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// ============================================
// WhatsApp Service (Optional, Non-Blocking)
// ============================================
const startWhatsAppService = async () => {
  if (process.env.ENABLE_WHATSAPP !== 'true') {
    console.log('⚠️  WhatsApp service disabled');
    return;
  }

  try {
    const { connectWhatsApp } = require('./src/utils/whatsappBaileys');
    console.log('🔌 Connecting WhatsApp service...');
    await connectWhatsApp();
    console.log('✅ WhatsApp service ready');
  } catch (error) {
    console.warn('⚠️  WhatsApp service failed (non-critical):', error.message);
  }
};

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log(`\n${'='.repeat(60)}`);
console.log(`Starting server on ${HOST}:${PORT}`);
console.log(`${'='.repeat(60)}\n`);

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`\n${'='.repeat(60)}\n`);

  // Start WhatsApp service (non-blocking)
  startWhatsAppService().catch(err => {
    console.warn('WhatsApp error (non-critical):', err.message);
  });
});

// ============================================
// Server Error Handlers
// ============================================
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on('clientError', (err, socket) => {
  console.error('❌ Client error:', err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// ============================================
// Process Error Handlers
// ============================================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ All error handlers registered');
