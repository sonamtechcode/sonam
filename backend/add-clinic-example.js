// Example: Add a clinic programmatically (without prompts)
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addExampleClinic() {
  let connection;
  
  try {
    console.log('🏥 Adding Example Clinic...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('✅ Connected to database');

    // Clinic details
    const clinicData = {
      name: 'Sunrise Dental Clinic',
      address: '456 Park Avenue, Near City Mall',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '080-12345678',
      email: 'info@sunrisedental.com',
      registration_no: 'REG003'
    };

    // Admin details
    const adminData = {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh@sunrisedental.com',
      phone: '9876543210',
      password: 'admin123'
    };

    // Branding
    const branding = {
      logo_url: 'https://example.com/sunrise-logo.png',
      primary_color: '#f59e0b',
      secondary_color: '#d97706'
    };

    // Insert clinic
    const [hospitalResult] = await connection.query(
      `INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [clinicData.name, clinicData.address, clinicData.city, clinicData.state, 
       clinicData.pincode, clinicData.phone, clinicData.email, clinicData.registration_no]
    );

    const hospitalId = hospitalResult.insertId;
    console.log(`✅ Clinic created with ID: ${hospitalId}`);

    // Create admin
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    await connection.query(
      `INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) 
       VALUES (?, ?, ?, ?, 'admin', ?, 1)`,
      [hospitalId, adminData.email, hashedPassword, adminData.name, adminData.phone]
    );
    console.log('✅ Admin user created');

    // Clinic settings
    await connection.query(
      `INSERT INTO clinic_settings (hospital_id, clinic_name, logo_url, primary_color, secondary_color) 
       VALUES (?, ?, ?, ?, ?)`,
      [hospitalId, clinicData.name, branding.logo_url, branding.primary_color, branding.secondary_color]
    );
    console.log('✅ Branding configured');

    // Departments
    const departments = [
      'General Dentistry', 'Orthodontics', 'Oral Surgery', 
      'Pediatric Dentistry', 'Cosmetic Dentistry', 'Endodontics',
      'Periodontics', 'Prosthodontics', 'Oral Medicine', 'Implantology'
    ];

    for (const dept of departments) {
      await connection.query(
        'INSERT INTO departments (hospital_id, name, is_active) VALUES (?, ?, 1)',
        [hospitalId, dept]
      );
    }
    console.log(`✅ Created ${departments.length} departments`);

    // Wards
    const wards = [
      ['General Ward', 'general', 15],
      ['Private Ward', 'private', 8],
      ['Recovery Room', 'semi-private', 6]
    ];

    for (const [name, type, beds] of wards) {
      await connection.query(
        'INSERT INTO wards (hospital_id, name, ward_type, total_beds, is_active) VALUES (?, ?, ?, ?, 1)',
        [hospitalId, name, type, beds]
      );
    }
    console.log(`✅ Created ${wards.length} wards`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Sunrise Dental Clinic Setup Complete!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n🌐 Login at: http://localhost:3001/login');
    console.log('='.repeat(60));

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addExampleClinic();
