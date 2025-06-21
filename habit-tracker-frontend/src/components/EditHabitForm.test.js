import React from 'react'; // Import React for JSX support
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditHabitForm from './EditHabitForm';

// Mock the api module - same pattern as debug test
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'Updated Habit' } })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  }
}));

import api from '../api';

describe('EditHabitForm Component', () => {
  const habit = { 
    id: '1', 
    name: 'Read', 
    completedDates: [],
    expectedFrequency: 'Daily',
    tags: ['learning', 'personal']
  };  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Explicitly set return values - this ensures components get proper Promise objects
    api.get.mockReturnValue(Promise.resolve({ data: [] }));
    api.post.mockReturnValue(Promise.resolve({ data: { id: 1, name: 'New Habit' } }));
    api.put.mockReturnValue(Promise.resolve({ data: { id: '1', name: 'Updated Habit' } }));
    api.delete.mockReturnValue(Promise.resolve({ data: {} }));
  });

  it('renders with initial habit data', () => {
    render(<EditHabitForm habit={habit} onHabitUpdated={jest.fn()} />);
    expect(screen.getByDisplayValue('Read')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
    expect(screen.getByDisplayValue('learning, personal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update habit/i })).toBeInTheDocument();
  });

  it('calls onHabitUpdated with updated data', async () => {
    const onHabitUpdated = jest.fn();
    render(<EditHabitForm habit={habit} onHabitUpdated={onHabitUpdated} />);
    
    const nameInput = screen.getByDisplayValue('Read');
    const frequencyInput = screen.getByDisplayValue('Daily');
    
    fireEvent.change(nameInput, { target: { value: 'Read More' } });
    fireEvent.change(frequencyInput, { target: { value: 'Twice daily' } });    fireEvent.click(screen.getByRole('button', { name: /update habit/i }));    // Wait for the API call and callback
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/habits/1', expect.objectContaining({
        name: 'Read More',
        expectedFrequency: 'Twice daily'
      }));
      expect(onHabitUpdated).toHaveBeenCalled();
    });
  });

  it('shows validation error for empty name', () => {
    render(<EditHabitForm habit={habit} onHabitUpdated={jest.fn()} />);
    const input = screen.getByDisplayValue('Read');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /update habit/i }));
    expect(screen.getByText(/habit name is required/i)).toBeInTheDocument();
  });

  it('handles cancel button', () => {
    const onHabitUpdated = jest.fn();
    render(<EditHabitForm habit={habit} onHabitUpdated={onHabitUpdated} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onHabitUpdated).toHaveBeenCalled();
  });
});
