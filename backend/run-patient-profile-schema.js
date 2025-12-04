require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  try {
    console.log('🚀 Running patient profile schema...\n');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    const schemaPath = path.join(__dirname, '..', 'database', 'patient_profile_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Executing schema...');
    await connection.query(schema);

    console.log('✅ Schema executed successfully\n');

    // Verify tables created
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'hospital_management' 
      AND TABLE_NAME LIKE 'patient_%'
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Patient-related tables:');
    tables.forEach(table => console.log(`   - ${table.TABLE_NAME}`));

    await connection.end();
    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSchema();
