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
  // Only return habits that belong to this specific user
  return habits.filter(habit => habit.userId === userId);
};

const dataClient = useMock
    ? {
        async getHabits(userId?: string) {
            return await mockDataClient.getHabits(userId);
        },
        async createHabit(name: string, completedDate?: string, completionsStr?: string, expectedFrequency?: string, userId?: string, category?: string) {
            return await mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId);
        },
        async updateHabit(id: string, name?: string, completionsStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
            return await mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId);
        },
        async deleteHabit(id: string, userId?: string) {
            return await mockDataClient.deleteHabit(id, userId);
        }
    }
    : {
        async getHabits(userId?: string) {
            try {
                return await sharepointClient.getHabits(userId);
            } catch (e) {
                const allHabits = await mockDataClient.getHabits();
                return filterHabitsByUser(allHabits, userId);
            }
        },
        async createHabit(name: string, completedDate?: string, completionsStr?: string, expectedFrequency?: string, userId?: string, category?: string) {
            try {
                return await sharepointClient.createHabit(name, completedDate, completionsStr, '', '', expectedFrequency, userId, category);
            } catch (e) {
                return await mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId);
            }
        },
        async updateHabit(id: string, name?: string, completionsStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
            try {
                return await sharepointClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency);
            } catch (e) {
                return await mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId);
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
            // Parse expectedFrequency - could be string, number, or JSON
            let expectedFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
            if (typeof expectedFrequency === 'string' && expectedFrequency.startsWith('{')) {
                try {
                    expectedFrequency = JSON.parse(expectedFrequency);
                } catch (e) {
                    // Keep as string if JSON parsing fails
                }
            }
            
            return {
                id: habit.id,
                name: getHabitName(habit),
                category: habit.Category || habit.category || null,
                completedDates: habit.CompletedDates ? safeSplit(habit.CompletedDates) : habit.completedDates || [],
                tags: habit.Tags ? safeSplit(habit.Tags) : habit.tags || [],
                notes: habit.Notes ? safeJsonParse(habit.Notes, []) : habit.notes || [],
                startDate: habit.StartDate || habit.startDate || '',
                expectedFrequency: expectedFrequency,
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
        const { name, frequency, expectedFrequency, category, tags } = req.body;
        validateHabitName(name);
        const sanitizedName = sanitizeHabitName(name);
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        
        // Handle both structured and legacy frequency
        let frequencyToStore = expectedFrequency || frequency || '';
        
        // If it's a structured frequency object, serialize it as JSON for SharePoint
        if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
            frequencyToStore = JSON.stringify(expectedFrequency);
        }
        
        // Prepare tags string for SharePoint (include category in tags if provided)
        let tagsToStore = '';
        if (tags && Array.isArray(tags)) {
            tagsToStore = tags.join(',');
        }
        
        // Pass frequency to dataClient as expectedFrequency
        const result = await dataClient.createHabit(sanitizedName, undefined, "", frequencyToStore, userId, category);
        
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            category: category || null,
            tags: tags || [],
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || [],
            expectedFrequency: expectedFrequency || frequency || '', // Return the original format
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
        const { name, completedDates, completions, tags, notes, expectedFrequency } = req.body;
        validateHabitId(id);
        
        // Get userId from authenticated user for proper filtering
        const userId = (req as AuthenticatedRequest).user?.id;
        
        // Fetch the current habit to preserve existing fields (filtered by user)
        const allHabits = await dataClient.getHabits(userId);
        
        const currentHabit = allHabits.find((h: any) => h.id === id);
        
        if (!currentHabit) throw new NotFoundError('Habit not found');
        
        // Only validate name if provided and not blank
        if (name !== undefined && name !== "") {
            validateHabitName(name);
        }
        
        // Handle both completedDates and completions (for backward compatibility)
        const inputCompletions = completions || completedDates;
        if (inputCompletions !== undefined) {
            validateCompletedDates(inputCompletions);
        }
        
        // Preserve existing data if not updating
        const finalName = name !== undefined ? sanitizeHabitName(name) : getHabitName(currentHabit);
        const finalCompletedDates = inputCompletions !== undefined 
            ? (Array.isArray(inputCompletions) ? inputCompletions : (inputCompletions ? inputCompletions.split(',').filter(Boolean) : []))
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
        const completionsStr = finalCompletedDates.join(',');
        const tagsStr = finalTags.join(',');
        const notesStr = JSON.stringify(finalNotes);
          // Update with all fields preserved
        const result = await dataClient.updateHabit(
            id,
            finalName,
            completionsStr,
            tagsStr,
            notesStr,
            finalExpectedFrequency,
            userId
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
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        validateHabitId(id);
        
        // Use full timestamp instead of date-only to allow multiple completions per day
        const completedTimestamp = date || new Date().toISOString();
        
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        const completedDates = getExistingValue('completedDates', habit);
        // Always add the new completion (no duplicate check for timestamps)
        completedDates.push(completedTimestamp);
        
        // Preserve all existing data
        const existingTags = getExistingValue('tags', habit);
        const existingNotes = getExistingValue('notes', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
          // Convert to strings for SharePoint
        const completionsString = completedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        
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
    try {
        const { id } = req.params;
        const { note, text, date } = req.body;
        const userId = (req as AuthenticatedRequest).user?.id; // Get userId from authenticated user
        
        validateHabitId(id);
        const noteText = note || text;
        if (!noteText) return res.status(400).json({ status: 'error', message: 'Note text required' });
        
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        // Get all existing data
        const existingNotes = getExistingValue('notes', habit);
        const existingCompletedDates = getExistingValue('completedDates', habit);
        const existingTags = getExistingValue('tags', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        
        // Add new note with full timestamp - ensure we preserve the full ISO string
        const fullTimestamp = date || new Date().toISOString();
        existingNotes.push({ 
            date: fullTimestamp, 
            text: noteText 
        });
          // Convert arrays to strings for SharePoint
        const completionsString = existingCompletedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        
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
        if (!habit) throw new NotFoundError('Habit not found');

        // Helper function to parse expected frequency
        const parseExpectedFrequency = (frequency: string): { timesPerWeek: number } => {
            if (!frequency) return { timesPerWeek: 7 }; // Default to daily
            
            const freq = frequency.toLowerCase();
            if (freq.includes('daily') || freq === 'daily') return { timesPerWeek: 7 };
            if (freq.includes('weekly') || freq === 'weekly') return { timesPerWeek: 1 };
            
            // Parse patterns like "2 times/week", "3 times per week", etc.
            const match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
            if (match) return { timesPerWeek: parseInt(match[1]) };
            
            // Parse patterns like "every 2 days", "every 3 days"
            const everyMatch = freq.match(/every\s*(\d+)\s*days?/);
            if (everyMatch) {
                const days = parseInt(everyMatch[1]);
                return { timesPerWeek: Math.round(7 / days) };
            }
            
            return { timesPerWeek: 7 }; // Default to daily if can't parse
        };

        // Calculate metrics directly without the complex Habit model logic
        const completedDates: string[] = habit.completedDates || [];
        const totalCompletions = completedDates.length;
        const expectedFreq = parseExpectedFrequency(habit.expectedFrequency || habit.ExpectedFrequency || 'daily');
        
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
            
            // Calculate expected completions for this week based on actual frequency
            const expectedCompletionsThisWeek = expectedFreq.timesPerWeek;
            
            if (expectedCompletionsThisWeek > 0) {
                completionRate = thisWeekCompletions / expectedCompletionsThisWeek; // Return as decimal (0.0 to 1.0)
                // Cap at 1.0 (100%) if user exceeded their goal
                completionRate = Math.min(completionRate, 1.0);
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

// New endpoints for enhanced frequency system
export const addHabitCompletion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (req as AuthenticatedRequest).user?.id;
        
        validateHabitId(id);
        const completionDate = date || new Date().toISOString();
        
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        // Get existing completions
        const completedDates = getExistingValue('completedDates', habit);
        
        // Add new completion (allowing multiple per day)
        completedDates.push(completionDate);
        
        // Preserve existing data
        const existingTags = getExistingValue('tags', habit);
        const existingNotes = getExistingValue('notes', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        
        // Convert to strings for SharePoint
        const completionsString = completedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        
        res.json({ 
            status: 'success', 
            data: { 
                id, 
                completedDates,
                message: 'Completion added successfully'
            } 
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const removeHabitCompletion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (req as AuthenticatedRequest).user?.id;
        
        validateHabitId(id);
        
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        // Get existing completions
        const completedDates = getExistingValue('completedDates', habit);
        
        if (date) {
            // Remove specific completion by exact timestamp or date
            const index = completedDates.findIndex((completion: string) => {
                // Try exact match first (for timestamp), then date match
                return completion === date || completion.slice(0, 10) === date.slice(0, 10);
            });
            
            if (index !== -1) {
                completedDates.splice(index, 1);
            }
        } else {
            // Remove the most recent completion for today
            const today = new Date().toISOString().slice(0, 10);
            const todayCompletions = completedDates
                .map((completion: string, index: number) => ({ completion, index }))
                .filter(({ completion }: { completion: string }) => completion.slice(0, 10) === today)
                .sort((a: { completion: string }, b: { completion: string }) => 
                    new Date(b.completion).getTime() - new Date(a.completion).getTime());
            
            if (todayCompletions.length > 0) {
                completedDates.splice(todayCompletions[0].index, 1);
            }
        }
        
        // Preserve existing data
        const existingTags = getExistingValue('tags', habit);
        const existingNotes = getExistingValue('notes', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        
        // Convert to strings for SharePoint
        const completionsString = completedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        
        await dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        
        res.json({ 
            status: 'success', 
            data: { 
                id, 
                completedDates,
                message: 'Completion removed successfully'
            } 
        });
    } catch (error: any) {
        handleError(error, res);
    }
};

export const getHabitCompletionsForDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { date } = req.query;
        const userId = (req as AuthenticatedRequest).user?.id;
        
        validateHabitId(id);
        const targetDate = (date as string) || new Date().toISOString().slice(0, 10);
        
        const habits = await dataClient.getHabits(userId);
        const habit = habits.find((h: any) => h.id === id);
        if (!habit) return res.status(404).json({ status: 'error', message: 'Habit not found' });
        
        const completedDates = getExistingValue('completedDates', habit);
        const dateOnly = targetDate.slice(0, 10);
        const count = completedDates.filter((completion: string) => 
            completion.slice(0, 10) === dateOnly
        ).length;
        
        res.json({ 
            status: 'success', 
            data: { 
                id, 
                date: dateOnly,
                count,
                completions: completedDates.filter((completion: string) => 
                    completion.slice(0, 10) === dateOnly
                )
            } 
        });
    } catch (error: any) {
        handleError(error, res);
    }
};