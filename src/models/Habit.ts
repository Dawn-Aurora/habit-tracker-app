class Habit {
    id: string;
    name: string;
    frequency: number;
    completed: boolean;

    constructor(id: string, name: string, frequency: number) {
        this.id = id;
        this.name = name;
        this.frequency = frequency;
        this.completed = false;
    }

    markAsCompleted() {
        this.completed = true;
    }

    reset() {
        this.completed = false;
    }
}

export default Habit;