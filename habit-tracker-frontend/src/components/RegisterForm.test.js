import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api;

describe('RegisterForm Component', () => {
  const mockOnRegisterSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ================== RENDERING TESTS ==================

  describe('Rendering', () => {
    test('renders registration form with all fields', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      expect(screen.getByText('✨ Join Habit Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText('📧 Email Address *')).toBeInTheDocument();
      expect(screen.getByLabelText('👤 First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('👤 Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    test('displays placeholders correctly', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter password (min 6 characters)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    test('shows switch to login section', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login here' })).toBeInTheDocument();
    });

    test('has correct input types', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      expect(screen.getByLabelText('📧 Email Address *')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('👤 First Name *')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('👤 Last Name *')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Password:')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirm Password:')).toHaveAttribute('type', 'password');
    });
  });

  // ================== FORM VALIDATION TESTS ==================

  describe('Form Validation', () => {
    test('validates all required fields', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Try to submit empty form
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
      });

      expect(mockedApi.post).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with invalid email
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('validates first name length', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with short first name
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'J' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    test('validates last name length', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with short last name
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'D' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    test('validates password length', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with short password
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: '123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: '123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    test('validates password confirmation matching', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with mismatched passwords
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'differentpassword' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    test('validates email format with various invalid formats', async () => {
      const invalidEmails = [
        'plainaddress',
        '@domain.com',
        'email@',
        'email@domain',
        'email..email@domain.com',
        'email@domain@domain.com'
      ];

      for (const invalidEmail of invalidEmails) {
        const { unmount } = render(
          <RegisterForm 
            onRegisterSuccess={mockOnRegisterSuccess}
            onSwitchToLogin={mockOnSwitchToLogin}
          />
        );

        fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
          target: { value: invalidEmail }
        });
        fireEvent.change(screen.getByLabelText('👤 First Name *'), {
          target: { value: 'John' }
        });
        fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
          target: { value: 'Doe' }
        });
        fireEvent.change(screen.getByLabelText('Password:'), {
          target: { value: 'password123' }
        });
        fireEvent.change(screen.getByLabelText('Confirm Password:'), {
          target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Register' }));

        await waitFor(() => {
          expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });

        // Cleanup for next iteration
        unmount();
      }
    });

    test('trims whitespace from names during validation', async () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with names that have whitespace
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: ' J ' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: ' D ' }
      });
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
      });
    });
  });

  // ================== USER INTERACTION TESTS ==================

  describe('User Interactions', () => {
    test('handles form input changes correctly', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      const emailInput = screen.getByLabelText('📧 Email Address *');
      const firstNameInput = screen.getByLabelText('👤 First Name *');
      const lastNameInput = screen.getByLabelText('👤 Last Name *');
      const passwordInput = screen.getByLabelText('Password:');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password:');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('john@example.com');
      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
    });

    test('handles successful registration', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: '123', email: 'john@example.com' }
        }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill valid form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123'
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });
      
      expect(mockOnRegisterSuccess).toHaveBeenCalledWith(mockResponse.data);
    });

    test('automatically switches to login after successful registration', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: '123', email: 'john@example.com' }
        }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit valid form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });

      // Fast-forward time to trigger auto-switch
      jest.advanceTimersByTime(2000);

      expect(mockOnSwitchToLogin).toHaveBeenCalled();
    });

    test('clears form after successful registration', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: '123', email: 'john@example.com' }
        }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });

      // Check that form is cleared
      expect(screen.getByLabelText('📧 Email Address *')).toHaveValue('');
      expect(screen.getByLabelText('👤 First Name *')).toHaveValue('');
      expect(screen.getByLabelText('👤 Last Name *')).toHaveValue('');
      expect(screen.getByLabelText('Password:')).toHaveValue('');
      expect(screen.getByLabelText('Confirm Password:')).toHaveValue('');
    });

    test('handles switch to login button click', () => {
      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Login here' }));

      expect(mockOnSwitchToLogin).toHaveBeenCalled();
    });
  });

  // ================== ERROR HANDLING TESTS ==================

  describe('Error Handling', () => {
    test('handles API error with message', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Email already exists' }
        }
      };
      mockedApi.post.mockRejectedValue(errorResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
    });

    test('handles 409 conflict error', async () => {
      const errorResponse = {
        response: { status: 409 }
      };
      mockedApi.post.mockRejectedValue(errorResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    test('handles network error', async () => {
      const networkError = {
        code: 'ERR_NETWORK'
      };
      mockedApi.post.mockRejectedValue(networkError);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Cannot connect to server. Please try again later.')).toBeInTheDocument();
      });
    });

    test('handles generic error', async () => {
      const genericError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(genericError);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('handles response without message', async () => {
      const mockResponse = {
        data: {} // No message property
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
    });
  });

  // ================== LOADING STATES TESTS ==================

  describe('Loading States', () => {
    test('shows loading state during registration', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockedApi.post.mockReturnValue(pendingPromise);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      // Check loading state
      expect(screen.getByRole('button', { name: 'Registering...' })).toBeDisabled();
      expect(screen.getByLabelText('📧 Email Address *')).toBeDisabled();
      expect(screen.getByLabelText('👤 First Name *')).toBeDisabled();
      expect(screen.getByLabelText('👤 Last Name *')).toBeDisabled();
      expect(screen.getByLabelText('Password:')).toBeDisabled();
      expect(screen.getByLabelText('Confirm Password:')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Login here' })).toBeDisabled();

      // Resolve the promise
      resolvePromise({ data: { message: 'Success' } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
      });
    });

    test('clears loading state after error', async () => {
      const errorResponse = {
        response: { data: { message: 'Email already exists' } }
      };
      mockedApi.post.mockRejectedValue(errorResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Check that loading state is cleared
      expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
      expect(screen.getByLabelText('📧 Email Address *')).not.toBeDisabled();
    });
  });

  // ================== EDGE CASES TESTS ==================

  describe('Edge Cases', () => {
    test('handles multiple rapid submissions', async () => {
      const mockResponse = {
        data: { message: 'User registered successfully' }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      // Submit multiple times rapidly
      const submitButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });

      // Should only be called once due to loading state
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
    });

    test('trims whitespace from email and names in submission', async () => {
      const mockResponse = {
        data: { message: 'User registered successfully' }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill form with whitespace
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: '  john@example.com  ' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: '  John  ' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: '  Doe  ' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123'
        });
      });
    });

    test('clears error and success messages on new submission', async () => {
      const errorResponse = {
        response: { data: { message: 'Email already exists' } }
      };
      mockedApi.post.mockRejectedValue(errorResponse);

      render(
        <RegisterForm 
          onRegisterSuccess={mockOnRegisterSuccess}
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form to get error
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      // Now mock success and submit again
      const successResponse = {
        data: { message: 'User registered successfully' }
      };
      mockedApi.post.mockResolvedValue(successResponse);

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });
    });
  });

  // ================== INTEGRATION TESTS ==================

  describe('Integration', () => {
    test('onRegisterSuccess callback is optional', async () => {
      const mockResponse = {
        data: { message: 'User registered successfully' }
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      // Render without onRegisterSuccess callback
      render(
        <RegisterForm 
          onSwitchToLogin={mockOnSwitchToLogin}
        />
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('👤 First Name *'), {
        target: { value: 'John' }
      });
      fireEvent.change(screen.getByLabelText('👤 Last Name *'), {
        target: { value: 'Doe' }
      });
      fireEvent.change(screen.getByLabelText('Password:'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password:'), {
        target: { value: 'password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(screen.getByText('Registration successful! You can now login with your credentials.')).toBeInTheDocument();
      });

      // Should not throw error
    });

    test('onSwitchToLogin callback is required for login button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: 'Login here' })).toBeInTheDocument();
      
      // Should not throw error when clicked without callback
      fireEvent.click(screen.getByRole('button', { name: 'Login here' }));
    });
  });
});
