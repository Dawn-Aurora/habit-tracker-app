import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as mockDataClient from '../mockDataClient';
import * as sharepointClient from '../sharepointClient';
import { AuthenticatedRequest } from '../middleware/auth';

// Enhanced fallback logic: try SharePoint, fallback to mock on error
const useMock = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true';

// Helper function to filter habits by user
const filterHabitsByUser = (habits: any[], userId?: string) => {
  if (!userId) {
    // For backward compatibility, return all habits if no user ID
    return habits;
  }
  return habits.filter(habit => habit.userId === userId || !habit.userId); // Include habits without userId for backward compatibility
};

const dataClient = useMock
    ? {
        async getHabits(userId?: string) {
            const allHabits = await mockDataClient.getHabits();
            return filterHabitsByUser(allHabits, userId);
        },
        async createHabit(name: string, completedDate?: string, completedDatesStr?: string, expectedFrequency?: string, userId?: string) {
            return await mockDataClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId);
        },
        async updateHabit(id: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
            return await mockDataClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId);
        },
        async deleteHabit(id: string, userId?: string) {
            return await mockDataClient.deleteHabit(id, userId);
        }
    }
    : {
        async getHabits(userId?: string) {
            try {
                const allHabits = await sharepointClient.getHabits();
                return filterHabitsByUser(allHabits, userId);
            } catch (e) {
                const allHabits = await mockDataClient.getHabits();
                return filterHabitsByUser(allHabits, userId);
            }
        },
        async createHabit(name: string, completedDate?: string, completedDatesStr?: string, expectedFrequency?: string, userId?: string) {
            try {
                return await sharepointClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency);
            } catch (e) {
                return await mockDataClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId);
            }
        },
        async updateHabit(id: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
            try {
                return await sharepointClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency);
            } catch (e) {
                return await mockDataClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId);
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
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        const habits = await dataClient.getHabits(userId);
        const transformedHabits = habits.map((habit: any) => {
            return {
                id: habit.id,
                name: getHabitName(habit),
                completedDates: habit.CompletedDates ? safeSplit(habit.CompletedDates) : habit.completedDates || [],
                tags: habit.Tags ? safeSplit(habit.Tags) : habit.tags || [],
                notes: habit.Notes ? safeJsonParse(habit.Notes, []) : habit.notes || [],
                startDate: habit.StartDate || habit.startDate || '',
                expectedFrequency: habit.ExpectedFrequency || habit.expectedFrequency || '',
                userId: habit.userId
            };
        });
        
        transformedHabits.forEach((habit: any) => {
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
        const { name, frequency } = req.body;
        validateHabitName(name);
        const sanitizedName = sanitizeHabitName(name);
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        // Pass frequency to dataClient as expectedFrequency
        const result = await dataClient.createHabit(sanitizedName, undefined, "", frequency, userId);
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || [],
            expectedFrequency: result.expectedFrequency || frequency || '',
            userId: result.userId || userId
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

export const deleteHabit = async (req: Request, res: Response) => {    try {
        const { id } = req.params;
        validateHabitId(id);
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        await dataClient.deleteHabit(id, userId);
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
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        validateHabitId(id);
        const completedDate = date || new Date().toISOString().slice(0, 10);
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
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
        
        await dataClient.updateHabit(id, getHabitName(habit), completedDatesString, tagsString, notesString, existingFrequency, userId);
        
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
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        validateHabitId(id);
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) throw new NotFoundError('Habit not found');        // Calculate metrics directly without the complex Habit model logic
        const completedDates: string[] = habit.completedDates || [];
        const totalCompletions = completedDates.length;
          // Calculate completion rate for this week
        let completionRate = 0;
        
        if (totalCompletions > 0) {
            // Calculate completion rate for this week (Monday to Sunday)
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Get Monday of this week
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);
            
            // Get Sunday of this week
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);
            
            // Count completions in this week
            const thisWeekCompletions = completedDates.filter((dateStr: string) => {
                const completionDate = new Date(dateStr);
                return completionDate >= monday && completionDate <= sunday;
            }).length;
            
            // Calculate days elapsed in this week (up to today)
            const daysElapsedThisWeek = Math.min(
                Math.floor((today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)) + 1,
                7
            );
            
            console.log('DEBUG: This week range:', monday.toISOString().slice(0, 10), 'to', sunday.toISOString().slice(0, 10));
            console.log('DEBUG: This week completions:', thisWeekCompletions);
            console.log('DEBUG: Days elapsed this week:', daysElapsedThisWeek);
            
            if (daysElapsedThisWeek > 0) {
                completionRate = thisWeekCompletions / daysElapsedThisWeek; // Return as decimal (0.0 to 1.0)
            }
        }
        
        // Calculate current streak
        let currentStreak = 0;
        if (completedDates.length > 0) {
            const dates = completedDates.map((d: string) => new Date(d)).sort((a: Date, b: Date) => b.getTime() - a.getTime());
            let current = new Date();
            current.setHours(0, 0, 0, 0); // Reset to start of day
            
            for (let d of dates) {
                d.setHours(0, 0, 0, 0); // Reset to start of day
                if (d.getTime() === current.getTime()) {
                    currentStreak++;
                    current.setDate(current.getDate() - 1);
                } else {
                    break;
                }
            }
        }
          console.log('DEBUG: This week calculation results:', {
            totalCompletions,
            completionRate,
            currentStreak
        });
        
        const metrics = {
            currentStreak: currentStreak,
            totalCompletions: totalCompletions,
            completionRate: completionRate,
            expectedFrequency: habit.expectedFrequency || habit.ExpectedFrequency || ''
        };
        res.json({ status: 'success', data: metrics });
    } catch (error: any) {
        handleError(error, res);
    }
};