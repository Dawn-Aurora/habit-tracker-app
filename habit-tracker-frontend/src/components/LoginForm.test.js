import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api;

describe('LoginForm Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form', () => {
    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    expect(screen.getByText('🔐 Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('📧 Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('🔒 Password *')).toBeInTheDocument();  
    expect(screen.getByRole('button', { name: '🚀 Login' })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockResponse = {
      data: {
        user: { id: '1', email: 'test@example.com', firstName: 'Test' },
        token: 'mock-token'
      }
    };
    mockedApi.post.mockResolvedValue(mockResponse);

    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('🔒 Password *'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Wait for localStorage to be set after successful login
    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-token');
    });
    
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data.user));
    expect(mockOnLogin).toHaveBeenCalledWith(mockResponse.data.user, 'mock-token');
  });

  test('handles login error', async () => {
    const mockError = {
      response: {
        data: { message: 'Invalid credentials' }
      }
    };
    mockedApi.post.mockRejectedValue(mockError);

    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('🔒 Password *'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    // Should not make API call
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  test('shows loading state during submission', async () => {
    // Mock a slow API call
    mockedApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('🔒 Password *'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    // Check that inputs are disabled during loading
    expect(screen.getByLabelText('📧 Email Address *')).toBeDisabled();
    expect(screen.getByLabelText('🔒 Password *')).toBeDisabled();
  });

  test('handles network error gracefully', async () => {
    const mockError = { code: 'ERR_NETWORK' };
    mockedApi.post.mockRejectedValue(mockError);

    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('🔒 Password *'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    await waitFor(() => {
      expect(screen.getByText('Cannot connect to server. Please try again later.')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<LoginForm onLoginSuccess={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText('📧 Email Address *'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.change(screen.getByLabelText('🔒 Password *'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: '🚀 Login' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    expect(mockedApi.post).not.toHaveBeenCalled();
  });
});
