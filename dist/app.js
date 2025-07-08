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
const path_1 = __importDefault(require("path"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Temporarily disabled Swagger due to deployment error
// import { specs, swaggerUi } from './swagger';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"]
        }
    }
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// CORS configuration for multiple deployment scenarios
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL || 'https://habit-tracker-frontend.vercel.app',
            'https://habit-tracker-frontend.vercel.app',
            'https://your-custom-domain.com'
        ]
        : [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files based on environment
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    // In production, serve the React build
    const reactBuildPath = path_1.default.join(__dirname, '../../habit-tracker-frontend/build');
    app.use(express_1.default.static(reactBuildPath));
}
else {
    // In development, serve the HTML interface
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
}
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/habits', habitRoutes_1.default);
// Root endpoint with API information
app.get('/api', (req, res) => {
    res.json({
        message: 'Habit Tracker API is working',
        version: '2.0.0',
        features: ['User Authentication', 'Personal Habit Tracking', 'Data Export/Import'],
        frontendMode: isProduction ? 'React (Production)' : 'HTML (Development)',
        endpoints: {
            '/': 'Frontend interface',
            '/api': 'This information page',
            '/api/auth/register': 'POST - Register new user',
            '/api/auth/login': 'POST - Login user',
            '/api/auth/profile': 'GET - Get user profile, PUT - Update profile',
            '/api/habits': 'GET - List user habits, POST - Create new habit',
            '/api/habits/:id': 'GET - Get habit by ID, PUT - Update habit, DELETE - Delete habit'
        },
        documentation: 'Swagger docs temporarily disabled for deployment'
    });
});
// Serve the appropriate frontend for all non-API routes
app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    if (isProduction) {
        // Serve React build in production
        res.sendFile(path_1.default.join(__dirname, '../../habit-tracker-frontend/build/index.html'));
    }
    else {
        // Serve HTML interface in development
        res.sendFile(path_1.default.join(__dirname, '../../public/index.html'));
    }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
exports.default = app;
