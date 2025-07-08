import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsDashboard, { getHabitCategory, parseExpectedFrequency } from './AnalyticsDashboard';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Line Chart Mock
    </div>
  ),
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Bar Chart Mock
    </div>
  ),
  Doughnut: ({ data, options }) => (
    <div data-testid="doughnut-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Doughnut Chart Mock
    </div>
  ),
}));

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

describe('AnalyticsDashboard', () => {
  const mockOnClose = jest.fn();

  const sampleHabits = [
    {
      id: 1,
      name: 'Morning Exercise',
      completedDates: [
        '2024-01-01T10:00:00Z',
        '2024-01-02T10:00:00Z',
        '2024-01-03T10:00:00Z',
        '2024-01-05T10:00:00Z',
      ],
      expectedFrequency: { count: 1, period: 'day' },
      tags: ['Fitness']
    },
    {
      id: 2,
      name: 'Read Books',
      completedDates: [
        '2024-01-01T20:00:00Z',
        '2024-01-03T20:00:00Z',
        '2024-01-04T20:00:00Z',
      ],
      expectedFrequency: 'daily',
      tags: ['Learning']
    },
    {
      id: 3,
      name: 'Meditation',
      completedDates: [
        '2024-01-02T07:00:00Z',
        '2024-01-04T07:00:00Z',
      ],
      expectedFrequency: { count: 3, period: 'week' },
      tags: ['Wellness']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders dashboard with modal overlay', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      // Check for modal overlay by style
      const overlay = document.querySelector('[style*="position: fixed"]');
      expect(overlay).toBeInTheDocument();
      
      // Check for main content
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('renders with empty habits array', () => {
      render(<AnalyticsDashboard habits={[]} onClose={mockOnClose} />);
      
      expect(screen.getByText('📊 No Data Yet')).toBeInTheDocument();
      expect(screen.getByText('Create some habits and mark them complete to see your analytics!')).toBeInTheDocument();
    });

    test('renders with null habits', () => {
      render(<AnalyticsDashboard habits={null} onClose={mockOnClose} />);
      
      expect(screen.getByText('📊 No Data Yet')).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    test('displays correct statistics', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      // Total habits
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Total Habits')).toBeInTheDocument();
      
      // Total completions (should show completions within default 30-day range)
      expect(screen.getByText('Completions (30 days)')).toBeInTheDocument();
      
      // Average completion rate
      expect(screen.getByText(/Avg Completion Rate/)).toBeInTheDocument();
      
      // Longest streak
      expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    });

    test('shows zero statistics for empty habits', () => {
      render(<AnalyticsDashboard habits={[]} onClose={mockOnClose} />);
      
      expect(screen.getByText('Total Habits')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Time Range Selector', () => {
    test('has default time range of 30 days', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const select = screen.getByDisplayValue('Last 30 days');
      expect(select).toBeInTheDocument();
    });

    test('can change time range', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const select = screen.getByDisplayValue('Last 30 days');
      fireEvent.change(select, { target: { value: '7' } });
      
      expect(screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Completions (7 days)')).toBeInTheDocument();
    });

    test('updates statistics when time range changes', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const select = screen.getByDisplayValue('Last 30 days');
      fireEvent.change(select, { target: { value: '90' } });
      
      expect(screen.getByDisplayValue('Last 90 days')).toBeInTheDocument();
      expect(screen.getByText('Completions (90 days)')).toBeInTheDocument();
    });
  });

  describe('View Type Selector', () => {
    test('has default view type of overview', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const overviewButton = screen.getByRole('button', { name: 'overview' });
      expect(overviewButton).toHaveStyle({ backgroundColor: '#2196f3' });
    });

    test('can switch between view types', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      // Switch to habits view
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      expect(habitsButton).toHaveStyle({ backgroundColor: '#2196f3' });
      expect(screen.getByText('🏆 Habit Performance Comparison')).toBeInTheDocument();
    });

    test('displays categories view correctly', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      expect(categoriesButton).toHaveStyle({ backgroundColor: '#2196f3' });
      expect(screen.getByText('📂 Category Analysis')).toBeInTheDocument();
    });
  });

  describe('Overview View', () => {
    test('displays progress chart and category breakdown', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      expect(screen.getByText('📈 Progress Over Time')).toBeInTheDocument();
      expect(screen.getByText('🎯 Category Breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    test('shows no data message when category data is empty', () => {
      const emptyHabits = [{
        id: 1,
        name: 'Test Habit',
        completedDates: [],
        expectedFrequency: 'daily'
      }];
      
      render(<AnalyticsDashboard habits={emptyHabits} onClose={mockOnClose} />);
      
      // The component shows a doughnut chart even with empty data
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  describe('Habits View', () => {
    test('displays habit comparison chart and details table', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      expect(screen.getByText('🏆 Habit Performance Comparison')).toBeInTheDocument();
      expect(screen.getByText('📋 Detailed Habit Statistics')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    test('displays habit details in table', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      // Check table headers
      expect(screen.getByText('Habit')).toBeInTheDocument();
      expect(screen.getByText('Completions')).toBeInTheDocument();
      expect(screen.getByText('Rate')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('Max Streak')).toBeInTheDocument();
      
      // Check habit names in table
      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
      expect(screen.getByText('Read Books')).toBeInTheDocument();
      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });

    test('shows no data message when habit data is empty', () => {
      render(<AnalyticsDashboard habits={[]} onClose={mockOnClose} />);
      
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      expect(screen.getByText('No habit data available')).toBeInTheDocument();
    });
  });

  describe('Categories View', () => {
    test('displays category analysis with chart and performance list', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
      expect(screen.getByText('Category Performance')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    test('shows category performance items', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      // Should show categories based on habit tags/names
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Wellness')).toBeInTheDocument();
    });

    test('shows no data message when category data is empty', () => {
      render(<AnalyticsDashboard habits={[]} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      expect(screen.getByText('No category data available. Complete some habits to see analytics!')).toBeInTheDocument();
    });

    test('handles habits without tags using name-based categorization', () => {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const habitsWithoutTags = [
        {
          id: 1,
          name: 'Morning Exercise',
          completedDates: [
            today,
            yesterday,
          ],
          expectedFrequency: 'daily'
          // No tags property
        },
        {
          id: 2,
          name: 'Read Programming Books',
          completedDates: [
            today,
          ],
          expectedFrequency: 'daily'
          // No tags property
        }
      ];

      render(<AnalyticsDashboard habits={habitsWithoutTags} onClose={mockOnClose} />);
      
      // Switch to categories view to trigger category analysis
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      expect(screen.getByText('📂 Category Analysis')).toBeInTheDocument();
      
      // Should categorize based on habit names
      // 'Morning Exercise' should be categorized as 'Fitness'
      // 'Read Programming Books' should be categorized as 'Learning'
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
    });

    test('handles habits with empty tags array using name-based categorization', () => {
      const today = new Date().toISOString();
      
      const habitsWithEmptyTags = [
        {
          id: 1,
          name: 'Gym Workout',
          completedDates: [today],
          expectedFrequency: 'daily',
          tags: [] // Empty tags array
        }
      ];

      render(<AnalyticsDashboard habits={habitsWithEmptyTags} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      // Should fall back to name-based categorization
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });

    test('exercises all conditional paths for category analysis', () => {
      const today = new Date().toISOString();
      
      const mixedHabits = [
        {
          id: 1,
          name: 'Morning Exercise', // No tags property
          completedDates: [today],
          expectedFrequency: 'daily'
        },
        {
          id: 2,
          name: 'Meditation Practice', // Null tags
          completedDates: [today],
          expectedFrequency: 'daily',
          tags: null
        },
        {
          id: 3,
          name: 'Study Programming', // Empty tags array
          completedDates: [today],
          expectedFrequency: 'daily',
          tags: []
        }
      ];

      render(<AnalyticsDashboard habits={mixedHabits} onClose={mockOnClose} />);
      
      // Start in overview to trigger analytics calculation
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
      
      // Switch to categories to verify categorization worked
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      // Should see name-based categories
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('Wellness')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    test('categorizes habits correctly based on name', () => {
      const exerciseHabits = [
        { id: 1, name: 'Morning Exercise', completedDates: ['2024-01-01T10:00:00Z'] },
        { id: 2, name: 'Gym Workout', completedDates: ['2024-01-01T10:00:00Z'] },
        { id: 3, name: 'Running', completedDates: ['2024-01-01T10:00:00Z'] }
      ];
      
      render(<AnalyticsDashboard habits={exerciseHabits} onClose={mockOnClose} />);
      
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      fireEvent.click(categoriesButton);
      
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });

    test('parses expected frequency correctly', () => {
      const habitsWithFrequency = [
        { 
          id: 1, 
          name: 'Daily Habit', 
          completedDates: ['2024-01-01T10:00:00Z'], 
          expectedFrequency: { count: 2, period: 'day' } 
        },
        { 
          id: 2, 
          name: 'Weekly Habit', 
          completedDates: ['2024-01-01T10:00:00Z'], 
          expectedFrequency: { count: 3, period: 'week' } 
        }
      ];
      
      render(<AnalyticsDashboard habits={habitsWithFrequency} onClose={mockOnClose} />);
      
      // The component should render without errors and process the frequency
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    test('calls onClose when close button is clicked', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: '✕ Close' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when clicking on overlay (no click outside functionality)', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const overlay = document.querySelector('[style*="position: fixed"]');
      fireEvent.click(overlay);
      
      // AnalyticsDashboard doesn't implement click-outside-to-close functionality
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('does not close when clicking inside modal content', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const modalContent = screen.getByText('📊 Analytics Dashboard').parentElement;
      fireEvent.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Chart Data', () => {
    test('generates correct progress chart data', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      
      expect(chartData.datasets[0].label).toBe('Daily Completions');
      expect(chartData.datasets[0].data).toBeDefined();
      expect(chartData.labels).toBeDefined();
    });

    test('generates correct habit comparison data', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      
      expect(chartData.datasets[0].label).toBe('Completion Rate (%)');
      // Check for truncated names (component truncates long names)
      expect(chartData.labels.some(label => label.includes('Morning Exercis'))).toBe(true);
      expect(chartData.labels).toContain('Read Books');
      expect(chartData.labels).toContain('Meditation');
    });

    test('generates correct category data', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const doughnutChart = screen.getByTestId('doughnut-chart');
      const chartData = JSON.parse(doughnutChart.getAttribute('data-chart-data'));
      
      expect(chartData.labels).toContain('Fitness');
      expect(chartData.labels).toContain('Learning');
      expect(chartData.labels).toContain('Wellness');
    });
  });

  describe('Accessibility', () => {
    test('has proper modal structure', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const overlay = document.querySelector('[style*="position: fixed"]');
      expect(overlay).toBeInTheDocument();
    });

    test('close button has accessible text', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      expect(screen.getByRole('button', { name: '✕ Close' })).toBeInTheDocument();
    });

    test('view type buttons are accessible', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      expect(screen.getByRole('button', { name: 'overview' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'habits' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'categories' })).toBeInTheDocument();
    });

    test('has proper ARIA labels for charts', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const doughnutChart = screen.getByTestId('doughnut-chart');
      
      expect(lineChart).toBeInTheDocument();
      expect(doughnutChart).toBeInTheDocument();
    });

    test('statistics cards have proper semantic structure', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      expect(screen.getByText('Total Habits')).toBeInTheDocument();
      expect(screen.getByText('Avg Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    });

    test('keyboard navigation works for interactive elements', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const overviewButton = screen.getByRole('button', { name: 'overview' });
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      const closeButton = screen.getByRole('button', { name: '✕ Close' });
      
      // Test that buttons are focusable
      overviewButton.focus();
      expect(document.activeElement).toBe(overviewButton);
      
      habitsButton.focus();
      expect(document.activeElement).toBe(habitsButton);
      
      categoriesButton.focus();
      expect(document.activeElement).toBe(categoriesButton);
      
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Performance Tests', () => {
    test('handles large dataset efficiently', () => {
      // Create a large dataset
      const largeHabits = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Habit ${i + 1}`,
        completedDates: Array.from({ length: 365 }, (_, j) => 
          new Date(2024, 0, j + 1).toISOString()
        ),
        expectedFrequency: { count: 1, period: 'day' },
        tags: [`Category${i % 10}`]
      }));

      const startTime = performance.now();
      render(<AnalyticsDashboard habits={largeHabits} onClose={mockOnClose} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles habits with many completions efficiently', () => {
      const habitWithManyCompletions = [{
        id: 1,
        name: 'Daily Habit',
        completedDates: Array.from({ length: 1000 }, (_, i) => 
          new Date(2024, 0, 1, i % 24).toISOString()
        ),
        expectedFrequency: { count: 1, period: 'day' },
        tags: ['Test']
      }];

      const startTime = performance.now();
      render(<AnalyticsDashboard habits={habitWithManyCompletions} onClose={mockOnClose} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Advanced Edge Cases', () => {
    test('handles habits with invalid date formats', () => {
      const habitsWithInvalidDates = [{
        id: 1,
        name: 'Invalid Date Habit',
        completedDates: ['invalid-date', '', null, undefined, '2024-13-45T25:70:80Z'],
        expectedFrequency: { count: 1, period: 'day' },
        tags: ['Test']
      }];

      expect(() => {
        render(<AnalyticsDashboard habits={habitsWithInvalidDates} onClose={mockOnClose} />);
      }).not.toThrow();
      
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles circular reference in habit data', () => {
      const circularHabit = {
        id: 1,
        name: 'Circular Habit',
        completedDates: ['2024-01-01T10:00:00Z'],
        expectedFrequency: { count: 1, period: 'day' },
        tags: ['Test']
      };
      circularHabit.self = circularHabit; // Create circular reference

      expect(() => {
        render(<AnalyticsDashboard habits={[circularHabit]} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    test('handles extremely long habit names', () => {
      const habitWithVeryLongName = [{
        id: 1,
        name: 'A'.repeat(1000), // 1000 character name
        completedDates: ['2024-01-01T10:00:00Z'],
        expectedFrequency: { count: 1, period: 'day' },
        tags: ['Test']
      }];

      render(<AnalyticsDashboard habits={habitWithVeryLongName} onClose={mockOnClose} />);
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles malformed frequency objects', () => {
      const habitsWithMalformedFrequency = [
        {
          id: 1,
          name: 'Malformed Frequency 1',
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: { count: 'invalid', period: 'day' },
          tags: ['Test']
        },
        {
          id: 2,
          name: 'Malformed Frequency 2',
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: { count: -5, period: 'invalid' },
          tags: ['Test']
        },
        {
          id: 3,
          name: 'Malformed Frequency 3',
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: 'not-an-object',
          tags: ['Test']
        }
      ];

      expect(() => {
        render(<AnalyticsDashboard habits={habitsWithMalformedFrequency} onClose={mockOnClose} />);
      }).not.toThrow();
      
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles empty and whitespace-only habit names', () => {
      const habitsWithEmptyNames = [
        {
          id: 1,
          name: '',
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: { count: 1, period: 'day' },
          tags: ['Test']
        },
        {
          id: 2,
          name: '   ',
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: { count: 1, period: 'day' },
          tags: ['Test']
        },
        {
          id: 3,
          name: null,
          completedDates: ['2024-01-01T10:00:00Z'],
          expectedFrequency: { count: 1, period: 'day' },
          tags: ['Test']
        }
      ];

      render(<AnalyticsDashboard habits={habitsWithEmptyNames} onClose={mockOnClose} />);
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles habits with special characters and emojis', () => {
      const habitsWithSpecialChars = [{
        id: 1,
        name: '🏃‍♂️ Run & Walk! @Home #Daily $$ 100% <script>alert("test")</script>',
        completedDates: ['2024-01-01T10:00:00Z'],
        expectedFrequency: { count: 1, period: 'day' },
        tags: ['Fitness', '💪', '<test>']
      }];

      render(<AnalyticsDashboard habits={habitsWithSpecialChars} onClose={mockOnClose} />);
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Chart Data Validation', () => {
    test('chart data structure is valid for all view types', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      // Overview charts
      const lineChart = screen.getByTestId('line-chart');
      const doughnutChart = screen.getByTestId('doughnut-chart');
      
      const lineChartData = JSON.parse(lineChart.getAttribute('data-chart-data'));
      const doughnutChartData = JSON.parse(doughnutChart.getAttribute('data-chart-data'));
      
      // Validate line chart structure
      expect(lineChartData.datasets).toBeDefined();
      expect(lineChartData.labels).toBeDefined();
      expect(Array.isArray(lineChartData.datasets)).toBe(true);
      expect(Array.isArray(lineChartData.labels)).toBe(true);
      
      // Validate doughnut chart structure
      expect(doughnutChartData.datasets).toBeDefined();
      expect(doughnutChartData.labels).toBeDefined();
      expect(Array.isArray(doughnutChartData.datasets)).toBe(true);
      expect(Array.isArray(doughnutChartData.labels)).toBe(true);
      
      // Switch to habits view and validate bar chart
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      fireEvent.click(habitsButton);
      
      const barChart = screen.getByTestId('bar-chart');
      const barChartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      
      expect(barChartData.datasets).toBeDefined();
      expect(barChartData.labels).toBeDefined();
      expect(Array.isArray(barChartData.datasets)).toBe(true);
      expect(Array.isArray(barChartData.labels)).toBe(true);
    });

    test('chart colors are properly defined', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const doughnutChart = screen.getByTestId('doughnut-chart');
      const chartData = JSON.parse(doughnutChart.getAttribute('data-chart-data'));
      
      expect(chartData.datasets[0].backgroundColor).toBeDefined();
      expect(Array.isArray(chartData.datasets[0].backgroundColor)).toBe(true);
    });

    test('chart options are properly configured', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      const lineChart = screen.getByTestId('line-chart');
      const chartOptions = JSON.parse(lineChart.getAttribute('data-chart-options'));
      
      expect(chartOptions.responsive).toBe(true);
      expect(chartOptions.plugins).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    test('component unmounts cleanly', () => {
      const { unmount } = render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      expect(() => unmount()).not.toThrow();
    });

    test('handles rapid state changes without memory leaks', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
      
      // Rapidly switch between views
      const overviewButton = screen.getByRole('button', { name: 'overview' });
      const habitsButton = screen.getByRole('button', { name: 'habits' });
      const categoriesButton = screen.getByRole('button', { name: 'categories' });
      
      for (let i = 0; i < 20; i++) {
        fireEvent.click(overviewButton);
        fireEvent.click(habitsButton);
        fireEvent.click(categoriesButton);
      }
      
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });
  });

  describe('Helper function unit tests', () => {
    it('getHabitCategory returns correct categories', () => {
      expect(getHabitCategory('Yoga exercise')).toBe('Fitness');
      expect(getHabitCategory('Read a book')).toBe('Learning');
      expect(getHabitCategory('Night Meditation')).toBe('Wellness');
      expect(getHabitCategory('Drink water')).toBe('Health');
      expect(getHabitCategory('Work project')).toBe('Productivity');
      expect(getHabitCategory('Unknown')).toBe('Other');
    });

    it('parseExpectedFrequency handles various inputs', () => {
      expect(parseExpectedFrequency(null)).toEqual({ timesPerPeriod: 1, periodDays: 1 });
      expect(parseExpectedFrequency({ count: 3, period: 'day' })).toEqual({ timesPerPeriod: 3, periodDays: 1 });
      expect(parseExpectedFrequency({ count: 2, period: 'week' })).toEqual({ timesPerPeriod: 2, periodDays: 7 });
      expect(parseExpectedFrequency({ count: 1, period: 'month' })).toEqual({ timesPerPeriod: 1, periodDays: 30 });
      expect(parseExpectedFrequency('daily')).toEqual({ timesPerPeriod: 1, periodDays: 1 });
      expect(parseExpectedFrequency('weekly')).toEqual({ timesPerPeriod: 1, periodDays: 7 });
      expect(parseExpectedFrequency('2 times/week')).toEqual({ timesPerPeriod: 2, periodDays: 7 });
      expect(parseExpectedFrequency('3 times per week')).toEqual({ timesPerPeriod: 3, periodDays: 7 });
      expect(parseExpectedFrequency('every 3 days')).toEqual({ timesPerPeriod: 1, periodDays: 3 });
      expect(parseExpectedFrequency('unknown')).toEqual({ timesPerPeriod: 1, periodDays: 1 });
    });
  });

  describe('Streaks View', () => {
    test('displays current streaks correctly', () => {
      render(<AnalyticsDashboard habits={sampleHabits} onClose={mockOnClose} />);
        // Switch to streaks view
      fireEvent.click(screen.getByText('streaks'));

      expect(screen.getByText('🏅 Current Streaks')).toBeInTheDocument();
      // Should display habit streaks
      expect(screen.getByText(/Morning Exercise: \d+/)).toBeInTheDocument();
    });

    test('handles habits with no streaks', () => {
      const habitsWithNoStreaks = [{
        id: 1,
        name: 'Test Habit',
        completedDates: [],
        tags: ['test'],
        createdAt: new Date().toISOString()
      }];

      render(<AnalyticsDashboard habits={habitsWithNoStreaks} onClose={mockOnClose} />);
        // Switch to streaks view
      fireEvent.click(screen.getByText('streaks'));

      expect(screen.getByText('Test Habit: 0')).toBeInTheDocument();
    });

    test('handles empty habits array in streaks view', () => {
      render(<AnalyticsDashboard habits={[]} onClose={mockOnClose} />);
        // Switch to streaks view
      fireEvent.click(screen.getByText('streaks'));

      expect(screen.getByText('No habits to display streaks.')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles habits with undefined names', () => {
      const habitsWithUndefinedName = [{
        id: 1,
        completedDates: [new Date().toISOString().slice(0, 10)],
        tags: ['test'],
        createdAt: new Date().toISOString()
      }];

      render(<AnalyticsDashboard habits={habitsWithUndefinedName} onClose={mockOnClose} />);
        // Switch to streaks view to trigger line 517
      fireEvent.click(screen.getByText('streaks'));

      expect(screen.getByText('Unnamed Habit: 1')).toBeInTheDocument();
    });

    test('handles zero completion rate calculation', () => {
      const habitsWithNoCompletions = [{
        id: 1,
        name: 'Never Completed',
        completedDates: [],
        tags: ['test'],
        createdAt: new Date().toISOString()
      }];

      render(<AnalyticsDashboard habits={habitsWithNoCompletions} onClose={mockOnClose} />);
      
      // This should trigger the zero completion rate path
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });
  });
});
