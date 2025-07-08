import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IndividualHabitAnalytics from './IndividualHabitAnalytics';

describe('IndividualHabitAnalytics - Simple Test', () => {
  const mockOnClose = jest.fn();
  
  const sampleHabit = {
    id: 1,
    name: 'Morning Exercise',
    completedDates: ['2024-01-01T10:00:00Z'],
    expectedFrequency: { count: 1, period: 'day' },
    tags: ['Fitness']
  };

  test('renders nothing when habit is null', () => {
    const { container } = render(<IndividualHabitAnalytics habit={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders with valid habit - basic test', () => {
    // This should help us identify if the issue is with the component or test setup
    const component = render(<IndividualHabitAnalytics habit={sampleHabit} onClose={mockOnClose} />);
    expect(component).toBeDefined();
  });
});
