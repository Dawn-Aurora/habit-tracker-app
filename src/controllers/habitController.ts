import { Request, Response } from 'express';
import { Habit } from '../models/Habit';

let habits: Habit[] = [];

export const getHabits = (req: Request, res: Response) => {
    res.json(habits);
};

export const addHabit = (req: Request, res: Response) => {
    const {name} = req.body;
    const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        completedDates: [],
    }
    habits.push(newHabit);
    res.status(201).json(newHabit);
};