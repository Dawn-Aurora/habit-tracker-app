export interface FrequencyConfig {
    count: number;
    period: 'day' | 'week' | 'month' | 'year';
}

class Habit {
    id: string;
    userId: string; // Associate habit with user
    name: string;
    frequency: number;
    completed: boolean;
    category?: string;
    tags: string[];
    notes: { date: string; text: string }[];
    expectedFrequency: number | string | FrequencyConfig; // Unified frequency field
    completions: string[];

    constructor(id: string, name: string, frequency: number, tags: string[] = [], expectedFrequency?: number | string | FrequencyConfig, userId?: string, category?: string) {
        this.id = id;
        this.userId = userId || '';
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
        this.category = category;
        this.tags = tags;
        this.notes = [];
        this.expectedFrequency = expectedFrequency || frequency;
        this.completions = [];
    }

    markAsCompleted(date: string = new Date().toISOString().slice(0, 10)) {
        if (!this.completions.includes(date)) {
            this.completions.push(date);
        }
        this.completed = true;
    }

    // New method for multiple completions per day
    addCompletion(date: string = new Date().toISOString()) {
        this.completions.push(date);
        this.completed = true;
    }

    // Get count of completions for a specific date
    getCompletionsForDate(date: string): number {
        const dateOnly = date.slice(0, 10); // Extract YYYY-MM-DD part
        return this.completions.filter(completion => 
            completion.slice(0, 10) === dateOnly
        ).length;
    }

    // Remove one completion for a specific date
    removeCompletion(date: string = new Date().toISOString().slice(0, 10)) {
        const dateOnly = date.slice(0, 10);
        const index = this.completions.findIndex(completion => 
            completion.slice(0, 10) === dateOnly
        );
        if (index !== -1) {
            this.completions.splice(index, 1);
        }
        
        // Update completed status
        this.completed = this.completions.length > 0;
    }

    addNote(text: string, date: string = new Date().toISOString().slice(0, 10)) {
        this.notes.push({ date, text });
    }

    reset() {
        this.completed = false;
    }

    getTotalCompletions(): number {
        return this.completions.length;
    }

    getCurrentStreak(): number {
        const dates = this.completions.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
        let streak = 0;
        let current = new Date();
        for (let d of dates) {
            if (d.toDateString() === current.toDateString()) {
                streak++;
                current.setDate(current.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }

    getCompletionRate(): number {
        // Use new frequency-aware calculation if expectedFrequency is structured
        if (this.isStructuredFrequency()) {
            return this.getFrequencyAwareCompletionRate();
        }
        
        // Fall back to old calculation for backward compatibility
        return this.getLegacyCompletionRate();
    }

    private isStructuredFrequency(): boolean {
        return typeof this.expectedFrequency === 'object' && 
               this.expectedFrequency !== null && 
               'count' in this.expectedFrequency && 
               'period' in this.expectedFrequency;
    }

    private getFrequencyAwareCompletionRate(): number {
        if (!this.isStructuredFrequency()) return 0;
        
        const frequencyConfig = this.expectedFrequency as FrequencyConfig;
        const { count, period } = frequencyConfig;
        const today = new Date();
        
        if (period === 'day') {
            // For daily habits, check today's completions
            const todayCount = this.getCompletionsForDate(today.toISOString());
            return Math.min(todayCount / count, 1.0); // Cap at 100%
        }
        
        if (period === 'week') {
            // Calculate completion rate for this week (Monday to Sunday)
            const { monday, sunday } = this.getWeekRange(today);
            const weekCompletions = this.getCompletionsInRange(monday, sunday);
            const weekProgress = weekCompletions / count;
            return Math.min(weekProgress, 1.0); // Cap at 100%
        }
        
        if (period === 'month') {
            // Calculate completion rate for this month
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const monthCompletions = this.getCompletionsInRange(monthStart, monthEnd);
            const monthProgress = monthCompletions / count;
            return Math.min(monthProgress, 1.0); // Cap at 100%
        }
        
        if (period === 'year') {
            // Calculate completion rate for this year
            const yearStart = new Date(today.getFullYear(), 0, 1);
            const yearEnd = new Date(today.getFullYear(), 11, 31);
            const yearCompletions = this.getCompletionsInRange(yearStart, yearEnd);
            const yearProgress = yearCompletions / count;
            return Math.min(yearProgress, 1.0); // Cap at 100%
        }
        
        return 0;
    }

    private getLegacyCompletionRate(): number {
        // Calculate completion rate for this week (Monday to Sunday)
        const today = new Date();
        const { monday, sunday } = this.getWeekRange(today);
        
        // Count completions in this week
        const thisWeekCompletions = this.completions.filter(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate >= monday && completionDate <= sunday;
        }).length;
        
        // Calculate days elapsed in this week (up to today)
        const daysElapsedThisWeek = Math.min(
            Math.floor((today.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)) + 1,
            7
        );
        
        if (daysElapsedThisWeek === 0) return 0;
        
        // Return as decimal (0.0 to 1.0) so frontend can display as percentage
        const rate = thisWeekCompletions / daysElapsedThisWeek;
        return rate;
    }

    private getWeekRange(date: Date) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get Monday of this week
        const monday = new Date(date);
        monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        
        // Get Sunday of this week
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        return { monday, sunday };
    }

    private getCompletionsInRange(startDate: Date, endDate: Date): number {
        return this.completions.filter(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate >= startDate && completionDate <= endDate;
        }).length;
    }
}

export default Habit;