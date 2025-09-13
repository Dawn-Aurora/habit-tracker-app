const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user credentials
let authToken = '';

async function testFlow() {
  try {
    console.log('=== Testing Habit Persistence and Updates ===\n');
    
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    authToken = loginResponse.data.token;
    console.log('Login successful');
    console.log('User ID:', loginResponse.data.user.id);
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 2. Get initial habits
    console.log('\n2. Getting initial habits...');
    const initialHabits = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Initial habits count:', initialHabits.data.data.length);
    
    // 3. Create first habit
    console.log('\n3. Creating first habit...');
    const habit1Response = await axios.post(`${API_URL}/habits`, {
      name: 'Exercise',
      frequency: 'daily',
      category: 'health'
    }, { headers });
    console.log('First habit created:', habit1Response.data.data.name);
    
    // 4. Create second habit
    console.log('\n4. Creating second habit...');
    const habit2Response = await axios.post(`${API_URL}/habits`, {
      name: 'Read Books', 
      frequency: 'daily',
      category: 'education'
    }, { headers });
    console.log('Second habit created:', habit2Response.data.data.name);
    
    // 5. Get habits after creation
    console.log('\n5. Getting habits after creation...');
    const habitsAfterCreation = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Habits after creation count:', habitsAfterCreation.data.data.length);
    habitsAfterCreation.data.data.forEach((habit, index) => {
      console.log(`  ${index + 1}. ${habit.name} (${habit.id})`);
    });
    
    // 6. Simulate page refresh delay
    console.log('\n6. Simulating page refresh (waiting 3 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. Fetch habits again (like a page refresh)
    console.log('\n7. Fetching habits after refresh...');
    const refreshHabits = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Habits after refresh count:', refreshHabits.data.data.length);
    refreshHabits.data.data.forEach((habit, index) => {
      console.log(`  ${index + 1}. ${habit.name} (${habit.id}) - Completions: ${habit.completedDates.length}`);
    });
    
    // 8. Test completion if we have habits
    if (refreshHabits.data.data.length > 0) {
      const firstHabit = refreshHabits.data.data[0];
      console.log(`\n8. Testing completion for "${firstHabit.name}"...`);
      
      const completionResponse = await axios.post(`${API_URL}/habits/${firstHabit.id}/complete`, {
        date: new Date().toISOString()
      }, { headers });
      console.log('Completion response status:', completionResponse.status);
      
      // 9. Check if completion persists
      console.log('\n9. Checking if completion persisted...');
      const habitsAfterCompletion = await axios.get(`${API_URL}/habits`, { headers });
      const updatedHabit = habitsAfterCompletion.data.data.find(h => h.id === firstHabit.id);
      console.log(`Updated habit "${updatedHabit.name}" completions:`, updatedHabit.completedDates);
    }
    
  } catch (error) {
    console.error('Error in test flow:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testFlow();