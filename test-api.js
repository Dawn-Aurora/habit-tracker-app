const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user credentials
let authToken = '';

async function testFlow() {
  try {
    console.log('=== Testing Habit API Flow ===\n');
    
    // 1. First register/login to get a token
    console.log('1. Registering test user...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('Registration successful');
    } catch (err) {
      console.log('Registration failed (user might already exist):', err.response?.data?.message);
    }
    
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    authToken = loginResponse.data.token;
    console.log('Login successful, got token');
    console.log('User ID:', loginResponse.data.user.id);
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 2. Get initial habits (should be empty)
    console.log('\n3. Getting initial habits...');
    const initialHabits = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Initial habits count:', initialHabits.data.data.length);
    console.log('Initial habits:', JSON.stringify(initialHabits.data.data, null, 2));
    
    // 3. Create first habit
    console.log('\n4. Creating first habit...');
    const habit1Response = await axios.post(`${API_URL}/habits`, {
      name: 'Exercise',
      frequency: 'daily',
      category: 'health'
    }, { headers });
    console.log('First habit created:', habit1Response.data.data);
    
    // 4. Get habits after first creation
    console.log('\n5. Getting habits after first creation...');
    const habitsAfterFirst = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Habits after first creation count:', habitsAfterFirst.data.data.length);
    console.log('Habits after first creation:', JSON.stringify(habitsAfterFirst.data.data, null, 2));
    
    // 5. Create second habit
    console.log('\n6. Creating second habit...');
    const habit2Response = await axios.post(`${API_URL}/habits`, {
      name: 'Read Books',
      frequency: 'daily',
      category: 'education'
    }, { headers });
    console.log('Second habit created:', habit2Response.data.data);
    
    // 6. Get habits after second creation
    console.log('\n7. Getting habits after second creation...');
    const habitsAfterSecond = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Habits after second creation count:', habitsAfterSecond.data.data.length);
    console.log('Habits after second creation:', JSON.stringify(habitsAfterSecond.data.data, null, 2));
    
    // 7. Create third habit
    console.log('\n8. Creating third habit...');
    const habit3Response = await axios.post(`${API_URL}/habits`, {
      name: 'Meditate',
      frequency: 'daily',
      category: 'wellness'
    }, { headers });
    console.log('Third habit created:', habit3Response.data.data);
    
    // 8. Get final habits
    console.log('\n9. Getting final habits...');
    const finalHabits = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Final habits count:', finalHabits.data.data.length);
    console.log('Final habits:', JSON.stringify(finalHabits.data.data, null, 2));
    
    // 9. Simulate page refresh - wait a bit and fetch again
    console.log('\n10. Simulating page refresh (wait 2 seconds then fetch)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const refreshHabits = await axios.get(`${API_URL}/habits`, { headers });
    console.log('Habits after refresh count:', refreshHabits.data.data.length);
    console.log('Habits after refresh:', JSON.stringify(refreshHabits.data.data, null, 2));
    
    // 10. Test completion functionality
    if (refreshHabits.data.data.length > 0) {
      const firstHabit = refreshHabits.data.data[0];
      console.log(`\n11. Testing completion for habit "${firstHabit.name}" (${firstHabit.id})...`);
      
      const completionResponse = await axios.post(`${API_URL}/habits/${firstHabit.id}/complete`, {
        date: new Date().toISOString()
      }, { headers });
      console.log('Completion response:', completionResponse.data);
      
      // Check if completion was saved
      console.log('\n12. Checking if completion was saved...');
      const habitsAfterCompletion = await axios.get(`${API_URL}/habits`, { headers });
      const updatedHabit = habitsAfterCompletion.data.data.find(h => h.id === firstHabit.id);
      console.log('Updated habit completions:', updatedHabit?.completedDates || []);
    }
    
  } catch (error) {
    console.error('Error in test flow:', error.response?.data || error.message);
  }
}

testFlow();