const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupAdvancedFeatures() {
  let conn;
  try {
    console.log('🚀 Setting up advanced features...\n');

    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, '../database/advanced-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing advanced schema...');
    
    // Split by delimiter and execute
    const statements = sql.split('//');
    
    for (let statement of statements) {
      statement = statement.trim();
      if (statement && !statement.startsWith('--') && !statement.startsWith('DELIMITER')) {
        try {
          await conn.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
            console.error('Error:', err.message.substring(0, 100));
          }
        }
      }
    }

    console.log('✅ Advanced schema created\n');

    // Verify tables
    console.log('📊 Verifying new tables...\n');
    
    const tables = [
      'digital_prescriptions',
      'prescription_medicines',
      'lab_reports',
      'patient_vitals',
      'appointment_reminders',
      'patient_medical_history',
      'doctor_schedules',
      'doctor_leaves',
      'patient_feedback',
      'medicine_expiry_alerts',
      'stock_reorder_alerts',
      'analytics_cache',
      'audit_logs'
    ];

    for (const table of tables) {
      const [rows] = await conn.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - NOT CREATED`);
      }
    }

    console.log('\n🎉 Advanced features setup complete!\n');
    console.log('📋 New Features Available:');
    console.log('   1. Digital Prescriptions');
    console.log('   2. Lab Reports Management');
    console.log('   3. Patient Vitals Tracking');
    console.log('   4. Appointment Reminders (24h & 1h)');
    console.log('   5. Patient Medical History');
    console.log('   6. Doctor Schedules');
    console.log('   7. Doctor Leaves Management');
    console.log('   8. Patient Feedback System');
    console.log('   9. Medicine Expiry Alerts');
    console.log('   10. Stock Reorder Alerts');
    console.log('   11. Analytics Dashboard');
    console.log('   12. Audit Logs\n');

    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (conn) await conn.end();
    process.exit(1);
  }
}

setupAdvancedFeatures();
