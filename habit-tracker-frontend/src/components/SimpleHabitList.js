import React from 'react';

function SimpleHabitList({ habits, onEdit, onDelete, onMarkComplete }) {

  if (!habits || habits.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>No habits found. Add your first habit to get started!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3>Simple Habit List (Debug)</h3>
      {habits.map((habit, index) => (
        <div key={habit.id || index} style={{ 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '16px',
          backgroundColor: '#f9f9f9'
        }}>
          <h4>{habit.name}</h4>
          <p>ID: {habit.id}</p>
          <p>Expected Frequency: {JSON.stringify(habit.expectedFrequency)}</p>
          <p>Completed Dates: {JSON.stringify(habit.completedDates)}</p>
          <p>Tags: {JSON.stringify(habit.tags)}</p>
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => onMarkComplete(habit.id)}
              style={{ 
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Mark Complete
            </button>
            <button 
              onClick={() => onEdit(habit)}
              style={{ 
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(habit.id)}
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SimpleHabitList;
