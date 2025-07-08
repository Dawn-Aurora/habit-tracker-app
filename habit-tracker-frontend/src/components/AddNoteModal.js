import React, { useState } from 'react';
import api from '../api';

function AddNoteModal({ habit, onClose, onNoteAdded }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/habits/${habit.id}/note`, {
        text: note.trim(),
        date: new Date().toISOString().slice(0, 10)
      });

      if (response.data.status === 'success') {
        onNoteAdded && onNoteAdded(response.data.data);
        onClose();
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Error adding note: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-form">
          <div className="modal-header">
            <h3>📝 Add Note</h3>
            <button 
              className="btn-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <div className="modern-card" style={{ marginBottom: '24px' }}>
            <div className="modern-card-body">
              <p style={{ 
                margin: 0, 
                color: '#6b7280',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>🎯</span>
                Adding note for <strong style={{ color: '#374151' }}>{habit.name}</strong>
              </p>
            </div>
          </div>
          
          {error && (
            <div className="modern-card" style={{ 
              marginBottom: '24px',
              border: '2px solid #ef4444',
              background: '#fef2f2'
            }}>
              <div className="modern-card-body">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ef4444'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <span style={{ fontWeight: '500' }}>{error}</span>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label htmlFor="note-text" className="modern-label">
                ✍️ Your Note
              </label>
              <textarea
                id="note-text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your thoughts, reflections, or observations about this habit..."
                rows="5"
                className="modern-input"
                style={{
                  resize: 'vertical',
                  minHeight: '120px',
                  fontFamily: 'inherit'
                }}
                disabled={loading}
                required
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button 
                type="button"
                onClick={onClose}
                className="modern-btn modern-btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="modern-btn modern-btn-primary"
                disabled={loading || !note.trim()}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <span>⏳</span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Add Note</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNoteModal;
