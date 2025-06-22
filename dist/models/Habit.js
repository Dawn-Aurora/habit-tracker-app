"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Habit {
    constructor(id, name, frequency, tags = [], expectedFrequency, userId) {
        this.id = id;
        this.userId = userId || ''; // Default to empty string for backward compatibility
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
        this.tags = tags;
        this.notes = [];
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
        console.log('DEBUG: This week range:', monday.toISOString().slice(0, 10), 'to', sunday.toISOString().slice(0, 10));
        // Count completions in this week
        const thisWeekCompletions = this.completions.filter(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate >= monday && completionDate <= sunday;
        }).length;
        // Calculate days elapsed in this week (up to today)
        const daysElapsedThisWeek = Math.min(Math.floor((today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
        console.log('DEBUG: This week completions:', thisWeekCompletions);
        console.log('DEBUG: Days elapsed this week:', daysElapsedThisWeek);
        if (daysElapsedThisWeek === 0)
            return 0;
        // Return as decimal (0.0 to 1.0) so frontend can display as percentage
        const rate = thisWeekCompletions / daysElapsedThisWeek;
        console.log('DEBUG: This week completion rate (decimal):', rate);
        return rate;
    }
}
exports.default = Habit;
