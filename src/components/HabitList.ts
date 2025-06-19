interface Habit {
    id: number;
    name: string;
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
    }
}

export default HabitList;