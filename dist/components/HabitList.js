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
    }
}
exports.default = HabitList;
