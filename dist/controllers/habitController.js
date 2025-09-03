"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHabitCompletionsForDate = exports.removeHabitCompletion = exports.addHabitCompletion = exports.getHabitMetrics = exports.getHabitsByTag = exports.addHabitNote = exports.markHabitCompleted = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const mockDataClient = __importStar(require("../mockDataClient"));
const sharepointClient = __importStar(require("../sharepointClient"));
// Enhanced fallback logic: try SharePoint, fallback to mock on error
const useMock = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true';
// Helper function to filter habits by user
const filterHabitsByUser = (habits, userId) => {
    if (!userId) {
        // For backward compatibility, return all habits if no user ID
        return habits;
    }
    // Only return habits that belong to this specific user
    return habits.filter(habit => habit.userId === userId);
};
const dataClient = useMock
    ? {
        getHabits(userId) {
            return __awaiter(this, void 0, void 0, function* () {
                const allHabits = yield mockDataClient.getHabits();
                return filterHabitsByUser(allHabits, userId);
            });
        },
        createHabit(name, completedDate, completionsStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId);
            });
        },
        updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId);
            });
        },
        deleteHabit(id, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mockDataClient.deleteHabit(id, userId);
            });
        }
    }
    : {
        getHabits(userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.getHabits(userId);
                }
                catch (e) {
                    const allHabits = yield mockDataClient.getHabits();
                    return filterHabitsByUser(allHabits, userId);
                }
            });
        },
        createHabit(name, completedDate, completionsStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.createHabit(name, completedDate, completionsStr, '', '', expectedFrequency, userId);
                }
                catch (e) {
                    return yield mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId);
                }
            });
        },
        updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency);
                }
                catch (e) {
                    return yield mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId);
                }
            });
        },
        deleteHabit(id) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.deleteHabit(id);
                }
                catch (e) {
                    return yield mockDataClient.deleteHabit(id);
                }
            });
        }
    };
