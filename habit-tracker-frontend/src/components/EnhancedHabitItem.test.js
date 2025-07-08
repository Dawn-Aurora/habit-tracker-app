import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedHabitItem from './EnhancedHabitItem';

// Mock the EnhancedCompletionCounter component
jest.mock('./EnhancedCompletionCounter', () => {
  return function MockEnhancedCompletionCounter({ habit, onCompletionChange }) {
    return (
      <div data-testid="completion-counter">
        <button onClick={() => onCompletionChange(habit.id, 1)}>
          Mock Counter
        </button>
      </div>
    );
  };
});

describe('EnhancedHabitItem Component', () => {
  const today = new Date().toISOString().slice(0, 10); // Get today's date for test data
  
  const mockHabit = {
    id: '1',
    name: 'Test Habit',
    completedDates: [`${today}T10:00:00.000Z`, `${today}T14:00:00.000Z`], // Use today's date
    expectedFrequency: {
      count: 5,
      period: 'day'
    },
    tags: ['health', 'fitness'],
    notes: [
      { text: 'Great workout today!', date: `${today}T10:00:00.000Z` }
    ]
  };

  const mockCallbacks = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAddNote: jest.fn(),
    onCompletionChange: jest.fn(),
    onViewAnalytics: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders habit information', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    expect(screen.getByText('Test Habit')).toBeInTheDocument();
    expect(screen.getByText('5 times per day')).toBeInTheDocument();
    expect(screen.getByText('health')).toBeInTheDocument();
    expect(screen.getByText('fitness')).toBeInTheDocument();
  });

  test('shows today\'s progress bar for daily habits', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    expect(screen.getByText('Today\'s Progress')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  test('does not show today\'s progress for weekly habits', () => {
    const weeklyHabit = {
      ...mockHabit,
      expectedFrequency: { count: 3, period: 'week' }
    };

    render(<EnhancedHabitItem habit={weeklyHabit} {...mockCallbacks} />);

    expect(screen.queryByText('Today\'s Progress')).not.toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
  });

  test('shows weekly progress for daily habits', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    expect(screen.getByText('This Week')).toBeInTheDocument();
    // 2 completions out of 35 (5 times per day * 7 days)
    expect(screen.getByText('2 / 35')).toBeInTheDocument();
  });

  test('shows completion counter', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    expect(screen.getByTestId('completion-counter')).toBeInTheDocument();
  });

  test('shows and hides details', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    // Details should be hidden initially
    expect(screen.queryByText('Total Completions:')).not.toBeInTheDocument();

    // Click show details
    const detailsButton = screen.getByText('👁️ Show Details');
    fireEvent.click(detailsButton);

    // Details should now be visible
    expect(screen.getByText('Total Completions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('📝 Latest Note')).toBeInTheDocument();
    expect(screen.getByText('"Great workout today!"')).toBeInTheDocument();

    // Click hide details
    const hideButton = screen.getByText('👁️ Hide Details');
    fireEvent.click(hideButton);

    // Details should be hidden again
    expect(screen.queryByText('Total Completions:')).not.toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const editButton = screen.getByLabelText('Edit Test Habit habit');
    fireEvent.click(editButton);

    expect(mockCallbacks.onEdit).toHaveBeenCalledWith(mockHabit);
  });

  test('calls onAddNote when note button is clicked', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const noteButton = screen.getByLabelText('Add note to Test Habit habit');
    fireEvent.click(noteButton);

    expect(mockCallbacks.onAddNote).toHaveBeenCalledWith(mockHabit);
  });

  test('calls onViewAnalytics when analytics button is clicked', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const analyticsButton = screen.getByLabelText('View analytics for Test Habit habit');
    fireEvent.click(analyticsButton);

    expect(mockCallbacks.onViewAnalytics).toHaveBeenCalledWith(mockHabit);
  });

  test('shows delete confirmation dialog', () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const deleteButton = screen.getByLabelText('Delete Test Habit habit');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Habit"? This action cannot be undone.'
    );
    expect(mockCallbacks.onDelete).toHaveBeenCalledWith('1');

    confirmSpy.mockRestore();
  });

  test('does not delete when confirmation is cancelled', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const deleteButton = screen.getByLabelText('Delete Test Habit habit');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockCallbacks.onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  test('handles habit without tags', () => {
    const habitWithoutTags = { ...mockHabit, tags: [] };
    render(<EnhancedHabitItem habit={habitWithoutTags} {...mockCallbacks} />);

    expect(screen.getByText('Test Habit')).toBeInTheDocument();
    expect(screen.queryByText('health')).not.toBeInTheDocument();
  });

  test('handles habit without notes', () => {
    const habitWithoutNotes = { ...mockHabit, notes: [] };
    render(<EnhancedHabitItem habit={habitWithoutNotes} {...mockCallbacks} />);

    // Show details to check for notes section
    const detailsButton = screen.getByText('👁️ Show Details');
    fireEvent.click(detailsButton);

    expect(screen.queryByText('📝 Latest Note')).not.toBeInTheDocument();
  });

  test('handles legacy frequency format', () => {
    const habitWithLegacyFreq = {
      ...mockHabit,
      expectedFrequency: undefined,
      desiredFrequency: { count: 3, period: 'week' }
    };

    render(<EnhancedHabitItem habit={habitWithLegacyFreq} {...mockCallbacks} />);

    expect(screen.getByText('3 times per week')).toBeInTheDocument();
  });

  test('calls onCompletionChange when completion counter is used', () => {
    render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);

    const mockCounterButton = screen.getByText('Mock Counter');
    fireEvent.click(mockCounterButton);

    expect(mockCallbacks.onCompletionChange).toHaveBeenCalledWith('1', 1);
  });

  describe('Monthly frequency calculations', () => {
    test('displays monthly progress correctly', () => {
      const monthlyHabit = {
        ...mockHabit,
        expectedFrequency: {
          count: 10,
          period: 'month'
        }
      };

      render(<EnhancedHabitItem habit={monthlyHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('10 times per month')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    test('handles monthly progress with no completions', () => {
      const monthlyHabit = {
        ...mockHabit,
        completedDates: [], // No completions
        expectedFrequency: {
          count: 5,
          period: 'month'
        }
      };

      render(<EnhancedHabitItem habit={monthlyHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('5 times per month')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });
  });

  describe('Frequency format fallbacks', () => {
    test('displays fallback when expectedFrequency is string', () => {
      const fallbackHabit = {
        ...mockHabit,
        expectedFrequency: 'Daily habit'
      };

      render(<EnhancedHabitItem habit={fallbackHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('Daily habit')).toBeInTheDocument();
    });

    test('displays frequency property when expectedFrequency is not available', () => {
      const fallbackHabit = {
        ...mockHabit,
        expectedFrequency: null,
        frequency: 'Custom frequency'
      };

      render(<EnhancedHabitItem habit={fallbackHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('Custom frequency')).toBeInTheDocument();
    });

    test('displays default message when no frequency is set', () => {
      const noFrequencyHabit = {
        ...mockHabit,
        expectedFrequency: null,
        frequency: null
      };

      render(<EnhancedHabitItem habit={noFrequencyHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('No frequency set')).toBeInTheDocument();
    });

    test('uses desiredFrequency when expectedFrequency is not available', () => {
      const desiredFrequencyHabit = {
        ...mockHabit,
        expectedFrequency: null,
        desiredFrequency: {
          count: 3,
          period: 'week'
        }
      };

      render(<EnhancedHabitItem habit={desiredFrequencyHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('3 times per week')).toBeInTheDocument();
    });
  });

  describe('Edge cases and other scenarios', () => {
    test('handles habits with undefined completedDates', () => {
      const undefinedDatesHabit = {
        ...mockHabit,
        completedDates: undefined
      };

      render(<EnhancedHabitItem habit={undefinedDatesHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('Test Habit')).toBeInTheDocument();
    });

    test('handles single count frequency (singular form)', () => {
      const singleCountHabit = {
        ...mockHabit,
        expectedFrequency: {
          count: 1,
          period: 'day'
        }
      };

      render(<EnhancedHabitItem habit={singleCountHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('1 time per day')).toBeInTheDocument();
    });

    test('handles habits without notes', () => {
      const noNotesHabit = {
        ...mockHabit,
        notes: []
      };

      render(<EnhancedHabitItem habit={noNotesHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('Test Habit')).toBeInTheDocument();
    });

    test('handles habits without tags', () => {
      const noTagsHabit = {
        ...mockHabit,
        tags: []
      };

      render(<EnhancedHabitItem habit={noTagsHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('Test Habit')).toBeInTheDocument();
    });

    test('handles invalid frequency period (returns null)', () => {
      const invalidPeriodHabit = {
        ...mockHabit,
        expectedFrequency: {
          count: 5,
          period: 'invalid'
        }
      };

      render(<EnhancedHabitItem habit={invalidPeriodHabit} {...mockCallbacks} />);
      
      expect(screen.getByText('5 times per invalid')).toBeInTheDocument();
    });
  });

  describe('Button focus and blur handlers (accessibility)', () => {
    test('handles focus and blur events on Show/Hide Details button', () => {
      render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);
      
      const detailsButton = screen.getByText('👁️ Show Details');
      
      // Test that the button exists and is interactive
      expect(detailsButton).toBeInTheDocument();
      expect(detailsButton).not.toBeDisabled();
      
      // Test that we can trigger focus and blur events without errors
      fireEvent.focus(detailsButton);
      fireEvent.blur(detailsButton);
      
      // The button should still be in the document after focus/blur
      expect(detailsButton).toBeInTheDocument();
    });

    test('handles focus and blur events on Edit button', () => {
      render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);
      
      const editButton = screen.getByText('✏️ Edit');
      
      // Test that the button exists and is interactive
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
      
      // Test that we can trigger focus and blur events without errors
      fireEvent.focus(editButton);
      fireEvent.blur(editButton);
      
      // The button should still be in the document after focus/blur
      expect(editButton).toBeInTheDocument();
    });

    test('handles focus and blur events on Note button', () => {
      render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);
      
      const noteButton = screen.getByText('📝 Note');
      
      // Test that the button exists and is interactive
      expect(noteButton).toBeInTheDocument();
      expect(noteButton).not.toBeDisabled();
      
      // Test that we can trigger focus and blur events without errors
      fireEvent.focus(noteButton);
      fireEvent.blur(noteButton);
      
      // The button should still be in the document after focus/blur
      expect(noteButton).toBeInTheDocument();
    });

    test('handles focus and blur events on Analytics button', () => {
      render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);
      
      const analyticsButton = screen.getByText('📊 Analytics');
      
      // Test that the button exists and is interactive
      expect(analyticsButton).toBeInTheDocument();
      expect(analyticsButton).not.toBeDisabled();
      
      // Test that we can trigger focus and blur events without errors
      fireEvent.focus(analyticsButton);
      fireEvent.blur(analyticsButton);
      
      // The button should still be in the document after focus/blur
      expect(analyticsButton).toBeInTheDocument();
    });

    test('handles focus and blur events on Delete button', () => {
      render(<EnhancedHabitItem habit={mockHabit} {...mockCallbacks} />);
      
      const deleteButton = screen.getByText('🗑️ Delete');
      
      // Test that the button exists and is interactive
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();
      
      // Test that we can trigger focus and blur events without errors
      fireEvent.focus(deleteButton);
      fireEvent.blur(deleteButton);
      
      // The button should still be in the document after focus/blur
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
