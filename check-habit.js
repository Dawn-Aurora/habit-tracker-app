const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function checkSpecificHabit() {
  try {
    console.log('=== Checking for specific habit ID ===\n');
    
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
    
    // 2. Get all habits
    console.log('\n2. Getting all habits...');
    const habitsResponse = await axios.get(`${API_URL}/habits`, { headers });
    const habits = habitsResponse.data.data || habitsResponse.data;
    console.log('Total habits found:', habits.length);
    
    // 3. Check for the specific problematic habit ID
    const targetHabitId = 'a867a40d-ccf9-4f43-93a3-60a580cf84c6';
    console.log(`\n3. Searching for habit ID: ${targetHabitId}`);
    
    const targetHabit = habits.find(h => h.id === targetHabitId);
    if (targetHabit) {
      console.log('✓ Found the habit:', JSON.stringify(targetHabit, null, 2));
      
      // Try to complete it
      console.log('\n4. Attempting to complete the habit...');
      try {
        const completionResponse = await axios.post(
          `${API_URL}/habits/${targetHabitId}/complete`, 
          { date: new Date().toISOString() }, 
          { headers }
        );
        console.log('✓ Completion successful:', completionResponse.data);
      } catch (completionError) {
        console.log('✗ Completion failed:', completionError.response?.status, completionError.response?.data);
      }
    } else {
      console.log('✗ Habit NOT found');
      console.log('Available habit IDs:');
      habits.forEach((h, i) => {
        console.log(`  ${i + 1}. ${h.id} - ${h.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkSpecificHabit();