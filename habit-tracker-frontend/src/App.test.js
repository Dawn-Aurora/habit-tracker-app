import React from 'react';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import api from './api';

// Mock the api module
jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock child components that might be complex
jest.mock('./components/EnhancedAddHabitForm', () => {
  return function MockAddHabitForm({ onHabitAdded }) {
    return (
      <div data-testid="add-habit-form">
        <button onClick={onHabitAdded}>Add Habit</button>
      </div>
    );
  };
});

jest.mock('./components/EnhancedHabitItem', () => {
  return function MockHabitItem({ habit, onEdit, onDelete, onAddNote, onCompletionChange, onViewAnalytics }) {
    return (
      <div data-testid={`habit-item-${habit.id}`}>
        <span>{habit.name}</span>
        <button onClick={() => onEdit(habit)}>Edit</button>
        <button onClick={() => onDelete(habit.id)}>Delete</button>
        <button onClick={() => onAddNote(habit)}>Add Note</button>
        <button onClick={() => onCompletionChange(habit.id, 1)}>Complete</button>
        <button onClick={() => onViewAnalytics(habit)}>Analytics</button>
      </div>
    );
  };
});

jest.mock('./components/EditHabitForm', () => {
  return function MockEditHabitForm({ habit, onHabitUpdated }) {
    return (
      <div data-testid="edit-habit-form">
        <span>Editing: {habit.name}</span>
        <button onClick={onHabitUpdated}>Update</button>
      </div>
    );
  };
});

