const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTestPatient() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('📝 Adding test patient with WhatsApp number...\n');

    // Get first hospital
    const [hospitals] = await conn.query('SELECT id FROM hospitals LIMIT 1');
    if (hospitals.length === 0) {
      console.log('❌ No hospital found!');
      return;
    }
    const hospitalId = hospitals[0].id;

    // Check if patient already exists
    const [existing] = await conn.query('SELECT id FROM patients WHERE phone = ?', ['7060985193']);
    
    if (existing.length > 0) {
      console.log('✅ Test patient already exists!');
      console.log('   Patient ID:', existing[0].id);
      console.log('   Phone: 7060985193\n');
      
      // Update phone number to ensure it's correct
      await conn.query('UPDATE patients SET phone = ? WHERE id = ?', ['7060985193', existing[0].id]);
      console.log('✅ Phone number updated!\n');
    } else {
      // Create new test patient
      const [result] = await conn.query(
        `INSERT INTO patients (hospital_id, patient_id, name, age, gender, phone, email, address, blood_group, emergency_contact, emergency_contact_name, medical_history) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hospitalId,
          'TEST001',
          'Test Patient (WhatsApp)',
          30,
          'male',
          '7060985193',
          'test@whatsapp.com',
          'Test Address, Mumbai',
          'O+',
          '9876543210',
          'Emergency Contact',
          'None'
        ]
      );

      console.log('✅ Test patient created!');
      console.log('   Patient ID:', result.insertId);
      console.log('   Name: Test Patient (WhatsApp)');
      console.log('   Phone: 7060985193\n');
    }

    console.log('📱 Now book an appointment for this patient!');
    console.log('   WhatsApp notification will be sent to: 7060985193\n');

    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addTestPatient();
