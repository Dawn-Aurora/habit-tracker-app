import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import habitRouter from './routes/habitRoutes';
import { specs, swaggerUi } from './swagger';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/habits', habitRouter);

export default app;