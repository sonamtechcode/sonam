// Script to create admin user with properly hashed password
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('✅ Connected to database');

    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Password hashed');

    // Delete existing users
    await connection.query('DELETE FROM users');
    console.log('✅ Cleared existing users');

    // Insert users with properly hashed password
    const users = [
      [null, 'admin@hospital.com', hashedPassword, 'Super Admin', 'super_admin', '9999999999', 1],
      [1, 'admin@cityhospital.com', hashedPassword, 'City Hospital Admin', 'admin', '9876543210', 1],
      [2, 'admin@metromedical.com', hashedPassword, 'Metro Admin', 'admin', '9876543211', 1],
      [3, 'admin@sunrisehc.com', hashedPassword, 'Sunrise Admin', 'admin', '9876543212', 1]
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }

    console.log('✅ Created 4 admin users');

    // Verify users
    const [rows] = await connection.query('SELECT id, email, name, role FROM users');
    console.log('\n📋 Users in database:');
    console.table(rows);

    console.log('\n🎉 Success! You can now login with:');
    console.log('   Email: admin@hospital.com');
    console.log('   Password: admin123');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
