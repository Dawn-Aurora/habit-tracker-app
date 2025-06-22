import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import habitRouter from '../../routes/habitRoutes';
import { habits as mockHabits } from '../../mockDataClient';

const app = express();
app.use(express.json());
app.use('/habits', habitRouter);

// Helper function to generate JWT token for testing
const generateTestToken = (userId: string = 'test-user-1'): string => {
  return jwt.sign(
    { userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const testToken = generateTestToken();

beforeEach(() => {
  mockHabits.length = 0;
  mockHabits.push(
    {
      id: '1',
      name: 'Morning Exercise',
      completions: ['2025-06-15', '2025-06-16'],
      tags: ['health'],
      notes: [],
      expectedFrequency: 7,
      userId: 'test-user-1',
      frequency: 7,
      completed: false
    },
    {
      id: '2',
      name: 'Reading',
      completions: ['2025-06-16'],
      tags: ['creativity'],
      notes: [],
      expectedFrequency: 5,
      userId: 'test-user-1',
      frequency: 5,
      completed: false
    },
    {
      id: '3',
      name: 'Meditation',
      completions: [],
      tags: ['relaxation'],
      notes: [],
      expectedFrequency: 3,
      userId: 'test-user-1',
      frequency: 3,
      completed: false
    }
  );
});

describe('Habit API Integration', () => {  describe('GET /habits', () => {
    it('should return a list of habits', async () => {
      const res = await request(app)
        .get('/habits')
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
  describe('POST /habits', () => {
    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('type', 'ValidationError');
    });
    it('should create a new habit', async () => {
      const res = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Integration Test Habit' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name', 'Integration Test Habit');
    });
  });
  describe('PUT /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const res = await request(app)
        .put('/habits/nonexistentid')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Does Not Exist' });
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('status', 'error');
    });
    it('should update an existing habit', async () => {
      const createRes = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Habit to Update' });
      const habitId = createRes.body.data.id;      const res = await request(app)
        .put(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Updated Habit Name', completions: ['2025-06-18'] });
      console.log('DEBUG completions:', res.body.data.completions);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id', habitId);
      expect(res.body.data).toHaveProperty('name', 'Updated Habit Name');
      expect(res.body.data.completions).toContain('2025-06-18');
    });
  });
  describe('DELETE /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const res = await request(app)
        .delete('/habits/nonexistentid')
        .set('Authorization', `Bearer ${testToken}`);
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('status', 'error');
    });
    it('should delete an existing habit', async () => {
      const createRes = await request(app)
        .post('/habits')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Habit to Delete' });
      const habitId = createRes.body.data.id;
      const res = await request(app)
        .delete(`/habits/${habitId}`)
        .set('Authorization', `Bearer ${testToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id', habitId);
    });
  });
});
