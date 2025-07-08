import React, { useState, useEffect } from 'react';

// Helper function to parse expected frequency
const parseExpectedFrequency = (frequency) => {
  if (!frequency) return { timesPerPeriod: 1, periodDays: 1 }; // Default to daily
  
  // Handle structured frequency object
  if (typeof frequency === 'object' && frequency.count && frequency.period) {
    const { count, period } = frequency;
    switch (period) {
      case 'day':
        return { timesPerPeriod: count, periodDays: 1 };
      case 'week':
        return { timesPerPeriod: count, periodDays: 7 };
      case 'month':
        return { timesPerPeriod: count, periodDays: 30 };
      default:
        return { timesPerPeriod: 1, periodDays: 1 };
    }
  }
  
  // Handle legacy string frequency
  if (typeof frequency !== 'string') return { timesPerPeriod: 1, periodDays: 1 };
  
  const freq = frequency.toLowerCase();
  if (freq.includes('daily') || freq === 'daily') return { timesPerPeriod: 1, periodDays: 1 };
  if (freq.includes('weekly') || freq === 'weekly') return { timesPerPeriod: 1, periodDays: 7 };
  
  // Parse patterns like "2 times/week", "3 times per week", etc.
  const match = freq.match(/(\d+)\s*times?\s*(?:per\s*|\/)\s*week/);
  if (match) return { timesPerPeriod: parseInt(match[1]), periodDays: 7 };
  
  // Parse patterns like "every 2 days", "every 3 days"
  const everyMatch = freq.match(/every\s*(\d+)\s*days?/);
  if (everyMatch) {
    const days = parseInt(everyMatch[1]);
    return { timesPerPeriod: 1, periodDays: days };
  }
  
  return { timesPerPeriod: 1, periodDays: 1 }; // Default to daily if can't parse
};

// Helper function to generate percentage-based heatmap colors
const getHeatmapColor = (completions, targetCount) => {
  if (completions === 0) return '#ebedf0'; // Gray for no activity (0%)
  
  // Calculate percentage of completion
  const percentage = (completions / targetCount) * 100;
  
  // Percentage-based color scheme
  if (percentage >= 100) return '#216e39'; // Darkest green (100% or more)
  if (percentage >= 75) return '#30a14e';  // Dark green (75-99%)
  if (percentage >= 50) return '#40c463';  // Medium green (50-74%)
  if (percentage >= 25) return '#9be9a8';  // Light green (25-49%)
  if (percentage >= 1) return '#d2f8d2';   // Very light green (1-24%)
  
  // Fallback (shouldn't reach here)
  return '#ebedf0';
};

// Helper function to generate GitHub-style yearly heatmap
const generateYearlyHeatmap = (completedDates, habit) => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const weeks = [];
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  
  // Get daily target from habit's expected frequency
  const getDailyTarget = (habit) => {
    if (habit.expectedFrequency && typeof habit.expectedFrequency === 'object') {
      const { count, period } = habit.expectedFrequency;
      if (period === 'day') return count;
      if (period === 'week') return Math.ceil(count / 7);
      if (period === 'month') return Math.ceil(count / 30);
      if (period === 'year') return Math.ceil(count / 365);
    }
    return 1; // Default to 1 per day
  };
  
  const dailyTarget = getDailyTarget(habit);
  
  // Calculate completions for each day
  const dailyCompletions = {};
  completedDates.forEach(dateStr => {
    const date = dateStr.slice(0, 10);
    dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
  });
  
  // Generate 53 weeks of data (GitHub style)
  for (let week = 0; week < 53; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (week * 7) + day);
      
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const completions = dailyCompletions[dateStr] || 0;
      
      days.push({
        date: currentDate.getDate(),
        fullDate: currentDate,
        dateStr: dateStr,
        completions: completions,
        targetCount: dailyTarget,
        percentage: dailyTarget > 0 ? (completions / dailyTarget) * 100 : 0,
        color: getHeatmapColor(completions, dailyTarget),
        isToday: dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear()
      });
    }
    weeks.push(days);
  }
  
  return {
    type: 'heatmap',
    data: weeks,
    dailyTarget: dailyTarget,
    totalCompletions: Object.values(dailyCompletions).reduce((a, b) => a + b, 0)
  };
};

