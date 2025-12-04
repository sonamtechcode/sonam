const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedNotifications() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('🔔 Adding sample notifications...\n');

    // Get first user ID
    const [users] = await conn.query('SELECT id, hospital_id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const userId = users[0].id;
    const hospitalId = users[0].hospital_id;

    // Sample notifications
    const notifications = [
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'New Patient Registered',
        message: 'Patient Rajesh Kumar has been successfully registered with ID PAT001',
        type: 'success',
        link: '/patients'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Appointment Scheduled',
        message: 'New appointment scheduled for tomorrow at 10:00 AM with Dr. Arun Mehta',
        type: 'info',
        link: '/appointments'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Low Medicine Stock',
        message: 'Paracetamol 500mg stock is running low. Current quantity: 50 units',
        type: 'warning',
        link: '/pharmacy'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Emergency Case',
        message: 'New emergency case admitted - Patient with severe chest pain',
        type: 'error',
        link: '/emergency'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Lab Test Completed',
        message: 'Blood test results are ready for patient Priya Sharma',
        type: 'success',
        link: '/laboratory'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Payment Received',
        message: 'Payment of ₹2,000 received for Bill #BILL001',
        type: 'success',
        link: '/billing'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Doctor Schedule Updated',
        message: 'Dr. Sneha Rao schedule has been updated for next week',
        type: 'info',
        link: '/doctors'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'Inventory Alert',
        message: 'Surgical gloves stock below reorder level. Please restock soon',
        type: 'warning',
        link: '/inventory'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'New User Added',
        message: 'New staff member has been added to the system',
        type: 'info',
        link: '/users'
      },
      {
        user_id: userId,
        hospital_id: hospitalId,
        title: 'System Update',
        message: 'System maintenance scheduled for this weekend',
        type: 'warning',
        link: '/settings'
      }
    ];

    // Insert notifications
    for (const notif of notifications) {
      try {
        await conn.query(
          'INSERT INTO notifications (user_id, hospital_id, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)',
          [notif.user_id, notif.hospital_id, notif.title, notif.message, notif.type, notif.link]
        );
      } catch (err) {
        console.error(`Error inserting notification: ${err.message}`);
      }
    }

    console.log('✅ Sample notifications added successfully!\n');

    // Show count
    const [count] = await conn.query('SELECT COUNT(*) as total FROM notifications WHERE user_id = ?', [userId]);
    console.log(`📊 Total notifications: ${count[0].total}\n`);

    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedNotifications();
