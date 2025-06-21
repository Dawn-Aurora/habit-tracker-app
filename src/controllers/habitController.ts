import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import * as mockDataClient from '../mockDataClient';
import * as sharepointClient from '../sharepointClient';

// Enhanced fallback logic: try SharePoint, fallback to mock on error
const useMock = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true';
const dataClient = useMock
    ? mockDataClient
    : {
        async getHabits() {
            try {
                return await sharepointClient.getHabits();
            } catch (e) {
                return await mockDataClient.getHabits();
            }
        },
        async createHabit(name: string, completedDate?: string, completedDatesStr?: string, expectedFrequency?: string) {
            try {
                return await sharepointClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency);
            } catch (e) {
                return await mockDataClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency);
            }
        },
        async updateHabit(id: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string) {
            try {
                return await sharepointClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency);
            } catch (e) {
                return await mockDataClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency);
            }
        },
        async deleteHabit(id: string) {
            try {
                return await sharepointClient.deleteHabit(id);
            } catch (e) {
                return await mockDataClient.deleteHabit(id);
            }
        }
    };

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

// Helper function to safely parse JSON or return empty array
const safeJsonParse = (value: string, fallback: any = []) => {
    if (!value || value === '""' || value === '=&quot;&quot;' || value === '[]') return fallback;
    try {
        return JSON.parse(value);
    } catch (e: any) {
        console.log('JSON parse error for value:', value, 'Error:', e.message);
        return fallback;
    }
};

// Helper function to safely split strings or return empty array
const safeSplit = (value: string, fallback: any[] = []) => {
    if (!value || value === '""' || value === '=&quot;&quot;') return fallback;
    if (Array.isArray(value)) return value;
    return value.split(',').filter(Boolean);
};

// Helper function to get existing field value safely
const getExistingValue = (field: string, habit: any) => {
    const spField = habit[field] || habit[field.charAt(0).toUpperCase() + field.slice(1)];
    if (spField && spField !== '=&quot;&quot;' && spField !== '""') {
        if (field === 'notes' || field === 'Notes') {
            try {
                return typeof spField === 'string' ? JSON.parse(spField) : spField;
            } catch (e) {
                return [];
            }
        } else if (field === 'tags' || field === 'Tags' || field === 'completedDates' || field === 'CompletedDates') {
            return Array.isArray(spField) ? spField : (spField ? spField.split(',').filter(Boolean) : []);
        }
        return spField;
    }
    return field === 'notes' || field === 'tags' || field === 'completedDates' ? [] : '';
};

function getHabitName(habit: any, fallbackName?: string): string {
    if (habit.fields && (habit.fields.Name || habit.fields.Title)) {
        return habit.fields.Name || habit.fields.Title;
    }
    return habit.Name || habit.Title || habit.name || fallbackName || '';
}

