"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({
        message: 'Habit Tracker API is working',
        endpoints: {
            '/': 'This information page',
            '/habits': 'GET - List all habits, POST - Create a new habit',
            '/habits/:id': 'GET - Get habit by ID, PUT - Update a habit, DELETE - Delete a habit'
        },
        documentation: 'Visit /api-docs for interactive API documentation'
    });
});
// API Documentation
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
app.use('/habits', habitRoutes_1.default);
exports.default = app;
