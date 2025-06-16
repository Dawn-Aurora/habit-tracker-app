import { Request, Response } from 'express';

export interface Habit {
    id: string;
    name: string;
    completedDates: string[];
}

let habits: Habit[] = [];

export const getHabits = (req: Request, res: Response) => {
    res.json(habits);
};

export const createHabit = (req: Request, res: Response) => {
    const {name} = req.body;
    const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        completedDates: [],
    }
    habits.push(newHabit);
    res.status(201).json(newHabit);
};

export const updateHabit = (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, completedDates } = req.body;
    const habitIndex = habits.findIndex(habit => habit.id === id);

    if (habitIndex === -1) {
        return res.status(404).json({ message: 'Habit not found' });
    }

    habits[habitIndex] = { id, name, completedDates };
    res.json(habits[habitIndex]);
};

export const deleteHabit = (req: Request, res: Response) => {
    const { id } = req.params;
    habits = habits.filter(habit => habit.id !== id);
    res.status(204).send();
};