import React, { useState } from 'react';
import api from '../api';

function EditHabitForm({ habit, onHabitUpdated }) {
  const [name, setName] = useState(habit.name);
  
  // Helper function to format frequency for editing
  const formatFrequencyForEdit = (expectedFrequency) => {
    if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
      const { count, period } = expectedFrequency;
      return `${count} time${count > 1 ? 's' : ''} per ${period}`;
    }
    return expectedFrequency || '';
  };
  
  const [expectedFrequency, setExpectedFrequency] = useState(formatFrequencyForEdit(habit.expectedFrequency));
  const [tags, setTags] = useState((habit.tags || []).join(', '));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    api.put(`/habits/${habit.id}`, { 
      name: name.trim(),
      expectedFrequency,
      tags: tagsArray
    })
      .then(res => {
        setLoading(false);
        if (onHabitUpdated) onHabitUpdated();
      })
      .catch(err => {
        console.error('Error updating habit:', err);
        setLoading(false);
        setError('Error updating habit: ' + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '24px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '400px'
    }}>
      <h3 style={{ marginTop: 0 }}>Edit Habit</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>        <div>
          <label htmlFor="edit-habit-name" style={{ display: 'block', marginBottom: '4px' }}>Habit Name *</label>
          <input
            id="edit-habit-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label htmlFor="edit-expected-frequency" style={{ display: 'block', marginBottom: '4px' }}>Expected Frequency</label>
          <input
            id="edit-expected-frequency"
            value={expectedFrequency}
            onChange={e => setExpectedFrequency(e.target.value)}
            placeholder="e.g., Daily, 3 times/week, Once/month"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label htmlFor="edit-tags" style={{ display: 'block', marginBottom: '4px' }}>Tags (comma-separated)</label>
          <input
            id="edit-tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g., health, fitness, personal"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => onHabitUpdated && onHabitUpdated()}
            style={{ padding: '8px 16px' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2196f3', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Updating...' : 'Update Habit'}
          </button>
        </div>
        
        {error && <div style={{ color: 'red', fontSize: '0.9em' }}>{error}</div>}
      </form>
    </div>
  );
}

export default EditHabitForm;