"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HabitList = /** @class */ (function () {
    function HabitList() {
        this.habits = [];
    }
    HabitList.prototype.addHabit = function (habit) {
        this.habits.push(habit);
        this.render();
    };
    HabitList.prototype.removeHabit = function (habitId) {
        this.habits = this.habits.filter(function (habit) { return habit.id !== habitId; });
        this.render();
    };
    HabitList.prototype.render = function () {
    };
    return HabitList;
}());
exports.default = HabitList;
