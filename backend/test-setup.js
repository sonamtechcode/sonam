require('dotenv').config();
const mysql = require('mysql2/promise');

async function testSetup() {
  console.log('🔍 Testing Hospital Management System Setup...\n');
  
  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });
    console.log('   ✅ Database connected successfully\n');

    // Check permissions table
    console.log('2️⃣ Checking permissions table...');
    const [permissions] = await conn.query('SELECT COUNT(*) as count FROM permissions');
    console.log(`   ✅ Permissions table exists with ${permissions[0].count} permissions\n`);

    // Check role_permissions table
    console.log('3️⃣ Checking role_permissions table...');
    const [rolePerms] = await conn.query('SELECT COUNT(*) as count FROM role_permissions');
    console.log(`   ✅ Role permissions table exists with ${rolePerms[0].count} assignments\n`);

    // Check notifications table
    console.log('4️⃣ Checking notifications table...');
    const [notifications] = await conn.query('SHOW TABLES LIKE "notifications"');
    if (notifications.length > 0) {
      console.log('   ✅ Notifications table exists\n');
    } else {
      console.log('   ❌ Notifications table missing - Run: node backend/setup-notifications.js\n');
    }

    // Check password_reset_tokens table
    console.log('5️⃣ Checking password_reset_tokens table...');
    const [resetTokens] = await conn.query('SHOW TABLES LIKE "password_reset_tokens"');
    if (resetTokens.length > 0) {
      console.log('   ✅ Password reset tokens table exists\n');
    } else {
      console.log('   ❌ Password reset tokens table missing - Run: node backend/setup-notifications.js\n');
    }

    // Check users table
    console.log('6️⃣ Checking users...');
    const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
    console.log(`   ✅ Users table exists with ${users[0].count} users\n`);

    // Check environment variables
    console.log('7️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'DB_HOST',
      'DB_USER',
      'DB_NAME',
      'JWT_SECRET',
      'EMAIL_USER'
    ];
    
    let envOk = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} is set`);
      } else {
        console.log(`   ❌ ${envVar} is missing`);
        envOk = false;
      }
    }
    
    if (!process.env.EMAIL_PASSWORD) {
      console.log('   ⚠️  EMAIL_PASSWORD is not set (required for forgot password feature)');
    } else {
      console.log('   ✅ EMAIL_PASSWORD is set');
    }
    
    console.log('\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database: Connected');
    console.log(`✅ Permissions: ${permissions[0].count} permissions loaded`);
    console.log(`✅ Role Permissions: ${rolePerms[0].count} assignments`);
    console.log(`${notifications.length > 0 ? '✅' : '❌'} Notifications: ${notifications.length > 0 ? 'Ready' : 'Missing'}`);
    console.log(`${resetTokens.length > 0 ? '✅' : '❌'} Password Reset: ${resetTokens.length > 0 ? 'Ready' : 'Missing'}`);
    console.log(`${envOk ? '✅' : '⚠️ '} Environment: ${envOk ? 'Configured' : 'Needs attention'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (notifications.length > 0 && resetTokens.length > 0 && envOk) {
      console.log('🎉 All systems ready! You can start the application.\n');
      console.log('Run: npm run dev (in backend folder)');
    } else {
      console.log('⚠️  Some setup steps are missing. Please check above.\n');
    }

    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. MySQL is running');
    console.log('   2. Database "hospital_management" exists');
    console.log('   3. .env file is configured correctly');
    process.exit(1);
  }
}

testSetup();
