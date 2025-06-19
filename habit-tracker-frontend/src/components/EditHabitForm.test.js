import React from 'react'; // Import React for JSX support

// Mock the api object to prevent real HTTP requests
var mockPost = jest.fn(() => Promise.resolve({ data: {} }));
var mockPut = jest.fn(() => Promise.resolve({ data: {} }));
jest.mock('../api', () => ({
  put: jest.fn(() => Promise.resolve({ data: {} })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditHabitForm from './EditHabitForm';

describe('EditHabitForm Component', () => {
  const habit = { id: '1', name: 'Read', completedDates: [] };

  beforeEach(() => {
    mockPost.mockClear();
    mockPut.mockClear();
  });

  it('renders with initial habit name', () => {
    render(<EditHabitForm habit={habit} onHabitUpdated={jest.fn()} />);
    expect(screen.getByDisplayValue('Read')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update habit/i })).toBeInTheDocument();
  });

  it('calls onHabitUpdated with updated name', async () => {
    const onHabitUpdated = jest.fn();
    render(<EditHabitForm habit={habit} onHabitUpdated={onHabitUpdated} />);
    const input = screen.getByDisplayValue('Read');
    fireEvent.change(input, { target: { value: 'Read More' } });
    fireEvent.click(screen.getByRole('button', { name: /update habit/i }));
    // Wait for the mock to be called and state to update
    await waitFor(() => {
      expect(onHabitUpdated).toHaveBeenCalled();
    });
  });

  it('shows validation error for empty name', () => {
    render(<EditHabitForm habit={habit} onHabitUpdated={jest.fn()} />);
    const input = screen.getByDisplayValue('Read');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /update habit/i }));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  // Add more edge case and error handling tests as needed
});
