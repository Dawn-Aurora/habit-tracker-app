"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HabitList {
    constructor() {
        this.habits = [];
    }
    addHabit(habit) {
        this.habits.push(habit);
        this.render();
    }
    removeHabit(habitId) {
        this.habits = this.habits.filter(habit => habit.id !== habitId);
        this.render();
    }
    render() {
        // Logic to display the list of habits
        console.log("Rendering habits:", this.habits);
    }
}
exports.default = HabitList;
