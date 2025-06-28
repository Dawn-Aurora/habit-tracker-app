// Mock for api.js - matches the default export structure

const mockApi = {
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { id: 1, name: 'New Habit' } })),
  put: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Updated Habit' } })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
};

// Export as both default and named for Jest compatibility
module.exports = mockApi;
module.exports.default = mockApi;
