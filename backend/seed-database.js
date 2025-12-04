const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('🌱 Starting complete database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('DELETE FROM appointments');
    await conn.query('DELETE FROM lab_bookings');
    await conn.query('DELETE FROM billing');
    await conn.query('DELETE FROM emergency_cases');
    await conn.query('DELETE FROM beds');
    await conn.query('DELETE FROM wards');
    await conn.query('DELETE FROM doctors');
    await conn.query('DELETE FROM patients');
    await conn.query('DELETE FROM departments');
    await conn.query('DELETE FROM medicines');
    await conn.query('DELETE FROM lab_tests');
    await conn.query('DELETE FROM inventory');
    await conn.query('DELETE FROM users WHERE role != "super_admin"');
    await conn.query('DELETE FROM hospitals');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Cleared existing data\n');

    // 1. CREATE 4 HOSPITALS
    console.log('🏥 Creating 4 hospitals...');
    const hospitals = [
      ['City General Hospital', '123 Main Street, Andheri', 'Mumbai', 'Maharashtra', '400001', '022-12345678', 'info@cityhospital.com', 'REG001'],
      ['Apollo Medical Center', '456 Park Road, Koramangala', 'Bangalore', 'Karnataka', '560001', '080-87654321', 'contact@apollo.com', 'REG002'],
      ['Max Healthcare', '789 MG Road, Connaught Place', 'Delhi', 'Delhi', '110001', '011-23456789', 'info@maxhealth.com', 'REG003'],
      ['Fortis Hospital', '321 Beach Road, Banjara Hills', 'Hyderabad', 'Telangana', '500001', '040-98765432', 'support@fortis.com', 'REG004']
    ];

    const hospitalIds = [];
    for (const hospital of hospitals) {
      const [result] = await conn.query(
        'INSERT INTO hospitals (name, address, city, state, pincode, phone, email, registration_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        hospital
      );
      hospitalIds.push(result.insertId);
    }
    console.log(`✅ Created ${hospitalIds.length} hospitals\n`);

    // 2. CREATE USERS FOR EACH HOSPITAL
    console.log('👥 Creating users for each hospital...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    for (let i = 0; i < hospitalIds.length; i++) {
      const hospitalId = hospitalIds[i];
      const hospitalName = hospitals[i][0].toLowerCase().replace(/\s+/g, '');
      
      await conn.query(
        'INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [hospitalId, `admin@${hospitalName}.com`, hashedPassword, `${hospitals[i][0]} Admin`, 'admin', `91234567${80 + i}`, 1]
      );
      await conn.query(
        'INSERT INTO users (hospital_id, email, password, name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [hospitalId, `doctor@${hospitalName}.com`, hashedPassword, `Dr. ${hospitals[i][0]} Doctor`, 'doctor', `91234567${90 + i}`, 1]
      );
    }
    console.log('✅ Created users for all hospitals\n');

    // Now seed data for each hospital
    for (let h = 0; h < hospitalIds.length; h++) {
      const hospitalId = hospitalIds[h];
      const hospitalName = hospitals[h][0];
      
      console.log(`\n📋 Seeding data for ${hospitalName}...\n`);

      // DEPARTMENTS - 10 per hospital
      console.log(`  📝 Inserting departments...`);
      const deptNames = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'General Medicine'];
      const deptIds = [];
      for (const deptName of deptNames) {
        const [result] = await conn.query(
          'INSERT INTO departments (hospital_id, name, description) VALUES (?, ?, ?)',
          [hospitalId, deptName, `${deptName} department`]
        );
        deptIds.push(result.insertId);
      }

      // PATIENTS - 10 per hospital
      console.log(`  📝 Inserting patients...`);
      const patientIds = [];
      for (let i = 1; i <= 10; i++) {
        const [result] = await conn.query(
          'INSERT INTO patients (hospital_id, patient_id, name, age, gender, phone, email, address, blood_group, emergency_contact, emergency_contact_name, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            hospitalId,
            `PAT${h}${String(i).padStart(3, '0')}`,
            `Patient ${h + 1}-${i}`,
            25 + i * 3,
            i % 2 === 0 ? 'male' : 'female',
            `98765432${h}${i}`,
            `patient${h}${i}@email.com`,
            `Address ${i}, ${hospitalName}`,
            ['O+', 'A+', 'B+', 'AB+', 'O-'][i % 5],
            `98765432${h}${i + 10}`,
            `Emergency Contact ${i}`,
            i % 3 === 0 ? 'Diabetes' : 'None'
          ]
        );
        patientIds.push(result.insertId);
      }

      // DOCTORS - 10 per hospital
      console.log(`  📝 Inserting doctors...`);
      const doctorIds = [];
      for (let i = 0; i < 10; i++) {
        const [result] = await conn.query(
          'INSERT INTO doctors (hospital_id, department_id, name, specialization, qualification, phone, email, experience, consultation_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            hospitalId,
            deptIds[i],
            `Dr. ${deptNames[i]} Specialist ${h + 1}`,
            deptNames[i],
            'MBBS, MD',
            `91234567${h}${i}`,
            `doctor${h}${i}@${hospitalName.toLowerCase().replace(/\s+/g, '')}.com`,
            8 + i,
            500 + i * 100
          ]
        );
        doctorIds.push(result.insertId);
      }

      // MEDICINES - 10 per hospital
      console.log(`  📝 Inserting medicines...`);
      const medicines = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Ibuprofen 400mg', 'Metformin 500mg', 'Atorvastatin 10mg', 'Omeprazole 20mg', 'Cetirizine 10mg', 'Azithromycin 500mg', 'Losartan 50mg', 'Aspirin 75mg'];
      for (let i = 0; i < 10; i++) {
        await conn.query(
          'INSERT INTO medicines (hospital_id, name, generic_name, manufacturer, batch_no, expiry_date, quantity, price, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [hospitalId, medicines[i], medicines[i].split(' ')[0], 'Pharma Co', `BATCH${h}${i}`, '2025-12-31', 500 + i * 50, 5 + i * 2, 100]
        );
      }

      // LAB TESTS - 10 per hospital
      console.log(`  📝 Inserting lab tests...`);
      const tests = ['Complete Blood Count', 'Blood Sugar Fasting', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Thyroid Profile', 'Urine Routine', 'ECG', 'X-Ray Chest', 'Ultrasound'];
      const testIds = [];
      for (let i = 0; i < 10; i++) {
        const [result] = await conn.query(
          'INSERT INTO lab_tests (hospital_id, test_name, test_code, price, normal_range) VALUES (?, ?, ?, ?, ?)',
          [hospitalId, tests[i], `TEST${i + 1}`, 200 + i * 100, 'Normal range']
        );
        testIds.push(result.insertId);
      }

      // INVENTORY - 10 per hospital
      console.log(`  📝 Inserting inventory...`);
      const items = ['Surgical Gloves', 'Syringes 5ml', 'Bandages', 'Cotton Wool', 'Surgical Masks', 'Hand Sanitizer', 'Thermometers', 'BP Monitors', 'Oxygen Cylinders', 'Wheelchairs'];
      for (let i = 0; i < 10; i++) {
        await conn.query(
          'INSERT INTO inventory (hospital_id, item_name, category, quantity, unit, purchase_date) VALUES (?, ?, ?, ?, ?, ?)',
          [hospitalId, items[i], 'Medical Supplies', 100 + i * 50, 'pieces', '2024-01-15']
        );
      }

      // WARDS - 10 per hospital
      console.log(`  📝 Inserting wards...`);
      const wardIds = [];
      const wardTypes = ['general', 'icu', 'private', 'semi-private'];
      for (let i = 1; i <= 10; i++) {
        const [result] = await conn.query(
          'INSERT INTO wards (hospital_id, name, ward_type, total_beds) VALUES (?, ?, ?, ?)',
          [hospitalId, `Ward ${i}`, wardTypes[i % 4], 10]
        );
        wardIds.push(result.insertId);
      }

      // BEDS - 10 per hospital (1 per ward)
      console.log(`  📝 Inserting beds...`);
      for (let i = 0; i < 10; i++) {
        await conn.query(
          'INSERT INTO beds (hospital_id, ward_id, bed_number, bed_type, status) VALUES (?, ?, ?, ?, ?)',
          [hospitalId, wardIds[i], `B${i + 1}`, wardTypes[i % 4], i % 3 === 0 ? 'occupied' : 'available']
        );
      }

      // APPOINTMENTS - 10 per hospital
      console.log(`  📝 Inserting appointments...`);
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i - 5));
        await conn.query(
          'INSERT INTO appointments (hospital_id, patient_id, doctor_id, appointment_date, appointment_time, token_number, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [hospitalId, patientIds[i], doctorIds[i], date.toISOString().split('T')[0], `${9 + i}:00:00`, i + 1, 'Regular checkup', i < 5 ? 'completed' : 'scheduled']
        );
      }

      // LAB BOOKINGS - 10 per hospital
      console.log(`  📝 Inserting lab bookings...`);
      for (let i = 0; i < 10; i++) {
        await conn.query(
          'INSERT INTO lab_bookings (hospital_id, patient_id, test_id, doctor_id, status, result_value) VALUES (?, ?, ?, ?, ?, ?)',
          [hospitalId, patientIds[i], testIds[i], doctorIds[i], i % 3 === 0 ? 'completed' : 'pending', i % 3 === 0 ? 'Normal' : null]
        );
      }

      // BILLING - 10 per hospital
      console.log(`  📝 Inserting billing records...`);
      for (let i = 0; i < 10; i++) {
        const items = JSON.stringify([{ name: 'Consultation', quantity: 1, price: 600 }]);
        await conn.query(
          'INSERT INTO billing (hospital_id, patient_id, bill_number, items, total_amount, discount, tax, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [hospitalId, patientIds[i], `BILL${h}${String(i + 1).padStart(3, '0')}`, items, 600, 0, 30, 'cash', i % 2 === 0 ? 'paid' : 'pending']
        );
      }

      // EMERGENCY CASES - 10 per hospital
      console.log(`  📝 Inserting emergency cases...`);
      const complaints = ['Chest pain', 'Headache', 'Fever', 'Accident', 'Abdominal pain', 'Allergic reaction', 'Fracture', 'Vomiting', 'Unconscious', 'Heart palpitations'];
      for (let i = 0; i < 10; i++) {
        const vitalSigns = JSON.stringify({ bp: '120/80', pulse: 72, temperature: 98.6, oxygen: 98 });
        await conn.query(
          'INSERT INTO emergency_cases (hospital_id, patient_id, complaint, severity, vital_signs, status) VALUES (?, ?, ?, ?, ?, ?)',
          [hospitalId, patientIds[i], complaints[i], ['low', 'medium', 'high'][i % 3], vitalSigns, i % 2 === 0 ? 'active' : 'discharged']
        );
      }

      console.log(`  ✅ Completed seeding for ${hospitalName}\n`);
    }

    // Summary
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   🏥 Hospitals: ${hospitalIds.length}`);
    console.log(`   📋 Per Hospital:`);
    console.log(`      - Departments: 10`);
    console.log(`      - Patients: 10`);
    console.log(`      - Doctors: 10`);
    console.log(`      - Medicines: 10`);
    console.log(`      - Lab Tests: 10`);
    console.log(`      - Inventory: 10`);
    console.log(`      - Wards: 10`);
    console.log(`      - Beds: 10`);
    console.log(`      - Appointments: 10`);
    console.log(`      - Lab Bookings: 10`);
    console.log(`      - Billing: 10`);
    console.log(`      - Emergency Cases: 10\n`);

    console.log('📝 Login Credentials:');
    console.log('   Super Admin:');
    console.log('      Email: sonamwork73@gmail.com');
    console.log('      Password: admin123\n');
    console.log('   Hospital Admins:');
    for (let i = 0; i < hospitals.length; i++) {
      const hospitalName = hospitals[i][0].toLowerCase().replace(/\s+/g, '');
      console.log(`      ${hospitals[i][0]}: admin@${hospitalName}.com / admin123`);
    }
    console.log('');

    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (conn) await conn.end();
    process.exit(1);
  }
}

seedDatabase();
