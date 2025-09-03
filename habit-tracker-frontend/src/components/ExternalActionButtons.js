import React from 'react';
import '../styles/external-action-buttons.css';

function ExternalActionButtons({ 
  habit, 
  onEdit, 
  onAddNote, 
  onMetricView, 
  onDelete,
  className = ""
}) {
  if (!habit) return null;

  return (
    <div className={`external-action-container ${className}`}>
      <button
        className="external-action-btn edit"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(habit);
        }}
        title="Edit habit"
      >
        <span className="action-icon">✏️</span>
        <span className="action-label">Edit</span>
      </button>
      
      <button
        className="external-action-btn note"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddNote(habit);
        }}
        title="Add note"
      >
        <span className="action-icon">📝</span>
        <span className="action-label">Note</span>
      </button>
      
      <button
        className="external-action-btn metric"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onMetricView) {
            onMetricView(habit);
          }
        }}
        title="View metrics"
      >
        <span className="action-icon">📊</span>
        <span className="action-label">Metrics</span>
      </button>
      
      <button
        className="external-action-btn delete"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(habit.id);
        }}
        title="Delete habit"
      >
        <span className="action-icon">🗑️</span>
        <span className="action-label">Delete</span>
      </button>
    </div>
  );
}

export default ExternalActionButtons;
