import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddNoteForm from './AddNoteForm';

// Mock the api module
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: { id: 1, message: 'Note added' } })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  }
}));

import api from '../api';

describe('AddNoteForm Component', () => {
  const mockHabit = {
    id: '1',
    name: 'Test Habit',
    completedDates: [],
    expectedFrequency: 'Daily'
  };

  const mockProps = {
    habit: mockHabit,
    onNoteAdded: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock returns
    api.get.mockReturnValue(Promise.resolve({ data: [] }));
    api.post.mockReturnValue(Promise.resolve({ data: { id: 1, message: 'Note added' } }));
    api.put.mockReturnValue(Promise.resolve({ data: {} }));
    api.delete.mockReturnValue(Promise.resolve({ data: {} }));
  });

  it('renders the form with correct title and fields', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const today = new Date().toISOString().slice(0, 10);
    expect(screen.getByText('Add Note to "Test Habit"')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Note *')).toBeInTheDocument();
    expect(screen.getByDisplayValue(today)).toBeInTheDocument(); // Today's date
    expect(screen.getByPlaceholderText('Add your note here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('initializes with today\'s date', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const today = new Date().toISOString().slice(0, 10);
    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
  });

  it('allows user to change date and note text', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = screen.getByDisplayValue(today);
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    
    fireEvent.change(dateInput, { target: { value: '2023-12-25' } });
    fireEvent.change(noteInput, { target: { value: 'Test note content' } });
    
    expect(dateInput.value).toBe('2023-12-25');
    expect(noteInput.value).toBe('Test note content');
  });

  it('shows validation error when note is empty', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Note text is required')).toBeInTheDocument();
  });

  it('shows validation error when note is only whitespace', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: '   ' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Note text is required')).toBeInTheDocument();
  });

  it('successfully submits note and calls onNoteAdded', async () => {
    render(<AddNoteForm {...mockProps} />);
    
    const today = new Date().toISOString().slice(0, 10);
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    const dateInput = screen.getByDisplayValue(today);
    
    fireEvent.change(noteInput, { target: { value: 'Great workout today!' } });
    fireEvent.change(dateInput, { target: { value: '2023-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits/1/notes', {
        note: 'Great workout today!',
        date: '2023-12-25'
      });
      expect(mockProps.onNoteAdded).toHaveBeenCalled();
    });
  });

  it('trims whitespace from note before submission', async () => {
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: '  Trimmed note  ' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits/1/notes', expect.objectContaining({
        note: 'Trimmed note'
      }));
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    // Make API call take some time
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(mockProps.onNoteAdded).toHaveBeenCalled();
    });
  });

  it('handles API error and shows error message', async () => {
    const errorMessage = 'Failed to add note';
    api.post.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(`Error adding note: ${errorMessage}`)).toBeInTheDocument();
    });
    
    expect(mockProps.onNoteAdded).not.toHaveBeenCalled();
  });

  it('handles API error with response data', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Server validation error'
        }
      }
    };
    api.post.mockRejectedValueOnce(errorResponse);
    
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error adding note: Server validation error')).toBeInTheDocument();
    });
  });

  it('prevents multiple submissions while loading', async () => {
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    
    // Click multiple times
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockProps.onNoteAdded).toHaveBeenCalled();
    });
    
    // Should only be called once
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('clears error message when form is resubmitted', async () => {
    // First submission fails
    api.post.mockRejectedValueOnce(new Error('First error'));
    
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /add note/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error adding note: First error')).toBeInTheDocument();
    });
    
    // Second submission succeeds
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Error adding note: First error')).not.toBeInTheDocument();
      expect(mockProps.onNoteAdded).toHaveBeenCalled();
    });
  });

  it('handles keyboard navigation properly', () => {
    render(<AddNoteForm {...mockProps} />);
    
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = screen.getByDisplayValue(today);
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const submitButton = screen.getByRole('button', { name: /add note/i });
    
    // Tab order should be: date -> note -> cancel -> submit
    dateInput.focus();
    expect(document.activeElement).toBe(dateInput);
    
    // All elements should be focusable
    expect(dateInput.tabIndex).not.toBe(-1);
    expect(noteInput.tabIndex).not.toBe(-1);
    expect(cancelButton.tabIndex).not.toBe(-1);
    expect(submitButton.tabIndex).not.toBe(-1);
  });

  it('handles form submission on Enter key in note textarea', async () => {
    render(<AddNoteForm {...mockProps} />);
    
    const noteInput = screen.getByPlaceholderText('Add your note here...');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    // Simulate form submission (Ctrl+Enter or form submit)
    const form = screen.getByRole('button', { name: /add note/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits/1/notes', expect.objectContaining({
        note: 'Test note'
      }));
    });
  });

  it('renders with correct styling and accessibility', () => {
    render(<AddNoteForm {...mockProps} />);
    
    // Check modal styling
    const modal = screen.getByText('Add Note to "Test Habit"').closest('div');
    expect(modal).toHaveStyle({
      position: 'fixed',
      backgroundColor: 'white',
      zIndex: '1000'
    });
    
    // Check form elements are present and accessible
    const today = new Date().toISOString().slice(0, 10);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Note *')).toBeInTheDocument();
    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add your note here...')).toBeRequired();
  });
});
