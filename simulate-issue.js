const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function simulateFrontendFlow() {
  try {
    console.log('=== Simulating Frontend Habit Creation Flow ===\n');
    
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    const authToken = loginResponse.data.token;
    console.log('Login successful');
    console.log('User ID:', loginResponse.data.user.id);
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 2. Get initial habit count
    console.log('\n2. Getting initial habits...');
    let habitsResponse = await axios.get(`${API_URL}/habits`, { headers });
    let habits = habitsResponse.data.data || habitsResponse.data;
    console.log('Initial habits count:', habits.length);
    
    // 3. Create first habit
    console.log('\n3. Creating first habit...');
    const habit1Data = {
      name: 'Test Exercise',
      category: 'health',
      tags: [],
      expectedFrequency: { count: 1, period: 'day' }
    };
    
    const habit1Response = await axios.post(`${API_URL}/habits`, habit1Data, { headers });
    let newHabit1 = habit1Response.data;
    if (habit1Response.data && habit1Response.data.data) {
      newHabit1 = habit1Response.data.data;
    }
    console.log('First habit created with ID:', newHabit1.id);
    console.log('Full response:', JSON.stringify(newHabit1, null, 2));
    
    // 4. Check habits after first creation
    console.log('\n4. Getting habits after first creation...');
    habitsResponse = await axios.get(`${API_URL}/habits`, { headers });
    habits = habitsResponse.data.data || habitsResponse.data;
    console.log('Habits count after first creation:', habits.length);
    
    // 5. Create second habit quickly (simulate rapid user action)
    console.log('\n5. Creating second habit quickly...');
    const habit2Data = {
      name: 'Test Reading',
      category: 'education',
      tags: [],
      expectedFrequency: { count: 1, period: 'day' }
    };
    
    const habit2Response = await axios.post(`${API_URL}/habits`, habit2Data, { headers });
    let newHabit2 = habit2Response.data;
    if (habit2Response.data && habit2Response.data.data) {
      newHabit2 = habit2Response.data.data;
    }
    console.log('Second habit created with ID:', newHabit2.id);
    console.log('Full response:', JSON.stringify(newHabit2, null, 2));
    
    // 6. Check habits after second creation
    console.log('\n6. Getting habits after second creation...');
    habitsResponse = await axios.get(`${API_URL}/habits`, { headers });
    habits = habitsResponse.data.data || habitsResponse.data;
    console.log('Habits count after second creation:', habits.length);
    
    // 7. Try to complete the second habit immediately
    console.log('\n7. Attempting to complete second habit immediately...');
    try {
      const completionResponse = await axios.post(
        `${API_URL}/habits/${newHabit2.id}/complete`, 
        { date: new Date().toISOString() }, 
        { headers }
      );
      console.log('✓ Completion successful:', completionResponse.data);
    } catch (completionError) {
      console.log('✗ Completion failed:', completionError.response?.status, completionError.response?.data);
      
      // Check if the habit still exists
      console.log('\n8. Checking if habit still exists after failed completion...');
      habitsResponse = await axios.get(`${API_URL}/habits`, { headers });
      habits = habitsResponse.data.data || habitsResponse.data;
      console.log('Habits count after failed completion:', habits.length);
      
      const stillExists = habits.find(h => h.id === newHabit2.id);
      if (stillExists) {
        console.log('✓ Second habit still exists in backend');
      } else {
        console.log('✗ Second habit missing from backend - this is the problem!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

simulateFrontendFlow();