// Helper function to generate calendar data
const generateCalendarData = (completedDates, frequency, selectedDate = null, habit = null) => {
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // For yearly habits, show GitHub-style heatmap
  if (frequency?.period === 'year') {
    return generateYearlyHeatmap(completedDates, habit);
  }
  
  // For other frequencies, show enhanced monthly view with heatmap styling
  const referenceDate = selectedDate || today;
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
  
  // Get daily target from habit's expected frequency
  const getDailyTarget = (habit) => {
    if (habit && habit.expectedFrequency && typeof habit.expectedFrequency === 'object') {
      const { count, period } = habit.expectedFrequency;
      if (period === 'day') return count;
      if (period === 'week') return Math.ceil(count / 7);
      if (period === 'month') return Math.ceil(count / 30);
      if (period === 'year') return Math.ceil(count / 365);
    }
    return 1; // Default to 1 per day
  };
  
  const dailyTarget = getDailyTarget(habit);
  
  // Calculate completions for each day
  const dailyCompletions = {};
  completedDates.forEach(dateStr => {
    const date = dateStr.slice(0, 10);
    dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
  });
  
  const days = [];
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Use local timezone for consistent date comparison
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const completions = completedDates.filter(cd => cd.slice(0, 10) === dateStr).length;
    
    days.push({
      date: currentDate.getDate(),
      fullDate: currentDate,
      dateStr: dateStr,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: dateStr === todayDateStr,
      hasCompletion: completions > 0,
      completions: completions,
      targetCount: dailyTarget,
      percentage: dailyTarget > 0 ? (completions / dailyTarget) * 100 : 0,
      color: getHeatmapColor(completions, dailyTarget)
    });
  }
  
  return { 
    type: 'month', 
    data: days,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dailyTarget: dailyTarget
  };
};

