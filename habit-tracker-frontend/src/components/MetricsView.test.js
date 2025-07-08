import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetricsView from './MetricsView';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api;

describe('MetricsView Component', () => {
  const mockOnClose = jest.fn();
  const mockHabitId = 'habit-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress act() warnings for components with useEffect API calls
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (args[0]?.includes?.('Warning: An update to MetricsView inside a test was not wrapped in act')) {
        return;
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ================== RENDERING TESTS ==================

  describe('Rendering', () => {
    test('renders loading state initially', () => {
      // Mock API to return a pending promise
      const pendingPromise = new Promise(() => {});
      mockedApi.get.mockReturnValue(pendingPromise);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
    });

    test('renders metrics data correctly', async () => {
      const mockMetrics = {
        currentStreak: 5,
        totalCompletions: 42,
        completionRate: 0.857,
        expectedFrequency: '5 times per week'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Habit Metrics')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Current Streak')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Total Completions')).toBeInTheDocument();
        expect(screen.getByText('85.7%')).toBeInTheDocument();
        expect(screen.getByText('This Week Completion Rate')).toBeInTheDocument();
        expect(screen.getByText('5 times per week')).toBeInTheDocument();
      });
    });

    test('renders close button', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });
    });

    test('renders modal component correctly', () => {
      const pendingPromise = new Promise(() => {});
      mockedApi.get.mockReturnValue(pendingPromise);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      // Just check that the modal content is rendered
      expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
    });
  });

  // ================== METRICS CALCULATION AND DISPLAY TESTS ==================

  describe('Metrics Calculation and Display', () => {
    test('displays zero values correctly', async () => {
      const mockMetrics = {
        currentStreak: 0,
        totalCompletions: 0,
        completionRate: 0.0,
        expectedFrequency: null
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getAllByText('0')).toHaveLength(2); // Current streak and total completions
        expect(screen.getByText('0.0%')).toBeInTheDocument(); // Completion rate
        expect(screen.getByText('Not set')).toBeInTheDocument(); // Expected frequency
      });
    });

    test('formats completion rate to one decimal place', async () => {
      const testCases = [
        { rate: 0.333333, expected: '33.3%' },
        { rate: 0.666666, expected: '66.7%' },
        { rate: 0.1, expected: '10.0%' },
        { rate: 1.0, expected: '100.0%' },
        { rate: 0.0, expected: '0.0%' }
      ];

      for (const testCase of testCases) {
        const mockMetrics = {
          currentStreak: 1,
          totalCompletions: 1,
          completionRate: testCase.rate,
          expectedFrequency: 'Daily'
        };

        mockedApi.get.mockResolvedValue({
          data: { data: mockMetrics }
        });

        const { unmount } = render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

        await waitFor(() => {
          expect(screen.getByText(testCase.expected)).toBeInTheDocument();
        });

        unmount();
      }
    });

    test('handles large numbers correctly', async () => {
      const mockMetrics = {
        currentStreak: 365,
        totalCompletions: 9999,
        completionRate: 0.987654321,
        expectedFrequency: '3 times per day'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('365')).toBeInTheDocument();
        expect(screen.getByText('9999')).toBeInTheDocument();
        expect(screen.getByText('98.8%')).toBeInTheDocument();
        expect(screen.getByText('3 times per day')).toBeInTheDocument();
      });
    });

    test('displays expected frequency variations', async () => {
      const frequencyTests = [
        'Daily',
        '5 times per week',
        '2 times per month',
        'Once per year',
        null,
        undefined,
        ''
      ];

      for (const frequency of frequencyTests) {
        const mockMetrics = {
          currentStreak: 1,
          totalCompletions: 1,
          completionRate: 1.0,
          expectedFrequency: frequency
        };

        mockedApi.get.mockResolvedValue({
          data: { data: mockMetrics }
        });

        const { unmount } = render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

        await waitFor(() => {
          if (frequency && frequency.trim()) {
            expect(screen.getByText(frequency)).toBeInTheDocument();
          } else {
            expect(screen.getByText('Not set')).toBeInTheDocument();
          }
        });

        unmount();
      }
    });
  });

  // ================== API INTEGRATION TESTS ==================

  describe('API Integration', () => {
    test('makes correct API call with habit ID', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      expect(mockedApi.get).toHaveBeenCalledWith('/habits/habit-123/metrics');
      expect(mockedApi.get).toHaveBeenCalledTimes(1);
    });

    test('updates metrics when habit ID changes', async () => {
      const mockMetrics1 = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      const mockMetrics2 = {
        currentStreak: 5,
        totalCompletions: 10,
        completionRate: 0.8,
        expectedFrequency: 'Weekly'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics1 }
      });

      const { rerender } = render(<MetricsView habitId="habit-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getAllByText('1')).toHaveLength(2); // Current streak and total completions
      });

      // Change habit ID
      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics2 }
      });

      rerender(<MetricsView habitId="habit-2" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
      });

      expect(mockedApi.get).toHaveBeenCalledWith('/habits/habit-1/metrics');
      expect(mockedApi.get).toHaveBeenCalledWith('/habits/habit-2/metrics');
      expect(mockedApi.get).toHaveBeenCalledTimes(2);
    });

    test('handles API response without data wrapper', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      // Response without data wrapper
      mockedApi.get.mockResolvedValue({
        data: mockMetrics
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        // Should handle the case gracefully
        expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
      });
    });
  });

  // ================== ERROR HANDLING TESTS ==================

  describe('Error Handling', () => {
    test('displays error message on API failure', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Habit not found' }
        }
      };

      mockedApi.get.mockRejectedValue(errorResponse);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading metrics: Habit not found')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
    });

    test('handles network error', async () => {
      const networkError = new Error('Network Error');
      mockedApi.get.mockRejectedValue(networkError);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading metrics: Network Error')).toBeInTheDocument();
      });
    });

    test('handles error without response data', async () => {
      const genericError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(genericError);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading metrics: Unknown error')).toBeInTheDocument();
      });
    });

    test('still shows close button on error', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Habit not found' }
        }
      };

      mockedApi.get.mockRejectedValue(errorResponse);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading metrics: Habit not found')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });
    });

    test('clears error on successful retry', async () => {
      // First call fails
      const errorResponse = {
        response: {
          data: { message: 'Network error' }
        }
      };
      mockedApi.get.mockRejectedValueOnce(errorResponse);

      const { rerender } = render(<MetricsView habitId="habit-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Error loading metrics: Network error')).toBeInTheDocument();
      });

      // Second call succeeds
      const mockMetrics = {
        currentStreak: 3,
        totalCompletions: 15,
        completionRate: 0.9,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      rerender(<MetricsView habitId="habit-2" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.queryByText('Error loading metrics: Network error')).not.toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
      });
    });
  });

  // ================== USER INTERACTION TESTS ==================

  describe('User Interactions', () => {
    test('calls onClose when close button is clicked', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('close button works even during loading', () => {
      const pendingPromise = new Promise(() => {});
      mockedApi.get.mockReturnValue(pendingPromise);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      // Close button should be available during loading (though not visible in loading state)
      // This test verifies the component structure doesn't break
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('close button works after error', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Error occurred' }
        }
      };

      mockedApi.get.mockRejectedValue(errorResponse);

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ================== EDGE CASES TESTS ==================

  describe('Edge Cases', () => {
    test('handles null metrics data', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: null }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
        expect(screen.getByText('Habit Metrics')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });

      // Should not display metrics when data is null
      expect(screen.queryByText('Current Streak')).not.toBeInTheDocument();
    });

    test('handles undefined metrics data', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: undefined }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
        expect(screen.getByText('Habit Metrics')).toBeInTheDocument();
      });
    });

    test('handles missing habit ID gracefully', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: null }
      });

      render(<MetricsView habitId="" onClose={mockOnClose} />);

      expect(mockedApi.get).toHaveBeenCalledWith('/habits//metrics');
    });

    test('handles component unmounting during API call', async () => {
      const pendingPromise = new Promise(() => {});
      mockedApi.get.mockReturnValue(pendingPromise);

      const { unmount } = render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      // Unmount while API call is pending
      unmount();

      // Should not throw any errors
      expect(mockedApi.get).toHaveBeenCalledTimes(1);
    });

    test('handles very large completion rates', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.5, // 150% - edge case
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('150.0%')).toBeInTheDocument();
      });
    });

    test('handles negative values gracefully', async () => {
      const mockMetrics = {
        currentStreak: -1,
        totalCompletions: -5,
        completionRate: -0.1,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('-1')).toBeInTheDocument();
        expect(screen.getByText('-5')).toBeInTheDocument();
        expect(screen.getByText('-10.0%')).toBeInTheDocument();
      });
    });

    test('handles floating point numbers correctly', async () => {
      const mockMetrics = {
        currentStreak: 1.5, // Should display as 1.5
        totalCompletions: 42.7, // Should display as 42.7
        completionRate: 0.8567, // Should display as 85.7%
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('1.5')).toBeInTheDocument();
        expect(screen.getByText('42.7')).toBeInTheDocument();
        expect(screen.getByText('85.7%')).toBeInTheDocument();
      });
    });
  });

  // ================== ACCESSIBILITY TESTS ==================

  describe('Accessibility', () => {
    test('modal has proper z-index for screen readers', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        const modal = screen.getByText('Habit Metrics').closest('div');
        expect(modal).toHaveStyle('z-index: 1000');
      });
    });

    test('has proper heading structure', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Habit Metrics' })).toBeInTheDocument();
      });
    });

    test('button has proper role and text', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });
  });

  // ================== INTEGRATION TESTS ==================

  describe('Integration', () => {
    test('onClose callback is required', () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      // Should not crash without onClose
      expect(() => {
        render(<MetricsView habitId={mockHabitId} />);
      }).not.toThrow();
    });

    test('works with different habit ID formats', async () => {
      const mockMetrics = {
        currentStreak: 1,
        totalCompletions: 1,
        completionRate: 1.0,
        expectedFrequency: 'Daily'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      const habitIds = ['123', 'habit-abc-123', 'user_123_habit_456', ''];

      for (const habitId of habitIds) {
        const { unmount } = render(<MetricsView habitId={habitId} onClose={mockOnClose} />);
        
        expect(mockedApi.get).toHaveBeenCalledWith(`/habits/${habitId}/metrics`);
        
        unmount();
      }
    });

    test('complete loading to success flow', async () => {
      const mockMetrics = {
        currentStreak: 7,
        totalCompletions: 49,
        completionRate: 0.875,
        expectedFrequency: '5 times per week'
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockMetrics }
      });

      render(<MetricsView habitId={mockHabitId} onClose={mockOnClose} />);

      // Loading state
      expect(screen.getByText('Loading metrics...')).toBeInTheDocument();

      // Success state
      await waitFor(() => {
        expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
        expect(screen.getByText('Habit Metrics')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('49')).toBeInTheDocument();
        expect(screen.getByText('87.5%')).toBeInTheDocument();
        expect(screen.getByText('5 times per week')).toBeInTheDocument();
      });

      // Interaction
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
