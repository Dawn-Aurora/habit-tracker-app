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
});
