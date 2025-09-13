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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHabitCompletionsForDate = exports.removeHabitCompletion = exports.addHabitCompletion = exports.getHabitMetrics = exports.getHabitsByTag = exports.addHabitNote = exports.markHabitCompleted = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var mockDataClient = __importStar(require("../mockDataClient"));
var sharepointClient = __importStar(require("../sharepointClient"));
// Enhanced fallback logic: try SharePoint, fallback to mock on error
var useMock = process.env.NODE_ENV === 'test' || process.env.USE_MOCK_DATA === 'true';
// Helper function to filter habits by user
var filterHabitsByUser = function (habits, userId) {
    if (!userId) {
        // For backward compatibility, return all habits if no user ID
        return habits;
    }
    // Only return habits that belong to this specific user
    return habits.filter(function (habit) { return habit.userId === userId; });
};
var dataClient = useMock
    ? {
        getHabits: function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, mockDataClient.getHabits(userId)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        createHabit: function (name, completedDate, completionsStr, expectedFrequency, userId, category) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        updateHabit: function (id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        },
        deleteHabit: function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, mockDataClient.deleteHabit(id, userId)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
    }
    : {
        getHabits: function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1, allHabits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, sharepointClient.getHabits(userId)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_1 = _a.sent();
                            return [4 /*yield*/, mockDataClient.getHabits()];
                        case 3:
                            allHabits = _a.sent();
                            return [2 /*return*/, filterHabitsByUser(allHabits, userId)];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        createHabit: function (name, completedDate, completionsStr, expectedFrequency, userId, category) {
            return __awaiter(this, void 0, void 0, function () {
                var result, e_2, errorMessage, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            console.log('[BACKEND] Attempting SharePoint createHabit...');
                            return [4 /*yield*/, sharepointClient.createHabit(name, completedDate, completionsStr, '', '', expectedFrequency, userId, category)];
                        case 1:
                            result = _a.sent();
                            console.log("[BACKEND] SharePoint createHabit succeeded with ID: ".concat(result.id));
                            return [2 /*return*/, result];
                        case 2:
                            e_2 = _a.sent();
                            errorMessage = e_2 instanceof Error ? e_2.message : 'Unknown error';
                            console.log("[BACKEND] SharePoint createHabit failed: ".concat(errorMessage, ", falling back to mock client"));
                            return [4 /*yield*/, mockDataClient.createHabit(name, completedDate, completionsStr, expectedFrequency, userId)];
                        case 3:
                            result = _a.sent();
                            console.log("[BACKEND] Mock createHabit succeeded with ID: ".concat(result.id));
                            return [2 /*return*/, result];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        updateHabit: function (id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, e_3, errorMessage, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            console.log("[BACKEND] Attempting SharePoint updateHabit for ID: ".concat(id, "..."));
                            return [4 /*yield*/, sharepointClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency)];
                        case 1:
                            result = _a.sent();
                            console.log("[BACKEND] SharePoint updateHabit succeeded for ID: ".concat(id));
                            return [2 /*return*/, result];
                        case 2:
                            e_3 = _a.sent();
                            errorMessage = e_3 instanceof Error ? e_3.message : 'Unknown error';
                            console.log("[BACKEND] SharePoint updateHabit failed for ID: ".concat(id, ": ").concat(errorMessage, ", falling back to mock client"));
                            return [4 /*yield*/, mockDataClient.updateHabit(id, name, completionsStr, tagsStr, notesStr, expectedFrequency, userId)];
                        case 3:
                            result = _a.sent();
                            console.log("[BACKEND] Mock updateHabit succeeded for ID: ".concat(id));
                            return [2 /*return*/, result];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        deleteHabit: function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, sharepointClient.deleteHabit(id)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_4 = _a.sent();
                            return [4 /*yield*/, mockDataClient.deleteHabit(id)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    };
var validation_1 = require("../utils/validation");
var handleError = function (error, res) {
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
var safeJsonParse = function (value, fallback) {
    if (fallback === void 0) { fallback = []; }
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
var safeSplit = function (value, fallback) {
    if (fallback === void 0) { fallback = []; }
    if (!value || value === '""' || value === '=&quot;&quot;')
        return fallback;
    if (Array.isArray(value))
        return value;
    return value.split(',').filter(Boolean);
};
// Helper function to get existing field value safely
var getExistingValue = function (field, habit) {
    var spField = habit[field] || habit[field.charAt(0).toUpperCase() + field.slice(1)];
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
var getHabits = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, habits, transformedHabits, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                transformedHabits = habits.map(function (habit) {
                    // Parse expectedFrequency - could be string, number, or JSON
                    var expectedFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
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
                        category: habit.Category || habit.category || null,
                        completedDates: habit.CompletedDates ? safeSplit(habit.CompletedDates) : habit.completedDates || [],
                        tags: habit.Tags ? safeSplit(habit.Tags) : habit.tags || [],
                        notes: habit.Notes ? safeJsonParse(habit.Notes, []) : habit.notes || [],
                        startDate: habit.StartDate || habit.startDate || '',
                        expectedFrequency: expectedFrequency,
                        userId: habit.userId
                    };
                });
                transformedHabits.forEach(function (habit) {
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
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                handleError(error_1, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHabits = getHabits;
var createHabit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, frequency, expectedFrequency, category, tags, sanitizedName, userId, frequencyToStore, tagsToStore, result, newHabit, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, name_1 = _a.name, frequency = _a.frequency, expectedFrequency = _a.expectedFrequency, category = _a.category, tags = _a.tags;
                (0, validation_1.validateHabitName)(name_1);
                sanitizedName = (0, validation_1.sanitizeHabitName)(name_1);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                frequencyToStore = expectedFrequency || frequency || '';
                // If it's a structured frequency object, serialize it as JSON for SharePoint
                if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
                    frequencyToStore = JSON.stringify(expectedFrequency);
                }
                tagsToStore = '';
                if (tags && Array.isArray(tags)) {
                    tagsToStore = tags.join(',');
                }
                // Pass frequency to dataClient as expectedFrequency
                console.log("[CONTROLLER] Creating habit \"".concat(sanitizedName, "\" for user ").concat(userId));
                return [4 /*yield*/, dataClient.createHabit(sanitizedName, undefined, "", frequencyToStore, userId, category)];
            case 1:
                result = _c.sent();
                console.log("[CONTROLLER] Habit created with ID: ".concat(result.id, ", type: ").concat(typeof result.id));
                newHabit = {
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
                (0, validation_1.validateHabitId)(newHabit.id);
                (0, validation_1.validateHabitName)(newHabit.name);
                res.status(201).json({
                    status: 'success',
                    data: newHabit
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                handleError(error_2, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createHabit = createHabit;
var updateHabit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, _a, name_2, completedDates, completions, tags, notes, expectedFrequency, userId, allHabits, currentHabit, inputCompletions, finalName, finalCompletedDates, finalTags, finalNotes, finalExpectedFrequency, completionsStr, tagsStr, notesStr, result, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                id_1 = req.params.id;
                _a = req.body, name_2 = _a.name, completedDates = _a.completedDates, completions = _a.completions, tags = _a.tags, notes = _a.notes, expectedFrequency = _a.expectedFrequency;
                (0, validation_1.validateHabitId)(id_1);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                allHabits = _c.sent();
                currentHabit = allHabits.find(function (h) { return h.id === id_1; });
                if (!currentHabit)
                    throw new validation_1.NotFoundError('Habit not found');
                // Only validate name if provided and not blank
                if (name_2 !== undefined && name_2 !== "") {
                    (0, validation_1.validateHabitName)(name_2);
                }
                inputCompletions = completions || completedDates;
                if (inputCompletions !== undefined) {
                    (0, validation_1.validateCompletedDates)(inputCompletions);
                }
                finalName = name_2 !== undefined ? (0, validation_1.sanitizeHabitName)(name_2) : getHabitName(currentHabit);
                finalCompletedDates = inputCompletions !== undefined
                    ? (Array.isArray(inputCompletions) ? inputCompletions : (inputCompletions ? inputCompletions.split(',').filter(Boolean) : []))
                    : getExistingValue('completedDates', currentHabit);
                finalTags = tags !== undefined
                    ? (Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(function (t) { return t.trim(); }).filter(Boolean) : []))
                    : getExistingValue('tags', currentHabit);
                finalNotes = notes !== undefined
                    ? (Array.isArray(notes) ? notes : (notes ? [notes] : []))
                    : getExistingValue('notes', currentHabit);
                finalExpectedFrequency = expectedFrequency !== undefined
                    ? String(expectedFrequency)
                    : (currentHabit.ExpectedFrequency || currentHabit.expectedFrequency || '');
                completionsStr = finalCompletedDates.join(',');
                tagsStr = finalTags.join(',');
                notesStr = JSON.stringify(finalNotes);
                return [4 /*yield*/, dataClient.updateHabit(id_1, finalName, completionsStr, tagsStr, notesStr, finalExpectedFrequency, userId)];
            case 2:
                result = _c.sent();
                res.json({
                    status: 'success',
                    data: {
                        id: id_1,
                        name: finalName,
                        completedDates: finalCompletedDates,
                        tags: finalTags,
                        notes: finalNotes,
                        expectedFrequency: finalExpectedFrequency
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _c.sent();
                handleError(error_3, res);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateHabit = updateHabit;
var deleteHabit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                (0, validation_1.validateHabitId)(id);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, dataClient.deleteHabit(id, userId)];
            case 1:
                _b.sent();
                res.status(200).json({ status: 'success', data: { id: id } });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                handleError(error_4, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteHabit = deleteHabit;
var markHabitCompleted = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_2, date, userId, completedTimestamp, habits, habit, completedDates, existingTags, existingNotes, existingFrequency, completionsString, tagsString, notesString, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id_2 = req.params.id;
                date = req.body.date;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                (0, validation_1.validateHabitId)(id_2);
                completedTimestamp = date || new Date().toISOString();
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                habit = habits.find(function (h) { return h.id === id_2; });
                if (!habit)
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Habit not found' })];
                completedDates = getExistingValue('completedDates', habit);
                // Always add the new completion (no duplicate check for timestamps)
                completedDates.push(completedTimestamp);
                existingTags = getExistingValue('tags', habit);
                existingNotes = getExistingValue('notes', habit);
                existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
                completionsString = completedDates.join(',');
                tagsString = existingTags.join(',');
                notesString = JSON.stringify(existingNotes);
                return [4 /*yield*/, dataClient.updateHabit(id_2, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId)];
            case 2:
                _b.sent();
                res.json({
                    status: 'success',
                    data: {
                        id: id_2,
                        name: getHabitName(habit),
                        completedDates: completedDates,
                        tags: existingTags,
                        notes: existingNotes,
                        expectedFrequency: existingFrequency
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _b.sent();
                handleError(error_5, res);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.markHabitCompleted = markHabitCompleted;
var addHabitNote = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_3, _a, note, text, date, userId, noteText, habits, habit, existingNotes, existingCompletedDates, existingTags, existingFrequency, fullTimestamp, completionsString, tagsString, notesString, error_6;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                id_3 = req.params.id;
                _a = req.body, note = _a.note, text = _a.text, date = _a.date;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                (0, validation_1.validateHabitId)(id_3);
                noteText = note || text;
                if (!noteText)
                    return [2 /*return*/, res.status(400).json({ status: 'error', message: 'Note text required' })];
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _c.sent();
                habit = habits.find(function (h) { return h.id === id_3; });
                if (!habit)
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Habit not found' })];
                existingNotes = getExistingValue('notes', habit);
                existingCompletedDates = getExistingValue('completedDates', habit);
                existingTags = getExistingValue('tags', habit);
                existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
                fullTimestamp = date || new Date().toISOString();
                existingNotes.push({
                    date: fullTimestamp,
                    text: noteText
                });
                completionsString = existingCompletedDates.join(',');
                tagsString = existingTags.join(',');
                notesString = JSON.stringify(existingNotes);
                return [4 /*yield*/, dataClient.updateHabit(id_3, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId)];
            case 2:
                _c.sent();
                res.json({
                    status: 'success',
                    data: {
                        id: id_3,
                        name: getHabitName(habit),
                        completedDates: existingCompletedDates,
                        tags: existingTags,
                        notes: existingNotes,
                        expectedFrequency: existingFrequency
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _c.sent();
                handleError(error_6, res);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addHabitNote = addHabitNote;
var getHabitsByTag = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tag_1, habits, filtered, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tag_1 = req.query.tag;
                return [4 /*yield*/, dataClient.getHabits()];
            case 1:
                habits = _a.sent();
                filtered = tag_1 ? habits.filter(function (h) { return h.tags && h.tags.includes(tag_1); }) : habits;
                res.json({ status: 'success', data: filtered });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                handleError(error_7, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHabitsByTag = getHabitsByTag;
var getHabitMetrics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_4, userId, habits, habit, parseExpectedFrequency, completedDates, totalCompletions, expectedFreq, completionRate, today, dayOfWeek, monday_1, sunday_1, thisWeekCompletions, daysElapsedThisWeek, expectedCompletionsThisWeek, currentStreak, dates, current, _i, dates_1, d, metrics, error_8;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id_4 = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                (0, validation_1.validateHabitId)(id_4);
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                habit = habits.find(function (h) { return h.id === id_4; });
                if (!habit)
                    throw new validation_1.NotFoundError('Habit not found');
                parseExpectedFrequency = function (frequency) {
                    if (!frequency)
                        return { timesPerWeek: 7 }; // Default to daily
                    var freq = frequency.toLowerCase();
                    if (freq.includes('daily') || freq === 'daily')
                        return { timesPerWeek: 7 };
                    if (freq.includes('weekly') || freq === 'weekly')
                        return { timesPerWeek: 1 };
                    // Parse patterns like "2 times/week", "3 times per week", etc.
                    var match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
                    if (match)
                        return { timesPerWeek: parseInt(match[1]) };
                    // Parse patterns like "every 2 days", "every 3 days"
                    var everyMatch = freq.match(/every\s*(\d+)\s*days?/);
                    if (everyMatch) {
                        var days = parseInt(everyMatch[1]);
                        return { timesPerWeek: Math.round(7 / days) };
                    }
                    return { timesPerWeek: 7 }; // Default to daily if can't parse
                };
                completedDates = habit.completedDates || [];
                totalCompletions = completedDates.length;
                expectedFreq = parseExpectedFrequency(habit.expectedFrequency || habit.ExpectedFrequency || 'daily');
                completionRate = 0;
                if (totalCompletions > 0) {
                    today = new Date();
                    dayOfWeek = today.getDay();
                    monday_1 = new Date(today);
                    monday_1.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    monday_1.setHours(0, 0, 0, 0);
                    sunday_1 = new Date(monday_1);
                    sunday_1.setDate(monday_1.getDate() + 6);
                    sunday_1.setHours(23, 59, 59, 999);
                    thisWeekCompletions = completedDates.filter(function (dateStr) {
                        var completionDate = new Date(dateStr);
                        return completionDate >= monday_1 && completionDate <= sunday_1;
                    }).length;
                    daysElapsedThisWeek = Math.min(Math.floor((today.getTime() - monday_1.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
                    expectedCompletionsThisWeek = expectedFreq.timesPerWeek;
                    if (expectedCompletionsThisWeek > 0) {
                        completionRate = thisWeekCompletions / expectedCompletionsThisWeek; // Return as decimal (0.0 to 1.0)
                        // Cap at 1.0 (100%) if user exceeded their goal
                        completionRate = Math.min(completionRate, 1.0);
                    }
                }
                currentStreak = 0;
                if (completedDates.length > 0) {
                    dates = completedDates.map(function (d) { return new Date(d); }).sort(function (a, b) { return b.getTime() - a.getTime(); });
                    current = new Date();
                    current.setHours(0, 0, 0, 0); // Reset to start of day
                    for (_i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
                        d = dates_1[_i];
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
                metrics = {
                    currentStreak: currentStreak,
                    totalCompletions: totalCompletions,
                    completionRate: completionRate,
                    expectedFrequency: habit.expectedFrequency || habit.ExpectedFrequency || ''
                };
                res.json({ status: 'success', data: metrics });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                handleError(error_8, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHabitMetrics = getHabitMetrics;
// New endpoints for enhanced frequency system
var addHabitCompletion = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_5, date, userId, completionDate, habits, habit, completedDates, existingTags, existingNotes, existingFrequency, completionsString, tagsString, notesString, error_9;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id_5 = req.params.id;
                date = req.body.date;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                (0, validation_1.validateHabitId)(id_5);
                completionDate = date || new Date().toISOString();
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                habit = habits.find(function (h) { return h.id === id_5; });
                if (!habit)
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Habit not found' })];
                completedDates = getExistingValue('completedDates', habit);
                // Add new completion (allowing multiple per day)
                completedDates.push(completionDate);
                existingTags = getExistingValue('tags', habit);
                existingNotes = getExistingValue('notes', habit);
                existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
                completionsString = completedDates.join(',');
                tagsString = existingTags.join(',');
                notesString = JSON.stringify(existingNotes);
                return [4 /*yield*/, dataClient.updateHabit(id_5, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId)];
            case 2:
                _b.sent();
                res.json({
                    status: 'success',
                    data: {
                        id: id_5,
                        completedDates: completedDates,
                        message: 'Completion added successfully'
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_9 = _b.sent();
                handleError(error_9, res);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addHabitCompletion = addHabitCompletion;
var removeHabitCompletion = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_6, date_1, userId, habits, habit, completedDates, index, today_1, todayCompletions, existingTags, existingNotes, existingFrequency, completionsString, tagsString, notesString, error_10;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id_6 = req.params.id;
                date_1 = req.body.date;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                (0, validation_1.validateHabitId)(id_6);
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                habit = habits.find(function (h) { return h.id === id_6; });
                if (!habit)
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Habit not found' })];
                completedDates = getExistingValue('completedDates', habit);
                if (date_1) {
                    index = completedDates.findIndex(function (completion) {
                        // Try exact match first (for timestamp), then date match
                        return completion === date_1 || completion.slice(0, 10) === date_1.slice(0, 10);
                    });
                    if (index !== -1) {
                        completedDates.splice(index, 1);
                    }
                }
                else {
                    today_1 = new Date().toISOString().slice(0, 10);
                    todayCompletions = completedDates
                        .map(function (completion, index) { return ({ completion: completion, index: index }); })
                        .filter(function (_a) {
                        var completion = _a.completion;
                        return completion.slice(0, 10) === today_1;
                    })
                        .sort(function (a, b) {
                        return new Date(b.completion).getTime() - new Date(a.completion).getTime();
                    });
                    if (todayCompletions.length > 0) {
                        completedDates.splice(todayCompletions[0].index, 1);
                    }
                }
                existingTags = getExistingValue('tags', habit);
                existingNotes = getExistingValue('notes', habit);
                existingFrequency = habit.ExpectedFrequency || habit.expectedFrequency || '';
                completionsString = completedDates.join(',');
                tagsString = existingTags.join(',');
                notesString = JSON.stringify(existingNotes);
                return [4 /*yield*/, dataClient.updateHabit(id_6, getHabitName(habit), completionsString, tagsString, notesString, existingFrequency, userId)];
            case 2:
                _b.sent();
                res.json({
                    status: 'success',
                    data: {
                        id: id_6,
                        completedDates: completedDates,
                        message: 'Completion removed successfully'
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_10 = _b.sent();
                handleError(error_10, res);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.removeHabitCompletion = removeHabitCompletion;
var getHabitCompletionsForDate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_7, date, userId, targetDate, habits, habit, completedDates, dateOnly_1, count, error_11;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id_7 = req.params.id;
                date = req.query.date;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                (0, validation_1.validateHabitId)(id_7);
                targetDate = date || new Date().toISOString().slice(0, 10);
                return [4 /*yield*/, dataClient.getHabits(userId)];
            case 1:
                habits = _b.sent();
                habit = habits.find(function (h) { return h.id === id_7; });
                if (!habit)
                    return [2 /*return*/, res.status(404).json({ status: 'error', message: 'Habit not found' })];
                completedDates = getExistingValue('completedDates', habit);
                dateOnly_1 = targetDate.slice(0, 10);
                count = completedDates.filter(function (completion) {
                    return completion.slice(0, 10) === dateOnly_1;
                }).length;
                res.json({
                    status: 'success',
                    data: {
                        id: id_7,
                        date: dateOnly_1,
                        count: count,
                        completions: completedDates.filter(function (completion) {
                            return completion.slice(0, 10) === dateOnly_1;
                        })
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_11 = _b.sent();
                handleError(error_11, res);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getHabitCompletionsForDate = getHabitCompletionsForDate;
