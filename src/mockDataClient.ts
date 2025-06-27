import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from './utils/validation';

let habits: any[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    completions: ['2025-06-15', '2025-06-16'],
    tags: ['health'],
    notes: [],
    expectedFrequency: '7 times/week',
    userId: '', // Default for backward compatibility
    frequency: 7,
    completed: false
  },
  {
    id: '2',
    name: 'Reading',
    completions: ['2025-06-16'],
    tags: ['creativity'],
    notes: [],
    expectedFrequency: '5 times/week',
    userId: '', // Default for backward compatibility
    frequency: 5,
    completed: false
  },
  {
    id: '3',
    name: 'Meditation',
    completions: [],
    tags: ['relaxation'],
    notes: [],
    expectedFrequency: '3 times/week',
    userId: '', // Default for backward compatibility
    frequency: 3,
    completed: false
  }
];

export async function getHabits() {
  return habits.map(h => ({ 
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
    id: uuidv4(),
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
  const habitIndex = habits.findIndex(h => h.id === itemId);
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found`);
  }
  if (name) {
    habits[habitIndex].name = name;
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
  }  return {
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
  const habitIndex = habits.findIndex(h => h.id === itemId);
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found`);
  }
  habits.splice(habitIndex, 1);
  return { success: true };
}
