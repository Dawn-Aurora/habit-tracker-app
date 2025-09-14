import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import habitRouter from './routes/habitRoutes';
import authRouter from './routes/authRoutes';
import { config, validateEnvironment, logConfiguration } from './config';

// Validate environment configuration on startup
validateEnvironment();
logConfiguration();

const app = express();

// Trust proxy for Azure deployment to fix rate limiting warnings
app.set('trust proxy', true);

app.use(helmet({
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
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: config.rateLimit.message
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: config.frontend.getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files based on environment
const isProduction = config.nodeEnv === 'production';

// For Azure deployment, we only serve API endpoints (frontend is deployed separately)
if (!isProduction) {
  // In development only, serve the HTML interface
  app.use(express.static(path.join(__dirname, '../../public')));
}

// API routes
app.use('/api/auth', authRouter);
app.use('/api/habits', habitRouter);

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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    dataClient: config.dataClient
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  if (isProduction) {
    // In production, redirect to frontend URL or return API info
    res.json({ 
      message: 'Habit Tracker API Server',
      frontend: config.frontend.url,
      api: '/api'
    });
  } else {
    // Serve HTML interface in development
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  }
});

export default app;