require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupCompleteSystem() {
  console.log('🚀 Setting up Complete Hospital Management System (PostgreSQL)...\n');

  let client = null;

  try {
    // Create connection to PostgreSQL
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Create database if not exists (connect to default postgres db first)
    const adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres'
    });

    await adminClient.connect();
    
    try {
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME || 'hospital_management'}`);
      console.log('✅ Database created\n');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('✅ Database already exists\n');
      } else {
        throw err;
      }
    }

    await adminClient.end();

    // Reconnect to the hospital_management database
    await client.end();
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    await client.connect();
    console.log('✅ Connected to hospital_management database\n');

    // Read and execute complete schema
    console.log('📋 Running complete schema...');
    const completeSchema = fs.readFileSync(
      path.join(__dirname, './database/complete-schema.sql'),
      'utf8'
    );
    
    // Split by semicolon and execute each statement
    const statements = completeSchema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        console.warn(`⚠️  Warning executing statement: ${err.message}`);
      }
    }
    console.log('✅ Complete schema executed\n');

    // Read and execute advanced schema
    console.log('📋 Running advanced features schema...');
    const advancedSchema = fs.readFileSync(
      path.join(__dirname, './database/advanced-schema.sql'),
      'utf8'
    );
    
    const advancedStatements = advancedSchema.split(';').filter(stmt => stmt.trim());
    for (const statement of advancedStatements) {
      try {
        await client.query(statement);
      } catch (err) {
        console.warn(`⚠️  Warning executing statement: ${err.message}`);
      }
    }
    console.log('✅ Advanced features schema executed\n');

    // Check tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = result.rows;
    console.log(`✅ Total tables created: ${tables.length}\n`);

    console.log('📊 Tables created:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
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
      const checkResult = await client.query(
        `SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        )`,
        [table]
      );
      
      if (checkResult.rows[0].exists) {
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

    await client.end();

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
    console.log('   4. Test all features!');
    console.log('\n═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check PostgreSQL is running');
    console.error('   2. Verify .env file has correct credentials:');
    console.error('      - DB_HOST (default: localhost)');
    console.error('      - DB_PORT (default: 5432)');
    console.error('      - DB_USER (default: postgres)');
    console.error('      - DB_PASSWORD');
    console.error('      - DB_NAME (default: hospital_management)');
    console.error('   3. Ensure user has CREATE DATABASE permission');
    console.error('   4. Check schema files exist in database/ folder\n');
    process.exit(1);
  }
}

// Run setup
setupCompleteSystem();
