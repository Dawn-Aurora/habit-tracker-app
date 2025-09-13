const axios = require('axios');

const AZURE_API = 'https://habit-tracker-backend-linux.azurewebsites.net/api';

async function debugBackendDataClient() {
  try {
    console.log('=== Debugging Backend Data Client ===\n');
    
    // Register and login
    const testEmail = `debugtest${Date.now()}@example.com`;
    await axios.post(`${AZURE_API}/auth/register`, {
      email: testEmail,
      password: 'testpassword123',
      firstName: 'Debug',
      lastName: 'Test'
    });
    
    const loginResponse = await axios.post(`${AZURE_API}/auth/login`, {
      email: testEmail,
      password: 'testpassword123'
    });
    
    const headers = { Authorization: `Bearer ${loginResponse.data.token}` };
    console.log('Logged in, User ID:', loginResponse.data.user.id, 'Type:', typeof loginResponse.data.user.id);
    
    // Create a habit and examine the response structure
    console.log('\n1. Creating habit and examining response...');
    const habitData = {
      name: 'Debug Test Habit',
      category: 'test',
      expectedFrequency: { count: 1, period: 'day' }
    };
    
    const createResponse = await axios.post(`${AZURE_API}/habits`, habitData, { headers });
    
    console.log('Full create response:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    
    // Check if the habit appears in the list
    console.log('\n2. Fetching all habits to see if it appears...');
    const habitsResponse = await axios.get(`${AZURE_API}/habits`, { headers });
    
    console.log('Full habits response:');
    console.log(JSON.stringify(habitsResponse.data, null, 2));
    
    // Try to create another habit to see the pattern
    console.log('\n3. Creating second habit...');
    const habit2Data = {
      name: 'Debug Test Habit 2',
      category: 'test',
      expectedFrequency: { count: 1, period: 'day' }
    };
    
    const create2Response = await axios.post(`${AZURE_API}/habits`, habit2Data, { headers });
    
    console.log('Second habit create response:');
    console.log(JSON.stringify(create2Response.data, null, 2));
    
    // Check habits again
    console.log('\n4. Fetching habits after second creation...');
    const habits2Response = await axios.get(`${AZURE_API}/habits`, { headers });
    
    console.log('Habits after second creation:');
    console.log(JSON.stringify(habits2Response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugBackendDataClient();