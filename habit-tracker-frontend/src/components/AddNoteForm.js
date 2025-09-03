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
    
    // Create timestamp with exact current time
    const now = new Date();
    
    // If user selected today's date, use current time
    // If user selected a different date, use noon of that date to avoid timezone issues
    let noteDateTime;
    if (date === new Date().toISOString().slice(0, 10)) {
      // Today - use current time
      noteDateTime = now;
    } else {
      // Different date - use noon to avoid timezone confusion
      const selectedDate = new Date(date + 'T12:00:00');
      noteDateTime = selectedDate;
    }
    
    api.post(`/habits/${habit.id}/note`, { 
      note: note.trim(),
      date: noteDateTime.toISOString()
    })
      .then(res => {
        setLoading(false);
        if (onNoteAdded) onNoteAdded();
      })
      .catch(err => {
        setLoading(false);
        setError('Error adding note: ' + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ 
        maxWidth: '500px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div className="modal-header" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px 24px',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600' }}>
            📝 Add Note to "{habit.name}"
          </h3>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              zIndex: 1000,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#ef4444';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#374151';
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ 
          background: 'white',
          padding: '24px',
          borderRadius: '0 0 16px 16px'
        }}>
          <form onSubmit={handleSubmit} className="habit-form">
            <div className="form-group">
              <label className="form-label">📅 Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="form-input"
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">✍️ Note *</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Share your thoughts, progress, or reflection..."
                required
                rows={4}
                className="form-textarea"
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            {error && (
              <div style={{ 
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}
            
            <div className="form-actions" style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button 
                type="button" 
                onClick={onCancel}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  padding: '12px 24px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? '💾 Saving...' : '💾 Save Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNoteForm;
