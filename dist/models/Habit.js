"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Habit = /** @class */ (function () {
    function Habit(id, name, frequency, tags, expectedFrequency, userId, category) {
        if (tags === void 0) { tags = []; }
        this.id = id;
        this.userId = userId || ''; // Default to empty string for backward compatibility
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
        this.category = category;
        this.tags = tags;
        this.notes = [];
        this.expectedFrequency = expectedFrequency || frequency;
        this.completions = [];
    }
    Habit.prototype.markAsCompleted = function (date) {
        if (date === void 0) { date = new Date().toISOString().slice(0, 10); }
        if (!this.completions.includes(date)) {
            this.completions.push(date);
        }
        this.completed = true;
    };
    // New method for multiple completions per day
    Habit.prototype.addCompletion = function (date) {
        if (date === void 0) { date = new Date().toISOString(); }
        this.completions.push(date);
        this.completed = true;
    };
    // Get count of completions for a specific date
    Habit.prototype.getCompletionsForDate = function (date) {
        var dateOnly = date.slice(0, 10); // Extract YYYY-MM-DD part
        return this.completions.filter(function (completion) {
            return completion.slice(0, 10) === dateOnly;
        }).length;
    };
    // Remove one completion for a specific date
    Habit.prototype.removeCompletion = function (date) {
        if (date === void 0) { date = new Date().toISOString().slice(0, 10); }
        var dateOnly = date.slice(0, 10);
        var index = this.completions.findIndex(function (completion) {
            return completion.slice(0, 10) === dateOnly;
        });
        if (index !== -1) {
            this.completions.splice(index, 1);
        }
        // Update completed status
        this.completed = this.completions.length > 0;
    };
    Habit.prototype.addNote = function (text, date) {
        if (date === void 0) { date = new Date().toISOString().slice(0, 10); }
        this.notes.push({ date: date, text: text });
    };
    Habit.prototype.reset = function () {
        this.completed = false;
    };
    Habit.prototype.getTotalCompletions = function () {
        return this.completions.length;
    };
    Habit.prototype.getCurrentStreak = function () {
        var dates = this.completions.map(function (d) { return new Date(d); }).sort(function (a, b) { return b.getTime() - a.getTime(); });
        var streak = 0;
        var current = new Date();
        for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
            var d = dates_1[_i];
            if (d.toDateString() === current.toDateString()) {
                streak++;
                current.setDate(current.getDate() - 1);
            }
            else {
                break;
            }
        }
        return streak;
    };
    Habit.prototype.getCompletionRate = function () {
        // Use new frequency-aware calculation if expectedFrequency is structured
        if (this.isStructuredFrequency()) {
            return this.getFrequencyAwareCompletionRate();
        }
        // Fall back to old calculation for backward compatibility
        return this.getLegacyCompletionRate();
    };
    Habit.prototype.isStructuredFrequency = function () {
        return typeof this.expectedFrequency === 'object' &&
            this.expectedFrequency !== null &&
            'count' in this.expectedFrequency &&
            'period' in this.expectedFrequency;
    };
    Habit.prototype.getFrequencyAwareCompletionRate = function () {
        if (!this.isStructuredFrequency())
            return 0;
        var frequencyConfig = this.expectedFrequency;
        var count = frequencyConfig.count, period = frequencyConfig.period;
        var today = new Date();
        if (period === 'day') {
            // For daily habits, check today's completions
            var todayCount = this.getCompletionsForDate(today.toISOString());
            return Math.min(todayCount / count, 1.0); // Cap at 100%
        }
        if (period === 'week') {
            // Calculate completion rate for this week (Monday to Sunday)
            var _a = this.getWeekRange(today), monday = _a.monday, sunday = _a.sunday;
            var weekCompletions = this.getCompletionsInRange(monday, sunday);
            var weekProgress = weekCompletions / count;
            return Math.min(weekProgress, 1.0); // Cap at 100%
        }
        if (period === 'month') {
            // Calculate completion rate for this month
            var monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            var monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            var monthCompletions = this.getCompletionsInRange(monthStart, monthEnd);
            var monthProgress = monthCompletions / count;
            return Math.min(monthProgress, 1.0); // Cap at 100%
        }
        if (period === 'year') {
            // Calculate completion rate for this year
            var yearStart = new Date(today.getFullYear(), 0, 1);
            var yearEnd = new Date(today.getFullYear(), 11, 31);
            var yearCompletions = this.getCompletionsInRange(yearStart, yearEnd);
            var yearProgress = yearCompletions / count;
            return Math.min(yearProgress, 1.0); // Cap at 100%
        }
        return 0;
    };
    Habit.prototype.getLegacyCompletionRate = function () {
        // Calculate completion rate for this week (Monday to Sunday)
        var today = new Date();
        var _a = this.getWeekRange(today), monday = _a.monday, sunday = _a.sunday;
        // Count completions in this week
        var thisWeekCompletions = this.completions.filter(function (dateStr) {
            var completionDate = new Date(dateStr);
            return completionDate >= monday && completionDate <= sunday;
        }).length;
        // Calculate days elapsed in this week (up to today)
        var daysElapsedThisWeek = Math.min(Math.floor((today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)) + 1, 7);
        if (daysElapsedThisWeek === 0)
            return 0;
        // Return as decimal (0.0 to 1.0) so frontend can display as percentage
        var rate = thisWeekCompletions / daysElapsedThisWeek;
        return rate;
    };
    Habit.prototype.getWeekRange = function (date) {
        var dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // Get Monday of this week
        var monday = new Date(date);
        monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        // Get Sunday of this week
        var sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return { monday: monday, sunday: sunday };
    };
    Habit.prototype.getCompletionsInRange = function (startDate, endDate) {
        return this.completions.filter(function (dateStr) {
            var completionDate = new Date(dateStr);
            return completionDate >= startDate && completionDate <= endDate;
        }).length;
    };
    return Habit;
}());
exports.default = Habit;
