"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    }
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/', (req, res) => {
    res.json({
        message: 'Habit Tracker API is working',
        version: '2.0.0',
        features: ['User Authentication', 'Personal Habit Tracking', 'Data Export/Import'],
        endpoints: {
            '/': 'This information page',
            '/auth/register': 'POST - Register new user',
            '/auth/login': 'POST - Login user',
            '/auth/profile': 'GET - Get user profile, PUT - Update profile',
            '/habits': 'GET - List user habits, POST - Create new habit',
            '/habits/:id': 'GET - Get habit by ID, PUT - Update habit, DELETE - Delete habit'
        },
        documentation: 'Visit /api-docs for interactive API documentation'
    });
});
// API Documentation
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
// Routes
app.use('/auth', authRoutes_1.default);
app.use('/habits', habitRoutes_1.default);
exports.default = app;
