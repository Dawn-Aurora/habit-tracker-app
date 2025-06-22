"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Habit {
    constructor(id, name, frequency, tags = [], startDate, expectedFrequency, userId) {
        this.id = id;
        this.userId = userId || ''; // Default to empty string for backward compatibility
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
        this.tags = tags;
        this.notes = [];
        this.startDate = startDate || new Date().toISOString().slice(0, 10);
        this.expectedFrequency = expectedFrequency || frequency;
        this.completions = [];
    }
    markAsCompleted(date = new Date().toISOString().slice(0, 10)) {
        if (!this.completions.includes(date)) {
            this.completions.push(date);
        }
        this.completed = true;
    }
    addNote(text, date = new Date().toISOString().slice(0, 10)) {
        this.notes.push({ date, text });
    }
    reset() {
        this.completed = false;
    }
    getTotalCompletions() {
        return this.completions.length;
    }
    getCurrentStreak() {
        const dates = this.completions.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
        let streak = 0;
        let current = new Date();
        for (let d of dates) {
            if (d.toDateString() === current.toDateString()) {
                streak++;
                current.setDate(current.getDate() - 1);
            }
            else {
                break;
            }
        }
        return streak;
    }
    getCompletionRate() {
        const daysSinceStart = Math.max(1, Math.ceil((new Date().getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        // Return as decimal (0.0 to 1.0) so frontend can display as percentage
        return this.getTotalCompletions() / daysSinceStart;
    }
}
exports.default = Habit;
