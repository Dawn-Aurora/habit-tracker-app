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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mockDataClient = __importStar(require("../mockDataClient"));
const sharepointClient = __importStar(require("../sharepointClient"));
const dataClient = process.env.DATA_CLIENT === 'mock'
    ? mockDataClient
    : sharepointClient;
const validation_1 = require("../utils/validation");
const handleError = (error, res) => {
    console.error('Error:', error);
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
function getHabitName(habit, fallbackName) {
    if (habit.fields && (habit.fields.Name || habit.fields.Title)) {
        return habit.fields.Name || habit.fields.Title;
    }
    return habit.Name || habit.Title || habit.name || fallbackName || '';
}
const getHabits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const habits = yield dataClient.getHabits();
        const transformedHabits = habits.map((habit) => ({
            id: habit.id,
            name: getHabitName(habit),
            completedDates: habit.CompletedDates
                ? habit.CompletedDates.split(',').filter(Boolean)
                : habit.completedDates || []
        }));
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
    try {
        const { name } = req.body;
        (0, validation_1.validateHabitName)(name);
        const sanitizedName = (0, validation_1.sanitizeHabitName)(name);
        const result = yield dataClient.createHabit(sanitizedName);
        const newHabit = {
            id: result.id,
            name: getHabitName(result, sanitizedName),
            completedDates: (result.fields && result.fields.CompletedDates)
                ? result.fields.CompletedDates.split(',').filter(Boolean)
                : result.completedDates || []
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
        const { name, completedDates } = req.body;
        (0, validation_1.validateHabitId)(id);
        if (name !== undefined) {
            (0, validation_1.validateHabitName)(name);
        }
        if (completedDates !== undefined) {
            (0, validation_1.validateCompletedDates)(completedDates);
        }
        const sanitizedName = name ? (0, validation_1.sanitizeHabitName)(name) : undefined;
        const completedDatesString = completedDates ? completedDates.join(',') : undefined;
        const result = yield dataClient.updateHabit(id, sanitizedName, completedDatesString);
        res.json({
            status: 'success',
            data: {
                id: result.id,
                name: getHabitName(result, sanitizedName),
                completedDates: ((_a = result.fields) === null || _a === void 0 ? void 0 : _a.CompletedDates)
                    ? result.fields.CompletedDates.split(',').filter(Boolean)
                    : result.completedDates || []
            }
        });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.updateHabit = updateHabit;
const deleteHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, validation_1.validateHabitId)(id);
        yield dataClient.deleteHabit(id);
        res.status(200).json({ status: 'success', data: { id } });
    }
    catch (error) {
        handleError(error, res);
    }
});
exports.deleteHabit = deleteHabit;
