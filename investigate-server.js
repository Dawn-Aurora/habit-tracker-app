const axios = require('axios');

const AZURE_API = 'https://habit-tracker-backend-linux.azurewebsites.net/api';

async function investigateServerIssue() {
  try {
    console.log('=== Investigating Azure Backend Issue ===\n');
    
    // 1. Register a test user
    console.log('1. Registering test user...');
    const testEmail = `testuser${Date.now()}@example.com`;
    try {
      await axios.post(`${AZURE_API}/auth/register`, {
        email: testEmail,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ Registration successful');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('ℹ️  User already exists (expected)');
      } else {
        console.log('❌ Registration failed:', regError.response?.status, regError.response?.data);
      }
    }
    
    // 2. Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${AZURE_API}/auth/login`, {
      email: testEmail,
      password: 'testpassword123'
    });
    
    const headers = { Authorization: `Bearer ${loginResponse.data.token}` };
    console.log('✅ Login successful, User ID:', loginResponse.data.user.id);
    
    // 3. Get initial habits
    console.log('\n3. Getting initial habits...');
    const initialHabits = await axios.get(`${AZURE_API}/habits`, { headers });
    console.log('Initial habits count:', initialHabits.data.data?.length || initialHabits.data.length);
    
    // 4. Create a habit and immediately check if it exists
    console.log('\n4. Creating habit...');
    const habitData = {
      name: 'Server Test Habit ' + Date.now(),
      category: 'test',
      expectedFrequency: { count: 1, period: 'day' }
    };
    
    const createResponse = await axios.post(`${AZURE_API}/habits`, habitData, { headers });
    let newHabit = createResponse.data;
    if (createResponse.data.data) newHabit = createResponse.data.data;
    
    console.log('✅ Habit creation response received');
    console.log('Created habit ID:', newHabit.id);
    console.log('Created habit name:', newHabit.name);
    
    // 5. Immediately check if the habit exists by fetching all habits
    console.log('\n5. Immediately checking if habit exists...');
    const afterCreateHabits = await axios.get(`${AZURE_API}/habits`, { headers });
    const habitsAfterCreate = afterCreateHabits.data.data || afterCreateHabits.data;
    console.log('Habits count after creation:', habitsAfterCreate.length);
    
    const foundHabit = habitsAfterCreate.find(h => h.id === newHabit.id);
    if (foundHabit) {
      console.log('✅ Habit found in list immediately after creation');
    } else {
      console.log('❌ Habit NOT found in list immediately after creation!');
      console.log('Available habit IDs:', habitsAfterCreate.map(h => h.id));
    }
    
    // 6. Wait a moment and check again
    console.log('\n6. Waiting 2 seconds and checking again...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const delayedHabits = await axios.get(`${AZURE_API}/habits`, { headers });
    const habitsAfterDelay = delayedHabits.data.data || delayedHabits.data;
    console.log('Habits count after delay:', habitsAfterDelay.length);
    
    const foundDelayed = habitsAfterDelay.find(h => h.id === newHabit.id);
    if (foundDelayed) {
      console.log('✅ Habit still exists after delay');
      
      // 7. Try to complete it
      console.log('\n7. Attempting to complete the habit...');
      try {
        await axios.post(`${AZURE_API}/habits/${newHabit.id}/complete`, {
          date: new Date().toISOString()
        }, { headers });
        console.log('✅ Completion successful');
      } catch (completeError) {
        console.log('❌ Completion failed:', completeError.response?.status, completeError.response?.data);
      }
    } else {
      console.log('❌ Habit disappeared after delay!');
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

investigateServerIssue();