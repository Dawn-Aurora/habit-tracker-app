#!/usr/bin/env node
// Calendar Testing Script for Habit Tracker
// This script creates test habits with different frequencies to validate calendar display

const baseUrl = 'http://localhost:5000/api';

// Test habit configurations
const testHabits = [
  {
    name: "📚 Daily Reading - Test",
    expectedFrequency: { count: 1, period: "day" },
    description: "Daily habit to test calendar day view"
  },
  {
    name: "🏃 Weekly Exercise - Test",
    expectedFrequency: { count: 3, period: "week" },
    description: "Weekly habit to test calendar week view"
  },
  {
    name: "📝 Monthly Review - Test",
    expectedFrequency: { count: 1, period: "month" },
    description: "Monthly habit to test calendar month view"
  },
  {
    name: "🎯 Annual Goals - Test",
    expectedFrequency: { count: 4, period: "year" },
    description: "Yearly habit to test calendar year view"
  },
  {
    name: "💧 Water Intake - Test",
    expectedFrequency: { count: 8, period: "day" },
    description: "Multiple daily completions test"
  }
];

// Function to create a test habit
async function createTestHabit(habit) {
  try {
    const response = await fetch(`${baseUrl}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: habit.name,
        expectedFrequency: habit.expectedFrequency
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error || error.message}`);
    }
    
    const result = await response.json();
    console.log(`✅ Created: ${habit.name}`);
    return result.data;
  } catch (error) {
    console.error(`❌ Failed to create ${habit.name}:`, error.message);
    return null;
  }
}

// Function to add sample completions to a habit
async function addSampleCompletions(habitId, completions) {
  for (const completion of completions) {
    try {
      const response = await fetch(`${baseUrl}/habits/${habitId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: completion
        })
      });
      
      if (response.ok) {
        console.log(`  ✓ Added completion: ${completion}`);
      } else {
        console.log(`  ⚠️ Failed to add completion: ${completion}`);
      }
    } catch (error) {
      console.log(`  ⚠️ Error adding completion: ${error.message}`);
    }
  }
}

// Generate sample completion dates
function generateSampleCompletions() {
  const completions = [];
  const today = new Date();
  
  // Add some completions for the past week
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    completions.push(date.toISOString());
  }
  
  // Add today's completion
  completions.push(today.toISOString());
  
  return completions;
}

// Main test function
async function runCalendarTests() {
  console.log('🧪 Starting Calendar Testing...');
  console.log('==============================');
  
  const createdHabits = [];
  
  // Create test habits
  for (const habit of testHabits) {
    console.log(`\n📝 Creating: ${habit.name}`);
    const created = await createTestHabit(habit);
    if (created) {
      createdHabits.push(created);
    }
  }
  
  console.log('\n🎯 Test Habits Created Successfully!');
  console.log('====================================');
  
  // Add sample completions to the first few habits
  if (createdHabits.length > 0) {
    console.log('\n📊 Adding sample completions...');
    const sampleCompletions = generateSampleCompletions();
    
    for (let i = 0; i < Math.min(3, createdHabits.length); i++) {
      const habit = createdHabits[i];
      console.log(`\n🔄 Adding completions to: ${habit.name}`);
      await addSampleCompletions(habit.id, sampleCompletions.slice(0, 3));
    }
  }
  
  console.log('\n🎉 Calendar Testing Complete!');
  console.log('=============================');
  console.log('✅ Test habits created with different frequencies');
  console.log('✅ Sample completions added for testing');
  console.log('✅ Ready to test calendar views in UI');
  console.log('\n📋 Next Steps:');
  console.log('1. Open the Habit Tracker app');
  console.log('2. Click on each test habit to view MetricsView');
  console.log('3. Verify calendar displays correctly for each frequency type');
  console.log('4. Test hover effects and animations');
  console.log('5. Check responsive design on different screen sizes');
  
  return createdHabits;
}

// Run the tests if this script is executed directly
if (require.main === module) {
  runCalendarTests().catch(console.error);
}

module.exports = { runCalendarTests, createTestHabit };
