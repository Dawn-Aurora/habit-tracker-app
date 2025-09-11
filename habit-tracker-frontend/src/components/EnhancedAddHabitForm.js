import React, { useState } from 'react';
import api from '../api';

function EnhancedAddHabitForm({ onAddHabit, onHabitAdded, onCancel }) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [period, setPeriod] = useState('day');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: '', label: 'Select a category...' },
    { value: 'health', label: '🏃‍♂️ Health & Fitness' },
    { value: 'productivity', label: '💼 Productivity' },
    { value: 'personal', label: '🌱 Personal Development' },
    { value: 'creative', label: '🎨 Creative' },
    { value: 'social', label: '👥 Social' },
    { value: 'learning', label: '📚 Learning' },
    { value: 'mindfulness', label: '🧘‍♀️ Mindfulness' },
    { value: 'other', label: '📌 Other' }
  ];

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
      category: category || null,
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
          setCategory('');
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
          setCategory('');
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
        <label htmlFor="category" className="modern-label">
          📂 Category
        </label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="modern-input"
          aria-describedby="category-help"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <div id="category-help" style={{ 
          fontSize: '0.75rem', 
          color: 'var(--gray-500)', 
          marginTop: 'var(--space-1)' 
        }}>
          💡 Choose a category to help organize your habits
        </div>
      </div>
      
      <div className="modern-form-group">
        <label htmlFor="tags" className="modern-label">
          🏷️ Additional Tags (comma-separated)
        </label>
        <input
          id="tags"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g., morning routine, evening, outdoor"
          className="modern-input"
          aria-describedby="tags-help"
        />
        <div id="tags-help" style={{ 
          fontSize: '0.75rem', 
          color: 'var(--gray-500)', 
          marginTop: 'var(--space-1)' 
        }}>
          💡 Add extra tags to further categorize your habit
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
      
      
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-3)', 
        marginTop: 'var(--space-4)',
        justifyContent: 'flex-end'
      }}>
        <button 
          type="button"
          onClick={onCancel}
          className="modern-btn-secondary"
          style={{ 
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: '#f3f4f6',
            color: '#374151',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className={`modern-btn ${loading ? 'modern-btn-secondary' : 'modern-btn-primary'}`}
          style={{ 
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: loading ? '#f3f4f6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: loading ? '#374151' : 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            transition: 'all 0.2s ease'
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
      </div>
    </form>
  );
}

export default EnhancedAddHabitForm;
