import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/modern-theme.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/responsive-layout.css';
import './styles/mobile-navigation.css';
import './styles/mobile-habit-card.css';
import EnhancedHabitList from './components/EnhancedHabitList';
import EnhancedAddHabitForm from './components/EnhancedAddHabitForm';
import EditHabitForm from './components/EditHabitForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StatsCard from './components/StatsCard';
import MetricsView from './components/MetricsView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AddNoteModal from './components/AddNoteModal';
import MobileNavigation from './components/MobileNavigation';
import { useResponsive } from './hooks/useResponsive';
import api from './api';

function App() {
  const responsive = useResponsive();
  
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
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

  const [activeView, setActiveView] = useState('habits');

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const normalizeExpectedFrequency = (freq) => {
    if (!freq) return '';
    if (typeof freq === 'object' && freq !== null) return freq;
    if (typeof freq === 'string') {
      const t = freq.trim();
      if (t.startsWith('{') && t.endsWith('}')) {
        try {
          const obj = JSON.parse(t);
          if (obj && typeof obj.count !== 'undefined' && obj.period) return obj;
        } catch (_) {
        }
      }
      return t;
    }
    return '';
  };

  const loadHabits = useCallback(async () => {
    try {
      const response = await api.get('/habits');
      
      let habits = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        habits = response.data.data;
      } else if (Array.isArray(response.data)) {
        habits = response.data;
      }
      const normalized = habits.map(h => ({
        ...h,
        expectedFrequency: normalizeExpectedFrequency(h.expectedFrequency)
      }));
      setHabits(normalized);
    } catch (err) {
      console.error('App.js - Error loading habits:', err);
      setError('Failed to load habits');
      setHabits([]);
    }
  }, []);

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
  }, [loadHabits]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (editingHabit || showMetrics || showAnalytics || showAddNote) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      window.__MODAL_OPEN__ = true;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      document.documentElement.style.overflow = 'hidden';
      
      const currentWidth = window.innerWidth;
      document.documentElement.style.width = `${currentWidth}px`;
    } else {
      setTimeout(() => {
        window.__MODAL_OPEN__ = false;
      }, 50);
      
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.width = '';
    }

    return () => {
      window.__MODAL_OPEN__ = false;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.width = '';
    };
  }, [editingHabit, showMetrics, showAnalytics, showAddNote]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
    setError('');
    setRegistrationSuccess(true);
    setShowRegister(false);
    // Clear success message after 4 seconds
    setTimeout(() => setRegistrationSuccess(false), 4000);
  };

  const handleAddHabit = async (habitData) => {
    try {
      // Attach userId to habitData
      const habitWithUser = {
        ...habitData,
        userId: user && user.id ? user.id : undefined
      };
      const response = await api.post('/habits', habitWithUser);
      
      let newHabit = response.data;
      if (response.data && response.data.data) {
        newHabit = response.data.data;
      }
      
      // Normalize the new habit's expected frequency
      newHabit = {
        ...newHabit,
        expectedFrequency: normalizeExpectedFrequency(newHabit.expectedFrequency)
      };
      
      // Add the new habit to the state immediately for instant feedback
      setHabits(prevHabits => {
        const updatedHabits = [...prevHabits, newHabit];
        return updatedHabits;
      });
      
      setShowAddForm(false);
      
      // Reload habits from server to ensure consistency
      // Small delay to prevent race condition and allow UI to update
      setTimeout(() => {
        loadHabits();
      }, 200);
      
    } catch (err) {
      console.error('App.js - Error adding habit:', err);
      setError('Failed to add habit');
      throw err;
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
      loadHabits();
    } catch (err) {
      console.error('Error completing habit:', err);
      setError('Failed to complete habit');
    }
  };

  const handleEditHabit = async (habitId, habitData) => {
    try {
      const response = await api.put(`/habits/${habitId}`, habitData);
      
      const updatedHabit = response.data.data || response.data;
      const fixedHabit = {
        ...updatedHabit,
        expectedFrequency: normalizeExpectedFrequency(updatedHabit.expectedFrequency)
      };

      setHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId ? fixedHabit : habit
        )
      );
      setEditingHabit(null);
    } catch (err) {
      console.error('Error editing habit:', err);
      console.error('Failed habit ID:', habitId);
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

  const calculateStats = (habits) => {
    const safeHabits = Array.isArray(habits) ? habits : [];
    const today = new Date().toISOString().slice(0, 10);
    
    const completedToday = safeHabits.filter(habit => {
      const completedDates = habit.completedDates || [];
      return completedDates.some(dateTime => dateTime.slice(0, 10) === today);
    }).length;
    
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    
    const parseExpectedFrequency = (frequency) => {
      if (!frequency) return { timesPerPeriod: 1, periodDays: 1 };
      
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
      
      if (typeof frequency !== 'string') return { timesPerPeriod: 1, periodDays: 1 };
      
      const freq = frequency.toLowerCase();
      if (freq.includes('daily') || freq === 'daily') return { timesPerPeriod: 1, periodDays: 1 };
      if (freq.includes('weekly') || freq === 'weekly') return { timesPerPeriod: 1, periodDays: 7 };
      
      const match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
      if (match) return { timesPerPeriod: parseInt(match[1]), periodDays: 7 };
      
      const everyMatch = freq.match(/every\s*(\d+)\s*days?/);
      if (everyMatch) {
        const days = parseInt(everyMatch[1]);
        return { timesPerPeriod: 1, periodDays: days };
      }
      
      return { timesPerPeriod: 1, periodDays: 1 };
    };
    
    const habitsMeetingExpectedFrequency = safeHabits.filter(habit => {
      const completedDates = habit.completedDates || [];
      const { timesPerPeriod, periodDays } = parseExpectedFrequency(habit.expectedFrequency);
      
      if (periodDays === 1) {
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
        
        return successfulDays >= Math.ceil(7 * 0.5);
        
      } else if (periodDays === 7) {
        const last7DaysCompletions = completedDates.filter(dateTime => 
          last7Days.includes(dateTime.slice(0, 10))
        ).length;
        
        return last7DaysCompletions >= timesPerPeriod;
        
      } else {
        const last7DaysCompletions = completedDates.filter(dateTime => 
          last7Days.includes(dateTime.slice(0, 10))
        ).length;
        
        const expectedCompletions = Math.ceil((timesPerPeriod * 7) / periodDays);
        return last7DaysCompletions >= Math.max(1, Math.ceil(expectedCompletions * 0.5));
      }
    }).length;
    
    const successRate = safeHabits.length > 0 ? 
      Math.round((habitsMeetingExpectedFrequency / safeHabits.length) * 100) : 0;
    
    let currentStreak = 0;
    
    const allCompletionDates = new Set();
    safeHabits.forEach(habit => {
      const completedDates = habit.completedDates || [];
      completedDates.forEach(dateTime => {
        const dateOnly = dateTime.slice(0, 10);
        allCompletionDates.add(dateOnly);
      });
    });
    
    const sortedDates = Array.from(allCompletionDates).sort((a, b) => b.localeCompare(a));
    
    if (sortedDates.length === 0) {
      currentStreak = 0;
    } else {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      
      if (!sortedDates.includes(todayStr)) {
        currentStreak = 0;
      } else {
        let checkDate = new Date(today);
        
        for (let i = 0; i < 365; i++) {
          const checkDateStr = checkDate.toISOString().slice(0, 10);
          
          if (sortedDates.includes(checkDateStr)) {
            currentStreak++;
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

  const stats = calculateStats(habits);
  const safeHabits = Array.isArray(habits) ? habits : [];

  const handleMobileViewChange = (view) => {
    setActiveView(view);
    
    switch (view) {
      case 'habits':
        setShowAddForm(false);
        setShowMetrics(false);
        setShowAnalytics(false);
        break;
      case 'add':
        setShowAddForm(true);
        setShowMetrics(false);
        setShowAnalytics(false);
        break;
      case 'metrics':
        setShowAddForm(false);
        setShowMetrics(true);
        setShowAnalytics(false);
        break;
      case 'analytics':
        setShowAddForm(false);
        setShowMetrics(false);
        setShowAnalytics(true);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🎯 Habit Tracker</h1>
            <p>Build better habits, one day at a time</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {registrationSuccess && (
            <div className="success-message">
              🎉 Registration successful! Please log in to continue.
            </div>
          )}
          
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
              <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>✨ Add New Habit</h3>
                    <button 
                      className="btn-close"
                      onClick={() => setShowAddForm(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-form-content">
                    <EnhancedAddHabitForm
                      onAddHabit={handleAddHabit}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </div>
                </div>
              </div>
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
        <AnalyticsDashboard
          habits={habits}
          onClose={() => setShowAnalytics(false)}
        />
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
            loadHabits();
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

      {/* Mobile Navigation */}
      {responsive.showMobileNav && user && (
        <MobileNavigation
          activeView={activeView}
          onViewChange={handleMobileViewChange}
          completedToday={stats.completedToday}
          totalHabits={safeHabits.length}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
