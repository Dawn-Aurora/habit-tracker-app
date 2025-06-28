import React from 'react';

function IndividualHabitAnalytics({ habit, onClose }) {
  if (!habit) return null;

  // Parse frequency data
  const getFrequencyDisplay = () => {
    const frequency = habit.expectedFrequency || habit.desiredFrequency;
    if (!frequency) return 'Not set';
    
    if (typeof frequency === 'object' && frequency.count && frequency.period) {
      const { count, period } = frequency;
      return `${count} time${count > 1 ? 's' : ''} per ${period}`;
    }
    
    if (typeof frequency === 'string') {
      try {
        const parsed = JSON.parse(frequency);
        if (parsed.count && parsed.period) {
          return `${parsed.count} time${parsed.count > 1 ? 's' : ''} per ${parsed.period}`;
        }
      } catch (e) {
        // If not JSON, return as-is
      }
      return frequency;
    }
    
    return 'Not set';
  };

  // Calculate habit-specific statistics
  const calculateStats = () => {
    const completedDates = habit.completedDates || [];
    const totalCompletions = completedDates.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort dates in descending order
    const sortedDates = completedDates
      .map(date => new Date(date))
      .sort((a, b) => b - a);
    
    if (sortedDates.length > 0) {
      let checkDate = new Date(today);
      for (const completionDate of sortedDates) {
        completionDate.setHours(0, 0, 0, 0);
        if (completionDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (completionDate.getTime() < checkDate.getTime()) {
          break;
        }
      }
    }
    
    // Calculate this week's progress
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const thisWeekCompletions = completedDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfWeek;
    }).length;
    
    // Calculate expected this week
    const frequency = habit.expectedFrequency || habit.desiredFrequency;
    let expectedThisWeek = 0;
    if (frequency && typeof frequency === 'object' && frequency.count && frequency.period) {
      if (frequency.period === 'day') {
        expectedThisWeek = frequency.count * 7;
      } else if (frequency.period === 'week') {
        expectedThisWeek = frequency.count;
      }
    }
    
    return {
      totalCompletions,
      currentStreak,
      thisWeekCompletions,
      expectedThisWeek
    };
  };

  const stats = calculateStats();
  const frequencyDisplay = getFrequencyDisplay();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80%',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            📊 {habit.name} Analytics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Expected Frequency */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #4caf50'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32', fontSize: '16px' }}>
            Expected Frequency
          </h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
            {frequencyDisplay}
          </div>
        </div>

        {/* Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #2196f3'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>
              {stats.totalCompletions}
            </div>
            <div style={{ fontSize: '14px', color: '#1565c0' }}>
              Total Completions
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff3e0',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ff9800'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f57c00' }}>
              {stats.currentStreak}
            </div>
            <div style={{ fontSize: '14px', color: '#ef6c00' }}>
              Current Streak
            </div>
          </div>
        </div>

        {/* This Week Progress */}
        <div style={{
          backgroundColor: '#f3e5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #9c27b0'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#7b1fa2', fontSize: '16px' }}>
            This Week Progress
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#6a1b9a' }}>
              {stats.thisWeekCompletions} / {stats.expectedThisWeek}
            </span>
            <span style={{ fontSize: '14px', color: '#8e24aa' }}>
              {stats.expectedThisWeek > 0 
                ? Math.round((stats.thisWeekCompletions / stats.expectedThisWeek) * 100)
                : 0}%
            </span>
          </div>
          <div style={{
            backgroundColor: '#e1bee7',
            height: '10px',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#9c27b0',
              height: '100%',
              width: `${stats.expectedThisWeek > 0 
                ? Math.min((stats.thisWeekCompletions / stats.expectedThisWeek) * 100, 100)
                : 0}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
            Recent Activity
          </h3>
          {habit.completedDates && habit.completedDates.length > 0 ? (
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Last completed: {new Date(habit.completedDates[habit.completedDates.length - 1]).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Recent dates: {habit.completedDates.slice(-5).map(date => 
                  new Date(date).toLocaleDateString()
                ).join(', ')}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              No completions yet. Start tracking today!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndividualHabitAnalytics;
