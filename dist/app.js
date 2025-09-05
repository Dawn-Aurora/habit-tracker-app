"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.USE_MOCK_DATA) {
    if (process.env.DATA_CLIENT && process.env.DATA_CLIENT.toLowerCase() === 'mock') {
        process.env.USE_MOCK_DATA = 'true';
    }
    else if (process.env.DATA_CLIENT && process.env.DATA_CLIENT.toLowerCase() === 'sharepoint') {
        process.env.USE_MOCK_DATA = 'false';
    }
}
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var path_1 = __importDefault(require("path"));
var habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
var authRoutes_1 = __importDefault(require("./routes/authRoutes"));
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
    var jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret || jwtSecret.includes('your-super-secret-jwt-key')) {
        console.warn('[SECURITY] Weak or default JWT_SECRET detected in production. Set a strong, random secret in environment variables.');
    }
}
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
var limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// CORS configuration for Azure deployment
var corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.FRONTEND_URL || 'https://witty-sand-040223500.2.azurestaticapps.net',
            'https://witty-sand-040223500.2.azurestaticapps.net',
            'https://habit-tracker-frontend.azurestaticapps.net',
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
var isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    // In production, serve the React build
    var reactBuildPath = path_1.default.join(__dirname, '../../habit-tracker-frontend/build');
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
app.get('/api', function (req, res) {
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
app.get('*', function (req, res) {
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
app.get('/api/health', function (req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
exports.default = app;
