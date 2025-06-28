import React, { useState } from 'react';
import api from '../api';

function EnhancedAddHabitForm({ onHabitAdded }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [period, setPeriod] = useState('day');
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
    
    const habitData = { 
      name: name.trim(), 
      tags: tagsArray,
      startDate,
      expectedFrequency: {
        count: parseInt(count),
        period: period
      }
    };
    
    api.post('/habits', habitData)
      .then(res => {
        setName('');
        setCount(1);
        setPeriod('day');
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
    }}>
      <div>
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
        <label style={{ display: 'block', marginBottom: '4px' }}>Expected Frequency</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(e.target.value)}
              style={{ width: '80px', padding: '8px' }}
            />
            <span>times per</span>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{ padding: '8px', minWidth: '100px' }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Example: {count} time{count > 1 ? 's' : ''} per {period}
          </div>
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
      
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          fontSize: '14px', 
          padding: '8px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      <button type="submit" style={{ 
        padding: '10px', 
        backgroundColor: '#2196f3', 
        color: 'white', 
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: '500'
      }}>
        Add Habit
      </button>
    </form>
  );
}

export default EnhancedAddHabitForm;
