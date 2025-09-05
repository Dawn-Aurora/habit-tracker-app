import * as sharepointClient from '../sharepointClient';
import { registerUser, loginUser } from '../controllers/userController';
import { Request, Response } from 'express';

// Mock sharepointClient to simulate missing columns / fallback scenarios
jest.mock('../sharepointClient', () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
}));

type MockReq = Partial<Request> & { body: any };
const makeRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (data: any) => { res.data = data; return res; };
  return res as Response & { data?: any; statusCode: number };
};

describe('User SharePoint fallback logic', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.USE_MOCK_DATA = 'true'; // Force mock fallback to avoid real SharePoint calls
  });

  it('registerUser falls back to in-memory when SharePoint createUser throws', async () => {
    (sharepointClient.createUser as jest.Mock).mockRejectedValueOnce(new Error('Missing columns'));

    const req: MockReq = { body: { email: 'test@example.com', password: 'secret123', firstName: 'Test', lastName: 'User' } };
    const res = makeRes();
    await registerUser(req as Request, res as Response);

    expect(res.statusCode).toBe(201);
    expect(res.data?.user?.email).toBe('test@example.com');
    expect(res.data?.token).toBeDefined();
  });

  it('loginUser returns 401 when user absent both in SharePoint and memory', async () => {
    (sharepointClient.getUserByEmail as jest.Mock).mockResolvedValueOnce(null);
    const req: MockReq = { body: { email: 'absent@example.com', password: 'whatever' } };
    const res = makeRes();
    await loginUser(req as Request, res as Response);
    expect(res.statusCode).toBe(401);
  });
});
