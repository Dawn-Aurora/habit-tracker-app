import React from 'react';

function HabitCard({ habit, onComplete, onEdit, onDelete }) {
  return (
    <div className="habit-card">
      <div className="habit-header">
        <h3 className="habit-title">{habit.name}</h3>
        <div className="habit-badges">
          <span className="habit-frequency">{habit.frequency}</span>
          <span className="habit-category">{habit.category}</span>
        </div>
      </div>
      
      {habit.description && (
        <p className="habit-description">{habit.description}</p>
      )}
      
      <div className="habit-stats">
        <div className="stat-item">
          <span className="stat-label">Streak:</span>
          <span className="stat-value">{habit.streak || 0} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last:</span>
          <span className="stat-value">
            {habit.lastCompleted ? new Date(habit.lastCompleted).toLocaleDateString() : 'Never'}
          </span>
        </div>
      </div>
      
      <div className="habit-actions">
        {habit.completed ? (
          <button className="btn btn-completed" disabled>
            ✅ Completed
          </button>
        ) : (
          <button 
            className="btn btn-success"
            onClick={() => onComplete(habit.id)}
          >
            ✓ Complete
          </button>
        )}
        
        <button 
          className="btn btn-secondary"
          onClick={() => onEdit(habit)}
        >
          📝 Edit
        </button>
        
        <button 
          className="btn btn-danger"
          onClick={() => onDelete(habit.id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default HabitCard;
