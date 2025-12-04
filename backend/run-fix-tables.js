require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runFixTables() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read and execute SQL file
    const sqlFile = path.join(__dirname, '../database/fix_prescription_reports.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📝 Executing SQL script...\n');
    
    const [results] = await connection.query(sql);
    
    console.log('✓ Tables fixed successfully!');
    console.log('\n=== Created Tables ===');
    console.log('- prescriptions (with medication, dosage, duration columns)');
    console.log('- patient_reports (for file uploads)');
    
    // Verify tables
    const [tables] = await connection.query("SHOW TABLES LIKE 'prescriptions'");
    const [tables2] = await connection.query("SHOW TABLES LIKE 'patient_reports'");
    
    if (tables.length > 0) {
      console.log('\n✓ Prescriptions table exists');
      const [cols] = await connection.query('DESCRIBE prescriptions');
      console.log('  Columns:', cols.map(c => c.Field).join(', '));
    }
    
    if (tables2.length > 0) {
      console.log('\n✓ Patient_reports table exists');
      const [cols] = await connection.query('DESCRIBE patient_reports');
      console.log('  Columns:', cols.map(c => c.Field).join(', '));
    }

    console.log('\n✅ Database setup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runFixTables();
