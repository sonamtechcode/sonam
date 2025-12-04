require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addNewClinic() {
  let connection;
  
  try {
    console.log('🏥 Add New Clinic/Hospital\n');
    console.log('='.repeat(50));

    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('✅ Connected to database\n');

    // Collect clinic information
    console.log('📋 Enter Clinic Details:\n');
    
    const clinicName = await question('Clinic Name: ');
    const address = await question('Address: ');
    const city = await question('City: ');
    const state = await question('State: ');
    const pincode = await question('Pincode: ');
    const phone = await question('Phone: ');
    const email = await question('Email: ');
    const registrationNo = await question('Registration Number: ');

    console.log('\n👤 Create Admin User for this Clinic:\n');
    
    const adminName = await question('Admin Name: ');
    const adminEmail = await question('Admin Email: ');
    const adminPhone = await question('Admin Phone: ');
    const adminPassword = await question('Admin Password (default: admin123): ') || 'admin123';

    console.log('\n🎨 Clinic Branding (Optional - Press Enter to skip):\n');
    
    const logoUrl = await question('Logo URL: ');
    const primaryColor = await question('Primary Color (default: #3b82f6): ') || '#3b82f6';
    const secondaryColor = await question('Secondary Color (default: #1d4ed8): ') || '#1d4ed8';

    console.log('\n⚙️  Creating clinic...');

    // Insert hospital/clinic
    const [hospitalResult] = await connection.query(
      `INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [clinicName, address, city, state, pincode, phone, email, registrationNo]
    );

    const hospitalId = hospitalResult.insertId;
    console.log(`✅ Clinic created with ID: ${hospitalId}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const [userResult] = await connection.query(
      `INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) 
       VALUES (?, ?, ?, ?, 'admin', ?, 1)`,
      [hospitalId, adminEmail, hashedPassword, adminName, adminPhone]
    );

    console.log(`✅ Admin user created with ID: ${userResult.insertId}`);

    // Create clinic settings
    await connection.query(
      `INSERT INTO clinic_settings (hospital_id, clinic_name, logo_url, primary_color, secondary_color) 
       VALUES (?, ?, ?, ?, ?)`,
      [hospitalId, clinicName, logoUrl || null, primaryColor, secondaryColor]
    );

    console.log('✅ Clinic branding settings created');

    // Create default departments
    console.log('\n📁 Creating default departments...');
    const departments = [
      'General Medicine',
      'Pediatrics',
      'Orthopedics',
      'Cardiology',
      'Dermatology',
      'ENT',
      'Ophthalmology',
      'Gynecology',
      'Dentistry',
      'Emergency'
    ];

    for (const dept of departments) {
      await connection.query(
        'INSERT INTO departments (hospital_id, name, is_active) VALUES (?, ?, 1)',
        [hospitalId, dept]
      );
    }

    console.log(`✅ Created ${departments.length} default departments`);

    // Create default wards
    console.log('\n🏥 Creating default wards...');
    const wards = [
      ['General Ward', 'general', 20],
      ['ICU', 'icu', 10],
      ['Private Ward', 'private', 5]
    ];

    for (const [name, type, beds] of wards) {
      await connection.query(
        'INSERT INTO wards (hospital_id, name, ward_type, total_beds, is_active) VALUES (?, ?, ?, ?, 1)',
        [hospitalId, name, type, beds]
      );
    }

    console.log(`✅ Created ${wards.length} default wards`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Clinic Setup Complete!\n');
    console.log('📋 Summary:');
    console.log(`   Clinic ID: ${hospitalId}`);
    console.log(`   Clinic Name: ${clinicName}`);
    console.log(`   Admin Email: ${adminEmail}`);
    console.log(`   Admin Password: ${adminPassword}`);
    console.log(`   Location: ${city}, ${state}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Login with admin credentials');
    console.log('   2. Add doctors and staff');
    console.log('   3. Configure lab tests and medicines');
    console.log('   4. Start registering patients');
    console.log('\n🌐 Login URL: http://localhost:3001/login');
    console.log('='.repeat(50));

    await connection.end();
    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (connection) await connection.end();
    rl.close();
    process.exit(1);
  }
}

addNewClinic();
