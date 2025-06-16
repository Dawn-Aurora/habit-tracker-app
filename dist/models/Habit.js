"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Habit {
    constructor(id, name, frequency) {
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
exports.default = Habit;
