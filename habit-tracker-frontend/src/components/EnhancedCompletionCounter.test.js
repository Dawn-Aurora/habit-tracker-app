import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedCompletionCounter from './EnhancedCompletionCounter';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api;

// Mock Date to ensure consistent test behavior
const MOCK_DATE = '2025-06-30';
const mockDate = new Date(MOCK_DATE);

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('EnhancedCompletionCounter Component', () => {
  const mockHabit = {
    id: '1',
    name: 'Test Habit',
    completedDates: [`${MOCK_DATE}T10:00:00.000Z`, `${MOCK_DATE}T14:00:00.000Z`],
    expectedFrequency: {
      count: 5,
      period: 'day'
    }
  };

  const mockOnCompletionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API responses
    mockedApi.post = jest.fn().mockResolvedValue({ data: { success: true } });
    mockedApi.delete = jest.fn().mockResolvedValue({ data: { success: true } });
  });

  test('renders with habit data', () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Should show today's count and target
    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('40% complete')).toBeInTheDocument();
    expect(screen.getByText('today')).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Check for progress information - the progress bar is displayed within the component
    const progressText = screen.getByText('40% complete');
    expect(progressText).toBeInTheDocument();
  });

  test('shows goal achieved when target is met', () => {
    const completedHabit = {
      ...mockHabit,
      completedDates: [
        `${MOCK_DATE}T08:00:00.000Z`,
        `${MOCK_DATE}T10:00:00.000Z`, 
        `${MOCK_DATE}T12:00:00.000Z`,
        `${MOCK_DATE}T14:00:00.000Z`,
        `${MOCK_DATE}T16:00:00.000Z`
      ]
    };

    render(
      <EnhancedCompletionCounter 
        habit={completedHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('100% complete')).toBeInTheDocument();
    expect(screen.getByText('Goal achieved!')).toBeInTheDocument();
  });

  test('handles add completion', async () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Debug: Check initial state
    expect(screen.getByText('2/5')).toBeInTheDocument();

    const addButton = screen.getByLabelText('Add completion for Test Habit');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/habits/1/completions', {
        date: expect.any(String)
      });
    });

    await waitFor(() => {
      expect(mockOnCompletionChange).toHaveBeenCalledWith('1', 3);
    }, { timeout: 3000 });
  });

  test('handles remove completion', async () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Debug: Check initial state
    expect(screen.getByText('2/5')).toBeInTheDocument();

    const removeButton = screen.getByLabelText('Remove completion for Test Habit');
    
    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('/habits/1/completions', {
        data: { date: expect.any(String) }
      });
    });

    await waitFor(() => {
      expect(mockOnCompletionChange).toHaveBeenCalledWith('1', 1);
    }, { timeout: 3000 });
  });

  test('disables remove button when no completions today', () => {
    const habitWithNoCompletions = {
      ...mockHabit,
      completedDates: []
    };

    render(
      <EnhancedCompletionCounter 
        habit={habitWithNoCompletions}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const removeButton = screen.getByLabelText('Remove completion for Test Habit');
    expect(removeButton).toBeDisabled();
  });

  test('works with habits without structured frequency', () => {
    const habitWithoutFrequency = {
      id: '2',
      name: 'Simple Habit',
      completedDates: [`${MOCK_DATE}T10:00:00.000Z`]
    };

    render(
      <EnhancedCompletionCounter 
        habit={habitWithoutFrequency}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Should show count without target
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('today')).toBeInTheDocument();
    expect(screen.queryByText('complete')).not.toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedApi.post.mockRejectedValue(new Error('API Error'));

    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const addButton = screen.getByLabelText('Add completion for Test Habit');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error adding completion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles remove completion API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedApi.delete.mockRejectedValue(new Error('API Error'));

    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const removeButton = screen.getByLabelText('Remove completion for Test Habit');
    
    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error removing completion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('handles button focus and blur events', () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const addButton = screen.getByLabelText('Add completion for Test Habit');
    const removeButton = screen.getByLabelText('Remove completion for Test Habit');

    // Test focus events
    fireEvent.focus(addButton);
    expect(addButton.style.outline).toBe('2px solid #4caf50');
    
    fireEvent.focus(removeButton);
    expect(removeButton.style.outline).toBe('2px solid #ff5722');

    // Test blur events
    fireEvent.blur(addButton);
    expect(addButton.style.outline).toBe('none');
    
    fireEvent.blur(removeButton);
    expect(removeButton.style.outline).toBe('none');
  });

  test('disables add button when target is reached', () => {
    const completedHabit = {
      ...mockHabit,
      completedDates: [
        `${MOCK_DATE}T10:00:00.000Z`,
        `${MOCK_DATE}T14:00:00.000Z`, 
        `${MOCK_DATE}T16:00:00.000Z`,
        `${MOCK_DATE}T18:00:00.000Z`,
        `${MOCK_DATE}T20:00:00.000Z`
      ]
    };

    render(
      <EnhancedCompletionCounter 
        habit={completedHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const addButton = screen.getByLabelText('Add completion for Test Habit');
    expect(addButton).toBeDisabled();
  });

  test('prevents adding completion when loading', async () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const addButton = screen.getByLabelText('Add completion for Test Habit');
    
    // Click button multiple times rapidly
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    // Only one API call should be made due to loading state
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
    });
  });

  test('prevents removing completion when loading', async () => {
    render(
      <EnhancedCompletionCounter 
        habit={mockHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    const removeButton = screen.getByLabelText('Remove completion for Test Habit');
    
    // Click button multiple times rapidly
    fireEvent.click(removeButton);
    fireEvent.click(removeButton);

    // Only one API call should be made due to loading state
    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledTimes(1);
    });
  });

  test('handles habits with non-daily frequency', () => {
    const weeklyHabit = {
      ...mockHabit,
      expectedFrequency: {
        count: 3,
        period: 'week'
      }
    };

    render(
      <EnhancedCompletionCounter 
        habit={weeklyHabit}
        onCompletionChange={mockOnCompletionChange}
      />
    );

    // Should not show percentage for weekly habits
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});
