const db = require('./src/config/database');

async function checkTables() {
  try {
    const [tables] = await db.query('SHOW TABLES');
    console.log('\n=== Existing Tables ===');
    tables.forEach(t => console.log('- ' + Object.values(t)[0]));
    
    // Check prescriptions table structure
    try {
      const [prescriptionCols] = await db.query('DESCRIBE prescriptions');
      console.log('\n=== Prescriptions Table Structure ===');
      prescriptionCols.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    } catch (err) {
      console.log('\n❌ Prescriptions table does not exist');
    }
    
    // Check patient_reports table
    try {
      const [reportCols] = await db.query('DESCRIBE patient_reports');
      console.log('\n=== Patient Reports Table Structure ===');
      reportCols.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    } catch (err) {
      console.log('\n❌ Patient_reports table does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
