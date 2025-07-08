import React from 'react'; // Import React for JSX support in tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddHabitForm from './AddHabitForm';

// Mock the api module with explicit inline mock - same pattern as debug test
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: { id: 1, name: 'New Habit' } })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  }
}));

import api from '../api';

describe('AddHabitForm Component', () => {  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Explicitly set return values - this ensures components get proper Promise objects
    api.get.mockReturnValue(Promise.resolve({ data: [] }));
    api.post.mockReturnValue(Promise.resolve({ data: { id: 1, name: 'New Habit' } }));
    api.put.mockReturnValue(Promise.resolve({ data: {} }));
    api.delete.mockReturnValue(Promise.resolve({ data: {} }));
  });

  it('renders all form fields', () => {
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    expect(screen.getByLabelText(/habit name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add habit/i })).toBeInTheDocument();
  });

  it('calls onHabitAdded with valid input', async () => {
    const onHabitAdded = jest.fn();
    render(<AddHabitForm onHabitAdded={onHabitAdded} />);
    
    const nameInput = screen.getByLabelText(/habit name/i);
    const frequencyInput = screen.getByLabelText(/expected frequency/i);
    
    fireEvent.change(nameInput, { target: { value: 'New Habit' } });
    fireEvent.change(frequencyInput, { target: { value: 'daily' } });    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));    // Wait for the API call and callback
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits', expect.objectContaining({
        name: 'New Habit',
        frequency: 'daily'
      }));
      expect(onHabitAdded).toHaveBeenCalled();
    });
  });

  it('shows validation error for empty name', () => {
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));
    expect(screen.getByText(/habit name is required/i)).toBeInTheDocument();
  });

  it('handles tags correctly', async () => {
    const onHabitAdded = jest.fn();
    render(<AddHabitForm onHabitAdded={onHabitAdded} />);
    
    const nameInput = screen.getByLabelText(/habit name/i);
    const tagsInput = screen.getByLabelText(/tags/i);
    
    fireEvent.change(nameInput, { target: { value: 'Exercise' } });
    fireEvent.change(tagsInput, { target: { value: 'health, fitness, daily' } });    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits', expect.objectContaining({
        name: 'Exercise',
        tags: ['health', 'fitness', 'daily']
      }));
    });
  });

  // ================== COVERAGE IMPROVEMENT TESTS ==================

  it('handles start date input changes', () => {
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    
    const startDateInput = screen.getByLabelText(/start date/i);
    fireEvent.change(startDateInput, { target: { value: '2023-12-25' } });
    
    // Should update the start date value
    expect(startDateInput.value).toBe('2023-12-25');
  });

  it('handles API errors during habit addition', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Habit name already exists' } }
    });
    
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    
    const nameInput = screen.getByLabelText(/habit name/i);
    fireEvent.change(nameInput, { target: { value: 'Existing Habit' } });
    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/error adding habit.*habit name already exists/i)).toBeInTheDocument();
    });
  });

  it('handles network errors during habit addition', async () => {
    api.post.mockRejectedValue(new Error('Network error'));
    
    render(<AddHabitForm onHabitAdded={jest.fn()} />);
    
    const nameInput = screen.getByLabelText(/habit name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Habit' } });
    fireEvent.click(screen.getByRole('button', { name: /add habit/i }));
    
    // Should display generic error message
    await waitFor(() => {
      expect(screen.getByText(/error adding habit.*network error/i)).toBeInTheDocument();
    });
  });
});