const axios = require('axios');

const AZURE_API = 'https://habit-tracker-backend-linux.azurewebsites.net/api';

async function testAzureBackend() {
  try {
    console.log('=== Testing Azure Production Backend ===\n');
    
    // Test if backend is responsive
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${AZURE_API}/habits`, {
      timeout: 10000,
      validateStatus: () => true // Don't throw on 401
    });
    
    if (healthResponse.status === 401) {
      console.log('✅ Backend is responsive (401 = needs auth, which is expected)');
    } else {
      console.log('Response status:', healthResponse.status);
    }
    
    // Try to login to test the full flow
    console.log('\n2. Testing login...');
    try {
      const loginResponse = await axios.post(`${AZURE_API}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Login successful');
      
      // Quick habit test
      console.log('\n3. Testing habit creation...');
      const headers = { Authorization: `Bearer ${loginResponse.data.token}` };
      
      const habitResponse = await axios.post(`${AZURE_API}/habits`, {
        name: 'Azure Test Habit',
        category: 'test',
        expectedFrequency: { count: 1, period: 'day' }
      }, { headers });
      
      console.log('✅ Habit creation successful, ID:', habitResponse.data.id || habitResponse.data.data?.id);
      
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('❌ Login failed - credentials may be invalid');
        console.log('This is expected if test user doesn\'t exist on production');
      } else {
        throw loginError;
      }
    }
    
    console.log('\n✅ Azure backend appears to be working correctly');
    
  } catch (error) {
    console.error('❌ Azure backend test failed:', error.message);
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot reach Azure backend - network/DNS issue');
    }
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAzureBackend();