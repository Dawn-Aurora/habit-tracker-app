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

  // Calculate today's completions for better progress display
  const getTodayProgress = () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCompletions = habit.completedDates?.filter(date => 
      date.slice(0, 10) === today
    ).length || 0;
    
    // Get target from expectedFrequency
    let target = null;
    if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
      const { count, period } = habit.expectedFrequency;
      if (period === 'day') {
        target = count;
      }
    }
    
    return { current: todayCompletions, target };
  };

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

  const todayProgress = getTodayProgress();
  const weeklyProgress = getWeeklyProgress();

  return (
    <div className="modern-card modern-fade-in" style={{
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Progress indicator stripe */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: todayProgress.target && todayProgress.current >= todayProgress.target 
          ? 'var(--gradient-success)' 
          : 'var(--gradient-primary)',
        opacity: 0.8
      }} />
      
      <div className="modern-card-body">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: '0 0 var(--space-1) 0', 
              fontSize: '1.25rem',
              color: 'var(--gray-800)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <span>{habit.name}</span>
              {todayProgress.target && todayProgress.current >= todayProgress.target && (
                <span style={{ fontSize: '1rem' }}>✅</span>
              )}
            </h3>
            
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--gray-500)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <span>📅</span>
              <span>{formatFrequency()}</span>
            </div>

            {/* Today's Progress Bar for Daily Habits */}
            {todayProgress.target && (
              <div className="modern-card" style={{
                marginBottom: 'var(--space-3)',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)'
              }}>
                <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)'
                  }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: 'var(--gray-600)' 
                    }}>
                      Today's Progress
                    </span>
                    <span className={`modern-badge ${
                      todayProgress.current >= todayProgress.target 
                        ? 'modern-badge-success' 
                        : 'modern-badge-primary'
                    }`}>
                      {todayProgress.current}/{todayProgress.target}
                    </span>
                  </div>
                  <div className="modern-progress">
                    <div 
                      className="modern-progress-bar"
                      style={{
                        width: `${Math.min((todayProgress.current / todayProgress.target) * 100, 100)}%`,
                        background: todayProgress.current >= todayProgress.target 
                          ? 'var(--gradient-success)' 
                          : 'var(--gradient-primary)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {habit.tags && habit.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                {habit.tags.map((tag, index) => (
                  <span key={index} className="modern-badge" style={{
                    background: 'var(--primary-color)',
                    color: 'var(--white)',
                    fontSize: '0.75rem'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginLeft: 'var(--space-4)' }}>
            {/* Always show enhanced completion counter */}
            <EnhancedCompletionCounter 
              habit={habit}
              onCompletionChange={onCompletionChange}
            />
            
            {/* Show weekly/monthly progress for those types */}
            {weeklyProgress && (
              <div className="modern-card" style={{
                marginTop: 'var(--space-3)',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--gray-500)', 
                    marginBottom: 'var(--space-1)' 
                  }}>
                    {weeklyProgress.label}
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: weeklyProgress.current >= weeklyProgress.target 
                      ? 'var(--success-color)' 
                      : 'var(--gray-600)'
                  }}>
                    {weeklyProgress.current} / {weeklyProgress.target}
                  </div>
                  {weeklyProgress.current >= weeklyProgress.target && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--success-color)', 
                      marginTop: 'var(--space-1)',
                      fontWeight: '500'
                    }}>
                      ✅ Complete!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-2)', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-controls={`habit-details-${habit.id}`}
            aria-label={`${showDetails ? 'Hide' : 'Show'} details for ${habit.name}`}
            className="modern-btn modern-btn-sm modern-btn-secondary"
          >
            {showDetails ? '👁️ Hide Details' : '👁️ Show Details'}
          </button>
          
          <button
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name} habit`}
            className="modern-btn modern-btn-sm modern-btn-warning"
          >
            ✏️ Edit
          </button>
          
          <button
            onClick={() => onAddNote(habit)}
            aria-label={`Add note to ${habit.name} habit`}
            className="modern-btn modern-btn-sm"
            style={{ 
              background: 'var(--secondary-color)', 
              color: 'var(--white)' 
            }}
          >
            📝 Note
          </button>
          
          <button
            onClick={() => onViewAnalytics && onViewAnalytics(habit)}
            aria-label={`View analytics for ${habit.name} habit`}
            className="modern-btn modern-btn-sm modern-btn-success"
          >
            📊 Analytics
          </button>
          
          <button
            onClick={(e) => {
              if (window.confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
                onDelete(habit.id);
              }
            }}
            aria-label={`Delete ${habit.name} habit`}
            className="modern-btn modern-btn-sm modern-btn-danger"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {showDetails && (
          <div 
            id={`habit-details-${habit.id}`}
            className="modern-slide-up"
            style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--gray-200)'
          }}
          role="region"
          aria-labelledby={`habit-details-title-${habit.id}`}
        >
          <h4 id={`habit-details-title-${habit.id}`} className="modern-text-lg" style={{ 
            margin: '0 0 var(--space-3) 0', 
            fontWeight: '600',
            color: 'var(--gray-700)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            📊 Habit Details
          </h4>
          
          <div className="modern-grid modern-grid-2" style={{ gap: 'var(--space-4)' }}>
            <div className="modern-card">
              <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--gray-600)',
                  marginBottom: 'var(--space-1)'
                }}>
                  Total Completions
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--primary-color)'
                }}>
                  {habit.completedDates?.length || 0}
                </div>
              </div>
            </div>
            
            {habit.completedDates && habit.completedDates.length > 0 && (
              <div className="modern-card">
                <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--gray-600)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Recent Completions
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--gray-500)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-1)'
                  }}>
                    {habit.completedDates
                      .slice(-5)
                      .map((date, index) => (
                        <span key={index} className="modern-badge">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {habit.notes && habit.notes.length > 0 && (
            <div className="modern-card" style={{ marginTop: 'var(--space-4)' }}>
              <div className="modern-card-body" style={{ padding: 'var(--space-3)' }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: 'var(--gray-600)',
                  marginBottom: 'var(--space-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  📝 Latest Note
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--gray-700)',
                  fontStyle: 'italic',
                  padding: 'var(--space-3)',
                  background: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                  borderLeft: '4px solid var(--primary-color)'
                }}>
                  "{habit.notes[habit.notes.length - 1].text}"
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedHabitItem;