jest.mock('./components/AddNoteForm', () => {
  return function MockAddNoteForm({ habit, onNoteAdded, onCancel }) {
    return (
      <div data-testid="add-note-form">
        <span>Adding note to: {habit.name}</span>
        <button onClick={onNoteAdded}>Add Note</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('./components/LoginForm', () => {
  return function MockLoginForm({ onLoginSuccess, onSwitchToRegister }) {
    return (
      <div data-testid="login-form">
        <button onClick={() => onLoginSuccess({ firstName: 'John', lastName: 'Doe' }, 'test-token')}>
          Login
        </button>
        <button onClick={onSwitchToRegister}>Switch to Register</button>
      </div>
    );
  };
});

jest.mock('./components/RegisterForm', () => {
  return function MockRegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
    return (
      <div data-testid="register-form">
        <button onClick={() => onRegisterSuccess({ message: 'Success' })}>Register</button>
        <button onClick={onSwitchToLogin}>Switch to Login</button>
      </div>
    );
  };
});

jest.mock('./components/AnalyticsDashboard', () => {
  return function MockAnalyticsDashboard({ habits, onClose }) {
    return (
      <div data-testid="analytics-dashboard">
        <span>Analytics for {habits.length} habits</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('./components/IndividualHabitAnalytics', () => {
  return function MockIndividualHabitAnalytics({ habit, onClose }) {
    return (
      <div data-testid="individual-analytics">
        <span>Analytics for: {habit.name}</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Default API responses
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: {} });
    api.put.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
  });

  test('renders habit tracker title', async () => {
    await act(async () => {
      render(<App />);
    });
    const title = screen.getByRole('heading', { name: /habit tracker/i, level: 1 });
    expect(title).toBeInTheDocument();
  });

  test('shows loading state initially', async () => {
    // Make API call hang to test loading state
    api.get.mockImplementation(() => new Promise(() => {}));
    
    render(<App />);
    
    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
  });

  test('loads existing authentication from localStorage', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome.*John.*Doe/)).toBeInTheDocument();
    });
  });

  test('handles invalid stored user data', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return 'invalid-json';
      return null;
    });

    await act(async () => {
      render(<App />);
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('shows login form when not authenticated', async () => {
    api.get.mockResolvedValue({ data: 'Server OK' });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome.*John.*Doe/)).toBeInTheDocument();
    });
  });

  test('switches between login and register forms', async () => {
    api.get.mockResolvedValue({ data: 'Server OK' });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    // Switch to register
    const switchToRegisterButton = screen.getByText('Switch to Register');
    await act(async () => {
      fireEvent.click(switchToRegisterButton);
    });

    expect(screen.getByTestId('register-form')).toBeInTheDocument();

    // Switch back to login
    const switchToLoginButton = screen.getByText('Switch to Login');
    await act(async () => {
      fireEvent.click(switchToLoginButton);
    });

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    api.get.mockResolvedValue({ data: 'Server OK' });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    // Switch to register
    const switchToRegisterButton = screen.getByText('Switch to Register');
    await act(async () => {
      fireEvent.click(switchToRegisterButton);
    });

    // Register
    const registerButton = screen.getByText('Register');
    await act(async () => {
      fireEvent.click(registerButton);
    });

    // Should switch back to login form
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('shows server disconnected state and allows retry', async () => {
    api.get.mockRejectedValue({ code: 'ERR_NETWORK' });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Cannot connect to server. Please try again later.')).toBeInTheDocument();
    });

    // Test retry connection
    const retryButton = screen.getByText('🔄 Retry Connection');
    await act(async () => {
      fireEvent.click(retryButton);
    });

    expect(api.get).toHaveBeenCalledWith('/');
  });

  test('shows checking server status', async () => {
    // Make API call hang to test loading state
    api.get.mockImplementation(() => new Promise(() => {}));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
    });
  });

  test('handles logout', async () => {
    // Setup authenticated state
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome.*John.*Doe/)).toBeInTheDocument();
    });

    // Click logout
    const logoutButton = screen.getByText('👋 Logout');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('fetches habits when authenticated', async () => {
    const mockHabits = [
      { id: 1, name: 'Exercise', frequency: 'daily' },
      { id: 2, name: 'Read', frequency: 'weekly' }
    ];

    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('habit-item-2')).toBeInTheDocument();
    });
  });

  test('shows empty state when no habits', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No habits yet!')).toBeInTheDocument();
      expect(screen.getByText('Create your first habit above to start your journey to better habits.')).toBeInTheDocument();
    });
  });

  test('handles habit deletion', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });
    api.delete.mockResolvedValue({ data: {} });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(api.delete).toHaveBeenCalledWith('/habits/1');
  });

  test('handles habit deletion error', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });
    api.delete.mockRejectedValue(new Error('Delete failed'));

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete habit/)).toBeInTheDocument();
    });
  });

  test('opens and closes edit habit form', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    // Open edit form
    const editButton = screen.getByText('Edit');
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(screen.getByTestId('edit-habit-form')).toBeInTheDocument();
    expect(screen.getByText('Editing: Exercise')).toBeInTheDocument();

    // Close edit form by updating
    const updateButton = screen.getByText('Update');
    await act(async () => {
      fireEvent.click(updateButton);
    });

    expect(screen.queryByTestId('edit-habit-form')).not.toBeInTheDocument();
  });

  test('opens and closes add note form', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    // Open add note form
    const addNoteButton = screen.getByText('Add Note');
    await act(async () => {
      fireEvent.click(addNoteButton);
    });

    expect(screen.getByTestId('add-note-form')).toBeInTheDocument();
    expect(screen.getByText('Adding note to: Exercise')).toBeInTheDocument();

    // Close by cancel
    const cancelButton = screen.getByText('Cancel');
    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByTestId('add-note-form')).not.toBeInTheDocument();

    // Test closing by adding note
    await act(async () => {
      fireEvent.click(addNoteButton);
    });

    const addNoteSubmitButton = within(screen.getByTestId('add-note-form')).getByText('Add Note');
    await act(async () => {
      fireEvent.click(addNoteSubmitButton);
    });

    expect(screen.queryByTestId('add-note-form')).not.toBeInTheDocument();
  });

  test('opens and closes analytics dashboard', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    });

    // Open analytics
    const analyticsButton = screen.getByText('📊 Analytics');
    await act(async () => {
      fireEvent.click(analyticsButton);
    });

    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();

    // Close analytics
    const closeButton = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByTestId('analytics-dashboard')).not.toBeInTheDocument();
  });

  test('opens and closes individual habit analytics', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    // Open individual analytics
    const analyticsButton = screen.getByText('Analytics');
    await act(async () => {
      fireEvent.click(analyticsButton);
    });

    expect(screen.getByTestId('individual-analytics')).toBeInTheDocument();
    expect(screen.getByText('Analytics for: Exercise')).toBeInTheDocument();

    // Close individual analytics
    const closeButton = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByTestId('individual-analytics')).not.toBeInTheDocument();
  });

  test('handles completion change', async () => {
    const mockHabits = [{ id: 1, name: 'Exercise', frequency: 'daily' }];
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: mockHabits } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('habit-item-1')).toBeInTheDocument();
    });

    const completeButton = screen.getByText('Complete');
    await act(async () => {
      fireEvent.click(completeButton);
    });

    // Should trigger fetchHabits again
    expect(api.get).toHaveBeenCalledWith('/habits');
  });

  test('handles habit addition', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('add-habit-form')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Habit');
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Should trigger fetchHabits
    expect(api.get).toHaveBeenCalledWith('/habits');
  });

  test('handles fetch habits errors - authentication error', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.reject({ response: { status: 401 } });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Session expired. Please log in again.')).toBeInTheDocument();
    });
  });

  test('handles fetch habits errors - network error', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.reject({ code: 'ERR_NETWORK' });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Network error - cannot connect to the server/)).toBeInTheDocument();
    });
  });

  test('handles fetch habits errors - invalid data', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.resolve({ data: null });
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Received invalid data from server')).toBeInTheDocument();
    });
  });

  test('handles fetch habits errors - general error', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.reject(new Error('Server error'));
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load habits: Server error')).toBeInTheDocument();
    });
  });

  test('shows reconnect button on error and allows retry', async () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'stored-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    api.get.mockImplementation((url) => {
      if (url === '/') return Promise.resolve({ data: 'Server OK' });
      if (url === '/habits') return Promise.reject(new Error('Server error'));
      return Promise.resolve({ data: [] });
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('🔄 Reconnect')).toBeInTheDocument();
    });

    const reconnectButton = screen.getByText('🔄 Reconnect');
    await act(async () => {
      fireEvent.click(reconnectButton);
    });

    expect(api.get).toHaveBeenCalledWith('/');
  });

  test('handles server status errors with response', async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Cannot connect to server. Please try again later.')).toBeInTheDocument();
    });
  });
});
