import request from 'supertest';
import express from 'express';
import habitRouter from '../../routes/habitRoutes';

const app = express();
app.use(express.json());
app.use('/habits', habitRouter);

describe('Habit API Integration', () => {
  describe('GET /habits', () => {
    it('should return a list of habits', async () => {
      const res = await request(app).get('/habits');
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
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body).toHaveProperty('type', 'ValidationError');
    });
    it('should create a new habit', async () => {
      const res = await request(app)
        .post('/habits')
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
        .send({ name: 'Does Not Exist' });
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('status', 'error');
    });
    it('should update an existing habit', async () => {
      const createRes = await request(app)
        .post('/habits')
        .send({ name: 'Habit to Update' });
      const habitId = createRes.body.data.id;
      const res = await request(app)
        .put(`/habits/${habitId}`)
        .send({ name: 'Updated Habit Name', completedDates: ['2025-06-18'] });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id', habitId);
      expect(res.body.data).toHaveProperty('name', 'Updated Habit Name');
      expect(res.body.data.completedDates).toContain('2025-06-18');
    });
  });

  describe('DELETE /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const res = await request(app).delete('/habits/nonexistentid');
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('status', 'error');
    });
    it('should delete an existing habit', async () => {
      const createRes = await request(app)
        .post('/habits')
        .send({ name: 'Habit to Delete' });
      const habitId = createRes.body.data.id;
      const res = await request(app).delete(`/habits/${habitId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id', habitId);
    });
  });
});
