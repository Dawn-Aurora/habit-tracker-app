import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import * as mockDataClient from '../mockDataClient';
import * as sharepointClient from '../sharepointClient';
const dataClient = process.env.DATA_CLIENT === 'mock'
  ? mockDataClient
  : sharepointClient;
import { 
    validateHabitName, 
    validateHabitId, 
    validateCompletedDates,
    sanitizeHabitName,
    ValidationError,
    NotFoundError
} from '../utils/validation';

export interface Habit {
    id: string;
    name: string;
    completedDates: string[];
}

interface SharePointHabit {
    id: string;
    fields?: {
        Name?: string;
        Title?: string;
        CompletedDates?: string;
    };
    Name?: string;
    Title?: string;
    CompletedDates?: string;
}

const handleError = (error: any, res: Response) => {
    console.error('Error:', error);
    if (error instanceof ValidationError) {
        return res.status(400).json({ 
            status: 'error',
            type: 'ValidationError',
            message: error.message 
        });
    }
    if (error instanceof NotFoundError) {
        return res.status(404).json({ 
            status: 'error',
            type: 'NotFoundError',
            message: error.message 
        });
    }
    if (error.statusCode === 404) {
        return res.status(404).json({ 
            status: 'error',
            type: 'NotFoundError',
            message: 'Resource not found in SharePoint' 
        });
    }
    return res.status(500).json({ 
        status: 'error',
        type: 'InternalServerError',
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

export const getHabits = async (req: Request, res: Response) => {
    try {
        const habits = await dataClient.getHabits();
        const transformedHabits = habits.map((habit: any) => ({
            id: habit.id,
            name: habit.Name || habit.Title || habit.name || '',
            completedDates: habit.CompletedDates
                ? habit.CompletedDates.split(',').filter(Boolean)
                : habit.completedDates || []
        }));
        transformedHabits.forEach((habit: Habit) => {
            validateHabitId(habit.id);
            validateHabitName(habit.name);
            if (habit.completedDates.length > 0) {
                validateCompletedDates(habit.completedDates);
            }
        });
        res.json({
            status: 'success',
            data: transformedHabits
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const createHabit = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        validateHabitName(name);
        const sanitizedName = sanitizeHabitName(name);
        const result = await dataClient.createHabit(sanitizedName);
        const newHabit = {
            id: result.id,
            name: (result.fields && (result.fields.Name || result.fields.Title)) || result.name || sanitizedName,
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || []
        };
        validateHabitId(newHabit.id);
        validateHabitName(newHabit.name);
        res.status(201).json({
            status: 'success',
            data: newHabit
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, completedDates } = req.body;
        validateHabitId(id);
        if (name !== undefined) {
            validateHabitName(name);
        }
        if (completedDates !== undefined) {
            validateCompletedDates(completedDates);
        }
        const sanitizedName = name ? sanitizeHabitName(name) : undefined;
        const completedDatesString = completedDates ? completedDates.join(',') : undefined;
        const result = await dataClient.updateHabit(id, sanitizedName, completedDatesString);
        res.json({
            status: 'success',
            data: {
                id: result.id,
                name: (result.fields?.Name || result.fields?.Title) || result.name || sanitizedName,
                completedDates: (result.fields?.CompletedDates)
                    ? result.fields.CompletedDates.split(',').filter(Boolean)
                    : result.completedDates || []
            }
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const deleteHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        validateHabitId(id);
        await dataClient.deleteHabit(id);
        res.status(200).json({ status: 'success', data: { id } });
    } catch (error: any) {
        handleError(error, res);
    }
};