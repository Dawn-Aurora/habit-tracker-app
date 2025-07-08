// Test script to add sample habits with various tags
// Run this in the browser console when logged in

const sampleHabits = [
  {
    name: "Morning Meditation",
    tags: ["mindfulness", "morning", "wellness"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Read Technical Books",
    tags: ["learning", "books", "career"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Workout Session",
    tags: ["fitness", "health", "evening"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Practice Guitar",
    tags: ["music", "hobby", "creativity"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Write Journal",
    tags: ["writing", "reflection", "evening"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Learn New Language",
    tags: ["learning", "language", "personal-growth"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Cook Healthy Meal",
    tags: ["cooking", "health", "nutrition"],
    expectedFrequency: { period: "day", count: 1 }
  },
  {
    name: "Call Family",
    tags: ["family", "social", "relationships"],
    expectedFrequency: { period: "week", count: 2 }
  },
  {
    name: "Deep Work Session",
    tags: ["productivity", "focus", "career"],
    expectedFrequency: { period: "day", count: 2 }
  },
  {
    name: "Nature Walk",
    tags: ["nature", "exercise", "mindfulness"],
    expectedFrequency: { period: "day", count: 1 }
  }
];

async function addSampleHabits() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('Please log in first');
    return;
  }

  console.log('Adding sample habits...');
  
  for (const habit of sampleHabits) {
    try {
      const response = await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(habit)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added: ${habit.name}`);
      } else {
        console.error(`❌ Failed to add: ${habit.name}`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${habit.name}:`, error);
    }
  }
  
  console.log('✨ Sample habits added! Refresh the page to see them.');
}

// Run the function
addSampleHabits();
