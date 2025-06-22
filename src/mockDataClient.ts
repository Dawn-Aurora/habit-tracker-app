import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from './utils/validation';

let habits: any[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    completedDates: ['2025-06-15', '2025-06-16'],
    tags: ['health'],
    notes: [],
    expectedFrequency: '7 times/week',
    userId: '' // Default for backward compatibility
  },
  {
    id: '2',
    name: 'Reading',
    completedDates: ['2025-06-16'],
    tags: ['creativity'],
    notes: [],
    expectedFrequency: '5 times/week',
    userId: '' // Default for backward compatibility
  },
  {
    id: '3',
    name: 'Meditation',
    completedDates: [],
    tags: ['relaxation'],
    notes: [],
    expectedFrequency: '3 times/week',
    userId: '' // Default for backward compatibility
  }
];

export async function getHabits() {
  return habits.map(h => ({ 
    ...h, 
    id: h.id,
    Name: h.name,
    Title: h.name,
    CompletedDates: h.completedDates.join(','),
    expectedFrequency: h.expectedFrequency || '',
    userId: h.userId || ''
  }));
}

export async function createHabit(name: string, completedDate?: string, completedDatesStr?: string, expectedFrequency?: string, userId?: string) {
  if (!name) {
    throw new Error('Habit name is required');
  }
  // Support both completedDate (single) and completedDatesStr (comma-separated)
  let completedDatesArr: string[] = [];
  if (completedDatesStr) {
    completedDatesArr = completedDatesStr.split(',').filter(Boolean);
  } else if (completedDate) {
    completedDatesArr = [completedDate];
  }
  const newHabit = {
    id: uuidv4(),
    name,
    completedDates: completedDatesArr,
    tags: [],
    notes: [],
    expectedFrequency: expectedFrequency || '',
    userId: userId || '',
    fields: {
      Title: name,
      Name: name,
      CompletedDates: completedDatesArr.join(',')
    }
  };
  habits.push(newHabit);
  return {
    id: newHabit.id,
    name: newHabit.name,
    completedDates: newHabit.completedDates,
    tags: newHabit.tags,
    notes: newHabit.notes,
    expectedFrequency: newHabit.expectedFrequency,
    fields: newHabit.fields
  };
}

export async function updateHabit(itemId: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
  const habitIndex = habits.findIndex(h => h.id === itemId);
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found`);
  }
  if (name) {
    habits[habitIndex].name = name;
  }
  if (completedDatesStr !== undefined) {
    let arr = completedDatesStr ? completedDatesStr.split(',').filter(Boolean) : [];
    habits[habitIndex].completedDates = arr;
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
    completedDates: [...habits[habitIndex].completedDates],
    tags: habits[habitIndex].tags,
    notes: habits[habitIndex].notes,
    expectedFrequency: habits[habitIndex].expectedFrequency,
    fields: {
      Title: habits[habitIndex].name,
      Name: habits[habitIndex].name,
      CompletedDates: habits[habitIndex].completedDates.join(',')
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
