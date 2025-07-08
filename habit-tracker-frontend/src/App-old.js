import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/modern-theme.css';
import './styles/components.css';
import './styles/layout.css';
import HabitCard from './components/HabitCard';
import AddHabitForm from './components/AddHabitForm';
import EditHabitForm from './components/EditHabitForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StatsCard from './components/StatsCard';
import api from './api';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  
  // App state
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing authentication on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthToken(storedToken);
        setUser(parsedUser);
        loadHabits();
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Load habits from API
  const loadHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError('Failed to load habits');
    }
  };

  // Authentication handlers
  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setError('');
    loadHabits();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthToken(null);
    setHabits([]);
    setError('');
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  // Habit management handlers
  const handleAddHabit = async (habitData) => {
    try {
      const response = await api.post('/habits', habitData);
      setHabits([...habits, response.data]);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding habit:', err);
      setError('Failed to add habit');
    }
  };

  const handleCompleteHabit = async (habitId) => {
    try {
      await api.post(`/habits/${habitId}/complete`);
      loadHabits(); // Refresh habits
    } catch (err) {
      console.error('Error completing habit:', err);
      setError('Failed to complete habit');
    }
  };

  const handleEditHabit = async (habitId, habitData) => {
    try {
      const response = await api.put(`/habits/${habitId}`, habitData);
      setHabits(habits.map(habit => 
        habit.id === habitId ? response.data : habit
      ));
      setEditingHabit(null);
    } catch (err) {
      console.error('Error editing habit:', err);
      setError('Failed to edit habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await api.delete(`/habits/${habitId}`);
        setHabits(habits.filter(habit => habit.id !== habitId));
      } catch (err) {
        console.error('Error deleting habit:', err);
        setError('Failed to delete habit');
      }
    }
  };

  // Calculate stats
  const stats = {
    totalHabits: habits.length,
    completedToday: habits.filter(habit => habit.completed).length,
    successRate: habits.length > 0 ? 
      Math.round((habits.filter(habit => habit.completed).length / habits.length) * 100) : 0,
    currentStreak: 0 // This would need backend support for proper calculation
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Show authentication forms if user is not logged in
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🎯 Habit Tracker</h1>
            <p>Build better habits, one day at a time</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
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
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎯 Habit Tracker</h1>
            <p>Welcome back, {user.name || user.email}!</p>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {error && <div className="error-message">{error}</div>}
          
          {/* Stats Section */}
          <section className="stats-section">
            <div className="stats-grid">
              <StatsCard
                title="Total Habits"
                value={stats.totalHabits}
                icon="📊"
              />
              <StatsCard
                title="Completed Today"
                value={stats.completedToday}
                icon="✅"
              />
              <StatsCard
                title="Success Rate"
                value={`${stats.successRate}%`}
                icon="📈"
              />
              <StatsCard
                title="Current Streak"
                value={stats.currentStreak}
                icon="🔥"
              />
            </div>
          </section>

          {/* Add Habit Section */}
          <section className="add-habit-section">
            <div className="section-header">
              <h2>Add New Habit</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancel' : '+ Add Habit'}
              </button>
            </div>
            
            {showAddForm && (
              <AddHabitForm
                onAddHabit={handleAddHabit}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </section>

          {/* Habits Section */}
          <section className="habits-section">
            <div className="section-header">
              <h2>Your Habits</h2>
            </div>
            
            {habits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <h3>No habits yet</h3>
                <p>Start building better habits by adding your first one!</p>
              </div>
            ) : (
              <div className="habits-grid">
                {habits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleCompleteHabit}
                    onEdit={setEditingHabit}
                    onDelete={handleDeleteHabit}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditHabitForm
              habit={editingHabit}
              onEditHabit={handleEditHabit}
              onCancel={() => setEditingHabit(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
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
      <div className="modern-app">
        <div className="modern-container">
          <div className="modern-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1>🎯 Habit Tracker</h1>
            <p>Your personal habit tracking companion</p>
          </div>
          <div className="modern-content modern-text-center">
            <div className="modern-card">
              <div className="modern-card-body">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading your habit tracker...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/register forms
  if (!user || !authToken) {
    return (
      <div className="modern-app">
        <div className="modern-container">
          <div className="modern-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1>🎯 Habit Tracker</h1>
            <p>Your personal habit tracking companion</p>
          </div>
          
          <div className="modern-content">
            {serverStatus === 'disconnected' && (
              <div className="modern-card modern-fade-in" style={{ marginBottom: 'var(--space-6)', border: '2px solid var(--error-color)' }}>
                <div className="modern-card-body modern-text-center">
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                  <h3 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Connection Error</h3>
                  <p style={{ marginBottom: '1.5rem' }}>Cannot connect to server. Please try again later.</p>
                  <button 
                    onClick={checkServerConnection} 
                    className="modern-btn modern-btn-primary"
                  >
                    🔄 Retry Connection
                  </button>
                </div>
              </div>
            )}

            {serverStatus === 'connected' && (
              <div className="modern-form modern-fade-in">
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
              </div>
            )}

            {serverStatus === 'checking' && (
              <div className="modern-card">
                <div className="modern-card-body modern-text-center">
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                  <p>Connecting to server...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - show main application
  return (
    <div className="modern-app">
      <div className="modern-container">
        <div className="modern-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1>🎯 Habit Tracker</h1>
          
          {/* User info and controls */}
          <div className="modern-card" style={{ 
            marginTop: 'var(--space-6)', 
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="modern-card-body" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)'
            }}>
              <span style={{ color: 'var(--white)', fontWeight: '500' }}>
                Welcome back, {user.firstName} {user.lastName}! 👋
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button 
                  onClick={() => setShowAnalytics(true)}
                  className="modern-btn modern-btn-ghost"
                  style={{ 
                    color: 'var(--white)', 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  📊 Analytics
                </button>
                <button 
                  onClick={handleLogout}
                  className="modern-btn"
                  style={{ 
                    background: 'var(--error-color)', 
                    color: 'var(--white)' 
                  }}
                >
                  👋 Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-content">
          {error && (
            <div className="modern-card modern-fade-in" style={{ 
              marginBottom: 'var(--space-6)', 
              border: '2px solid var(--error-color)',
              background: '#ffebee'
            }}>
              <div className="modern-card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: 'var(--error-color)', fontWeight: '500' }}>{error}</p>
                  </div>
                  <button 
                    onClick={checkServerConnection} 
                    className="modern-btn modern-btn-sm modern-btn-primary"
                  >
                    🔄 Reconnect
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Add Habit Form */}
          <div className="modern-card modern-mb-8">
            <div className="modern-card-header">
              <h2 className="modern-card-title">✨ Create New Habit</h2>
            </div>
            <div className="modern-card-body">
              <EnhancedAddHabitForm onHabitAdded={handleAdd} />
            </div>
          </div>
          
          {/* Habits List */}
          {loading ? (
            <div className="modern-card">
              <div className="modern-card-body modern-text-center">
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading your habits...</p>
              </div>
            </div>
          ) : (
            <div className="modern-card">
              <div className="modern-card-header">
                <h2 className="modern-card-title">
                  📋 Your Habits {habits.length > 0 && `(${habits.length})`}
                </h2>
              </div>
              <div className="modern-card-body">
                {habits.length === 0 ? (
                  <div className="modern-text-center" style={{
                    padding: 'var(--space-12) var(--space-6)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--gray-300)'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎯</div>
                    <h3 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--gray-600)' }}>
                      No habits yet!
                    </h3>
                    <p style={{ margin: 0, color: 'var(--gray-500)' }}>
                      Create your first habit above to start your journey to better habits.
                    </p>
                  </div>
                ) : (
                  <div className="modern-grid" style={{ gap: 'var(--space-4)' }}>
                    {habits.map(habit => (
                      <EnhancedHabitItem
                        key={habit.id}
                        habit={habit}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddNote={handleAddNote}
                        onCompletionChange={handleCompletionChange}
                        onViewAnalytics={handleViewAnalytics}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
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
    </div>
  );
}

export default App;
