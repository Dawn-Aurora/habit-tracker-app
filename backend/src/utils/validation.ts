import { Request } from 'express';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export function validateHabitName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new ValidationError('Habit name is required and must be a string');
    }
    if (name.trim().length === 0) {
        throw new ValidationError('Habit name cannot be empty');
    }
    if (name.length > 100) {
        throw new ValidationError('Habit name must be less than 100 characters');
    }
}

export function validateHabitId(id: string): void {
    if (!id || typeof id !== 'string') {
        throw new ValidationError('Habit ID is required and must be a string');
    }
    // Allow UUIDs (with dashes) and alphanumeric IDs - more permissive for real-world IDs
    if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
        throw new ValidationError('Invalid habit ID format');
    }
}

export function validateCompletedDates(dates: string[]): void {
    if (!Array.isArray(dates)) {
        throw new ValidationError('Completed dates must be an array');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[-+]\d{2}:?\d{2})?)?$/;
    
    dates.forEach((date, index) => {
        if (!dateRegex.test(date)) {
            throw new ValidationError(`Invalid date format at index ${index}. Dates must be in ISO or YYYY-MM-DD format`);
        }
        
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new ValidationError(`Invalid date at index ${index}`);
        }
        
        if (parsedDate > new Date()) {
            throw new ValidationError(`Future dates are not allowed at index ${index}`);
        }
    });
}

export function sanitizeHabitName(name: string): string {
    name = name.trim();
    name = name.replace(/<\/?[a-z][^>]*>/gi, '');
    name = name.replace(/[&<>"]|'/g, function(match) {
        const entities: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return entities[match];
    });
    return name;
}
