require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
});

async function seedData() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // 1. Insert Hospital
    console.log('📍 Creating hospital...');
    const hospitalResult = await pool.query(
      `INSERT INTO hospitals (name, email, phone, address, city, state, country, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Solvixo Hospital', 'info@solvixo.com', '+91-9876543210', '123 Medical Street', 'Mumbai', 'Maharashtra', 'India', 'active']
    );
    const hospitalId = hospitalResult.rows[0].id;
    console.log(`   ✅ Hospital created with ID: ${hospitalId}\n`);

    // 2. Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 3. Insert Admin User
    console.log('👤 Creating admin user...');
    const adminResult = await pool.query(
      `INSERT INTO users (hospital_id, username, email, password_hash, role, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [hospitalId, 'admin', 'admin@solvixo.com', hashedPassword, 'admin', 'Admin', 'User', true]
    );
    const adminId = adminResult.rows[0].id;
    console.log(`   ✅ Admin created with ID: ${adminId}`);
    console.log(`   📧 Email: admin@solvixo.com`);
    console.log(`   🔑 Password: 123456\n`);

    // 4. Insert Doctor User
    console.log('👨‍⚕️ Creating doctor user...');
    const doctorUserResult = await pool.query(
      `INSERT INTO users (hospital_id, username, email, password_hash, role, first_name, last_name, department, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [hospitalId, 'dr_sharma', 'dr.sharma@solvixo.com', hashedPassword, 'doctor', 'Rajesh', 'Sharma', 'Cardiology', true]
    );
    const doctorUserId = doctorUserResult.rows[0].id;
    console.log(`   ✅ Doctor user created with ID: ${doctorUserId}`);
    console.log(`   📧 Email: dr.sharma@solvixo.com`);
    console.log(`   🔑 Password: 123456\n`);

    // 5. Insert Doctor Record
    console.log('🏥 Creating doctor record...');
    const doctorResult = await pool.query(
      `INSERT INTO doctors (hospital_id, user_id, license_number, specialization, qualification, experience_years, consultation_fee, availability_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [hospitalId, doctorUserId, 'LIC123456', 'Cardiology', 'MBBS, MD', 10, 500.00, 'available']
    );
    const doctorId = doctorResult.rows[0].id;
    console.log(`   ✅ Doctor record created with ID: ${doctorId}\n`);

    // 6. Insert Patient
    console.log('🤒 Creating patient...');
    const patientResult = await pool.query(
      `INSERT INTO patients (hospital_id, patient_id_number, first_name, last_name, date_of_birth, gender, blood_group, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (patient_id_number) DO UPDATE SET patient_id_number = EXCLUDED.patient_id_number
       RETURNING id`,
      [hospitalId, 'PAT001', 'Amit', 'Kumar', '1990-05-15', 'male', 'O+', '+91-9876543211', 'amit.kumar@email.com', 'active']
    );
    const patientId = patientResult.rows[0].id;
    console.log(`   ✅ Patient created with ID: ${patientId}\n`);

    // 7. Insert Appointment
    console.log('📅 Creating appointment...');
    const appointmentResult = await pool.query(
      `INSERT INTO appointments (hospital_id, patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, reason_for_visit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [hospitalId, patientId, doctorId, '2026-03-20', '10:00:00', 'scheduled', 'consultation', 'Heart checkup']
    );
    const appointmentId = appointmentResult.rows[0].id;
    console.log(`   ✅ Appointment created with ID: ${appointmentId}\n`);

    // 8. Insert Patient Vitals
    console.log('📊 Creating patient vitals...');
    await pool.query(
      `INSERT INTO patient_vitals (hospital_id, patient_id, recorded_by, temperature, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, respiratory_rate, oxygen_saturation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [hospitalId, patientId, adminId, 98.6, 120, 80, 72, 16, 98.5]
    );
    console.log(`   ✅ Patient vitals recorded\n`);

    // 9. Insert Department
    console.log('🏢 Creating department...');
    const deptResult = await pool.query(
      `INSERT INTO departments (hospital_id, name, description, head_doctor_id, total_beds, available_beds)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [hospitalId, 'Cardiology', 'Heart and Cardiovascular Department', doctorId, 20, 15]
    );
    const deptId = deptResult.rows[0].id;
    console.log(`   ✅ Department created with ID: ${deptId}\n`);

    // 10. Insert Beds
    console.log('🛏️ Creating beds...');
    for (let i = 1; i <= 5; i++) {
      await pool.query(
        `INSERT INTO beds (hospital_id, department_id, bed_number, bed_type, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [hospitalId, deptId, `BED-${i}`, i === 1 ? 'icu' : 'general', 'available']
      );
    }
    console.log(`   ✅ 5 beds created\n`);

    // 11. Insert Prescription
    console.log('💊 Creating prescription...');
    await pool.query(
      `INSERT INTO digital_prescriptions (hospital_id, patient_id, doctor_id, appointment_id, medicine_name, dosage, frequency, duration_days, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [hospitalId, patientId, doctorId, appointmentId, 'Aspirin', '100mg', 'Once daily', 30, 'active']
    );
    console.log(`   ✅ Prescription created\n`);

    // 12. Insert Lab Report
    console.log('🧪 Creating lab report...');
    await pool.query(
      `INSERT INTO lab_reports (hospital_id, patient_id, test_name, test_code, ordered_by, status, results)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [hospitalId, patientId, 'Blood Test', 'BT001', adminId, 'completed', 'All values normal']
    );
    console.log(`   ✅ Lab report created\n`);

    // 13. Insert Ambulance
    console.log('🚑 Creating ambulance...');
    const ambulanceResult = await pool.query(
      `INSERT INTO ambulances (hospital_id, ambulance_number, vehicle_registration, driver_name, driver_phone, vehicle_type, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [hospitalId, 'AMB-001', 'MH-01-AB-1234', 'Rajesh Singh', '+91-9876543212', 'advanced', 2, 'available']
    );
    console.log(`   ✅ Ambulance created\n`);

    // 14. Insert Pharmacy Items
    console.log('💉 Creating pharmacy items...');
    const medicines = [
      ['Aspirin', 'ASP001', 'Acetylsalicylic Acid', 'Bayer', 500, 100, 10.00],
      ['Paracetamol', 'PAR001', 'Paracetamol', 'Crocin', 1000, 200, 5.00],
      ['Amoxicillin', 'AMX001', 'Amoxicillin', 'Cipla', 300, 50, 25.00]
    ];

    for (const medicine of medicines) {
      await pool.query(
        `INSERT INTO pharmacy (hospital_id, medicine_name, medicine_code, generic_name, manufacturer, quantity_in_stock, reorder_level, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [hospitalId, ...medicine]
      );
    }
    console.log(`   ✅ 3 medicines added to pharmacy\n`);

    // 15. Insert Billing
    console.log('💰 Creating billing record...');
    await pool.query(
      `INSERT INTO billing (hospital_id, patient_id, invoice_number, service_type, amount, tax_amount, total_amount, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [hospitalId, patientId, 'INV-001', 'Consultation', 500.00, 90.00, 590.00, 'pending']
    );
    console.log(`   ✅ Billing record created\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 SEED DATA INSERTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Test Credentials:');
    console.log('   Role: Admin');
    console.log('   Email: admin@solvixo.com');
    console.log('   Password: 123456');
    console.log('\n   Role: Doctor');
    console.log('   Email: dr.sharma@solvixo.com');
    console.log('   Password: 123456');
    console.log('\n🚀 You can now login and test the system!');
    console.log('═══════════════════════════════════════════════════════\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
