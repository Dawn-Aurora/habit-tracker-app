import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import AddHabitForm from './components/AddHabitForm';
import EditHabitForm from './components/EditHabitForm';
import HabitList from './components/HabitList';
import api from './api';

function App() {
  const [habits, setHabits] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Function to check server connection
  const checkServerConnection = useCallback(() => {
    console.log('Checking server status...');
    setServerStatus('checking');
    setError('');
    
    api.get('/')
      .then((response) => {
        console.log('Backend server response:', response.data);
        setServerStatus('connected');
        console.log('Backend server is running');
      })
      .catch((err) => {
        console.error('Backend server not available:', err.message);
        if (err.code === 'ERR_NETWORK') {
          console.error('Network error - server might be down or CORS issue');
        }
        if (err.response) {
          console.error('Server responded with status:', err.response.status);
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
    console.log('Fetching habits from:', 'http://localhost:5000/habits');
    api.get('/habits')
      .then(res => {
        console.log('Habits response:', res.data);
        if (res.data && res.data.data) {
          setHabits(res.data.data);
          setError(''); // Clear any error messages on success
        } else {
          console.error('Unexpected response format:', res.data);
          setError('Received invalid data from server');
        }
      })
      .catch((error) => {
        console.error('Error fetching habits:', error);
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
        console.error('Error deleting habit:', error);
        setError('Failed to delete habit: ' + (error.message || 'Unknown error'));
      });
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
          />
        )}
        {editingHabit && (
          <EditHabitForm
            habit={editingHabit}
            onHabitUpdated={handleUpdate}
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
