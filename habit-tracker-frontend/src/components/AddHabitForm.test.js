import React from 'react'; // Import React for JSX support in tests
// Mock the api object to prevent real HTTP requests
var mockPost = jest.fn(() => Promise.resolve({ data: {} }));
jest.mock('../api', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddHabitForm from './AddHabitForm';

describe('AddHabitForm Component', () => {
  beforeEach(() => {
    mockPost.mockClear();
  });

  it('renders the form fields', () => {
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    expect(screen.getByPlaceholderText(/new habit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add habit/i })).toBeInTheDocument();
  });

  it('calls onHabitAdded with valid input', async () => {
    const onHabitAdded = jest.fn();
    render(<AddHabitForm onHabitAdded={onHabitAdded} />);
    const input = screen.getByPlaceholderText(/new habit/i);
    fireEvent.change(input, { target: { value: 'New Habit' } });
    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));
    // Wait for the input to be cleared and callback to be called
    await waitFor(() => {
      expect(input.value).toBe('');
      expect(onHabitAdded).toHaveBeenCalled();
    });
  });

  // You can add more tests for error handling, etc.
});
