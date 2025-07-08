import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/modern-theme.css';
import './styles/components.css';
import './styles/layout.css';
import EnhancedHabitList from './components/EnhancedHabitList';
import EnhancedAddHabitForm from './components/EnhancedAddHabitForm';
import EditHabitForm from './components/EditHabitForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StatsCard from './components/StatsCard';
import MetricsView from './components/MetricsView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AddNoteModal from './components/AddNoteModal';
import api from './api';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  
  // App state
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteHabit, setNoteHabit] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scroll-to-top button state
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Load habits from API
  const loadHabits = async () => {
    try {
      const response = await api.get('/habits');
      
      // Handle different response structures
      let habits = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        habits = response.data.data; // API returns {status: 'success', data: [...]}
      } else if (Array.isArray(response.data)) {
        habits = response.data; // API returns [...] directly
      }
      
      setHabits(habits);
    } catch (err) {
      console.error('App.js - Error loading habits:', err);
      setError('Failed to load habits');
      setHabits([]); // Ensure habits is always an array
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
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

  // Scroll-to-top button effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300); // Show after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Authentication handlers
  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setError('');
    loadHabits();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setHabits([]);
    setError('');
  };

  const handleRegisterSuccess = (userData, token) => {
    // Store user data but don't immediately log them in
    // Instead, show a success message and redirect to login
    setError('');
    setShowRegister(false);
    
    // You could add a success message here if needed
    // For now, just go back to login form
  };

  // Habit management handlers
  const handleAddHabit = async (habitData) => {
    try {
      const response = await api.post('/habits', habitData);
      
      // Handle different response structures
      let newHabit = response.data;
      if (response.data && response.data.data) {
        newHabit = response.data.data; // API returns {status: 'success', data: {...}}
      }
      
      setHabits(prevHabits => {
        const updatedHabits = [...prevHabits, newHabit];
        return updatedHabits;
      });
      setShowAddForm(false);
      
      // Refresh habits to ensure consistency
      await loadHabits();
      
    } catch (err) {
      console.error('App.js - Error adding habit:', err);
      setError('Failed to add habit');
      throw err; // Re-throw to allow EnhancedAddHabitForm to handle it
    }
  };

  const handleCompleteHabit = async (habitId) => {
    if (!habitId) {
      console.error('Habit ID is undefined');
      setError('Invalid habit ID');
      return;
    }
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
      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId ? response.data : habit
        )
      );
      setEditingHabit(null);
    } catch (err) {
      console.error('Error editing habit:', err);
      setError('Failed to edit habit');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!habitId) {
      console.error('Habit ID is undefined');
      setError('Invalid habit ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await api.delete(`/habits/${habitId}`);
        setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitId));
      } catch (err) {
        console.error('Error deleting habit:', err);
        setError('Failed to delete habit');
      }
    }
  };

  // Helper function to calculate stats with new timestamp-based completion system
  const calculateStats = (habits) => {
    const safeHabits = Array.isArray(habits) ? habits : [];
    const today = new Date().toISOString().slice(0, 10);
    
    // Calculate completions today (count all habits with completions today)
    const completedToday = safeHabits.filter(habit => {
      const completedDates = habit.completedDates || [];
      return completedDates.some(dateTime => dateTime.slice(0, 10) === today);
    }).length;
    
    // Calculate success rate (habits meeting their expected frequency in the last 7 days)
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    
    // Helper function to parse expected frequency (same as in AnalyticsDashboard)
    const parseExpectedFrequency = (frequency) => {
      if (!frequency) return { timesPerPeriod: 1, periodDays: 1 }; // Default to daily
      
      // Handle structured frequency object
      if (typeof frequency === 'object' && frequency.count && frequency.period) {
        const { count, period } = frequency;
        switch (period) {
          case 'day':
            return { timesPerPeriod: count, periodDays: 1 };
          case 'week':
            return { timesPerPeriod: count, periodDays: 7 };
          case 'month':
            return { timesPerPeriod: count, periodDays: 30 };
          default:
            return { timesPerPeriod: 1, periodDays: 1 };
        }
      }
      
      // Handle legacy string frequency
      if (typeof frequency !== 'string') return { timesPerPeriod: 1, periodDays: 1 };
      
      const freq = frequency.toLowerCase();
      if (freq.includes('daily') || freq === 'daily') return { timesPerPeriod: 1, periodDays: 1 };
      if (freq.includes('weekly') || freq === 'weekly') return { timesPerPeriod: 1, periodDays: 7 };
      
      // Parse patterns like "2 times/week", "3 times per week", etc.
      const match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
      if (match) return { timesPerPeriod: parseInt(match[1]), periodDays: 7 };
      
      // Parse patterns like "every 2 days", "every 3 days"
      const everyMatch = freq.match(/every\s*(\d+)\s*days?/);
      if (everyMatch) {
        const days = parseInt(everyMatch[1]);
        return { timesPerPeriod: 1, periodDays: days };
      }
      
      return { timesPerPeriod: 1, periodDays: 1 }; // Default to daily if can't parse
    };
    
    const habitsMeetingExpectedFrequency = safeHabits.filter(habit => {
      const completedDates = habit.completedDates || [];
      const { timesPerPeriod, periodDays } = parseExpectedFrequency(habit.expectedFrequency);
      
      if (periodDays === 1) {
        // Daily habit: count successful days in last 7 days
        let successfulDays = 0;
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dayStr = checkDate.toISOString().slice(0, 10);
          
          const dayCompletions = completedDates.filter(dateTime => 
            dateTime.slice(0, 10) === dayStr
          ).length;
          
          if (dayCompletions >= timesPerPeriod) {
            successfulDays++;
          }
        }
        
        // Success if at least 50% of days met the goal
        return successfulDays >= Math.ceil(7 * 0.5);
        
      } else if (periodDays === 7) {
        // Weekly habit: check if this week's goal was met
        const last7DaysCompletions = completedDates.filter(dateTime => 
          last7Days.includes(dateTime.slice(0, 10))
        ).length;
        
        return last7DaysCompletions >= timesPerPeriod;
        
      } else {
        // Other frequencies: use proportional calculation
        const last7DaysCompletions = completedDates.filter(dateTime => 
          last7Days.includes(dateTime.slice(0, 10))
        ).length;
        
        const expectedCompletions = Math.ceil((timesPerPeriod * 7) / periodDays);
        return last7DaysCompletions >= Math.max(1, Math.ceil(expectedCompletions * 0.5));
      }
    }).length;
    
    const successRate = safeHabits.length > 0 ? 
      Math.round((habitsMeetingExpectedFrequency / safeHabits.length) * 100) : 0;
    
    // Calculate current streak (consecutive days with at least one habit completed)
    let currentStreak = 0;
    
    // Get all unique dates where any habit was completed
    const allCompletionDates = new Set();
    safeHabits.forEach(habit => {
      const completedDates = habit.completedDates || [];
      completedDates.forEach(dateTime => {
        const dateOnly = dateTime.slice(0, 10); // Extract date part (YYYY-MM-DD)
        allCompletionDates.add(dateOnly);
      });
    });
    
    // Convert to sorted array (newest first)
    const sortedDates = Array.from(allCompletionDates).sort((a, b) => b.localeCompare(a));
    
    if (sortedDates.length === 0) {
      currentStreak = 0;
    } else {
      // Start from today and count consecutive days
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      
      // Check if today has any completions
      if (!sortedDates.includes(todayStr)) {
        currentStreak = 0;
      } else {
        // Count consecutive days starting from today
        let checkDate = new Date(today);
        
        for (let i = 0; i < 365; i++) { // Check up to 365 days back
          const checkDateStr = checkDate.toISOString().slice(0, 10);
          
          if (sortedDates.includes(checkDateStr)) {
            currentStreak++;
            // Move to previous day
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    return {
      totalHabits: safeHabits.length,
      completedToday,
      successRate,
      currentStreak
    };
  };

  // Calculate stats
  const stats = calculateStats(habits);
  const safeHabits = Array.isArray(habits) ? habits : [];

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
            <p>Welcome back, {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}!</p>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowAnalytics(true);
              }}
              style={{ marginRight: '10px' }}
            >
              📊 Analytics
            </button>
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
                value={`${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`}
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
              <EnhancedAddHabitForm
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
            
            {safeHabits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <h3>No habits yet</h3>
                <p>Start building better habits by adding your first one!</p>
              </div>
            ) : (
              <EnhancedHabitList
                habits={safeHabits}
                onEdit={setEditingHabit}
                onDelete={handleDeleteHabit}
                onMarkComplete={handleCompleteHabit}
                onCompletionChange={loadHabits}
                onViewMetrics={(habit) => {
                  setSelectedHabit(habit);
                  setShowMetrics(true);
                }}
                onAddNote={(habit) => {
                  setNoteHabit(habit);
                  setShowAddNote(true);
                }}
              />
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

      {/* Metrics View Modal */}
      {showMetrics && (
        <MetricsView
          habits={habits}
          selectedHabit={selectedHabit}
          onClose={() => {
            setShowMetrics(false);
            setSelectedHabit(null);
          }}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1200px', width: '90%' }}>
            <AnalyticsDashboard
              habits={habits}
              onClose={() => setShowAnalytics(false)}
            />
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && noteHabit && (
        <AddNoteModal
          habit={noteHabit}
          onClose={() => {
            setShowAddNote(false);
            setNoteHabit(null);
          }}
          onNoteAdded={() => {
            loadHabits(); // Refresh habits to show new note
          }}
        />
      )}

      {/* Scroll-to-top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#1976d2';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#2196f3';
            e.target.style.transform = 'scale(1)';
          }}
          title="Scroll to top"
        >
          ⬆️
        </button>
      )}
    </div>
  );
}

export default App;
