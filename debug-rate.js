// Quick test of the completion rate logic
const completions = ["2025-06-15", "2025-06-16", "2025-06-22"];
const startDate = ""; // Empty like in our data

// Simulate the logic
let calculatedStartDate = startDate;
if (!calculatedStartDate || calculatedStartDate === '') {
    if (completions.length > 0) {
        const completionDates = completions.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
        calculatedStartDate = completionDates[0].toISOString().slice(0, 10);
        console.log('Using earliest completion date as start:', calculatedStartDate);
    }
}

const startDateObj = new Date(calculatedStartDate);
const currentDate = new Date();
const daysSinceStart = Math.max(1, Math.ceil((currentDate.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
const totalCompletions = completions.length;

console.log('Start date object:', startDateObj);
console.log('Current date:', currentDate);
console.log('Days since start:', daysSinceStart);
console.log('Total completions:', totalCompletions);
console.log('Rate calculation:', totalCompletions / daysSinceStart);
console.log('Rate as percentage:', (totalCompletions / daysSinceStart) * 100);