const validation_1 = require("../utils/validation");
const handleError = (error, res) => {
    if (error instanceof validation_1.ValidationError) {
        return res.status(400).json({
            status: 'error',
            type: 'ValidationError',
            message: error.message
        });
    }
    if (error instanceof validation_1.NotFoundError) {
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
const safeJsonParse = (value, fallback = []) => {
    if (!value || value === '""' || value === '=&quot;&quot;' || value === '[]')
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch (e) {
        return fallback;
    }
};
// Helper function to safely split strings or return empty array
const safeSplit = (value, fallback = []) => {
    if (!value || value === '""' || value === '=&quot;&quot;')
        return fallback;
    if (Array.isArray(value))
        return value;
    return value.split(',').filter(Boolean);
};
// Helper function to get existing field value safely
const getExistingValue = (field, habit) => {
    const spField = habit[field] || habit[field.charAt(0).toUpperCase() + field.slice(1)];
    if (spField && spField !== '=&quot;&quot;' && spField !== '""') {
        if (field === 'notes' || field === 'Notes') {
            try {
                return typeof spField === 'string' ? JSON.parse(spField) : spField;
            }
            catch (e) {
                return [];
            }
        }
        else if (field === 'tags' || field === 'Tags' || field === 'completedDates' || field === 'CompletedDates') {
            return Array.isArray(spField) ? spField : (spField ? spField.split(',').filter(Boolean) : []);
        }
        return spField;
    }
    return field === 'notes' || field === 'tags' || field === 'completedDates' ? [] : '';
};
function getHabitName(habit, fallbackName) {
    if (habit.fields && (habit.fields.Name || habit.fields.Title)) {
        return habit.fields.Name || habit.fields.Title;
    }
    return habit.Name || habit.Title || habit.name || fallbackName || '';
}
const getHabits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        const habits = yield dataClient.getHabits(userId);
        const transformedHabits = habits.map((habit) => {
            // Parse expectedFrequency - could be string, number, or JSON
            let expectedFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
            if (typeof expectedFrequency === 'string' && expectedFrequency.startsWith('{')) {
                try {
                    expectedFrequency = JSON.parse(expectedFrequency);
                }
                catch (e) {
                    // Keep as string if JSON parsing fails
                }
            }
            return {
                id: habit.id,
                name: getHabitName(habit),
                completedDates: habit.CompletedDates ? safeSplit(habit.CompletedDates) : habit.completedDates || [],
                tags: habit.Tags ? safeSplit(habit.Tags) : habit.tags || [],
                notes: habit.Notes ? safeJsonParse(habit.Notes, []) : habit.notes || [],
                startDate: habit.StartDate || habit.startDate || '',
                expectedFrequency: expectedFrequency,
                userId: habit.userId
            };
        });
        transformedHabits.forEach((habit) => {
            (0, validation_1.validateHabitId)(habit.id);
            (0, validation_1.validateHabitName)(habit.name);
            if (habit.completedDates.length > 0) {
                (0, validation_1.validateCompletedDates)(habit.completedDates);
            }
        });
        res.json({
            status: 'success',
            data: transformedHabits
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.getHabits = getHabits;
const createHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, frequency, expectedFrequency } = req.body;
        (0, validation_1.validateHabitName)(name);
        const sanitizedName = (0, validation_1.sanitizeHabitName)(name);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        // Handle both structured and legacy frequency
        let frequencyToStore = expectedFrequency || frequency || '';
        // If it's a structured frequency object, serialize it as JSON for SharePoint
        if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
            frequencyToStore = JSON.stringify(expectedFrequency);
        }
        // Pass frequency to dataClient as expectedFrequency
        const result = yield dataClient.createHabit(sanitizedName, undefined, "", frequencyToStore, userId);
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || [],
            expectedFrequency: expectedFrequency || frequency || '', // Return the original format
            userId: result.userId || userId
        };
        (0, validation_1.validateHabitId)(newHabit.id);
        (0, validation_1.validateHabitName)(newHabit.name);
        res.status(201).json({
            status: 'success',
            data: newHabit
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.createHabit = createHabit;
const updateHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, completedDates, completions, tags, notes, expectedFrequency } = req.body;
        (0, validation_1.validateHabitId)(id);
        // Get userId from authenticated user for proper filtering
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Fetch the current habit to preserve existing fields (filtered by user)
        const allHabits = yield dataClient.getHabits(userId);
        const currentHabit = allHabits.find((h) => h.id === id);
        if (!currentHabit)
            throw new validation_1.NotFoundError('Habit not found');
        // Only validate name if provided and not blank
        if (name !== undefined && name !== "") {
            (0, validation_1.validateHabitName)(name);
        }
        // Handle both completedDates and completions (for backward compatibility)
        const inputCompletions = completions || completedDates;
        if (inputCompletions !== undefined) {
            (0, validation_1.validateCompletedDates)(inputCompletions);
        }
        // Preserve existing data if not updating
        const finalName = name !== undefined ? (0, validation_1.sanitizeHabitName)(name) : getHabitName(currentHabit);
        const finalCompletedDates = inputCompletions !== undefined
            ? (Array.isArray(inputCompletions) ? inputCompletions : (inputCompletions ? inputCompletions.split(',').filter(Boolean) : []))
            : getExistingValue('completedDates', currentHabit);
        const finalTags = tags !== undefined
            ? (Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : []))
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
        const result = yield dataClient.updateHabit(id, finalName, completionsStr, tagsStr, notesStr, finalExpectedFrequency, userId);
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
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.updateHabit = updateHabit;
const deleteHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        (0, validation_1.validateHabitId)(id);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        yield dataClient.deleteHabit(id, userId);
        res.status(200).json({ status: 'success', data: { id } });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.deleteHabit = deleteHabit;
const markHabitCompleted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        (0, validation_1.validateHabitId)(id);
        // Use full timestamp instead of date-only to allow multiple completions per day
        const completedTimestamp = date || new Date().toISOString();
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
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
        yield dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
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
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.markHabitCompleted = markHabitCompleted;
const addHabitNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { note, text, date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        (0, validation_1.validateHabitId)(id);
        const noteText = note || text;
        if (!noteText)
            return res.status(400).json({ status: 'error', message: 'Note text required' });
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
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
        yield dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
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
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.addHabitNote = addHabitNote;
const getHabitsByTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tag } = req.query;
        const habits = yield dataClient.getHabits();
        const filtered = tag ? habits.filter((h) => h.tags && h.tags.includes(tag)) : habits;
        res.json({ status: 'success', data: filtered });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.getHabitsByTag = getHabitsByTag;
const getHabitMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        (0, validation_1.validateHabitId)(id);
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            throw new validation_1.NotFoundError('Habit not found');
        // Helper function to parse expected frequency
        const parseExpectedFrequency = (frequency) => {
            if (!frequency)
                return { timesPerWeek: 7 }; // Default to daily
            const freq = frequency.toLowerCase();
            if (freq.includes('daily') || freq === 'daily')
                return { timesPerWeek: 7 };
            if (freq.includes('weekly') || freq === 'weekly')
                return { timesPerWeek: 1 };
            // Parse patterns like "2 times/week", "3 times per week", etc.
            const match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
            if (match)
                return { timesPerWeek: parseInt(match[1]) };
            // Parse patterns like "every 2 days", "every 3 days"
            const everyMatch = freq.match(/every\s*(\d+)\s*days?/);
            if (everyMatch) {
                const days = parseInt(everyMatch[1]);
                return { timesPerWeek: Math.round(7 / days) };
            }
            return { timesPerWeek: 7 }; // Default to daily if can't parse
        };
        // Calculate metrics directly without the complex Habit model logic
        const completedDates = habit.completedDates || [];
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
            const thisWeekCompletions = completedDates.filter((dateStr) => {
                const completionDate = new Date(dateStr);
                return completionDate >= monday && completionDate <= sunday;
            }).length;
            // Calculate days elapsed in this week (up to today)
            const daysElapsedThisWeek = Math.min(Math.floor((today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
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
            const dates = completedDates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
            let current = new Date();
            current.setHours(0, 0, 0, 0); // Reset to start of day
            for (let d of dates) {
                d.setHours(0, 0, 0, 0); // Reset to start of day
                if (d.getTime() === current.getTime()) {
                    currentStreak++;
                    current.setDate(current.getDate() - 1);
                }
                else {
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
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.getHabitMetrics = getHabitMetrics;
// New endpoints for enhanced frequency system
const addHabitCompletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        (0, validation_1.validateHabitId)(id);
        const completionDate = date || new Date().toISOString();
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
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
        yield dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        res.json({
            status: 'success',
            data: {
                id,
                completedDates,
                message: 'Completion added successfully'
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.addHabitCompletion = addHabitCompletion;
const removeHabitCompletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        (0, validation_1.validateHabitId)(id);
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
        // Get existing completions
        const completedDates = getExistingValue('completedDates', habit);
        if (date) {
            // Remove specific completion by exact timestamp or date
            const index = completedDates.findIndex((completion) => {
                // Try exact match first (for timestamp), then date match
                return completion === date || completion.slice(0, 10) === date.slice(0, 10);
            });
            if (index !== -1) {
                completedDates.splice(index, 1);
            }
        }
        else {
            // Remove the most recent completion for today
            const today = new Date().toISOString().slice(0, 10);
            const todayCompletions = completedDates
                .map((completion, index) => ({ completion, index }))
                .filter(({ completion }) => completion.slice(0, 10) === today)
                .sort((a, b) => new Date(b.completion).getTime() - new Date(a.completion).getTime());
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
        yield dataClient.updateHabit(id, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId);
        res.json({
            status: 'success',
            data: {
                id,
                completedDates,
                message: 'Completion removed successfully'
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.removeHabitCompletion = removeHabitCompletion;
const getHabitCompletionsForDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { date } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        (0, validation_1.validateHabitId)(id);
        const targetDate = date || new Date().toISOString().slice(0, 10);
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
        const completedDates = getExistingValue('completedDates', habit);
        const dateOnly = targetDate.slice(0, 10);
        const count = completedDates.filter((completion) => completion.slice(0, 10) === dateOnly).length;
        res.json({
            status: 'success',
            data: {
                id,
                date: dateOnly,
                count,
                completions: completedDates.filter((completion) => completion.slice(0, 10) === dateOnly)
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.getHabitCompletionsForDate = getHabitCompletionsForDate;
