import React from 'react';

function HabitList({ habits, onEdit, onDelete, onMarkComplete, onAddNote, onViewMetrics }) {
  if (!habits || habits.length === 0) {
    return <div>No habits found.</div>;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getRecentCompletions = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return [];
    return completedDates.slice(-3).reverse(); // Show last 3 completions
  };

  return (
    <ul>
      {habits.map(habit => (
        <li key={habit.id} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start', 
          gap: '8px', 
          border: '1px solid #ddd',
          padding: '12px',
          margin: '8px 0',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{habit.name}</span>
            {habit.expectedFrequency && (
              <span style={{ color: '#888', fontSize: '0.9em' }}>
                ({habit.expectedFrequency})
              </span>
            )}
          </div>
          
          {/* Tags */}
          {habit.tags && habit.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {habit.tags.map((tag, index) => (
                <span key={index} style={{
                  backgroundColor: '#e3f2fd',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8em',
                  color: '#1976d2'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Recent Completions */}
          {habit.completedDates && habit.completedDates.length > 0 && (
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Recent: {getRecentCompletions(habit.completedDates).map(formatDate).join(', ')}
              <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                ({habit.completedDates.length} total)
              </span>
            </div>
          )}

          {/* Notes Preview */}
          {habit.notes && habit.notes.length > 0 && (
            <div style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>
              Latest note: {habit.notes[habit.notes.length - 1].text || habit.notes[habit.notes.length - 1]}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => onEdit(habit)} style={{ padding: '4px 8px' }}>
              Edit
            </button>
            <button onClick={() => onDelete(habit.id)} style={{ padding: '4px 8px' }}>
              Delete
            </button>
            <button onClick={() => onMarkComplete(habit.id)} style={{ 
              padding: '4px 8px', 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px'
            }}>
              Mark Complete
            </button>
            <button onClick={() => onAddNote(habit)} style={{ padding: '4px 8px' }}>
              Add Note
            </button>
            <button onClick={() => onViewMetrics(habit.id)} style={{ padding: '4px 8px' }}>
              View Metrics
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default HabitList;