const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// You'll need to replace this with a valid token from your login
const TOKEN = 'YOUR_AUTH_TOKEN_HERE';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

async function testPrescription() {
  console.log('\n=== Testing Prescription Creation ===');
  try {
    const response = await api.post('/prescriptions', {
      patient_id: 1, // Replace with valid patient ID
      doctor_id: 1,  // Replace with valid doctor ID
      medication: 'Amoxicillin',
      dosage: '500mg',
      duration: '7 days',
      notes: 'Take after meals'
    });
    console.log('✓ Prescription created:', response.data);
  } catch (error) {
    console.error('✗ Failed to create prescription:', error.response?.data || error.message);
  }
}

async function testGetPrescriptions() {
  console.log('\n=== Testing Get Prescriptions ===');
  try {
    const response = await api.get('/prescriptions/patient/1'); // Replace with valid patient ID
    console.log('✓ Prescriptions fetched:', response.data);
  } catch (error) {
    console.error('✗ Failed to fetch prescriptions:', error.response?.data || error.message);
  }
}

async function testReportUpload() {
  console.log('\n=== Testing Report Upload ===');
  
  // Create a test file if it doesn't exist
  const testFilePath = path.join(__dirname, 'test-report.txt');
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(testFilePath, 'This is a test medical report');
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('patient_id', '1'); // Replace with valid patient ID
    formData.append('report_type', 'Medical Report');
    formData.append('description', 'Test report upload');

    const response = await axios.post(`${API_URL}/patient-reports`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    console.log('✓ Report uploaded:', response.data);
  } catch (error) {
    console.error('✗ Failed to upload report:', error.response?.data || error.message);
  }
}

async function testGetReports() {
  console.log('\n=== Testing Get Reports ===');
  try {
    const response = await api.get('/patient-reports/patient/1'); // Replace with valid patient ID
    console.log('✓ Reports fetched:', response.data);
  } catch (error) {
    console.error('✗ Failed to fetch reports:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('Starting Prescription & Report Tests...');
  console.log('Make sure the server is running on http://localhost:5000');
  console.log('Update TOKEN, patient_id, and doctor_id in this script before running\n');

  await testGetPrescriptions();
  await testPrescription();
  await testGetPrescriptions();
  
  await testGetReports();
  await testReportUpload();
  await testGetReports();

  console.log('\n=== Tests Complete ===\n');
}

runTests();
