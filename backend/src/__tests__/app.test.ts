import request from 'supertest';
import express from 'express';
import appModule from '../app';

const app = appModule;

describe('App Root Endpoint', () => {
  it('should return API info at root /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Habit Tracker API is working');
    expect(res.body).toHaveProperty('endpoints');
    expect(res.body.endpoints).toHaveProperty('/habits');
  });
});

describe('Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});
