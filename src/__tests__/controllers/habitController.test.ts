process.env.DATA_CLIENT = 'mock';
jest.mock('../../mockDataClient');
jest.mock('../../sharepointClient');

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import * as habitController from '../../controllers/habitController';
import * as mockDataClient from '../../mockDataClient';
import * as sharepointClient from '../../sharepointClient';

describe('Habit Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    };
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation(result => {
        responseObject = result;
        return mockResponse;
      }),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('getHabits', () => {
    it('should return all habits', async () => {
      const mockHabits = [
        { id: '1', Name: 'Exercise', Title: 'Exercise', CompletedDates: '2025-06-15,2025-06-16' },
        { id: '2', Name: 'Reading', Title: 'Reading', CompletedDates: '2025-06-17' }
      ];
      (sharepointClient.getHabits as jest.Mock).mockRejectedValue(new Error('fail'));
      (mockDataClient.getHabits as jest.Mock).mockResolvedValue(mockHabits);
      await habitController.getHabits(mockRequest as AuthenticatedRequest, mockResponse as Response);
      expect(mockDataClient.getHabits).toHaveBeenCalledWith();
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject).toHaveProperty('status', 'success');
      expect(responseObject).toHaveProperty('data');
      expect((responseObject as any).data).toHaveLength(2);
      expect((responseObject as any).data[0]).toHaveProperty('id', '1');
      expect((responseObject as any).data[0]).toHaveProperty('name', 'Exercise');
      expect((responseObject as any).data[0].completedDates).toEqual(['2025-06-15', '2025-06-16']);
    });    it('should handle errors properly', async () => {
      (sharepointClient.getHabits as jest.Mock).mockRejectedValue(new Error('fail'));
      (mockDataClient.getHabits as jest.Mock).mockRejectedValue(new Error('Database error'));
      await habitController.getHabits(mockRequest as AuthenticatedRequest, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject).toHaveProperty('status', 'error');
    });
  });

  describe('createHabit', () => {    it('should create a new habit', async () => {
      mockRequest = {
        body: { name: 'New Habit' },
        user: {
          id: 'user123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      };
      const mockCreatedHabit = {
        id: '3',
        fields: {
          Name: 'New Habit',
          Title: 'New Habit',
          CompletedDates: ''
        }
      };
      (sharepointClient.createHabit as jest.Mock).mockRejectedValue(new Error('fail'));
      (mockDataClient.createHabit as jest.Mock).mockResolvedValue(mockCreatedHabit);
      await habitController.createHabit(mockRequest as AuthenticatedRequest, mockResponse as Response);
      expect(mockDataClient.createHabit).toHaveBeenCalledWith('New Habit', undefined, "", undefined, 'user123');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject).toHaveProperty('status', 'success');
      expect((responseObject as any).data).toHaveProperty('id', '3');
    });
  });
});
