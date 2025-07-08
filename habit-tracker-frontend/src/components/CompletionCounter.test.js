import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompletionCounter from './CompletionCounter';

// Mock the api module
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { status: 'success', data: { count: 0 } } })),
    post: jest.fn(() => Promise.resolve({ data: { status: 'success' } })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: { status: 'success' } }))
  }
}));

import api from '../api';

describe('CompletionCounter Component', () => {
  const mockHabit = {
    id: '1',
    name: 'Test Habit',
    completedDates: ['2023-12-25T10:00:00Z', '2023-12-24T09:00:00Z'],
    expectedFrequency: 'Daily',
    desiredFrequency: {
      count: 3,
      period: 'day'
    }
  };

  const mockProps = {
    habit: mockHabit,
    date: '2023-12-25',
    onCompletionChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock returns
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 0 } } }));
    api.post.mockReturnValue(Promise.resolve({ data: { status: 'success' } }));
    api.delete.mockReturnValue(Promise.resolve({ data: { status: 'success' } }));
  });

  it('renders with initial count from API', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 2 } } }));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    expect(api.get).toHaveBeenCalledWith('/habits/1/completions?date=2023-12-25');
  });

  it('falls back to counting completedDates when API fails', async () => {
    api.get.mockRejectedValue(new Error('API Error'));
    
    const habitWithCompletions = {
      ...mockHabit,
      completedDates: ['2023-12-25T10:00:00Z', '2023-12-25T14:00:00Z']
    };
    
    render(<CompletionCounter {...mockProps} habit={habitWithCompletions} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays "Today" for current date', () => {
    const today = new Date().toISOString().slice(0, 10);
    render(<CompletionCounter {...mockProps} date={today} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays specific date when not today', () => {
    render(<CompletionCounter {...mockProps} date="2023-12-25" />);
    
    expect(screen.getByText('2023-12-25')).toBeInTheDocument();
  });

  it('increments count when plus button is clicked', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 1 } } }));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits/1/completions', {
        date: expect.stringContaining('2023-12-25T')
      });
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    expect(mockProps.onCompletionChange).toHaveBeenCalledWith('1', 2);
  });

  it('decrements count when minus button is clicked', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 2 } } }));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    const decrementButton = screen.getByRole('button', { name: /-/ });
    fireEvent.click(decrementButton);
    
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/habits/1/completions', {
        data: { date: '2023-12-25' }
      });
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    
    expect(mockProps.onCompletionChange).toHaveBeenCalledWith('1', 1);
  });

  it('disables decrement button when count is zero', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 0 } } }));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      const decrementButton = screen.getByRole('button', { name: /-/ });
      expect(decrementButton).toBeDisabled();
    });
  });

  it('prevents count from going below zero', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 0 } } }));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
    
    const decrementButton = screen.getByRole('button', { name: /-/ });
    expect(decrementButton).toBeDisabled();
    
    // Try to click anyway
    fireEvent.click(decrementButton);
    
    expect(api.delete).not.toHaveBeenCalled();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows loading state during API calls', async () => {
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CompletionCounter {...mockProps} />);
    
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(incrementButton);
    
    expect(incrementButton).toBeDisabled();
    expect(screen.getByText('Updating...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(incrementButton).not.toBeDisabled();
    });
  });

  it('shows error message when API call fails', async () => {
    api.post.mockRejectedValue(new Error('Network error'));
    
    render(<CompletionCounter {...mockProps} />);
    
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to add completion')).toBeInTheDocument();
    });
  });

  it('shows error message when decrement API call fails', async () => {
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 2 } } }));
    api.delete.mockRejectedValue(new Error('Network error'));
    
    render(<CompletionCounter {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    
    const decrementButton = screen.getByRole('button', { name: /-/ });
    fireEvent.click(decrementButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to remove completion')).toBeInTheDocument();
    });
  });

  it('calculates target count from desiredFrequency for daily habits', async () => {
    const habitWithDesiredFreq = {
      ...mockHabit,
      desiredFrequency: { count: 3, period: 'day' }
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 2 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithDesiredFreq} />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('/ 3')).toBeInTheDocument();
    });
  });

  it('parses target count from legacy expectedFrequency string', async () => {
    const habitWithLegacyFreq = {
      ...mockHabit,
      expectedFrequency: '2 times/day',
      desiredFrequency: null
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 1 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithLegacyFreq} />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 2')).toBeInTheDocument();
    });
  });

  it('defaults to target count of 1 for daily habits', async () => {
    const habitWithDailyFreq = {
      ...mockHabit,
      expectedFrequency: 'Daily',
      desiredFrequency: null
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 0 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithDailyFreq} />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      // Should not show "/1" for single target
      expect(screen.queryByText('/ 1')).not.toBeInTheDocument();
    });
  });

  it('shows progress bar for multi-target habits', async () => {
    const habitWithMultiTarget = {
      ...mockHabit,
      desiredFrequency: { count: 5, period: 'day' }
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 3 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithMultiTarget} />);
    
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Check ARIA attributes
      expect(progressBar).toHaveAttribute('aria-valuenow', '3');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
      // Check the inner progress bar fill
      const innerDiv = progressBar.querySelector('div');
      expect(innerDiv).toHaveStyle({ width: '60%' });
    });
  });

  it('shows goal achieved message when target is reached', async () => {
    const habitWithTarget = {
      ...mockHabit,
      desiredFrequency: { count: 3, period: 'day' }
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 3 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithTarget} />);
    
    await waitFor(() => {
      expect(screen.getByText('✓ Goal achieved!')).toBeInTheDocument();
    });
  });

  it('prevents multiple API calls while loading', async () => {
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<CompletionCounter {...mockProps} />);
    
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    
    // Click multiple times rapidly
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    });
    
    // Should only make one API call
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('handles habit without completedDates gracefully', async () => {
    const habitWithoutDates = {
      ...mockHabit,
      completedDates: null
    };
    
    api.get.mockRejectedValue(new Error('API Error'));
    
    render(<CompletionCounter {...mockProps} habit={habitWithoutDates} />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('uses default date when not provided', async () => {
    const today = new Date().toISOString().slice(0, 10);
    
    render(<CompletionCounter habit={mockHabit} onCompletionChange={jest.fn()} />);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/habits/1/completions?date=${today}`);
    });
  });

  it('handles non-daily desiredFrequency correctly', async () => {
    const habitWithWeeklyFreq = {
      ...mockHabit,
      desiredFrequency: { count: 3, period: 'week' }
    };
    
    render(<CompletionCounter {...mockProps} habit={habitWithWeeklyFreq} />);
    
    await waitFor(() => {
      // Should default to 1 for non-daily periods
      expect(screen.queryByText('/ 3')).not.toBeInTheDocument();
    });
  });

  it('correctly formats date for API calls with timezone', async () => {
    render(<CompletionCounter {...mockProps} />);
    
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/habits/1/completions', {
        date: expect.stringMatching(/^2023-12-25T\d{2}:\d{2}:\d{2}/)
      });
    });
  });

  it('updates progress percentage correctly', async () => {
    const habitWithTarget = {
      ...mockHabit,
      desiredFrequency: { count: 4, period: 'day' }
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 1 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithTarget} />);
    
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      const innerDiv = progressBar.querySelector('div');
      expect(innerDiv).toHaveStyle({ width: '25%' }); // 1/4 = 25%
    });
    
    // Increment and check new percentage
    const incrementButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      const innerDiv = progressBar.querySelector('div');
      expect(innerDiv).toHaveStyle({ width: '50%' }); // 2/4 = 50%
    });
  });

  it('caps progress at 100%', async () => {
    const habitWithTarget = {
      ...mockHabit,
      desiredFrequency: { count: 2, period: 'day' }
    };
    
    api.get.mockReturnValue(Promise.resolve({ data: { status: 'success', data: { count: 3 } } }));
    
    render(<CompletionCounter {...mockProps} habit={habitWithTarget} />);
    
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      const innerDiv = progressBar.querySelector('div');
      expect(innerDiv).toHaveStyle({ width: '100%' }); // Capped at 100%
    });
  });
});
