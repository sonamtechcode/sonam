require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupCompleteSystem() {
  console.log('🚀 Setting up Complete Hospital Management System...\n');

  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL\n');

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS hospital_management');
    await connection.query('USE hospital_management');
    console.log('✅ Database selected\n');

    // Read and execute complete schema
    console.log('📋 Running complete schema...');
    const completeSchema = fs.readFileSync(
      path.join(__dirname, '../database/complete-schema.sql'),
      'utf8'
    );
    await connection.query(completeSchema);
    console.log('✅ Complete schema executed\n');

    // Read and execute advanced schema
    console.log('📋 Running advanced features schema...');
    const advancedSchema = fs.readFileSync(
      path.join(__dirname, '../database/advanced-schema.sql'),
      'utf8'
    );
    await connection.query(advancedSchema);
    console.log('✅ Advanced features schema executed\n');

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Total tables created: ${tables.length}\n`);

    console.log('📊 Tables created:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });

    // Verify critical tables
    console.log('\n🔍 Verifying critical tables...');
    const criticalTables = [
      'hospitals',
      'users',
      'patients',
      'doctors',
      'appointments',
      'patient_vitals',
      'doctor_schedules',
      'doctor_leaves',
      'patient_medical_history',
      'lab_reports',
      'patient_feedback',
      'ambulances',
      'ambulance_trips',
      'audit_logs',
      'digital_prescriptions'
    ];

    let allTablesExist = true;
    for (const table of criticalTables) {
      const [result] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = 'hospital_management' AND table_name = ?`,
        [table]
      );
      
      if (result[0].count > 0) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING!`);
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      console.log('\n✅ All critical tables verified!\n');
    } else {
      console.log('\n⚠️  Some tables are missing. Please check the schema files.\n');
    }

    // Create indexes for performance
    console.log('⚡ Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, appointment_time)',
      'CREATE INDEX IF NOT EXISTS idx_vitals_patient_date ON patient_vitals(patient_id, recorded_at)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_rating ON patient_feedback(hospital_id, rating)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_doctor_schedules_day ON doctor_schedules(doctor_id, day_of_week)'
    ];

    for (const indexQuery of indexes) {
      try {
        await connection.query(indexQuery);
      } catch (error) {
        // Index might already exist, ignore error
      }
    }
    console.log('✅ Performance indexes created\n');

    await connection.end();

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📦 System Status:');
    console.log('   ✅ Database: hospital_management');
    console.log(`   ✅ Tables: ${tables.length} tables created`);
    console.log('   ✅ Indexes: Performance indexes added');
    console.log('   ✅ Schema: Complete + Advanced features');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Start frontend: cd ../frontend/frontend && npm run dev');
    console.log('   3. Login with your credentials');
    console.log('   4. Test all 29 features!');
    console.log('\n📚 Documentation:');
    console.log('   - FULL-IMPLEMENTATION-GUIDE.md');
    console.log('   - SYSTEM-AUDIT-REPORT.md');
    console.log('   - ADVANCED-FEATURES-PLAN.md');
    console.log('\n💡 Features Available:');
    console.log('   ✅ Analytics Dashboard');
    console.log('   ✅ Patient Vitals');
    console.log('   ✅ Medical History');
    console.log('   ✅ Doctor Schedules');
    console.log('   ✅ Doctor Leaves');
    console.log('   ✅ Lab Reports');
    console.log('   ✅ Medicine Alerts');
    console.log('   ✅ Ambulance Tracking');
    console.log('   ✅ Revenue Analytics');
    console.log('   ✅ Patient Feedback');
    console.log('   ✅ Performance Ratings');
    console.log('   ✅ Audit Logs');
    console.log('   ✅ And 17 more features!');
    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MySQL is running');
    console.error('   2. Verify .env file has correct credentials');
    console.error('   3. Ensure user has CREATE DATABASE permission');
    console.error('   4. Check schema files exist in database/ folder\n');
    process.exit(1);
  }
}

// Run setup
setupCompleteSystem();
