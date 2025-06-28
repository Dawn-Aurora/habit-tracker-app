import React, { useState } from 'react';
import EnhancedCompletionCounter from './EnhancedCompletionCounter';

function EnhancedHabitItem({ 
  habit, 
  onEdit, 
  onDelete, 
  onAddNote, 
  onCompletionChange,
  onViewAnalytics
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate weekly progress for weekly/monthly habits
  const getWeeklyProgress = () => {
    // Check both expectedFrequency (unified) and desiredFrequency (legacy)
    const frequency = habit.expectedFrequency || habit.desiredFrequency;
    if (!frequency || typeof frequency !== 'object') return null;
    
    const { count, period } = frequency;
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const completionsThisWeek = habit.completedDates?.filter(dateStr => {
      const completionDate = new Date(dateStr);
      return completionDate >= monday;
    }).length || 0;
    
    if (period === 'day') {
      // For daily habits, show progress toward full week goal
      const fullWeekTarget = count * 7; // Full week target (7 days)
      
      return {
        current: completionsThisWeek,
        target: fullWeekTarget,
        label: 'This Week'
      };
    }
    
    if (period === 'week') {
      return {
        current: completionsThisWeek,
        target: count,
        label: 'This Week'
      };
    }
    
    if (period === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const completionsThisMonth = habit.completedDates?.filter(dateStr => {
        const completionDate = new Date(dateStr);
        return completionDate >= monthStart;
      }).length || 0;
      
      return {
        current: completionsThisMonth,
        target: count,
        label: 'This Month'
      };
    }
    
    return null;
  };

  const formatFrequency = () => {
    // Check unified expectedFrequency first
    const frequency = habit.expectedFrequency || habit.desiredFrequency;
    if (frequency && typeof frequency === 'object') {
      const { count, period } = frequency;
      return `${count} time${count > 1 ? 's' : ''} per ${period}`;
    }
    
    return habit.expectedFrequency || habit.frequency || 'No frequency set';
  };

  const weeklyProgress = getWeeklyProgress();

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease'
    }}>
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
            color: '#333',
            fontWeight: '600'
          }}>
            {habit.name}
          </h3>
          
          <div style={{ 
            fontSize: '13px', 
            color: '#666',
            marginBottom: '8px'
          }}>
            {formatFrequency()}
          </div>
          
          {habit.tags && habit.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {habit.tags.map((tag, index) => (
                <span key={index} style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '10px',
                  fontWeight: '500'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginLeft: '16px' }}>
          {/* Always show enhanced completion counter */}
          <EnhancedCompletionCounter 
            habit={habit}
            onCompletionChange={onCompletionChange}
          />
          
          {/* Show weekly/monthly progress for those types */}
          {weeklyProgress && (
            <div style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              minWidth: '100px',
              marginTop: '8px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '4px' 
              }}>
                {weeklyProgress.label}
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: weeklyProgress.current >= weeklyProgress.target ? '#4caf50' : '#666'
              }}>
                {weeklyProgress.current} / {weeklyProgress.target}
              </div>
              {weeklyProgress.current >= weeklyProgress.target && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#4caf50', 
                  marginTop: '2px' 
                }}>
                  ✓ Complete!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <button
          onClick={() => onEdit(habit)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#fff3e0',
            border: '1px solid #ffcc02',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#f57c00'
          }}
        >
          ✏️ Edit
        </button>
        
        <button
          onClick={() => onAddNote(habit)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#f3e5f5',
            border: '1px solid #ce93d8',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#7b1fa2'
          }}
        >
          📝 Note
        </button>
        
        <button
          onClick={() => onViewAnalytics && onViewAnalytics(habit)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#2e7d32'
          }}
        >
          📊 Analytics
        </button>
        
        <button
          onClick={() => onDelete(habit.id)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#d32f2f'
          }}
        >
          🗑️ Delete
        </button>
      </div>

      {showDetails && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            <strong>Total Completions:</strong> {habit.completedDates?.length || 0}
          </div>
          
          {habit.completedDates && habit.completedDates.length > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <strong>Recent completions:</strong>{' '}
              {habit.completedDates
                .slice(-5)
                .map(date => new Date(date).toLocaleDateString())
                .join(', ')}
            </div>
          )}
          
          {habit.notes && habit.notes.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <strong style={{ fontSize: '12px' }}>Latest Note:</strong>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                fontStyle: 'italic',
                marginTop: '2px'
              }}>
                "{habit.notes[habit.notes.length - 1].text}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedHabitItem;
