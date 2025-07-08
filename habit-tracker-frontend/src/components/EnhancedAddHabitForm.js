import React, { useState } from 'react';
import api from '../api';

function EnhancedAddHabitForm({ onAddHabit, onHabitAdded, onCancel }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [period, setPeriod] = useState('day');
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (loading) return; // Prevent multiple submissions
    
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    setLoading(true);
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
    
    // Use the provided callback function
    const callback = onAddHabit || onHabitAdded;
    
    if (callback) {
      // Call the parent's handler directly
      callback(habitData)
        .then(() => {
          setName('');
          setCount(1);
          setPeriod('day');
          setTags('');
          setStartDate(new Date().toISOString().slice(0, 10));
          setError('');
          if (onCancel) onCancel();
        })
        .catch(err => {
          console.error('EnhancedAddHabitForm - Error adding habit:', err);
          setError('Error adding habit: ' + (err.response?.data?.message || err.message));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Fallback to direct API call
      api.post('/habits', habitData)
        .then(res => {
          setName('');
          setCount(1);
          setPeriod('day');
          setTags('');
          setStartDate(new Date().toISOString().slice(0, 10));
          setError('');
          if (onHabitAdded) onHabitAdded();
          if (onCancel) onCancel();
        })
        .catch(err => {
          console.error('EnhancedAddHabitForm - Direct API call error:', err);
          setError('Error adding habit: ' + (err.response?.data?.message || err.message));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="modern-form modern-fade-in"
      style={{ maxWidth: '100%' }}
      aria-labelledby="add-habit-form-title"
    >
      {error && (
        <div className="modern-card" style={{ 
          marginBottom: 'var(--space-4)', 
          border: '2px solid var(--error-color)',
          background: '#ffebee'
        }}>
          <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <p id="habit-error" style={{ margin: 0, color: 'var(--error-color)', fontWeight: '500' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="modern-form-group">
        <label htmlFor="habit-name" className="modern-label">
          🎯 Habit Name *
        </label>
        <input
          id="habit-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Exercise, Read, Meditate"
          required
          aria-required="true"
          aria-describedby={error ? "habit-error" : undefined}
          className="modern-input"
          style={{ 
            borderColor: error && !name.trim() ? 'var(--error-color)' : undefined
          }}
        />
      </div>
      
      <fieldset className="modern-card" style={{ border: 'none', padding: 0 }}>
        <div className="modern-card-header">
          <h4 className="modern-card-title" style={{ fontSize: '1rem' }}>
            📅 Expected Frequency
          </h4>
        </div>
        <div className="modern-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)', alignItems: 'end' }}>
            <div className="modern-form-group modern-mb-0">
              <label htmlFor="frequency-count" className="modern-label">
                Times:
              </label>
              <input
                id="frequency-count"
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={e => setCount(e.target.value)}
                className="modern-input"
                aria-label="Number of times"
                aria-describedby="frequency-example"
              />
            </div>
            <div className="modern-form-group modern-mb-0">
              <label htmlFor="frequency-period" className="modern-label">
                Per:
              </label>
              <select
                id="frequency-period"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="modern-input modern-select"
                aria-label="Time period"
                aria-describedby="frequency-example"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div 
            id="frequency-example"
            className="modern-badge modern-badge-primary"
            style={{ 
              marginTop: 'var(--space-3)',
              display: 'inline-block'
            }}
            aria-live="polite"
          >
            📋 Example: {count} time{count > 1 ? 's' : ''} per {period}
          </div>
        </div>
      </fieldset>
      
      <div className="modern-form-group">
        <label htmlFor="tags" className="modern-label">
          🏷️ Tags (comma-separated)
        </label>
        <input
          id="tags"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g., health, fitness, personal"
          className="modern-input"
          aria-describedby="tags-help"
        />
        <div id="tags-help" style={{ 
          fontSize: '0.75rem', 
          color: 'var(--gray-500)', 
          marginTop: 'var(--space-1)' 
        }}>
          💡 Separate multiple tags with commas
        </div>
      </div>
      
      <div className="modern-form-group">
        <label htmlFor="start-date" className="modern-label">
          📅 Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="modern-input"
          aria-describedby="start-date-help"
        />
        <div id="start-date-help" style={{ 
          fontSize: '0.75rem', 
          color: 'var(--gray-500)', 
          marginTop: 'var(--space-1)' 
        }}>
          🚀 When you want to begin tracking this habit
        </div>
      </div>
      
      
      <button 
        type="submit" 
        disabled={loading}
        className={`modern-btn modern-btn-lg ${loading ? 'modern-btn-secondary' : 'modern-btn-primary'}`}
        style={{ 
          width: '100%',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)'
        }}
        aria-describedby={error ? "habit-error" : undefined}
      >
        {loading ? (
          <>
            <span>⏳</span>
            <span>Adding Habit...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Add Habit</span>
          </>
        )}
      </button>
    </form>
  );
}

export default EnhancedAddHabitForm;
