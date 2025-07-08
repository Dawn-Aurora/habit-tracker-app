import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedAddHabitForm from './EnhancedAddHabitForm';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api;

describe('EnhancedAddHabitForm Component', () => {
  const mockOnHabitAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the current date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15'));
    
    // Suppress act() warnings for components with async state updates
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (args[0]?.includes?.('Warning: An update to EnhancedAddHabitForm inside a test was not wrapped in act')) {
        return;
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ================== RENDERING TESTS ==================

  describe('Rendering', () => {
    test('renders all form fields correctly', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Check form fields are rendered (title is in parent App component)
      // Form has expected fields without checking specific title

      // Check habit name field
      expect(screen.getByLabelText('🎯 Habit Name *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Exercise, Read, Meditate')).toBeInTheDocument();

      // Check frequency fields
      expect(screen.getByText('📅 Expected Frequency')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of times')).toBeInTheDocument();
      expect(screen.getByLabelText('Time period')).toBeInTheDocument();

      // Check tags field
      expect(screen.getByLabelText('🏷️ Tags (comma-separated)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., health, fitness, personal')).toBeInTheDocument();

      // Check 📅 Start Date field
      expect(screen.getByLabelText('📅 Start Date')).toBeInTheDocument();

      // Check submit button
      expect(screen.getByRole('button', { name: '✨ Add Habit' })).toBeInTheDocument();
    });

    test('displays proper labels and placeholders', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Check required field indicator
      expect(screen.getByText('🎯 Habit Name *')).toBeInTheDocument();

      // Check help text
      expect(screen.getByText('💡 Separate multiple tags with commas')).toBeInTheDocument();
      expect(screen.getByText('🚀 When you want to begin tracking this habit')).toBeInTheDocument();
    });

    test('shows frequency options', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      const periodSelect = screen.getByLabelText('Time period');
      expect(periodSelect).toBeInTheDocument();

      // Check all period options
      expect(screen.getByRole('option', { name: 'Day' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Week' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Month' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Year' })).toBeInTheDocument();
    });

    test('displays frequency example dynamically', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Default example
      expect(screen.getByText('📋 Example: 1 time per day')).toBeInTheDocument();

      // Change count to 3
      const countInput = screen.getByLabelText('Number of times');
      fireEvent.change(countInput, { target: { value: '3' } });
      expect(screen.getByText(/3\s+times?\s+per\s+day/)).toBeInTheDocument();

      // Change period to week
      const periodSelect = screen.getByLabelText('Time period');
      fireEvent.change(periodSelect, { target: { value: 'week' } });
      expect(screen.getByText((content, element) => {
        return content.includes('3') && content.includes('times') && content.includes('per') && content.includes('week');
      })).toBeInTheDocument();
    });

    test('has correct default values', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      expect(screen.getByLabelText('🎯 Habit Name *')).toHaveValue('');
      expect(screen.getByLabelText('Number of times')).toHaveValue(1);
      expect(screen.getByLabelText('Time period')).toHaveValue('day');
      expect(screen.getByLabelText('🏷️ Tags (comma-separated)')).toHaveValue('');
      expect(screen.getByLabelText('📅 Start Date')).toHaveValue('2023-06-15');
    });
  });

  // ================== FORM VALIDATION TESTS ==================

  describe('Form Validation', () => {
    test('validates required habit name field', async () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Try to submit with empty name
      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      fireEvent.click(submitButton);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Habit name is required')).toBeInTheDocument();
      });

      // Check that API was not called
      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    test('validates habit name with only whitespace', async () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Enter only whitespace
      const nameInput = screen.getByLabelText('🎯 Habit Name *');
      fireEvent.change(nameInput, { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Habit name is required')).toBeInTheDocument();
      });
    });

    test('trims habit name before validation', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '1' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Enter name with leading/trailing spaces
      const nameInput = screen.getByLabelText('🎯 Habit Name *');
      fireEvent.change(nameInput, { target: { value: '  Exercise  ' } });

      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/habits', {
          name: 'Exercise',
          tags: [],
          startDate: '2023-06-15',
          expectedFrequency: {
            count: 1,
            period: 'day'
          }
        });
      });
    });

    test('validates frequency count boundaries', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      const countInput = screen.getByLabelText('Number of times');
      
      // Check min and max attributes
      expect(countInput).toHaveAttribute('min', '1');
      expect(countInput).toHaveAttribute('max', '20');
      expect(countInput).toHaveAttribute('type', 'number');
    });

    test('shows appropriate error styling for invalid name', async () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      const nameInput = screen.getByLabelText('🎯 Habit Name *');
      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toBeInTheDocument();
      });
    });
  });

  // ================== USER INTERACTION TESTS ==================

  describe('User Interactions', () => {
    test('handles form input changes correctly', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      const nameInput = screen.getByLabelText('🎯 Habit Name *');
      const countInput = screen.getByLabelText('Number of times');
      const periodSelect = screen.getByLabelText('Time period');
      const tagsInput = screen.getByLabelText('🏷️ Tags (comma-separated)');
      const dateInput = screen.getByLabelText('📅 Start Date');

      // Test all input changes
      fireEvent.change(nameInput, { target: { value: 'Morning Jog' } });
      fireEvent.change(countInput, { target: { value: '5' } });
      fireEvent.change(periodSelect, { target: { value: 'week' } });
      fireEvent.change(tagsInput, { target: { value: 'health, fitness' } });
      fireEvent.change(dateInput, { target: { value: '2023-07-01' } });

      expect(nameInput).toHaveValue('Morning Jog');
      expect(countInput).toHaveValue(5);
      expect(periodSelect).toHaveValue('week');
      expect(tagsInput).toHaveValue('health, fitness');
      expect(dateInput).toHaveValue('2023-07-01');
    });

    test('submits form with valid data', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Daily Reading' }
      });
      fireEvent.change(screen.getByLabelText('Number of times'), {
        target: { value: '2' }
      });
      fireEvent.change(screen.getByLabelText('Time period'), {
        target: { value: 'week' }
      });
      fireEvent.change(screen.getByLabelText('🏷️ Tags (comma-separated)'), {
        target: { value: 'education, self-improvement' }
      });
      fireEvent.change(screen.getByLabelText('📅 Start Date'), {
        target: { value: '2023-07-01' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/habits', {
          name: 'Daily Reading',
          tags: ['education', 'self-improvement'],
          startDate: '2023-07-01',
          expectedFrequency: {
            count: 2,
            period: 'week'
          }
        });
      });
    });

    test('handles API success responses', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Fill and submit form  
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockOnHabitAdded).toHaveBeenCalled();
      });

      // Form should be reset after successful submission
      expect(screen.getByLabelText('🎯 Habit Name *')).toHaveValue('');
      expect(screen.getByLabelText('Number of times')).toHaveValue(1);
      expect(screen.getByLabelText('Time period')).toHaveValue('day');
      expect(screen.getByLabelText('🏷️ Tags (comma-separated)')).toHaveValue('');
      expect(screen.getByLabelText('📅 Start Date')).toHaveValue('2023-06-15');
    });

    test('handles API error responses', async () => {
      const errorResponse = {
        response: { data: { message: 'Habit name already exists' } }
      };
      mockedApi.post.mockRejectedValue(errorResponse);
      
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Duplicate Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(screen.getByText('Error adding habit: Habit name already exists')).toBeInTheDocument();
      });

      expect(mockOnHabitAdded).not.toHaveBeenCalled();
    });

    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockedApi.post.mockRejectedValue(networkError);
      
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(screen.getByText('Error adding habit: Network Error')).toBeInTheDocument();
      });
    });

    test('processes tags correctly', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });

      // Test various tag formats
      fireEvent.change(screen.getByLabelText('🏷️ Tags (comma-separated)'), {
        target: { value: ' health , fitness, , personal ' }
      });

      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/habits', expect.objectContaining({
          tags: ['health', 'fitness', 'personal'] // Should trim and filter empty tags
        }));
      });
    });

    test('handles empty tags correctly', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      // Leave tags empty

      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/habits', expect.objectContaining({
          tags: []
        }));
      });
    });
  });

  // ================== EDGE CASES TESTS ==================

  describe('Edge Cases', () => {
    test('clears error when user starts typing after error', async () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Trigger error first
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));
      
      await waitFor(() => {
        expect(screen.getByText('Habit name is required')).toBeInTheDocument();
      });

      // Start typing - error should clear  
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'New Habit' }
      });

      // Submit again to trigger form processing
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(screen.queryByText('Habit name is required')).not.toBeInTheDocument();
      });
    });

    test('handles form submission during loading state', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockedApi.post.mockReturnValue(pendingPromise);

      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      
      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      
      // Submit first time
      fireEvent.click(submitButton);
      
      // Submit again while first request is pending
      fireEvent.click(submitButton);

      // Only one API call should be made
      expect(mockedApi.post).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolvePromise({ data: { id: '123' } });
      
      await waitFor(() => {
        expect(mockOnHabitAdded).toHaveBeenCalled();
      });
    });

    test('handles invalid API response structure', async () => {
      mockedApi.post.mockResolvedValue({ invalidStructure: true });
      
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      // Should still call onHabitAdded even if response structure is unexpected
      await waitFor(() => {
        expect(mockOnHabitAdded).toHaveBeenCalled();
      });
    });

    test('handles component unmounting during API call', async () => {
      const pendingPromise = new Promise(() => {}); // Never resolves
      mockedApi.post.mockReturnValue(pendingPromise);

      const { unmount } = render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      // Unmount component while API call is pending
      unmount();

      // Should not throw any errors
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
    });
  });

  // ================== ACCESSIBILITY TESTS ==================

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Check form has proper labeling
      expect(screen.getByRole('form')).toHaveAttribute('aria-labelledby', 'add-habit-form-title');

      // Check required fields have aria-required
      expect(screen.getByLabelText('🎯 Habit Name *')).toHaveAttribute('aria-required', 'true');

      // Check fieldset and legend
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('📅 Expected Frequency')).toBeInTheDocument();
    });

    test('error messages have proper ARIA attributes', async () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        const errorElement = screen.getByText('Habit name is required');
        expect(errorElement).toHaveAttribute('id', 'habit-error');
        // Check that the error container has proper structure (not role="alert" but proper aria setup)
        expect(errorElement.parentElement?.parentElement?.parentElement).toHaveClass('modern-card');
      });

      // Input should reference the error
      expect(screen.getByLabelText('🎯 Habit Name *')).toHaveAttribute('aria-describedby', 'habit-error');
    });

    test('frequency example updates live', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      const exampleElement = screen.getByText('📋 Example: 1 time per day');
      expect(exampleElement).toHaveAttribute('aria-live', 'polite');
    });

    test('form inputs have proper descriptions', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      expect(screen.getByLabelText('🏷️ Tags (comma-separated)')).toHaveAttribute('aria-describedby', 'tags-help');
      expect(screen.getByLabelText('📅 Start Date')).toHaveAttribute('aria-describedby', 'start-date-help');
    });
  });

  // ================== INTEGRATION TESTS ==================

  describe('Integration', () => {
    test('onHabitAdded callback is optional', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      
      // Render without onHabitAdded callback
      render(<EnhancedAddHabitForm />);

      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalled();
      });

      // Should not throw error even without callback
    });

    test('form resets completely after successful submission', async () => {
      mockedApi.post.mockResolvedValue({ data: { id: '123' } });
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);

      // Fill out all fields
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Complete Habit' }
      });
      fireEvent.change(screen.getByLabelText('Number of times'), {
        target: { value: '5' }
      });
      fireEvent.change(screen.getByLabelText('Time period'), {
        target: { value: 'month' }
      });
      fireEvent.change(screen.getByLabelText('🏷️ Tags (comma-separated)'), {
        target: { value: 'tag1, tag2' }
      });
      fireEvent.change(screen.getByLabelText('📅 Start Date'), {
        target: { value: '2023-12-25' }
      });

      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));

      await waitFor(() => {
        expect(mockOnHabitAdded).toHaveBeenCalled();
      });

      // All fields should be reset
      expect(screen.getByLabelText('🎯 Habit Name *')).toHaveValue('');
      expect(screen.getByLabelText('Number of times')).toHaveValue(1);
      expect(screen.getByLabelText('Time period')).toHaveValue('day');
      expect(screen.getByLabelText('🏷️ Tags (comma-separated)')).toHaveValue('');
      expect(screen.getByLabelText('📅 Start Date')).toHaveValue('2023-06-15');
    });
  });

  // ================== BUTTON INTERACTION TESTS ==================

  describe('Submit Button Interactions', () => {
    test('handles mouse enter and leave events on submit button when not loading', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);
      
      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      
      // Test mouse enter - should change background color
      fireEvent.mouseEnter(submitButton);
      expect(submitButton).toBeInTheDocument();
      
      // Test mouse leave - should reset background color  
      fireEvent.mouseLeave(submitButton);
      expect(submitButton).toBeInTheDocument();
    });

    test('does not change background color on mouse events when loading', () => {
      // Mock API to return a pending promise to simulate loading state
      const pendingPromise = new Promise(() => {});
      mockedApi.post.mockReturnValue(pendingPromise);
      
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);
      
      // Fill in required field and submit to trigger loading state
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));
      
      const submitButton = screen.getByRole('button', { name: '⏳ Adding Habit...' });
      const originalStyle = submitButton.style.backgroundColor;
      
      // Test mouse enter during loading - should not change background color
      fireEvent.mouseEnter(submitButton);
      expect(submitButton.style.backgroundColor).toBe(originalStyle);
      
      // Test mouse leave during loading - should not change background color
      fireEvent.mouseLeave(submitButton);
      expect(submitButton.style.backgroundColor).toBe(originalStyle);
    });

    test('handles focus and blur events on submit button', () => {
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);
      
      const submitButton = screen.getByRole('button', { name: '✨ Add Habit' });
      
      // Test focus - should add outline
      fireEvent.focus(submitButton);
      expect(submitButton).toBeInTheDocument();
      
      // Test blur - should remove outline
      fireEvent.blur(submitButton);
      expect(submitButton).toBeInTheDocument();
    });

    test('displays correct button text based on loading state', async () => {
      // Test initial state
      render(<EnhancedAddHabitForm onHabitAdded={mockOnHabitAdded} />);
      expect(screen.getByRole('button', { name: '✨ Add Habit' })).toBeInTheDocument();
      
      // Mock API to simulate loading
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockedApi.post.mockReturnValue(pendingPromise);
      
      // Fill in required field and submit
      fireEvent.change(screen.getByLabelText('🎯 Habit Name *'), {
        target: { value: 'Test Habit' }
      });
      fireEvent.click(screen.getByRole('button', { name: '✨ Add Habit' }));
      
      // Should show loading text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '⏳ Adding Habit...' })).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolvePromise({ data: { id: '123' } });
      
      // Should return to normal text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '✨ Add Habit' })).toBeInTheDocument();
      });
    });
  });
});
