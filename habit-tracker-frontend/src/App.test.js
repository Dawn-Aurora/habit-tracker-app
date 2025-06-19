import React from 'react'; // Import React for JSX support in tests
import { act } from 'react'; // Import act from React

// Mock the api object to prevent real HTTP requests
jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    // Add other methods as needed
  }
}));

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders habit tracker title', async () => {
  await act(async () => {
    render(<App />);
  });
  const title = screen.getByText(/habit tracker/i);
  expect(title).toBeInTheDocument();
});
