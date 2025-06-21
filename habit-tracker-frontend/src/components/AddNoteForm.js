import React, { useState } from 'react';
import api from '../api';

function AddNoteForm({ habit, onNoteAdded, onCancel }) {
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Note text is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    api.post(`/habits/${habit.id}/notes`, { 
      note: note.trim(),
      date
    })
      .then(res => {
        setLoading(false);
        if (onNoteAdded) onNoteAdded();
      })
      .catch(err => {
        console.error('Error adding note:', err);
        setLoading(false);
        setError('Error adding note: ' + (err.response?.data?.message || err.message));
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
      <h3 style={{ marginTop: 0 }}>Add Note to "{habit.name}"</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Note *</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add your note here..."
            required
            rows={4}
            style={{ width: '100%', padding: '8px', resize: 'vertical' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{ padding: '8px 16px' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </div>
        
        {error && <div style={{ color: 'red', fontSize: '0.9em' }}>{error}</div>}
      </form>
    </div>
  );
}

export default AddNoteForm;
