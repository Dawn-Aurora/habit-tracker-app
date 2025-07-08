import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndividualHabitAnalytics from './IndividualHabitAnalytics';

describe('IndividualHabitAnalytics - Basic Test', () => {
  const mockOnClose = jest.fn();
  
  const sampleHabit = {
    id: 1,
    name: 'Morning Exercise',
    completedDates: [
      '2024-01-01T10:00:00Z',
      '2024-01-02T10:00:00Z',
    ],
    expectedFrequency: { count: 1, period: 'day' },
    tags: ['Fitness', 'Health'],
    createdAt: '2023-12-01T00:00:00Z'
  };

  test('renders basic analytics modal', () => {
    render(<IndividualHabitAnalytics habit={sampleHabit} onClose={mockOnClose} />);
    expect(screen.getByText('📊 Morning Exercise Analytics')).toBeInTheDocument();
  });
});
