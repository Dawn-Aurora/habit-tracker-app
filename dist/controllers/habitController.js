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
exports.getHabitMetrics = exports.getHabitsByTag = exports.addHabitNote = exports.markHabitCompleted = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
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
    return habits.filter(habit => habit.userId === userId || !habit.userId); // Include habits without userId for backward compatibility
};
const dataClient = useMock
    ? {
        getHabits(userId) {
            return __awaiter(this, void 0, void 0, function* () {
                const allHabits = yield mockDataClient.getHabits();
                return filterHabitsByUser(allHabits, userId);
            });
        },
        createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mockDataClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId);
            });
        },
        updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mockDataClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId);
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
                    const allHabits = yield sharepointClient.getHabits();
                    return filterHabitsByUser(allHabits, userId);
                }
                catch (e) {
                    const allHabits = yield mockDataClient.getHabits();
                    return filterHabitsByUser(allHabits, userId);
                }
            });
        },
        createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency);
                }
                catch (e) {
                    return yield mockDataClient.createHabit(name, completedDate, completedDatesStr, expectedFrequency, userId);
                }
            });
        },
        updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield sharepointClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency);
                }
                catch (e) {
                    return yield mockDataClient.updateHabit(id, name, completedDatesStr, tagsStr, notesStr, expectedFrequency, userId);
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
        console.log('JSON parse error for value:', value, 'Error:', e.message);
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
        const { name, frequency } = req.body;
        (0, validation_1.validateHabitName)(name);
        const sanitizedName = (0, validation_1.sanitizeHabitName)(name);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        // Pass frequency to dataClient as expectedFrequency
        const result = yield dataClient.createHabit(sanitizedName, undefined, "", frequency, userId);
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || [],
            expectedFrequency: result.expectedFrequency || frequency || '',
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
    try {
        const { id } = req.params;
        const { name, completedDates, tags, notes, expectedFrequency } = req.body;
        (0, validation_1.validateHabitId)(id);
        // Fetch the current habit to preserve existing fields
        const currentHabit = (yield dataClient.getHabits()).find((h) => h.id === id);
        if (!currentHabit)
            throw new validation_1.NotFoundError('Habit not found');
        // Only validate name if provided and not blank
        if (name !== undefined && name !== "") {
            (0, validation_1.validateHabitName)(name);
        }
        if (completedDates !== undefined) {
            (0, validation_1.validateCompletedDates)(completedDates);
        }
        // Preserve existing data if not updating
        const finalName = name !== undefined ? (0, validation_1.sanitizeHabitName)(name) : getHabitName(currentHabit);
        const finalCompletedDates = completedDates !== undefined
            ? (Array.isArray(completedDates) ? completedDates : (completedDates ? completedDates.split(',').filter(Boolean) : []))
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
        const completedDatesStr = finalCompletedDates.join(',');
        const tagsStr = finalTags.join(',');
        const notesStr = JSON.stringify(finalNotes);
        // Update with all fields preserved
        const result = yield dataClient.updateHabit(id, finalName, completedDatesStr, tagsStr, notesStr, finalExpectedFrequency);
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
    console.log('DEBUG: markHabitCompleted endpoint hit', req.method, req.originalUrl, req.body);
    try {
        const { id } = req.params;
        const { date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get userId from authenticated user
        (0, validation_1.validateHabitId)(id);
        const completedDate = date || new Date().toISOString().slice(0, 10);
        const habits = yield dataClient.getHabits(userId);
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
        const completedDates = getExistingValue('completedDates', habit);
        if (!completedDates.includes(completedDate))
            completedDates.push(completedDate);
        // Preserve all existing data
        const existingTags = getExistingValue('tags', habit);
        const existingNotes = getExistingValue('notes', habit);
        const existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
        // Convert to strings for SharePoint
        const completedDatesString = completedDates.join(',');
        const tagsString = existingTags.join(',');
        const notesString = JSON.stringify(existingNotes);
        yield dataClient.updateHabit(id, getHabitName(habit), completedDatesString, tagsString, notesString, existingFrequency, userId);
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
    console.log('DEBUG: addHabitNote endpoint hit', req.method, req.originalUrl, req.body);
    try {
        const { id } = req.params;
        const { note, text, date } = req.body;
        (0, validation_1.validateHabitId)(id);
        const noteText = note || text;
        if (!noteText)
            return res.status(400).json({ status: 'error', message: 'Note text required' });
        const habits = yield dataClient.getHabits();
        const habit = habits.find((h) => h.id === id);
        if (!habit)
            return res.status(404).json({ status: 'error', message: 'Habit not found' });
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
        yield dataClient.updateHabit(id, getHabitName(habit), completedDatesString, tagsString, notesString, existingFrequency);
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
            throw new validation_1.NotFoundError('Habit not found'); // Calculate metrics directly without the complex Habit model logic
        const completedDates = habit.completedDates || [];
        const totalCompletions = completedDates.length;
        // Calculate completion rate safely
        let completionRate = 0;
        let effectiveStartDate = habit.startDate;
        if (totalCompletions > 0) {
            // If no start date, use the earliest completion date
            if (!effectiveStartDate || effectiveStartDate === '') {
                const sortedDates = completedDates.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
                effectiveStartDate = sortedDates[0].toISOString().slice(0, 10);
            }
            const startDateObj = new Date(effectiveStartDate);
            const currentDate = new Date();
            if (!isNaN(startDateObj.getTime())) {
                const daysSinceStart = Math.max(1, Math.ceil((currentDate.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
                completionRate = totalCompletions / daysSinceStart; // Return as decimal (0.0 to 1.0)
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
        console.log('DEBUG: Direct calculation results:', {
            totalCompletions,
            completionRate,
            currentStreak,
            effectiveStartDate
        });
        const metrics = {
            currentStreak: currentStreak,
            totalCompletions: totalCompletions,
            completionRate: completionRate,
            startDate: effectiveStartDate,
            expectedFrequency: habit.expectedFrequency || habit.ExpectedFrequency || ''
        };
        res.json({ status: 'success', data: metrics });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.getHabitMetrics = getHabitMetrics;
