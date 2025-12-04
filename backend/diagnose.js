require('dotenv').config();
const mysql = require('mysql2/promise');

async function diagnose() {
  console.log('🔍 Diagnosing Hospital Management System...\n');
  
  console.log('📋 Environment Variables:');
  console.log('   DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
  console.log('   DB_PORT:', process.env.DB_PORT || '❌ NOT SET');
  console.log('   DB_USER:', process.env.DB_USER || '❌ NOT SET');
  console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET (hidden)' : '⚠️  EMPTY');
  console.log('   DB_NAME:', process.env.DB_NAME || '❌ NOT SET');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
  console.log('');
  
  try {
    console.log('🔌 Testing database connection...');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });
    
    console.log('✅ Database connection successful!\n');
    
    console.log('📊 Checking tables...');
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:\n`);
    
    // Check important tables
    const importantTables = [
      'users', 'hospitals', 'patients', 'doctors', 'appointments',
      'permissions', 'role_permissions', 'notifications', 'password_reset_tokens'
    ];
    
    for (const table of importantTables) {
      const exists = tables.some(t => Object.values(t)[0] === table);
      if (exists) {
        const [count] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ✅ ${table.padEnd(25)} (${count[0].count} rows)`);
      } else {
        console.log(`   ❌ ${table.padEnd(25)} (missing)`);
      }
    }
    
    console.log('\n🎉 Diagnosis complete! System is ready.\n');
    
    await conn.end();
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.log('\n💡 Possible solutions:\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔴 MySQL service is not running');
      console.log('   → Start MySQL service:');
      console.log('      Windows: Start-Service -Name MySQL80');
      console.log('      Or use Services app to start MySQL\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   🔴 Wrong username or password');
      console.log('   → Check DB_USER and DB_PASSWORD in .env file');
      console.log('   → Default: root with empty password\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   🔴 Database does not exist');
      console.log('   → Create database:');
      console.log('      mysql -u root -p -e "CREATE DATABASE hospital_management;"\n');
    } else {
      console.log('   🔴 Unknown error');
      console.log('   → Check MySQL is installed and running');
      console.log('   → Verify .env configuration\n');
    }
    
    process.exit(1);
  }
}

diagnose();
