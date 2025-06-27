import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import habitRouter from './routes/habitRoutes';
import authRouter from './routes/authRoutes';
// Temporarily disabled Swagger due to deployment error
// import { specs, swaggerUi } from './swagger';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  }
});
app.use(limiter);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

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
    documentation: 'Swagger docs temporarily disabled for deployment'
    // documentation: 'Visit /api-docs for interactive API documentation'
  });
});

// API Documentation - Temporarily disabled due to deployment error
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRouter);
app.use('/habits', habitRouter);

export default app;