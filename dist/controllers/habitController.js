"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHabit = exports.getHabits = void 0;
let habits = [];
const getHabits = (req, res) => {
    res.json(habits);
};
exports.getHabits = getHabits;
const addHabit = (req, res) => {
    const { name } = req.body;
    const newHabit = {
        id: Date.now().toString(),
        name,
        completedDates: [],
    };
    habits.push(newHabit);
    res.status(201).json(newHabit);
};
exports.addHabit = addHabit;
