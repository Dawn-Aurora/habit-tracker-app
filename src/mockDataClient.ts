import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from './utils/validation';

let habits: any[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    completedDates: ['2025-06-15', '2025-06-16']
  },
  {
    id: '2',
    name: 'Reading',
    completedDates: ['2025-06-16']
  },
  {
    id: '3',
    name: 'Meditation',
    completedDates: []
  }
];

export async function getHabits() {
  return habits.map(h => ({ 
    ...h, 
    id: h.id,
    Name: h.name,
    Title: h.name,
    CompletedDates: h.completedDates.join(',')
  }));
}

export async function createHabit(name: string, completedDate?: string) {
  if (!name) {
    throw new Error('Habit name is required');
  }
  const newHabit = {
    id: uuidv4(),
    name,
    completedDates: completedDate ? [completedDate] : [],
    fields: {
      Title: name,
      Name: name,
      CompletedDates: completedDate || ''
    }
  };
  habits.push(newHabit);
  return newHabit;
}

export async function updateHabit(itemId: string, name?: string, completedDate?: string) {
  const habitIndex = habits.findIndex(h => h.id === itemId);
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found`);
  }
  if (name) {
    habits[habitIndex].name = name;
  }
  if (completedDate !== undefined) {
    habits[habitIndex].completedDates = completedDate ? completedDate.split(',').filter(Boolean) : [];
  }
  return {
    id: habits[habitIndex].id,
    fields: {
      Title: habits[habitIndex].name,
      Name: habits[habitIndex].name,
      CompletedDates: habits[habitIndex].completedDates.join(',')
    }
  };
}

export async function deleteHabit(itemId: string) {
  const habitIndex = habits.findIndex(h => h.id === itemId);
  if (habitIndex === -1) {
    throw new NotFoundError(`Item with ID ${itemId} not found`);
  }
  habits.splice(habitIndex, 1);
  return { success: true };
}
