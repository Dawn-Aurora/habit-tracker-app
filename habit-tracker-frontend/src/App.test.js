import React from 'react'; // Import React for JSX support in tests
import { act } from 'react'; // Import act from React

// Mock the api module with explicit inline mock
jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }
}));

import { render, screen } from '@testing-library/react';
import App from './App';
import api from './api';

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Explicitly set return values - this ensures components get proper Promise objects
    api.get.mockReturnValue(Promise.resolve({ data: [] }));
    api.post.mockReturnValue(Promise.resolve({ data: {} }));
    api.put.mockReturnValue(Promise.resolve({ data: {} }));
    api.delete.mockReturnValue(Promise.resolve({ data: {} }));
  });

  test('renders habit tracker title', async () => {
    await act(async () => {
      render(<App />);
    });
    const title = screen.getByRole('heading', { name: /habit tracker/i, level: 1 });
    expect(title).toBeInTheDocument();
  });
});
