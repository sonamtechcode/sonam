const axios = require('axios');

const API_URL = 'https://healthhubapi.solvixo.org/api';

async function testAPI() {
  console.log('Testing API Connection...\n');
  console.log(`API URL: ${API_URL}\n`);

  // Test 1: Health Check (if available)
  try {
    console.log('1. Testing basic connectivity...');
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Health check passed:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('⚠️  Health endpoint not available (this is okay)');
    } else {
      console.log('❌ Connection error:', error.message);
    }
  }

  // Test 2: Login endpoint
  try {
    console.log('\n2. Testing login endpoint...');
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'test@example.com',
        password: 'test123'
      },
      { 
        timeout: 10000,
        validateStatus: () => true // Accept any status code
      }
    );
    
    if (response.status === 401) {
      console.log('✅ Login endpoint is working (invalid credentials expected)');
      console.log('   Response:', response.data);
    } else if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log('   Response:', response.data);
    } else {
      console.log('⚠️  Unexpected response:', response.status, response.data);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to API server');
      console.log('   Make sure the backend is running on the production server');
    } else if (error.response) {
      console.log('✅ API is responding');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }

  // Test 3: Check CORS
  console.log('\n3. CORS Configuration:');
  console.log('   Make sure your backend allows requests from your frontend domain');
  console.log('   Backend should have CORS enabled for production frontend URL');

  console.log('\n=== Test Complete ===\n');
}

testAPI();
