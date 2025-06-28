import React from 'react';
import EnhancedCompletionCounter from './EnhancedCompletionCounter';

function EnhancedHabitList({ habits, onEdit, onDelete, onMarkComplete, onAddNote, onViewMetrics, onCompletionChange }) {
  if (!habits || habits.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontSize: '18px'
      }}>
        No habits found. Add your first habit to get started!
      </div>
    );
  }

  const formatFrequency = (expectedFrequency) => {
    if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
      const { count, period } = expectedFrequency;
      return `${count} time${count > 1 ? 's' : ''} per ${period}`;
    }
    return expectedFrequency || '';
  };

  const getCompletionRate = (habit) => {
    if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
      const { count, period } = habit.expectedFrequency;
      const today = new Date();
      
      if (period === 'day') {
        const todayCount = habit.completedDates.filter(date => 
          date.slice(0, 10) === today.toISOString().slice(0, 10)
        ).length;
        return Math.min((todayCount / count) * 100, 100);
      }
      
      if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekCompletions = habit.completedDates.filter(date => {
          const completionDate = new Date(date);
          return completionDate >= weekStart && completionDate <= weekEnd;
        }).length;
        
        return Math.min((weekCompletions / count) * 100, 100);
      }
    }
    
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {habits.map(habit => {
        const completionRate = getCompletionRate(habit);
        const isStructuredFrequency = typeof habit.expectedFrequency === 'object';
        
        return (
          <div key={habit.id} style={{ 
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#fafafa',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {habit.name}
                </h3>
                
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {formatFrequency(habit.expectedFrequency)}
                  {completionRate !== null && (
                    <span style={{ 
                      marginLeft: '8px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: completionRate >= 100 ? '#4caf50' : completionRate >= 70 ? '#ff9800' : '#f44336',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {Math.round(completionRate)}%
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {habit.tags && habit.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {habit.tags.map((tag, index) => (
                      <span key={index} style={{
                        backgroundColor: '#e3f2fd',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#1976d2'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Enhanced Completion Counter for structured frequency */}
              {isStructuredFrequency && (
                <EnhancedCompletionCounter 
                  habit={habit} 
                  onCompletionChange={onCompletionChange}
                />
              )}
            </div>
            
            {/* Recent Completions */}
            {habit.completedDates && habit.completedDates.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Recent completions:
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {habit.completedDates.slice(-5).reverse().map((date, index) => (
                    <span key={index} style={{
                      backgroundColor: '#e8f5e8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#2e7d32'
                    }}>
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {!isStructuredFrequency && (
                <button 
                  onClick={() => onMarkComplete(habit.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Mark Complete
                </button>
              )}
              
              <button 
                onClick={() => onEdit(habit)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              
              <button 
                onClick={() => onAddNote(habit)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Add Note
              </button>
              
              <button 
                onClick={() => onViewMetrics(habit.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Metrics
              </button>
              
              <button 
                onClick={() => onDelete(habit.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EnhancedHabitList;