function MetricsView({ habits, selectedHabit, onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // Navigation functions
  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };
  
  useEffect(() => {
    if (selectedHabit) {
      setLoading(true);
      setError('');
      
      // Calculate metrics from habit data
      const calculateMetrics = () => {
        const habit = selectedHabit;
        const today = new Date().toISOString().slice(0, 10);
        const completedDates = habit.completedDates || [];
        
        // Parse expected frequency
        let expectedFrequency = 'Not set';
        if (habit.expectedFrequency) {
          if (typeof habit.expectedFrequency === 'object') {
            const { count, period } = habit.expectedFrequency;
            expectedFrequency = `${count} times per ${period}`;
          } else {
            expectedFrequency = habit.expectedFrequency;
          }
        }
        
        // Calculate streak (basic mode: count consecutive days with any completion)
        let currentStreak = 0;
        const dates = completedDates.map(d => d.slice(0, 10)).sort();
        
        if (dates.length > 0) {
          const latestDate = dates[dates.length - 1];
          if (latestDate === today) {
            currentStreak = 1;
            // Count consecutive days backwards
            for (let i = dates.length - 2; i >= 0; i--) {
              const prevDate = new Date(dates[i]);
              const nextDate = new Date(dates[i + 1]);
              const diffTime = nextDate - prevDate;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }
        
        // Calculate period-based progress based on expected frequency
        let periodCompletions, expectedInPeriod, completionRate, periodLabel;
        
        if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
          const { count, period } = habit.expectedFrequency;
          
          if (period === 'day') {
            // Daily habits: show total completions vs expected completions this week
            const startOfWeek = new Date();
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            // Count total completions this week
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfWeek && d <= endOfWeek;
            }).length;
            
            expectedInPeriod = count * 7; // expected times per day × 7 days
            periodLabel = 'This Week Progress';
            
          } else if (period === 'week') {
            // Weekly habits: show total completions vs expected completions this week
            const startOfWeek = new Date();
            const dayOfWeek = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfWeek && d <= endOfWeek;
            }).length;
            
            expectedInPeriod = count; // expected times per week
            periodLabel = 'This Week Progress';
            
          } else if (period === 'month') {
            // Monthly habits: show total completions vs expected completions this month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfMonth && d <= endOfMonth;
            }).length;
            
            expectedInPeriod = count; // expected times per month
            periodLabel = 'This Month Progress';
            
          } else if (period === 'year') {
            // Yearly habits: show total completions vs expected completions this year
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            endOfYear.setHours(23, 59, 59, 999);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfYear && d <= endOfYear;
            }).length;
            
            expectedInPeriod = count; // expected times per year
            periodLabel = 'This Year Progress';
            
          } else {
            // Default to weekly
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfWeek && d <= endOfWeek;
            }).length;
            
            expectedInPeriod = 7; // Default expectation
            periodLabel = 'This Week Progress';
          }
        } else {
          // Legacy or no frequency set - default to weekly
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          periodCompletions = completedDates.filter(date => {
            const d = new Date(date);
            return d >= startOfWeek && d <= endOfWeek;
          }).length;
          
          expectedInPeriod = 7; // Default expectation
          periodLabel = 'This Week Progress';
        }
        
        completionRate = expectedInPeriod > 0 ? Math.min((periodCompletions / expectedInPeriod) * 100, 100) : 0;
        
        // Calculate advanced analytics
        const now = new Date();
        
        // Success rate trends - DAY-BASED SUCCESS RATE
        // Calculate successful days (days where goal was met)
        const { timesPerPeriod: targetPerDay, periodDays } = parseExpectedFrequency(habit.expectedFrequency);
        let dailyTarget = targetPerDay;
        if (periodDays === 7) {
          dailyTarget = Math.ceil(targetPerDay / 7); // Weekly habits distributed over 7 days
        } else if (periodDays === 30) {
          dailyTarget = Math.ceil(targetPerDay / 30); // Monthly habits distributed over 30 days
        }
        
        // Count successful days in last 7 days
        let weeklySuccessfulDays = 0;
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dayStr = checkDate.toISOString().slice(0, 10);
          
          const dayCompletions = completedDates.filter(dateTime => 
            dateTime.slice(0, 10) === dayStr
          ).length;
          
          if (dayCompletions >= dailyTarget) {
            weeklySuccessfulDays++;
          }
        }
        
        // Count successful days in last 30 days  
        let monthlySuccessfulDays = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dayStr = checkDate.toISOString().slice(0, 10);
          
          const dayCompletions = completedDates.filter(dateTime => 
            dateTime.slice(0, 10) === dayStr
          ).length;
          
          if (dayCompletions >= dailyTarget) {
            monthlySuccessfulDays++;
          }
        }
        
        const weeklySuccessRate = Math.round((weeklySuccessfulDays / 7) * 100);
        const monthlySuccessRate = Math.round((monthlySuccessfulDays / 30) * 100);
        
        // Best time analysis
        const hourCounts = {};
        completedDates.forEach(date => {
          const hour = new Date(date).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        const bestHour = Object.keys(hourCounts).length > 0 ? 
          Object.entries(hourCounts).reduce((a, b) => 
            hourCounts[a[0]] > hourCounts[b[0]] ? a : b, ['0', 0])[0] : null;
        
        // Consistency score
        const totalDays = Math.max(1, Math.floor((now - new Date(completedDates[0] || now)) / (1000 * 60 * 60 * 24)) + 1);
        const activeDays = new Set(completedDates.map(d => d.slice(0, 10))).size;
        const consistencyScore = Math.min(
          Math.round((currentStreak / 30) * 50) + 
          Math.round((activeDays / totalDays) * 50),
          100
        );
        
        return {
          currentStreak,
          totalCompletions: completedDates.length,
          periodCompletions,
          expectedInPeriod,
          completionRate: completionRate.toFixed(1),
          expectedFrequency,
          periodLabel,
          // Advanced metrics
          weeklySuccessRate,
          monthlySuccessRate,
          bestHour: bestHour ? `${bestHour}:00` : 'N/A',
          consistencyScore: consistencyScore || 0,
          totalDays,
          activeDays
        };
      };
      
      try {
        const calculatedMetrics = calculateMetrics();
        setMetrics(calculatedMetrics);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating metrics:', err);
        setError('Error calculating metrics');
        setLoading(false);
      }
    }
  }, [selectedHabit, selectedMonth]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          <div className="modal-form">
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                fontSize: '24px',
                animation: 'pulse 2s infinite'
              }}>📊</div>
              <div style={{ 
                fontSize: '16px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>Loading metrics...</div>
              <div style={{
                width: '40px',
                height: '4px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  borderRadius: '2px',
                  animation: 'loading-bar 1.5s infinite'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedHabit) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', position: 'relative' }}>
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#d32f2f';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f44336';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
        
        <div className="modal-form">
          <div className="modal-header">
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span>
              <span>{selectedHabit.name} Analytics</span>
            </h3>
          </div>
        
        {error ? (
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
        ) : metrics ? (
          <div>
            {/* Quick Performance Overview */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
              <div className="modern-card-header">
                <h4 className="modern-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏆 Quick Performance Overview
                  <span 
                    style={{ 
                      fontSize: '14px', 
                      cursor: 'help', 
                      color: '#6b7280',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '12px',
                      fontWeight: 'normal'
                    }}
                    title="Success Rate Logic: Counts successful days where you met your daily goal. Example: If your habit is '5 times per day' and you achieved this goal on 2 out of 7 days, your success rate is 2/7 = 29%. This shows how consistently you meet your targets, not just total completions."
                  >
                    ℹ️
                  </span>
                </h4>
              </div>
              <div className="modern-card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: metrics.weeklySuccessRate >= 80 ? '#059669' : 
                            metrics.weeklySuccessRate >= 60 ? '#d97706' : '#dc2626'
                    }}>
                      {metrics.weeklySuccessRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      7-Day Success
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: metrics.monthlySuccessRate >= 80 ? '#059669' : 
                            metrics.monthlySuccessRate >= 60 ? '#d97706' : '#dc2626'
                    }}>
                      {metrics.monthlySuccessRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      30-Day Success
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: metrics.consistencyScore >= 80 ? '#059669' : 
                            metrics.consistencyScore >= 60 ? '#d97706' : '#dc2626'
                    }}>
                      {metrics.consistencyScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Consistency Score
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: '#3b82f6'
                    }}>
                      {metrics.bestHour}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Most Active Hour
                    </div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }}></div>
                    <span>Excellent (80%+)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#d97706', borderRadius: '50%' }}></div>
                    <span>Good (60-79%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }}></div>
                    <span>Needs Improvement (&lt;60%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Frequency Section */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
              <div className="modern-card-header">
                <h4 className="modern-card-title">🎯 Expected Frequency</h4>
              </div>
              <div className="modern-card-body">
                <div style={{ 
                  textAlign: 'center',
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#059669'
                }}>
                  {selectedHabit.expectedFrequency?.count || 1} times per {selectedHabit.expectedFrequency?.period || 'day'}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            {/* Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div className="modern-card" style={{ textAlign: 'center' }}>
                <div className="modern-card-body">
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {metrics.currentStreak}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    🔥 Current Streak
                  </div>
                </div>
              </div>
              
              <div className="modern-card" style={{ textAlign: 'center' }}>
                <div className="modern-card-body">
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981' }}>
                    {metrics.totalCompletions}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                    ✅ Total Completions
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
              <div className="modern-card-header">
                <h4 className="modern-card-title">📈 Weekly Progress Trend</h4>
              </div>
              <div className="modern-card-body">
                {(() => {
                  // Generate last 7 days data
                  const weeklyData = [];
                  const today = new Date();
                  const completedDates = selectedHabit.completedDates || [];
                  
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = date.toISOString().slice(0, 10);
                    const completions = completedDates.filter(cd => cd.slice(0, 10) === dateStr).length;
                    
                    weeklyData.push({
                      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                      date: dateStr,
                      completions: completions,
                      isToday: i === 0
                    });
                  }
                  
                  const maxCompletions = Math.max(...weeklyData.map(d => d.completions), 1);
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'end', gap: '8px', padding: '16px' }}>
                      {weeklyData.map((day, index) => (
                        <div key={index} style={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: day.isToday ? '#3b82f6' : '#6b7280'
                          }}>
                            {day.completions}
                          </div>
                          <div style={{
                            width: '24px',
                            height: `${Math.max((day.completions / maxCompletions) * 60, 4)}px`,
                            backgroundColor: day.completions > 0 
                              ? (day.isToday ? '#3b82f6' : '#10b981')
                              : '#e5e7eb',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          title={`${day.day}: ${day.completions} / ${day.targetCount} times (${Math.round(day.percentage)}%)`}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                          }}
                          />
                          <div style={{ 
                            fontSize: '11px', 
                            color: day.isToday ? '#3b82f6' : '#9ca3af',
                            fontWeight: day.isToday ? 'bold' : 'normal'
                          }}>
                            {day.day}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Dynamic Period Progress */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
              <div className="modern-card-header">
                <h4 className="modern-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 {metrics.periodLabel}
                  <span 
                    style={{ 
                      fontSize: '14px', 
                      cursor: 'help', 
                      color: '#6b7280',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '12px',
                      fontWeight: 'normal'
                    }}
                    title="Progress Logic: Shows total completions vs expected completions for the period. Example: If your habit is '5 times per day', this week expects 35 total (5×7). If you completed 6 times (any days), progress is 6/35 = 17%. This tracks your overall activity volume."
                  >
                    ℹ️
                  </span>
                </h4>
              </div>
              <div className="modern-card-body">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {metrics.periodCompletions} / {metrics.expectedInPeriod} completions
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>
                    {metrics.completionRate}%
                  </span>
                </div>
                <div style={{ 
                  backgroundColor: '#e5e7eb', 
                  height: '12px', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    backgroundColor: '#7c3aed', 
                    height: '100%', 
                    width: `${Math.min((metrics.periodCompletions / metrics.expectedInPeriod) * 100, 100)}%`,
                    transition: 'width 0.3s ease',
                    borderRadius: '6px'
                  }} />
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {(() => {
              const calendarData = generateCalendarData(
                selectedHabit.completedDates || [], 
                selectedHabit.expectedFrequency,
                selectedHabit.expectedFrequency?.period === 'year' ? null : selectedMonth,
                selectedHabit  // Pass the habit for target calculation
              );
              
              return (
                <div className="modern-card" style={{ 
                  marginBottom: '24px',
                  animation: 'slideIn 0.5s ease-out'
                }}>
                  <div className="modern-card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 className="modern-card-title">
                        📅 {calendarData.type === 'heatmap' ? 'Activity Heatmap - GitHub Style' : `Calendar View - ${calendarData.monthName || 'Current Month'}`}
                      </h4>
                      
                      {/* Navigation buttons */}
                      {calendarData.type !== 'heatmap' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigateMonth(-1)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#e5e7eb';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            ← Previous
                          </button>
                          <button
                            onClick={() => setSelectedMonth(new Date())}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#3b82f6',
                              border: '1px solid #3b82f6',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#ffffff',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#2563eb';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#3b82f6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            Today
                          </button>
                          <button
                            onClick={() => navigateMonth(1)}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#e5e7eb';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modern-card-body">
                    {calendarData.type === 'heatmap' ? (
                      // GitHub-style yearly heatmap
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '4px',
                          marginBottom: '16px'
                        }}>
                          {/* Month labels */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(53, 1fr)', 
                            gap: '2px',
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '8px'
                          }}>
                            {calendarData.data.map((week, weekIndex) => (
                              <div key={weekIndex} style={{ textAlign: 'center' }}>
                                {weekIndex % 4 === 0 && week[0] && week[0].fullDate.getDate() <= 7 ? 
                                  week[0].fullDate.toLocaleDateString('en-US', { month: 'short' }) : ''}
                              </div>
                            ))}
                          </div>
                          
                          {/* Day labels */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: '#6b7280', marginRight: '8px' }}>
                              <div style={{ height: '12px', lineHeight: '12px' }}>Mon</div>
                              <div style={{ height: '12px', lineHeight: '12px' }}></div>
                              <div style={{ height: '12px', lineHeight: '12px' }}>Wed</div>
                              <div style={{ height: '12px', lineHeight: '12px' }}></div>
                              <div style={{ height: '12px', lineHeight: '12px' }}>Fri</div>
                              <div style={{ height: '12px', lineHeight: '12px' }}></div>
                              <div style={{ height: '12px', lineHeight: '12px' }}>Sun</div>
                            </div>
                            
                            {/* Heatmap grid */}
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(53, 1fr)', 
                              gap: '2px',
                              flex: 1
                            }}>
                              {calendarData.data.map((week, weekIndex) => (
                                <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {week.map((day, dayIndex) => (
                                    <div
                                      key={`${weekIndex}-${dayIndex}`}
                                      style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: day.color,
                                        border: day.isToday ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative'
                                      }}
                                      title={`${day.fullDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.completions} / ${day.targetCount} times (${Math.round(day.percentage)}%)`}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.5)';
                                        e.target.style.zIndex = '10';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.zIndex = '1';
                                        e.target.style.boxShadow = 'none';
                                      }}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Heatmap legend */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px'
                        }}>
                          <div>
                            <strong>{calendarData.totalCompletions}</strong> completions in the last year
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>0%</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#ebedf0', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#d2f8d2', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#9be9a8', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#40c463', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#30a14e', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#216e39', borderRadius: '2px' }} />
                            </div>
                            <span>100%+</span>
                          </div>
                        </div>
                      </div>
                    ) : calendarData.type === 'year' ? (
                      // Yearly view - 12 months grid
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '12px' 
                      }}>
                        {calendarData.data.map((month, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              borderRadius: '10px',
                              border: '2px solid #e5e7eb',
                              backgroundColor: month.hasCompletion ? '#dcfce7' : '#f9fafb',
                              borderColor: month.hasCompletion ? '#10b981' : '#e5e7eb',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              transform: 'scale(1)',
                              boxShadow: month.hasCompletion ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = month.hasCompletion 
                                ? '0 8px 24px rgba(16, 185, 129, 0.25)' 
                                : '0 4px 12px rgba(0, 0, 0, 0.1)';
                              e.target.style.backgroundColor = month.hasCompletion 
                                ? '#bbf7d0' 
                                : '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = month.hasCompletion 
                                ? '0 4px 12px rgba(16, 185, 129, 0.15)' 
                                : 'none';
                              e.target.style.backgroundColor = month.hasCompletion 
                                ? '#dcfce7' 
                                : '#f9fafb';
                            }}
                          >
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: 'bold', 
                              color: month.hasCompletion ? '#065f46' : '#6b7280',
                              marginBottom: '4px'
                            }}>
                              {month.name}
                            </div>
                            {month.hasCompletion && (
                              <div style={{
                                fontSize: '12px',
                                color: '#10b981',
                                fontWeight: '500'
                              }}>
                                {month.completions} ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Monthly view - calendar grid
                      <div>
                        {/* Calendar header */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(7, 1fr)', 
                          gap: '4px',
                          marginBottom: '12px'
                        }}>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div
                              key={day}
                              style={{
                                padding: '10px',
                                textAlign: 'center',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#4b5563',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar body */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(7, 1fr)', 
                          gap: '4px' 
                        }}>
                          {calendarData.data.map((day, index) => (
                            <div
                              key={index}
                              style={{
                                aspectRatio: '1 / 1',  // Force perfect square
                                width: '100%',
                                padding: '4px',
                                textAlign: 'center',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                backgroundColor: day.isCurrentMonth 
                                  ? day.color 
                                  : '#f9fafb',
                                color: day.isCurrentMonth 
                                  ? (day.completions > 0 ? '#ffffff' : '#374151')
                                  : '#9ca3af',
                                border: day.isToday 
                                  ? '2px solid #3b82f6' 
                                  : '1px solid rgba(0,0,0,0.1)',
                                fontWeight: day.isToday ? 'bold' : 'normal',
                                cursor: day.isCurrentMonth ? 'pointer' : 'default',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: day.isToday ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                                transform: 'scale(1)',
                                position: 'relative',
                                overflow: 'hidden'  // Prevent content from breaking square shape
                              }}
                              title={day.isCurrentMonth ? `${day.fullDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.completions} / ${day.targetCount} times (${Math.round(day.percentage)}%)` : ''}
                              onMouseEnter={(e) => {
                                if (day.isCurrentMonth) {
                                  e.target.style.transform = 'scale(1.05)';
                                  e.target.style.boxShadow = day.completions > 0 
                                    ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                                    : '0 4px 12px rgba(0, 0, 0, 0.1)';
                                  e.target.style.zIndex = '10';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (day.isCurrentMonth) {
                                  e.target.style.transform = 'scale(1)';
                                  e.target.style.boxShadow = day.isToday 
                                    ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
                                    : 'none';
                                  e.target.style.zIndex = '1';
                                }
                              }}
                            >
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                lineHeight: '1',
                                marginBottom: '2px'
                              }}>
                                {day.date}
                              </span>
                              {/* Always render a completion count area to maintain consistent height */}
                              <span style={{
                                fontSize: '10px',
                                lineHeight: '1',
                                fontWeight: 'bold',
                                color: day.completions > 1 ? 
                                  (day.completions > 0 ? '#ffffff' : '#10b981') : 'transparent',
                                backgroundColor: day.completions > 1 ? 
                                  (day.completions > 0 ? 'rgba(0,0,0,0.2)' : 'transparent') : 'transparent',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                visibility: day.completions > 1 ? 'visible' : 'hidden',
                                minHeight: '16px',  // Reserve space even when hidden
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {day.completions > 1 ? `${day.completions}×` : '2×'}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* GitHub-style heatmap legend */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          fontSize: '12px',
                          color: '#6b7280',
                          marginTop: '16px',
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div>
                            <strong>{calendarData.data.filter(d => d.completions > 0).length}</strong> days with completions this month
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>0%</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#ebedf0', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#d2f8d2', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#9be9a8', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#40c463', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#30a14e', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#216e39', borderRadius: '2px' }} />
                            </div>
                            <span>100%+</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Notes Section */}
            {selectedHabit.notes && selectedHabit.notes.length > 0 && (
              <div className="modern-card" style={{ marginBottom: '24px' }}>
                <div className="modern-card-header">
                  <h4 className="modern-card-title">📝 Notes ({selectedHabit.notes.length})</h4>
                </div>
                <div className="modern-card-body">
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedHabit.notes.slice(-3).map((note, index) => (
                      <div key={index} className="modern-card" style={{ 
                        marginBottom: '12px',
                        border: '1px solid #e5e7eb',
                        borderLeft: '4px solid #3b82f6'
                      }}>
                        <div className="modern-card-body" style={{ padding: '12px' }}>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280', 
                            marginBottom: '6px',
                            fontWeight: '500'
                          }}>
                            {note.date ? new Date(note.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'No date'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                            {note.text || note}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedHabit.notes.length > 3 && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280', 
                        textAlign: 'center', 
                        fontStyle: 'italic',
                        marginTop: '8px'
                      }}>
                        Showing last 3 notes...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="modern-card">
              <div className="modern-card-header">
                <h4 className="modern-card-title">🔄 Recent Activity</h4>
              </div>
              <div className="modern-card-body">
                {selectedHabit.completedDates && selectedHabit.completedDates.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedHabit.completedDates
                      .map(dateTime => new Date(dateTime))
                      .sort((a, b) => b.getTime() - a.getTime()) // Sort newest first
                      .slice(0, 10) // Show only last 10 completions
                      .map((date, index) => (
                        <div key={index} style={{ 
                          padding: '8px 12px',
                          margin: '4px 0',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ color: '#10b981' }}>✅</span>
                          <span style={{ color: '#374151' }}>
                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                    No completions yet. Start tracking today!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

export default MetricsView;
