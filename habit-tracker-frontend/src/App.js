import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import EnhancedAddHabitForm from './components/EnhancedAddHabitForm';
import EnhancedHabitItem from './components/EnhancedHabitItem';
import EditHabitForm from './components/EditHabitForm';
import AddNoteForm from './components/AddNoteForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IndividualHabitAnalytics from './components/IndividualHabitAnalytics';
import api from './api';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  
  // Existing habit management state
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [addingNoteHabit, setAddingNoteHabit] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showIndividualAnalytics, setShowIndividualAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Check for existing authentication on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthToken(storedToken);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Authentication handlers
  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setError('');
    // Server status should be connected if login succeeded
    setServerStatus('connected');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    setHabits([]);
    setError('');
  };

  const handleRegisterSuccess = (data) => {
    // Registration successful - switch to login
    setShowRegister(false);
  };

  // Function to check server connection
  const checkServerConnection = useCallback(() => {
    setServerStatus('checking');
    setError('');
    
    api.get('/')
      .then((response) => {
        setServerStatus('connected');
      })
      .catch((err) => {
        if (err.code === 'ERR_NETWORK') {
          // Network error - server might be down or CORS issue
        }
        if (err.response) {
          // Server responded with status error
        }
        setServerStatus('disconnected');
        setError('Cannot connect to the server. Please make sure the backend is running.');
      });
  }, []);

  // Check if server is available on component mount
  useEffect(() => {
    checkServerConnection();
  }, [checkServerConnection]);

  const fetchHabits = useCallback(() => {
    if (serverStatus !== 'connected' || !authToken) {
      if (!authToken) {
        // User not authenticated - this is normal, don't show error
        setLoading(false);
        return;
      }
      setError('Cannot connect to the server. Please make sure the backend is running.');
      setLoading(false);
      return;
    }
    
    console.log('Fetching habits...'); // Debug log
    setLoading(true);
    api.get('/habits')
      .then(res => {
        console.log('Fetched habits response:', res.data); // Debug log
        if (res.data && res.data.data) {
          setHabits(res.data.data);
          setError(''); // Clear any error messages on success
          console.log('Updated habits state:', res.data.data); // Debug log
        } else {
          setError('Received invalid data from server');
        }
      })
      .catch((error) => {
        console.error('Error fetching habits:', error); // Debug log
        if (error.response && error.response.status === 401) {
          // Authentication error - will be handled by axios interceptor
          setError('Session expired. Please log in again.');
        } else if (error.code === 'ERR_NETWORK') {
          setError('Network error - cannot connect to the server. Please make sure the backend is running.');
        } else {
          setError(`Failed to load habits: ${error.message || 'Unknown error'}`);
        }
      })
      .finally(() => setLoading(false));
  }, [serverStatus, authToken]);

  useEffect(() => {
    if (serverStatus === 'connected' && authToken) {
      fetchHabits();
    }
  }, [serverStatus, authToken, fetchHabits]);

  const handleAdd = () => fetchHabits();
  const handleEdit = (habit) => setEditingHabit(habit);
  const handleUpdate = () => {
    setEditingHabit(null);
    fetchHabits();
  };
  const handleDelete = (id) => {
    api.delete(`/habits/${id}`)
      .then(fetchHabits)
      .catch((error) => {
        setError('Failed to delete habit: ' + (error.message || 'Unknown error'));
      });
  };

  // Add note to habit
  const handleAddNote = (habit) => {
    setAddingNoteHabit(habit);
  };

  const handleNoteAdded = () => {
    setAddingNoteHabit(null);
    fetchHabits();
  };

  // Handle completion changes from enhanced UI
  const handleCompletionChange = async (habitId, newCount) => {
    console.log(`Habit ${habitId} completion count changed to ${newCount}`);
    // Refresh habits data to update analytics dashboard
    await fetchHabits();
  };

  // Handle individual habit analytics
  const handleViewAnalytics = (habit) => {
    // Show individual habit analytics modal
    setShowIndividualAnalytics(habit);
  };

  // If loading initial auth check, show loading
  if (loading && !user && !authToken) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Habit Tracker</h1>
          <div>Loading...</div>
        </header>
      </div>
    );
  }

  // If not authenticated, show login/register forms
  if (!user || !authToken) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Habit Tracker</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Your personal habit tracking companion
          </p>
          
          {serverStatus === 'disconnected' && (
            <div>
              <div style={{color: 'red', marginBottom: '10px'}}>
                Cannot connect to server. Please try again later.
              </div>
              <button 
                onClick={checkServerConnection} 
                style={{padding: '8px 16px', margin: '5px', cursor: 'pointer'}}
              >
                Retry Connection
              </button>
            </div>
          )}

          {serverStatus === 'connected' && (
            <>
              {showRegister ? (
                <RegisterForm 
                  onRegisterSuccess={handleRegisterSuccess}
                  onSwitchToLogin={() => setShowRegister(false)}
                />
              ) : (
                <LoginForm 
                  onLoginSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setShowRegister(true)}
                />
              )}
            </>
          )}

          {serverStatus === 'checking' && (
            <div style={{ margin: '20px 0' }}>
              Connecting to server...
            </div>
          )}
        </header>
      </div>
    );
  }

  // Authenticated user - show main application
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Habit Tracker</h1>
        
        {/* User info and logout */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          color: '#333'
        }}>
          <span>Welcome, {user.firstName} {user.lastName}!</span>
          <button 
            onClick={handleLogout}
            style={{
              marginLeft: '15px',
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
          <button 
            onClick={() => setShowAnalytics(true)}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            📊 Analytics
          </button>
        </div>

        {error && (
          <div>
            <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>
            <button 
              onClick={checkServerConnection} 
              style={{padding: '8px 16px', margin: '5px', cursor: 'pointer'}}
            >
              Reconnect to Server
            </button>
          </div>
        )}
        
        
        <EnhancedAddHabitForm onHabitAdded={handleAdd} />
        
        {loading ? (
          <div>Loading habits...</div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {habits.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No habits yet!</h3>
                <p style={{ margin: 0 }}>Create your first habit above to get started on your journey.</p>
              </div>
            ) : (
              habits.map(habit => (
                <EnhancedHabitItem
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddNote={handleAddNote}
                  onCompletionChange={handleCompletionChange}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))
            )}
          </div>
        )}
        {editingHabit && (
          <EditHabitForm
            habit={editingHabit}
            onHabitUpdated={handleUpdate}
          />
        )}
        {addingNoteHabit && (
          <AddNoteForm
            habit={addingNoteHabit}
            onNoteAdded={handleNoteAdded}
            onCancel={() => setAddingNoteHabit(null)}
          />
        )}
        {showAnalytics && (
          <AnalyticsDashboard
            habits={habits}
            onClose={() => setShowAnalytics(false)}
          />
        )}
        {showIndividualAnalytics && (
          <IndividualHabitAnalytics
            habit={showIndividualAnalytics}
            onClose={() => setShowIndividualAnalytics(null)}
          />
        )}
      </header>
    </div>
  );
}

export default App;
