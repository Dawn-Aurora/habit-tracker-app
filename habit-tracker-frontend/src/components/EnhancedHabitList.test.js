import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedHabitList from './EnhancedHabitList';

// Mock EnhancedCompletionCounter
jest.mock('./EnhancedCompletionCounter', () => {
  return function MockEnhancedCompletionCounter({ habit, onCompletionChange }) {
    return (
      <div data-testid={`completion-counter-${habit.id}`}>
        <button onClick={() => onCompletionChange(habit.id, 'increment')}>
          Increment
        </button>
        <button onClick={() => onCompletionChange(habit.id, 'decrement')}>
          Decrement
        </button>
      </div>
    );
  };
});

describe('EnhancedHabitList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnMarkComplete = jest.fn();
  const mockOnAddNote = jest.fn();
  const mockOnViewMetrics = jest.fn();
  const mockOnCompletionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15T10:00:00Z')); // Thursday
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ================== RENDERING TESTS ==================

  describe('Rendering', () => {
    test('renders empty state when no habits provided', () => {
      render(
        <EnhancedHabitList 
          habits={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('No habits found. Add your first habit to get started!')).toBeInTheDocument();
    });

    test('renders empty state when habits is null', () => {
      render(
        <EnhancedHabitList 
          habits={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('No habits found. Add your first habit to get started!')).toBeInTheDocument();
    });

    test('renders habit list with basic habit information', () => {
      const habits = [
        {
          id: '1',
          name: 'Morning Exercise',
          expectedFrequency: 'Daily',
          tags: ['health', 'fitness'],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read Book',
          expectedFrequency: 'Weekly',
          tags: ['education'],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
      expect(screen.getByText('Read Book')).toBeInTheDocument();
      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
    });

    test('renders habit tags correctly', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: ['health', 'fitness', 'morning'],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('health')).toBeInTheDocument();
      expect(screen.getByText('fitness')).toBeInTheDocument();
      expect(screen.getByText('morning')).toBeInTheDocument();
    });

    test('renders action buttons for each habit', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Note' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Metrics' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    test('renders recent completions', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: [
            '2023-06-10T09:00:00Z',
            '2023-06-11T09:00:00Z',
            '2023-06-12T09:00:00Z'
          ]
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Recent completions:')).toBeInTheDocument();
      expect(screen.getByText('6/10/2023')).toBeInTheDocument();
      expect(screen.getByText('6/11/2023')).toBeInTheDocument();
      expect(screen.getByText('6/12/2023')).toBeInTheDocument();
    });

    test('limits recent completions to last 5 entries', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: [
            '2023-06-08T09:00:00Z',
            '2023-06-09T09:00:00Z',
            '2023-06-10T09:00:00Z',
            '2023-06-11T09:00:00Z',
            '2023-06-12T09:00:00Z',
            '2023-06-13T09:00:00Z',
            '2023-06-14T09:00:00Z'
          ]
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      // Should only show the last 5 completions
      expect(screen.getByText('6/10/2023')).toBeInTheDocument();
      expect(screen.getByText('6/11/2023')).toBeInTheDocument();
      expect(screen.getByText('6/12/2023')).toBeInTheDocument();
      expect(screen.getByText('6/13/2023')).toBeInTheDocument();
      expect(screen.getByText('6/14/2023')).toBeInTheDocument();
      
      // Should not show older completions
      expect(screen.queryByText('6/8/2023')).not.toBeInTheDocument();
      expect(screen.queryByText('6/9/2023')).not.toBeInTheDocument();
    });

    test('shows recent completions in reverse chronological order', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: [
            '2023-06-10T09:00:00Z',
            '2023-06-11T09:00:00Z',
            '2023-06-12T09:00:00Z'
          ]
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      const completionDates = screen.getAllByText(/6\/\d+\/2023/);
      expect(completionDates[0]).toHaveTextContent('6/12/2023'); // Most recent first
      expect(completionDates[1]).toHaveTextContent('6/11/2023');
      expect(completionDates[2]).toHaveTextContent('6/10/2023'); // Oldest last
    });
  });

  // ================== FREQUENCY FORMATTING TESTS ==================

  describe('Frequency Formatting', () => {
    test('formats string frequencies correctly', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Daily')).toBeInTheDocument();
    });

    test('formats structured frequencies correctly', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 3, period: 'week' },
          tags: [],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: { count: 1, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('3 times per week')).toBeInTheDocument();
      expect(screen.getByText('1 time per day')).toBeInTheDocument();
    });

    test('handles empty or null frequencies', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: null,
          tags: [],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: '',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });

    test('handles singular vs plural frequency counts', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 1, period: 'week' },
          tags: [],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: { count: 5, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('1 time per week')).toBeInTheDocument(); // Singular
      expect(screen.getByText('5 times per day')).toBeInTheDocument(); // Plural
    });
  });

  // ================== COMPLETION RATE TESTS ==================

  describe('Completion Rate Calculation', () => {
    test('calculates daily completion rate correctly', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 2, period: 'day' },
          tags: [],
          completedDates: ['2023-06-15T09:00:00Z'] // 1 completion today out of 2 expected
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('calculates weekly completion rate correctly', () => {
      // Current date is Thursday 2023-06-15
      // Week starts Monday 2023-06-12
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 3, period: 'week' },
          tags: [],
          completedDates: [
            '2023-06-12T09:00:00Z', // Monday
            '2023-06-14T09:00:00Z'  // Wednesday
            // 2 completions out of 3 expected this week
          ]
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    test('caps completion rate at 100%', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 1, period: 'day' },
          tags: [],
          completedDates: [
            '2023-06-15T09:00:00Z',
            '2023-06-15T15:00:00Z', // 2 completions today, but only 1 expected
          ]
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    test('shows correct completion rate colors', () => {
      const habits = [
        {
          id: '1',
          name: 'High Completion',
          expectedFrequency: { count: 1, period: 'day' },
          tags: [],
          completedDates: ['2023-06-15T09:00:00Z'] // 100%
        },
        {
          id: '2',
          name: 'Medium Completion',
          expectedFrequency: { count: 4, period: 'day' },
          tags: [],
          completedDates: [
            '2023-06-15T09:00:00Z',
            '2023-06-15T12:00:00Z',
            '2023-06-15T15:00:00Z' // 3 out of 4 = 75%
          ]
        },
        {
          id: '3',
          name: 'Low Completion',
          expectedFrequency: { count: 4, period: 'day' },
          tags: [],
          completedDates: ['2023-06-15T09:00:00Z'] // 1 out of 4 = 25%
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      const completionRates = screen.getAllByText(/\d+%/);
      expect(completionRates[0]).toHaveStyle('background-color: #4caf50'); // Green for 100%
      expect(completionRates[1]).toHaveStyle('background-color: #ff9800'); // Orange for 75%
      expect(completionRates[2]).toHaveStyle('background-color: #f44336'); // Red for 25%
    });

    test('does not show completion rate for non-structured frequencies', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: ['2023-06-15T09:00:00Z']
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    });
  });

  // ================== ENHANCED COMPLETION COUNTER TESTS ==================

  describe('Enhanced Completion Counter Integration', () => {
    test('shows completion counter for structured frequencies', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 3, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByTestId('completion-counter-1')).toBeInTheDocument();
    });

    test('does not show completion counter for non-structured frequencies', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.queryByTestId('completion-counter-1')).not.toBeInTheDocument();
    });

    test('calls onCompletionChange when completion counter is used', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 3, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByText('Increment'));

      expect(mockOnCompletionChange).toHaveBeenCalledWith('1', 'increment');
    });
  });

  // ================== BUTTON INTERACTION TESTS ==================

  describe('Button Interactions', () => {
    test('calls onMarkComplete when mark complete button is clicked', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily', // Non-structured frequency shows Mark Complete button
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Mark Complete' }));

      expect(mockOnMarkComplete).toHaveBeenCalledWith('1');
    });

    test('calls onEdit when edit button is clicked', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(mockOnEdit).toHaveBeenCalledWith(habits[0]);
    });

    test('calls onAddNote when add note button is clicked', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));

      expect(mockOnAddNote).toHaveBeenCalledWith(habits[0]);
    });

    test('calls onViewMetrics when metrics button is clicked', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Metrics' }));

      expect(mockOnViewMetrics).toHaveBeenCalledWith('1');
    });

    test('calls onDelete when delete button is clicked', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    test('does not show Mark Complete button for structured frequencies', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 3, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.queryByRole('button', { name: 'Mark Complete' })).not.toBeInTheDocument();
    });
  });

  // ================== EDGE CASES TESTS ==================

  describe('Edge Cases', () => {
    test('handles habits without tags', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });

    test('handles habits with empty tags array', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });

    test('handles habits without completedDates', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.queryByText('Recent completions:')).not.toBeInTheDocument();
    });

    test('handles habits with empty completedDates array', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.queryByText('Recent completions:')).not.toBeInTheDocument();
    });

    test('handles invalid completion dates gracefully', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: ['invalid-date', '2023-06-15T09:00:00Z']
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('6/15/2023')).toBeInTheDocument();
    });

    test('handles habits with malformed expectedFrequency objects', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: null, period: 'day' },
          tags: [],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: { count: 3 }, // Missing period
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
    });

    test('handles zero completion counts in structured frequency', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 0, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('0 times per day')).toBeInTheDocument();
    });

    test('handles negative completion counts gracefully', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: -1, period: 'day' },
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('-1 times per day')).toBeInTheDocument();
    });

    test('handles very long habit names', () => {
      const habits = [
        {
          id: '1',
          name: 'This is a very long habit name that should still display properly without breaking the layout',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('This is a very long habit name that should still display properly without breaking the layout')).toBeInTheDocument();
    });

    test('handles very long tag names', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: ['this-is-a-very-long-tag-name-that-should-wrap-properly'],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('this-is-a-very-long-tag-name-that-should-wrap-properly')).toBeInTheDocument();
    });
  });

  // ================== MULTIPLE HABITS TESTS ==================

  describe('Multiple Habits', () => {
    test('renders multiple habits with different configurations', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: { count: 1, period: 'day' },
          tags: ['health'],
          completedDates: ['2023-06-15T09:00:00Z']
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: 'Daily',
          tags: ['education', 'books'],
          completedDates: []
        },
        {
          id: '3',
          name: 'Meditate',
          expectedFrequency: { count: 2, period: 'week' },
          tags: [],
          completedDates: ['2023-06-12T09:00:00Z']
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
      expect(screen.getByText('Meditate')).toBeInTheDocument();

      // Check that different frequency types are handled correctly
      expect(screen.getByText('1 time per day')).toBeInTheDocument();
      expect(screen.getByText('Daily')).toBeInTheDocument();
      expect(screen.getByText('2 times per week')).toBeInTheDocument();

      // Check that completion counters are shown only for structured frequencies
      expect(screen.getByTestId('completion-counter-1')).toBeInTheDocument();
      expect(screen.queryByTestId('completion-counter-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('completion-counter-3')).toBeInTheDocument();
    });

    test('each habit has its own set of action buttons', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        },
        {
          id: '2',
          name: 'Read',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMarkComplete={mockOnMarkComplete}
          onAddNote={mockOnAddNote}
          onViewMetrics={mockOnViewMetrics}
          onCompletionChange={mockOnCompletionChange}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);

      // Test clicking different buttons
      fireEvent.click(editButtons[0]);
      expect(mockOnEdit).toHaveBeenCalledWith(habits[0]);

      fireEvent.click(deleteButtons[1]);
      expect(mockOnDelete).toHaveBeenCalledWith('2');
    });
  });

  // ================== CALLBACK TESTS ==================

  describe('Callback Functions', () => {
    test('works without optional callback functions', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      expect(() => {
        render(<EnhancedHabitList habits={habits} />);
      }).not.toThrow();

      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });

    test('handles null callback functions gracefully', () => {
      const habits = [
        {
          id: '1',
          name: 'Exercise',
          expectedFrequency: 'Daily',
          tags: [],
          completedDates: []
        }
      ];

      render(
        <EnhancedHabitList 
          habits={habits}
          onEdit={null}
          onDelete={null}
          onMarkComplete={null}
          onAddNote={null}
          onViewMetrics={null}
          onCompletionChange={null}
        />
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      
      // Buttons should still be present
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });
});
