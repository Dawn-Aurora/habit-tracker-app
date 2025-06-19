import React from 'react';
import { render, screen } from '@testing-library/react';
import HabitList from './HabitList';

describe('HabitList Component', () => {
  it('renders without crashing (empty list)', () => {
    render(<HabitList habits={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/no habits/i)).toBeInTheDocument();
  });

  it('renders a list of habits', () => {
    const habits = [
      { id: '1', name: 'Exercise', completedDates: [] },
      { id: '2', name: 'Read', completedDates: [] },
    ];
    render(<HabitList habits={habits} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const habits = [{ id: '1', name: 'Exercise', completedDates: [] }];
    const onEdit = jest.fn();
    render(<HabitList habits={habits} onEdit={onEdit} onDelete={jest.fn()} />);
    screen.getByText('Edit').click();
    expect(onEdit).toHaveBeenCalledWith(habits[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    const habits = [{ id: '1', name: 'Exercise', completedDates: [] }];
    const onDelete = jest.fn();
    render(<HabitList habits={habits} onEdit={jest.fn()} onDelete={onDelete} />);
    screen.getByText('Delete').click();
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  // Add more edge case and error handling tests as needed
});
