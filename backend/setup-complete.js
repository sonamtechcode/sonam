// Complete setup script - Creates database, tables, and admin users
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupComplete() {
  let connection;
  
  try {
    console.log('🚀 Starting complete database setup...\n');

    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS hospital_management');
    await connection.query('USE hospital_management');
    console.log('✅ Database created/selected\n');

    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES LIKE 'hospitals'");
    
    if (tables.length === 0) {
      // Read and execute schema
      console.log('📝 Creating tables...');
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schema);
      console.log('✅ Tables created\n');

      // Read and execute permissions
      console.log('📝 Setting up permissions...');
      const permissionsPath = path.join(__dirname, '..', 'database', 'permissions.sql');
      const permissions = fs.readFileSync(permissionsPath, 'utf8');
      await connection.query(permissions);
      console.log('✅ Permissions configured\n');

      // Read and execute notifications
      console.log('📝 Setting up notifications...');
      const notificationsPath = path.join(__dirname, '..', 'database', 'notifications.sql');
      const notifications = fs.readFileSync(notificationsPath, 'utf8');
      await connection.query(notifications);
      console.log('✅ Notifications configured\n');
    } else {
      console.log('✅ Tables already exist\n');
    }

    // Check and insert sample hospital
    const [hospitals] = await connection.query('SELECT id FROM hospitals LIMIT 1');
    if (hospitals.length === 0) {
      console.log('📝 Creating sample hospital...');
      await connection.query(`
        INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no) 
        VALUES ('City General Hospital', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', '022-12345678', 'info@cityhospital.com', 'REG001')
      `);
      console.log('✅ Hospital created\n');
    } else {
      console.log('✅ Hospital already exists\n');
    }

    // Create admin users with properly hashed passwords
    console.log('📝 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Clear existing users
    await connection.query('DELETE FROM users');
    
    const users = [
      [null, 'admin@hospital.com', hashedPassword, 'Super Admin', 'super_admin', '9999999999', 1],
      [1, 'admin@cityhospital.com', hashedPassword, 'City Hospital Admin', 'admin', '9876543210', 1],
      [1, 'doctor@hospital.com', hashedPassword, 'Dr. John Doe', 'doctor', '9876543211', 1],
      [1, 'nurse@hospital.com', hashedPassword, 'Nurse Jane', 'nurse', '9876543212', 1],
      [1, 'receptionist@hospital.com', hashedPassword, 'Receptionist Mary', 'receptionist', '9876543213', 1]
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('✅ Admin users created\n');

    // Verify setup
    const [userRows] = await connection.query('SELECT id, email, name, role FROM users');
    console.log('📋 Created Users:');
    console.table(userRows);

    console.log('\n🎉 Setup completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: admin123\n');
    console.log('💡 You can now start the server with: npm run dev\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupComplete();
