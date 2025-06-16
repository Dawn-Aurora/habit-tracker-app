export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // ISO date strings
}