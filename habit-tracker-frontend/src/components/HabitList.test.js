import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HabitList from './HabitList';

describe('HabitList Component', () => {
  const mockHabits = [
    { 
      id: '1', 
      name: 'Exercise', 
      completedDates: ['2023-06-15', '2023-06-16'], 
      expectedFrequency: 'Daily',
      tags: ['health', 'fitness'],
      notes: [{ date: '2023-06-15', text: 'Good workout today!' }]
    },
    { 
      id: '2', 
      name: 'Reading', 
      completedDates: ['2023-06-17'], 
      expectedFrequency: 'Daily',
      tags: ['learning'],
      notes: []
    }
  ];

  const mockProps = {
    habits: mockHabits,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onMarkComplete: jest.fn(),
    onAddNote: jest.fn(),
    onViewMetrics: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing (empty list)', () => {
    render(<HabitList {...mockProps} habits={[]} />);
    expect(screen.getByText(/no habits found/i)).toBeInTheDocument();
  });

  it('renders a list of habits', () => {
    render(<HabitList {...mockProps} />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<HabitList {...mockProps} />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockHabits[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<HabitList {...mockProps} />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onMarkComplete when mark complete button is clicked', () => {
    render(<HabitList {...mockProps} />);
    const markCompleteButtons = screen.getAllByText('Mark Complete');
    fireEvent.click(markCompleteButtons[0]);
    expect(mockProps.onMarkComplete).toHaveBeenCalledWith('1');
  });

  // NEW TESTS for uncovered lines

  it('formats object frequency correctly', () => {
    const habitsWithObjectFreq = [{
      id: '1',
      name: 'Exercise',
      expectedFrequency: { count: 3, period: 'week' }
    }];
    render(<HabitList {...mockProps} habits={habitsWithObjectFreq} />);
    expect(screen.getByText('(3 times per week)')).toBeInTheDocument();
  });

  it('formats object frequency correctly for singular count', () => {
    const habitsWithObjectFreq = [{
      id: '1',
      name: 'Exercise',
      expectedFrequency: { count: 1, period: 'day' }
    }];
    render(<HabitList {...mockProps} habits={habitsWithObjectFreq} />);
    expect(screen.getByText('(1 time per day)')).toBeInTheDocument();
  });

  it('calls onAddNote when add note button is clicked', () => {
    render(<HabitList {...mockProps} />);
    const addNoteButtons = screen.getAllByText('Add Note');
    fireEvent.click(addNoteButtons[0]);
    expect(mockProps.onAddNote).toHaveBeenCalledWith(mockHabits[0]);
  });

  it('calls onViewMetrics when view metrics button is clicked', () => {
    render(<HabitList {...mockProps} />);
    const viewMetricsButtons = screen.getAllByText('View Metrics');
    fireEvent.click(viewMetricsButtons[0]);
    expect(mockProps.onViewMetrics).toHaveBeenCalledWith('1');
  });

  it('handles null expected frequency gracefully', () => {
    const habitsWithNullFreq = [{
      id: '1',
      name: 'Exercise',
      expectedFrequency: null
    }];
    render(<HabitList {...mockProps} habits={habitsWithNullFreq} />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    // Should not show frequency text
    expect(screen.queryByText(/times per/)).not.toBeInTheDocument();
  });

  it('handles string frequency correctly', () => {
    const habitsWithStringFreq = [{
      id: '1',
      name: 'Exercise',
      expectedFrequency: 'Daily'
    }];
    render(<HabitList {...mockProps} habits={habitsWithStringFreq} />);
    expect(screen.getByText('(Daily)')).toBeInTheDocument();
  });

  it('handles notes with text property correctly', () => {
    const habitsWithNotes = [{
      id: '1',
      name: 'Exercise',
      notes: [{ text: 'Great workout!' }]
    }];
    render(<HabitList {...mockProps} habits={habitsWithNotes} />);
    expect(screen.getByText('Latest note: Great workout!')).toBeInTheDocument();
  });

  it('handles notes as simple strings', () => {
    const habitsWithStringNotes = [{
      id: '1',
      name: 'Exercise',
      notes: ['Simple note text']
    }];
    render(<HabitList {...mockProps} habits={habitsWithStringNotes} />);
    expect(screen.getByText('Latest note: Simple note text')).toBeInTheDocument();
  });

  it('displays recent completions with formatted dates and total count', () => {
    const dates = ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04'];
    const habitsRecent = [{ id: '1', name: 'Test Habit', completedDates: dates }];
    render(<HabitList {...mockProps} habits={habitsRecent} />);
    // Should show last 3 dates in reverse order and total count
    const recentDiv = screen.getByText(/^Recent:/i);
    expect(recentDiv).toHaveTextContent(/7\/4\/2025, 7\/3\/2025, 7\/2\/2025/);
    expect(screen.getByText('(4 total)')).toBeInTheDocument();
  });

  it('does not render recent section when completedDates is empty or undefined', () => {
    const habitsNone = [ { id: '1', name: 'Test Habit', completedDates: [] } ];
    render(<HabitList {...mockProps} habits={habitsNone} />);
    expect(screen.queryByText(/^Recent:/i)).not.toBeInTheDocument();

    const habitsUndefined = [ { id: '2', name: 'No Dates Habit' } ];
    render(<HabitList {...mockProps} habits={habitsUndefined} />);
    expect(screen.queryByText(/^Recent:/i)).not.toBeInTheDocument();
  });
});
