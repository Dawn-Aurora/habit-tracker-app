import React from 'react';

// Export utility functions
const generateCSVExport = (habit) => {
  const completedDates = habit.completedDates || [];
  
  // Group completions by date
  const completionsByDate = {};
  completedDates.forEach(dateStr => {
    const date = dateStr.slice(0, 10); // Get YYYY-MM-DD
    completionsByDate[date] = (completionsByDate[date] || 0) + 1;
  });
  
  // Generate CSV headers
  let csvContent = 'Date,Completions,Day of Week,Week Number,Month,Year\n';
  
  // Sort dates and add data
  const sortedDates = Object.keys(completionsByDate).sort();
  sortedDates.forEach(date => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const weekNumber = getWeekNumber(dateObj);
    const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    const completions = completionsByDate[date];
    
    csvContent += `${date},${completions},${dayOfWeek},${weekNumber},${month},${year}\n`;
  });
  
  return csvContent;
};

const generateJSONExport = (habit, stats) => {
  const exportData = {
    habitInfo: {
      name: habit.name,
      expectedFrequency: habit.expectedFrequency || habit.desiredFrequency,
      tags: habit.tags || [],
      createdDate: habit.createdAt || 'Unknown'
    },
    statistics: {
      totalCompletions: stats.totalCompletions,
      currentStreak: stats.currentStreak,
      thisWeekCompletions: stats.thisWeekCompletions,
      expectedThisWeek: stats.expectedThisWeek,
      weeklyProgress: stats.expectedThisWeek > 0 ? 
        Math.round((stats.thisWeekCompletions / stats.expectedThisWeek) * 100) : 0
    },
    completionData: habit.completedDates || [],
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
};

const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

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
    
    // Calculate current streak and longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort dates in descending order for current streak
    const sortedDates = completedDates
      .map(date => new Date(date))
      .sort((a, b) => b - a);

    // Calculate current streak
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

    // Calculate longest streak
    if (completedDates.length > 0) {
      // Sort dates in ascending order for longest streak calculation
      const datesAsc = [...completedDates]
        .map(date => new Date(date))
        .sort((a, b) => a - b);
      
      // Group by date (remove duplicates from same day)
      const uniqueDates = [];
      let lastDateStr = '';
      datesAsc.forEach(date => {
        const dateStr = date.toISOString().slice(0, 10);
        if (dateStr !== lastDateStr) {
          uniqueDates.push(date);
          lastDateStr = dateStr;
        }
      });
      
      // Calculate longest consecutive streak
      tempStreak = 1;
      longestStreak = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        
        // Check if dates are consecutive (within 1-2 days for flexibility)
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (dayDiff <= 2) { // Allow 1-2 day gap
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate streak milestones achieved
    const milestones = [
      { days: 3, name: '3-Day Starter', emoji: '🌱' },
      { days: 7, name: '1-Week Champion', emoji: '🔥' },
      { days: 14, name: '2-Week Warrior', emoji: '💪' },
      { days: 30, name: '1-Month Master', emoji: '🏆' },
      { days: 60, name: '2-Month Legend', emoji: '👑' },
      { days: 100, name: '100-Day Hero', emoji: '🌟' }
    ];
    
    const achievedMilestones = milestones.filter(m => longestStreak >= m.days);
    const nextMilestone = milestones.find(m => longestStreak < m.days);

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
      longestStreak,
      thisWeekCompletions,
      expectedThisWeek,
      achievedMilestones,
      nextMilestone
    };
  };

  const stats = calculateStats();
  const frequencyDisplay = getFrequencyDisplay();

  return (
    <div 
      style={{
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
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
          <h2 id="analytics-title" style={{ margin: 0, color: '#333', fontSize: '24px' }}>
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
            aria-label="Close analytics modal"
          >
            ✕ Close
          </button>
        </div>

        {/* Expected Frequency */}
        <div 
          style={{
            backgroundColor: '#e8f5e8',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #4caf50'
          }}
          role="region"
          aria-labelledby="frequency-title"
        >
          <h3 id="frequency-title" style={{ margin: '0 0 8px 0', color: '#2e7d32', fontSize: '16px' }}>
            Expected Frequency
          </h3>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1b5e20' }}>
            {frequencyDisplay}
          </div>
        </div>

        {/* Statistics Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}
          role="region"
          aria-labelledby="stats-title"
        >
          <h3 id="stats-title" className="sr-only">Habit Statistics</h3>
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

          <div style={{
            backgroundColor: '#ffebee',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #f44336'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d32f2f' }}>
              {stats.longestStreak}
            </div>
            <div style={{ fontSize: '14px', color: '#c62828' }}>
              Best Streak
            </div>
          </div>
        </div>

        {/* Streak Achievements */}
        {stats.achievedMilestones.length > 0 && (
          <div style={{
            backgroundColor: '#f3e5f5',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #9c27b0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#7b1fa2', fontSize: '16px' }}>
              🏆 Streak Achievements
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {stats.achievedMilestones.map((milestone, index) => (
                <div key={index} style={{
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{milestone.emoji}</span>
                  <span>{milestone.name}</span>
                </div>
              ))}
            </div>
            {stats.nextMilestone && (
              <div style={{ fontSize: '12px', color: '#7b1fa2', fontStyle: 'italic' }}>
                Next goal: {stats.nextMilestone.emoji} {stats.nextMilestone.name} 
                ({stats.nextMilestone.days - stats.longestStreak} days to go)
              </div>
            )}
          </div>
        )}

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

        {/* Monthly Calendar View */}
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #4caf50'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2e7d32', fontSize: '16px' }}>
            This Month Calendar
          </h3>
          {(() => {
            // Generate calendar for current month
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
            
            // Create calendar grid
            const weeks = [];
            let currentWeek = [];
            
            // Add empty cells for days before month starts
            for (let i = 0; i < startingDayOfWeek; i++) {
              currentWeek.push(null);
            }
            
            // Add all days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const completionCount = habit.completedDates ? 
                habit.completedDates.filter(d => d.slice(0, 10) === dateStr).length : 0;
              
              const isToday = today.getDate() === day && 
                            today.getMonth() === month && 
                            today.getFullYear() === year;
              
              currentWeek.push({
                day,
                dateStr,
                completionCount,
                isToday
              });
              
              // If week is complete (7 days) or it's the last day, start new week
              if (currentWeek.length === 7) {
                weeks.push([...currentWeek]);
                currentWeek = [];
              }
            }
            
            // Add remaining week if it has days
            if (currentWeek.length > 0) {
              // Fill remaining days with null
              while (currentWeek.length < 7) {
                currentWeek.push(null);
              }
              weeks.push(currentWeek);
            }
            
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            return (
              <div>
                <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '8px', fontWeight: 'bold' }}>
                  {monthNames[month]} {year}
                </div>
                
                {/* Day headers */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '2px',
                  marginBottom: '4px'
                }}>
                  {dayNames.map(dayName => (
                    <div key={dayName} style={{
                      fontSize: '10px',
                      color: '#666',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      padding: '2px'
                    }}>
                      {dayName}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '2px'
                }}>
                  {weeks.flat().map((day, index) => {
                    if (!day) {
                      return <div key={index} style={{ width: '24px', height: '24px' }} />;
                    }
                    
                    const { day: dayNum, completionCount, isToday } = day;
                    
                    // Determine background color based on completion count
                    let backgroundColor = '#f0f0f0';
                    let textColor = '#999';
                    
                    if (completionCount > 0) {
                      // Get expected daily count
                      const frequency = habit.expectedFrequency || habit.desiredFrequency;
                      let expectedDaily = 1;
                      if (frequency && typeof frequency === 'object' && frequency.period === 'day') {
                        expectedDaily = frequency.count;
                      }
                      
                      const completionRatio = completionCount / expectedDaily;
                      if (completionRatio >= 1) {
                        backgroundColor = '#4caf50'; // Full completion - green
                        textColor = 'white';
                      } else if (completionRatio >= 0.5) {
                        backgroundColor = '#8bc34a'; // Partial completion - light green
                        textColor = 'white';
                      } else {
                        backgroundColor = '#c8e6c9'; // Some completion - very light green
                        textColor = '#2e7d32';
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor,
                          color: textColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: isToday ? 'bold' : 'normal',
                          border: isToday ? '2px solid #2e7d32' : 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        title={`${dayNum}: ${completionCount} completion${completionCount !== 1 ? 's' : ''}`}
                      >
                        {dayNum}
                        {completionCount > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            borderRadius: '50%',
                            width: '8px',
                            height: '8px',
                            fontSize: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {completionCount > 9 ? '9+' : completionCount}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginTop: '8px',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  <span>Less</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '2px' }} />
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#c8e6c9', borderRadius: '2px' }} />
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#8bc34a', borderRadius: '2px' }} />
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#4caf50', borderRadius: '2px' }} />
                  </div>
                  <span>More</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Data Export Section */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #1976d2'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1565c0', fontSize: '16px' }}>
                Export Data
              </h3>
              <p style={{ margin: '0', fontSize: '12px', color: '#1976d2' }}>
                Download your habit data for analysis
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  // Generate CSV data
                  const csvData = generateCSVExport(habit);
                  downloadFile(csvData, `${habit.name}_habit_data.csv`, 'text/csv');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📊 CSV
              </button>
              <button
                onClick={() => {
                  // Generate JSON data
                  const jsonData = generateJSONExport(habit, stats);
                  downloadFile(jsonData, `${habit.name}_habit_data.json`, 'application/json');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#388e3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📄 JSON
              </button>
            </div>
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
