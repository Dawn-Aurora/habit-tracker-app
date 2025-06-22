class Habit {
    id: string;
    userId: string; // Associate habit with user
    name: string;
    frequency: number;
    completed: boolean;
    tags: string[];
    notes: { date: string; text: string }[];
    startDate: string;
    expectedFrequency: number | string;
    completions: string[]; // ISO date strings

    constructor(id: string, name: string, frequency: number, tags: string[] = [], startDate?: string, expectedFrequency?: number | string, userId?: string) {
        this.id = id;
        this.userId = userId || ''; // Default to empty string for backward compatibility
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
        this.tags = tags;
        this.notes = [];
        // Set start date - if empty or invalid, will be handled in getCompletionRate
        this.startDate = startDate || '';
        this.expectedFrequency = expectedFrequency || frequency;
        this.completions = [];
    }

    markAsCompleted(date: string = new Date().toISOString().slice(0, 10)) {
        if (!this.completions.includes(date)) {
            this.completions.push(date);
        }
        this.completed = true;
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
        // Handle empty or invalid start dates
        let startDate = this.startDate;
        console.log('DEBUG: Original startDate:', startDate);
        
        if (!startDate || startDate === '') {
            // If no start date, use the earliest completion date or today
            if (this.completions.length > 0) {
                const completionDates = this.completions.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
                startDate = completionDates[0].toISOString().slice(0, 10);
                console.log('DEBUG: Using earliest completion date as start:', startDate);
            } else {
                startDate = new Date().toISOString().slice(0, 10);
                console.log('DEBUG: Using today as start date:', startDate);
            }
        }
        
        const startDateObj = new Date(startDate);
        const currentDate = new Date();
        
        // Ensure start date is valid
        if (isNaN(startDateObj.getTime())) {
            console.log('DEBUG: Invalid start date, returning 0');
            return 0;
        }
        
        const daysSinceStart = Math.max(1, Math.ceil((currentDate.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
        const totalCompletions = this.getTotalCompletions();
        
        console.log('DEBUG: Days since start:', daysSinceStart);
        console.log('DEBUG: Total completions:', totalCompletions);
        
        // Return as decimal (0.0 to 1.0) so frontend can display as percentage
        const rate = totalCompletions / daysSinceStart;
        console.log('DEBUG: Calculated rate (decimal):', rate);
        return rate;
    }
}

export default Habit;