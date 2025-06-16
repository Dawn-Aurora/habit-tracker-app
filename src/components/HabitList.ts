// Define the Habit interface if not imported from elsewhere
interface Habit {
    id: number;
    name: string;
    // Add other properties as needed
}

class HabitList {
    private habits: Habit[];

    constructor() {
        this.habits = [];
    }

    addHabit(habit: Habit): void {
        this.habits.push(habit);
        this.render();
    }

    removeHabit(habitId: number): void {
        this.habits = this.habits.filter(habit => habit.id !== habitId);
        this.render();
    }

    render(): void {
        // Logic to display the list of habits
        console.log("Rendering habits:", this.habits);
    }
}

export default HabitList;