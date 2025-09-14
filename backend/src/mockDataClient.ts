import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from './utils/validation';

let habits: any[] = [
  // No default habits - users start with a clean slate
];

// Use integer IDs to match SharePoint behavior
let nextId = 1;

export async function getHabits(userId?: string) {
  const filteredHabits = userId ? habits.filter(h => h.userId === userId) : habits;
  
  return filteredHabits.map(h => ({ 
    ...h, 
    id: h.id,
    Name: h.name,
    Title: h.name,
    CompletedDates: h.completions.join(','),
    completedDates: h.completions, // Add this field for direct access
    expectedFrequency: h.expectedFrequency || '',
    userId: h.userId || ''
  }));
}

export async function createHabit(name: string, completedDate?: string, completionsStr?: string, expectedFrequency?: string, userId?: string) {
  if (!name) {
    throw new Error('Habit name is required');
  }
  // Support both completedDate (single) and completionsStr (comma-separated)
  let completionsArr: string[] = [];
  if (completionsStr) {
    completionsArr = completionsStr.split(',').filter(Boolean);
  } else if (completedDate) {
    completionsArr = [completedDate];
  }
  const newHabit = {
    id: String(nextId++), // Use integer IDs converted to string to match SharePoint behavior
    name,
    completions: completionsArr,
    tags: [],
    notes: [],
    expectedFrequency: expectedFrequency || '',
    userId: userId || '',
    frequency: parseInt(expectedFrequency?.replace(/[^0-9]/g, '') || '7'),
    completed: false,
    fields: {
      Title: name,
      Name: name,
      CompletedDates: completionsArr.join(',')
    }
  };
  habits.push(newHabit);
  
  // Debug log removed for production
  
  return {
    id: newHabit.id,
    name: newHabit.name,
    completions: newHabit.completions,
    tags: newHabit.tags,
    notes: newHabit.notes,
    expectedFrequency: newHabit.expectedFrequency,
    frequency: newHabit.frequency,
    completed: newHabit.completed,
    fields: newHabit.fields
  };
}

export async function updateHabit(itemId: string, name?: string, completionsStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
  // Find habit by ID and ensure it belongs to the user (if userId provided)
  const habitIndex = habits.findIndex(h => h.id === itemId && (!userId || h.userId === userId));
  
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found or access denied`);
  }
  if (name) {
    habits[habitIndex].name = name;
    // CRITICAL FIX: Also update the fields object
    if (!habits[habitIndex].fields) habits[habitIndex].fields = {};
    habits[habitIndex].fields.Title = name;
    habits[habitIndex].fields.Name = name;
  }
  if (completionsStr !== undefined) {
    let arr = completionsStr ? completionsStr.split(',').filter(Boolean) : [];
    habits[habitIndex].completions = arr;
    if (!habits[habitIndex].fields) habits[habitIndex].fields = {};
    habits[habitIndex].fields.CompletedDates = arr.join(',');
  }
  if (tagsStr !== undefined) {
    habits[habitIndex].tags = tagsStr ? tagsStr.split(',').filter(Boolean) : [];
  }
  if (notesStr !== undefined) {
    habits[habitIndex].notes = notesStr ? JSON.parse(notesStr) : [];
  }
  if (expectedFrequency !== undefined) {
    habits[habitIndex].expectedFrequency = expectedFrequency;
  }
  
  return {
    id: habits[habitIndex].id,
    name: habits[habitIndex].name,
    completedDates: [...habits[habitIndex].completions], // Fix: use completions, not completedDates
    tags: habits[habitIndex].tags,
    notes: habits[habitIndex].notes,
    expectedFrequency: habits[habitIndex].expectedFrequency,
    fields: {
      Title: habits[habitIndex].name,
      Name: habits[habitIndex].name,
      CompletedDates: habits[habitIndex].completions.join(',') // Fix: use completions, not completedDates
    }
  };
}

export { habits };

export async function deleteHabit(itemId: string, userId?: string) {
  // Find habit by ID and ensure it belongs to the user (if userId provided)
  const habitIndex = habits.findIndex(h => h.id === itemId && (!userId || h.userId === userId));
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found or access denied`);
  }
  habits.splice(habitIndex, 1);
  return { success: true };
}