export const getHabits = async (req: Request, res: Response) => {
    try {
        const habits = await dataClient.getHabits();
        const transformedHabits = habits.map((habit: any) => {
            return {
                id: habit.id,
                name: getHabitName(habit),
                completedDates: habit.CompletedDates ? safeSplit(habit.CompletedDates) : habit.completedDates || [],
                tags: habit.Tags ? safeSplit(habit.Tags) : habit.tags || [],
                notes: habit.Notes ? safeJsonParse(habit.Notes, []) : habit.notes || [],
                startDate: habit.StartDate || habit.startDate || '',
                expectedFrequency: habit.ExpectedFrequency || habit.expectedFrequency || ''
            };
        });
        
        transformedHabits.forEach((habit: any) => {
            validateHabitId(habit.id);
            validateHabitName(habit.name);
            if (habit.completedDates.length > 0) {
                validateCompletedDates(habit.completedDates);
            }        });
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
        const { name, frequency } = req.body;
        validateHabitName(name);
        const sanitizedName = sanitizeHabitName(name);
        // Pass frequency to dataClient as expectedFrequency
        const result = await dataClient.createHabit(sanitizedName, undefined, "", "", "[]", frequency);
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || [],
            expectedFrequency: result.expectedFrequency || frequency || ''
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
        const { name, completedDates, tags, notes, expectedFrequency } = req.body;
        validateHabitId(id);
        
        // Fetch the current habit to preserve existing fields
        const currentHabit = (await dataClient.getHabits()).find((h: any) => h.id === id);
        if (!currentHabit) throw new NotFoundError('Habit not found');
        
        // Only validate name if provided and not blank
        if (name !== undefined && name !== "") {
            validateHabitName(name);
        }
        if (completedDates !== undefined) {
            validateCompletedDates(completedDates);
        }
        
        // Preserve existing data if not updating
        const finalName = name !== undefined ? sanitizeHabitName(name) : getHabitName(currentHabit);
        const finalCompletedDates = completedDates !== undefined 
            ? (Array.isArray(completedDates) ? completedDates : (completedDates ? completedDates.split(',').filter(Boolean) : []))
            : getExistingValue('completedDates', currentHabit);
        const finalTags = tags !== undefined 
            ? (Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean) : []))
            : getExistingValue('tags', currentHabit);
        const finalNotes = notes !== undefined 
            ? (Array.isArray(notes) ? notes : (notes ? [notes] : []))
            : getExistingValue('notes', currentHabit);
        const finalExpectedFrequency = expectedFrequency !== undefined 
            ? String(expectedFrequency) 
            : (currentHabit.ExpectedFrequency || currentHabit.expectedFrequency || '');
        
        // Convert arrays to strings for SharePoint
        const completedDatesStr = finalCompletedDates.join(',');
        const tagsStr = finalTags.join(',');
        const notesStr = JSON.stringify(finalNotes);
        
        // Update with all fields preserved
        const result = await dataClient.updateHabit(
            id,
            finalName,
            completedDatesStr,
            tagsStr,
            notesStr,
            finalExpectedFrequency
        );
        
        res.json({
            status: 'success',
            data: {
                id,
                name: finalName,
                completedDates: finalCompletedDates,
                tags: finalTags,
                notes: finalNotes,
                expectedFrequency: finalExpectedFrequency
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

export const markHabitCompleted = async (req: Request, res: Response) => {
    console.log('DEBUG: markHabitCompleted endpoint hit', req.method, req.originalUrl, req.body);
    try {
        const { id } = req.params;
        const { date } = req.body;
        validateHabitId(id);
        const completedDate = date || new Date().toISOString().slice(0, 10);
        const habit = (await dataClient.getHabits()).find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        const completedDates = getExistingValue('completedDates', habit);
        if (!completedDates.includes(completedDate)) completedDates.push(completedDate);
        
        // Preserve all existing data
        const existingTags = getExistingValue('tags', habit);
        const existingNotes = getExistingValue('notes', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        
        // Convert to strings for SharePoint
        const completedDatesString = completedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completedDatesString, tagsString, notesString, existingFrequency);
        
        res.json({ 
            status: 'success', 
            data: { 
                id, 
                name: getHabitName(habit),
                completedDates,
                tags: existingTags,
                notes: existingNotes,
                expectedFrequency: existingFrequency
            } 
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const addHabitNote = async (req: Request, res: Response) => {
    console.log('DEBUG: addHabitNote endpoint hit', req.method, req.originalUrl, req.body);
    try {
        const { id } = req.params;
        const { note, text, date } = req.body;
        validateHabitId(id);
        const noteText = note || text;
        if (!noteText) return res.status(400).json({ status: 'error', message: 'Note text required' });
        const habits = await dataClient.getHabits();
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        // Get all existing data
        const existingNotes = getExistingValue('notes', habit);
        const existingCompletedDates = getExistingValue('completedDates', habit);
        const existingTags = getExistingValue('tags', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        
        // Add new note
        existingNotes.push({ date: date || new Date().toISOString().slice(0, 10), text: noteText });
        
        // Convert arrays to strings for SharePoint
        const completedDatesString = existingCompletedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completedDatesString, tagsString, notesString, existingFrequency);
        
        res.json({ 
            status: 'success', 
            data: { 
                id, 
                name: getHabitName(habit),
                completedDates: existingCompletedDates,
                tags: existingTags,
                notes: existingNotes,
                expectedFrequency: existingFrequency
            } 
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const getHabitsByTag = async (req: Request, res: Response) => {
    try {
        const { tag } = req.query;
        const habits = await dataClient.getHabits();
        const filtered = tag ? habits.filter((h: any) => h.tags && h.tags.includes(tag)) : habits;
        res.json({ status: 'success', data: filtered });
    } catch (error: any) {
        handleError(error, res);
    }
};

import HabitModel from '../models/Habit';
export const getHabitMetrics = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        validateHabitId(id);
        const habits = await dataClient.getHabits();
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) throw new NotFoundError('Habit not found');
        // Convert to Habit model for metrics
        const habitModel = new HabitModel(habit.id, habit.name, habit.frequency || 1, habit.tags || [], habit.startDate, habit.expectedFrequency);
        habitModel.completions = habit.completedDates || [];
        const metrics = {
            currentStreak: habitModel.getCurrentStreak(),
            totalCompletions: habitModel.getTotalCompletions(),
            completionRate: habitModel.getCompletionRate(),
            startDate: habitModel.startDate,
            expectedFrequency: habitModel.expectedFrequency
        };
        res.json({ status: 'success', data: metrics });
    } catch (error: any) {
        handleError(error, res);
    }
};