import React, { useState } from 'react';
import api from '../api';

function AddHabitForm({ onHabitAdded }) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    api.post('/habits', { 
      name: name.trim(), 
      frequency,
      tags: tagsArray,
      startDate 
    })
      .then(res => {
        setName('');
        setFrequency('');
        setTags('');
        setStartDate(new Date().toISOString().slice(0, 10));
        setError('');
        if (onHabitAdded) onHabitAdded();
      })
      .catch(err => {
        console.error('Error adding habit:', err);
        setError('Error adding habit: ' + (err.response?.data?.message || err.message));
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px', 
      maxWidth: '400px', 
      padding: '16px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      margin: '16px 0'
    }}>      <div>
        <label htmlFor="habit-name" style={{ display: 'block', marginBottom: '4px' }}>Habit Name *</label>
        <input
          id="habit-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Exercise, Read, Meditate"
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <div>
        <label htmlFor="expected-frequency" style={{ display: 'block', marginBottom: '4px' }}>Expected Frequency</label>
        <input
          id="expected-frequency"
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          placeholder="e.g., Daily, 3 times/week, Once/month"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <div>
        <label htmlFor="tags" style={{ display: 'block', marginBottom: '4px' }}>Tags (comma-separated)</label>
        <input
          id="tags"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g., health, fitness, personal"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <div>
        <label htmlFor="start-date" style={{ display: 'block', marginBottom: '4px' }}>Start Date</label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      
      <button type="submit" style={{ 
        padding: '10px', 
        backgroundColor: '#2196f3', 
        color: 'white', 
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Add Habit
      </button>
      
      {error && <div style={{ color: 'red', fontSize: '0.9em' }}>{error}</div>}
    </form>
  );
}

export default AddHabitForm;