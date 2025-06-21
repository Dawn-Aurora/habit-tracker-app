import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import AddHabitForm from './components/AddHabitForm';
import EditHabitForm from './components/EditHabitForm';
import AddNoteForm from './components/AddNoteForm';
import MetricsView from './components/MetricsView';
import HabitList from './components/HabitList';
import api from './api';

function App() {
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [addingNoteHabit, setAddingNoteHabit] = useState(null);
  const [viewingMetricsHabitId, setViewingMetricsHabitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

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
    if (serverStatus !== 'connected') {
      setError('Cannot connect to the server. Please make sure the backend is running.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    api.get('/habits')
      .then(res => {
        if (res.data && res.data.data) {
          setHabits(res.data.data);
          setError(''); // Clear any error messages on success
        } else {
          setError('Received invalid data from server');
        }
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          setError('Network error - cannot connect to the server. Please make sure the backend is running.');
        } else {
          setError(`Failed to load habits: ${error.message || 'Unknown error'}`);
        }
      })
      .finally(() => setLoading(false));
  }, [serverStatus]);

  useEffect(() => {
    if (serverStatus === 'connected') {
      fetchHabits();
    }
  }, [serverStatus, fetchHabits]);

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

  // Mark a habit as complete (record current date)
  const handleMarkComplete = (id) => {
    api.post(`/habits/${id}/complete`, { date: new Date().toISOString().slice(0, 10) })
      .then(fetchHabits)
      .catch((error) => {
        setError('Failed to mark habit as complete: ' + (error.message || 'Unknown error'));
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

  // View metrics for habit
  const handleViewMetrics = (habitId) => {
    setViewingMetricsHabitId(habitId);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Habit Tracker</h1>
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
        <AddHabitForm onHabitAdded={handleAdd} />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <HabitList
            habits={habits}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkComplete={handleMarkComplete}
            onAddNote={handleAddNote}
            onViewMetrics={handleViewMetrics}
          />
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
        {viewingMetricsHabitId && (
          <MetricsView
            habitId={viewingMetricsHabitId}
            onClose={() => setViewingMetricsHabitId(null)}
          />
        )}
        <div>
          <button onClick={checkServerConnection}>
            {serverStatus === 'connected' ? 'Server is up' : 'Reconnect to server'}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
