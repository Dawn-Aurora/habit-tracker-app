import React, { useState, useEffect } from 'react';
import './MetricsView.css';

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
  
  // New 4-tier color system
  if (percentage >= 100) return '#22c55e';  // Green (100%)
  if (percentage >= 50) return '#f97316';   // Orange (50%-99%)
  if (percentage >= 1) return '#eab308';    // Yellow (1%-49%)
  
  // Fallback (shouldn't reach here)
  return '#ebedf0'; // Gray
};

// Helper function to get background color for completion percentage
const getCompletionBackgroundColor = (completions, targetCount) => {
  if (completions === 0) return '#f9fafb'; // Light gray for no activity
  
  const percentage = (completions / targetCount) * 100;
  
  if (percentage >= 100) return '#dcfce7';  // Light green (100%)
  if (percentage >= 50) return '#fed7aa';   // Light orange (50%-99%)
  if (percentage >= 1) return '#fef3c7';    // Light yellow (1%-49%)
  
  return '#f9fafb'; // Light gray fallback
};

// Helper function to get text color for completion percentage
const getCompletionTextColor = (completions, targetCount) => {
  if (completions === 0) return '#6b7280'; // Gray for no activity
  
  const percentage = (completions / targetCount) * 100;
  
  if (percentage >= 100) return '#059669';  // Dark green (100%) - keep existing since it's darker
  if (percentage >= 50) return '#ea580c';   // Dark orange (50%-99%)
  if (percentage >= 1) return '#ca8a04';    // Dark yellow (1%-49%)
  
  return '#6b7280'; // Gray fallback
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
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Navigation functions (for future use)
  // eslint-disable-next-line no-unused-vars
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
        let consistencyScore;
        
        // Check if this is an annual habit
        const isAnnualHabit = habit.expectedFrequency && 
          typeof habit.expectedFrequency === 'object' && 
          habit.expectedFrequency.period === 'year';
        
        if (isAnnualHabit) {
          // For annual habits, consistency score = (completions this year / expected per year) * 100
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          endOfYear.setHours(23, 59, 59, 999);
          
          const yearCompletions = completedDates.filter(date => {
            const d = new Date(date);
            return d >= startOfYear && d <= endOfYear;
          }).length;
          
          const expectedPerYear = habit.expectedFrequency.count || 1;
          consistencyScore = Math.min(Math.round((yearCompletions / expectedPerYear) * 100), 100);
        } else {
          // Original logic for daily/weekly/monthly habits
          const totalDays = Math.max(1, Math.floor((now - new Date(completedDates[0] || now)) / (1000 * 60 * 60 * 24)) + 1);
          const activeDays = new Set(completedDates.map(d => d.slice(0, 10))).size;
          consistencyScore = Math.min(
            Math.round((currentStreak / 30) * 50) + 
            Math.round((activeDays / totalDays) * 50),
            100
          );
        }
        
        // Calculate totalDays and activeDays for metrics
        const totalDays = Math.max(1, Math.floor((now - new Date(completedDates[0] || now)) / (1000 * 60 * 60 * 24)) + 1);
        const activeDays = new Set(completedDates.map(d => d.slice(0, 10))).size;
        
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
            justifyContent: 'center',
            lineHeight: 1
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
                  gridTemplateColumns: (() => {
                    // Check if this is an annual habit
                    const isAnnualHabit = selectedHabit.expectedFrequency && 
                      typeof selectedHabit.expectedFrequency === 'object' && 
                      selectedHabit.expectedFrequency.period === 'year';
                    
                    // For annual habits, show only 2 columns (Consistency Score + Total Completions)
                    return isAnnualHabit ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))';
                  })(), 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {(() => {
                    // Check if this is an annual habit
                    const isAnnualHabit = selectedHabit.expectedFrequency && 
                      typeof selectedHabit.expectedFrequency === 'object' && 
                      selectedHabit.expectedFrequency.period === 'year';
                    
                    return (
                      <>
                        {/* Show 7-day success only for non-annual habits */}
                        {!isAnnualHabit && (
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
                        )}
                        
                        {/* Show 30-day success only for non-annual habits */}
                        {!isAnnualHabit && (
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
                        )}
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
                      </>
                    );
                  })()} 
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
                    <span>Excellent (80%+)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#f97316', borderRadius: '50%' }}></div>
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

            {/* Weekly Progress - Horizontal Scroll Bar (Hide for annual and monthly habits) */}
            {(() => {
              // Check if this is an annual or monthly habit
              const isAnnualHabit = selectedHabit.expectedFrequency && 
                typeof selectedHabit.expectedFrequency === 'object' && 
                selectedHabit.expectedFrequency.period === 'year';
              
              const isMonthlyHabit = selectedHabit.expectedFrequency && 
                typeof selectedHabit.expectedFrequency === 'object' && 
                selectedHabit.expectedFrequency.period === 'month';
              
              if (isAnnualHabit || isMonthlyHabit) {
                return null; // Don't show weekly progress for annual or monthly habits
              }
              
              return (
                <div className="modern-card" style={{ marginBottom: '24px' }}>
                  <div className="modern-card-header">
                    <h4 className="modern-card-title">📈 Weekly Progress</h4>
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
                    
                    // Calculate target for this day
                    let dailyTarget = 1;
                    if (selectedHabit.expectedFrequency && typeof selectedHabit.expectedFrequency === 'object') {
                      const { count, period } = selectedHabit.expectedFrequency;
                      if (period === 'day') dailyTarget = count;
                      if (period === 'week') dailyTarget = Math.ceil(count / 7);
                      if (period === 'month') dailyTarget = Math.ceil(count / 30);
                    }
                    
                    const percentage = dailyTarget > 0 ? Math.min((completions / dailyTarget) * 100, 100) : 0;
                    let status;
                    if (percentage >= 100) {
                      status = 'completed'; // Green (100%)
                    } else if (percentage >= 50) {
                      status = 'high-partial'; // Orange (50%-99%)
                    } else if (percentage >= 1) {
                      status = 'low-partial'; // Yellow (1%-49%)
                    } else {
                      status = 'empty'; // Gray (0%)
                    }
                    
                    weeklyData.push({
                      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                      date: dateStr,
                      completions: completions,
                      targetCount: dailyTarget,
                      percentage: percentage,
                      isToday: i === 0,
                      status: status
                    });
                  }
                  
                  // Calculate summary
                  const completedDays = weeklyData.filter(d => d.status === 'completed').length;
                  const totalActions = weeklyData.reduce((sum, d) => sum + d.completions, 0);
                  const expectedActions = weeklyData.reduce((sum, d) => sum + d.targetCount, 0);
                  
                  return (
                    <div>
                      {/* Compact Summary */}
                      <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                          ✅ {completedDays} of 7 days completed
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {totalActions} of {expectedActions} actions done this week
                        </div>
                      </div>
                      
                      {/* Horizontal Scroll Bar */}
                      <div className="weekly-progress-mobile">
                        {weeklyData.map((day, index) => (
                          <div 
                            key={index} 
                            className={`weekly-day-card ${day.status} ${day.isToday ? 'today' : ''}`}
                            title={`${day.day}: ${day.completions}/${day.targetCount} (${Math.round(day.percentage)}%)`}
                          >
                            <div className="weekly-day-label">{day.day}</div>
                            <div className="weekly-day-count">
                              {day.completions > 0 ? `${day.completions}×` : '0'}
                            </div>
                            <div className="weekly-day-progress">
                              <div 
                                className="weekly-day-progress-fill"
                                style={{ width: `${day.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
              );
            })()} 

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

            {/* Calendar View - Mobile Optimized */}
            {(() => {
              // eslint-disable-next-line no-unused-vars
              const calendarData = generateCalendarData(
                selectedHabit.completedDates || [], 
                selectedHabit.expectedFrequency,
                selectedHabit.expectedFrequency?.period === 'year' ? null : selectedMonth,
                selectedHabit
              );
              
              return (
                <div className="calendar-mobile-container">
                  <div 
                    className={`calendar-toggle ${showCalendar ? 'expanded' : ''}`}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <h4>📅 Calendar View</h4>
                    <span style={{ 
                      fontSize: '18px', 
                      transform: showCalendar ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}>
                      ▼
                    </span>
                  </div>
                  
                  <div className={`calendar-content ${showCalendar ? 'expanded' : 'collapsed'}`}>
                    {/* Calendar Header - Month View Only */}
                    <div className="calendar-header-mobile">
                      <div className="calendar-month-nav">
                        <button 
                          className="calendar-nav-btn"
                          onClick={() => {
                            const newDate = new Date(selectedMonth);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setSelectedMonth(newDate);
                          }}
                        >
                          ◀
                        </button>
                        <div className="calendar-month-year">
                          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <button 
                          className="calendar-nav-btn"
                          onClick={() => {
                            const newDate = new Date(selectedMonth);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setSelectedMonth(newDate);
                          }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    {/* Month View Calendar Grid */}
                    {/* Hide day headers for annual habits */}
                    {!(selectedHabit.expectedFrequency && 
                       typeof selectedHabit.expectedFrequency === 'object' && 
                       selectedHabit.expectedFrequency.period === 'year') && (
                      <div className="mini-calendar-header">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                          <div key={`day-${index}-${day}`} className="mini-calendar-day-header">{day}</div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mini-calendar-grid">
                      {/* Show current month in 7×~5 grid for non-annual habits, or year view for annual habits */}
                      {(() => {
                        // Check if this is an annual habit
                        const isAnnualHabit = selectedHabit.expectedFrequency && 
                          typeof selectedHabit.expectedFrequency === 'object' && 
                          selectedHabit.expectedFrequency.period === 'year';
                        
                        if (isAnnualHabit) {
                          // Annual habit: Show 12 months of current year
                          const currentYear = selectedMonth.getFullYear();
                          const months = [];
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          
                          for (let month = 0; month < 12; month++) {
                            // Count completions in this month
                            const monthCompletions = (selectedHabit.completedDates || [])
                              .filter(cd => {
                                const date = new Date(cd);
                                return date.getFullYear() === currentYear && 
                                       date.getMonth() === month;
                              }).length;
                            
                            // Get monthly target
                            const { count: yearlyTarget } = selectedHabit.expectedFrequency;
                            const monthlyTarget = Math.ceil(yearlyTarget / 12);
                            
                            const completionRate = monthlyTarget > 0 ? 
                              Math.min((monthCompletions / monthlyTarget) * 100, 100) : 0;
                            
                            const hasCompletion = monthCompletions >= monthlyTarget;
                            const partialCompletion = monthCompletions > 0 && monthCompletions < monthlyTarget;
                            const isCurrentMonth = month === new Date().getMonth() && 
                                                 currentYear === new Date().getFullYear();
                            
                            months.push(
                              <div
                                key={month}
                                className={`annual-month-cell ${
                                  hasCompletion ? 'has-completion' : 
                                  partialCompletion ? 'partial-completion' : ''
                                } ${isCurrentMonth ? 'current-month' : ''}`}
                                title={`${monthNames[month]} ${currentYear}: ${monthCompletions}/${monthlyTarget} completed (${Math.round(completionRate)}%)`}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '12px 8px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: getCompletionBackgroundColor(monthCompletions, monthlyTarget),
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minHeight: '60px'
                                }}
                              >
                                <div style={{ 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  color: '#374151',
                                  marginBottom: '4px'
                                }}>
                                  {monthNames[month]}
                                </div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  color: getCompletionTextColor(monthCompletions, monthlyTarget)
                                }}>
                                  {monthCompletions}x
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="annual-month-grid">
                              {months}
                            </div>
                          );
                        } else {
                          // Regular habit: Show daily calendar view
                            const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                            // eslint-disable-next-line no-unused-vars
                            const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
                            const startDate = new Date(firstDay);
                            startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
                            
                            const days = [];
                            for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
                              const date = new Date(startDate);
                              date.setDate(startDate.getDate() + i);
                              
                              const dateStr = date.toISOString().slice(0, 10);
                              const completions = (selectedHabit.completedDates || [])
                                .filter(cd => cd.slice(0, 10) === dateStr).length;
                              
                              let dailyTarget = 1;
                              if (selectedHabit.expectedFrequency && typeof selectedHabit.expectedFrequency === 'object') {
                                const { count, period } = selectedHabit.expectedFrequency;
                                if (period === 'day') dailyTarget = count;
                                if (period === 'week') dailyTarget = Math.ceil(count / 7);
                                if (period === 'month') dailyTarget = Math.ceil(count / 30);
                              }
                              
                              const percentage = dailyTarget > 0 ? (completions / dailyTarget) * 100 : 0;
                              
                              // Use 4-tier color system matching weekly progress
                              let completionStatus;
                              if (percentage >= 100) {
                                completionStatus = 'has-completion'; // Green (100%)
                              } else if (percentage >= 50) {
                                completionStatus = 'high-partial'; // Orange (50%-99%)
                              } else if (percentage >= 1) {
                                completionStatus = 'low-partial'; // Yellow (1%-49%)
                              } else {
                                completionStatus = ''; // Gray (0%)
                              }
                              
                              const isToday = dateStr === new Date().toISOString().slice(0, 10);
                              const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                              
                              days.push(
                                <div
                                  key={i}
                                  className={`mini-calendar-day ${
                                    isCurrentMonth ? 'current-month' : 'other-month'
                                  } ${completionStatus} ${isToday ? 'today' : ''}`}
                                  title={`${date.toLocaleDateString()}: ${completions}/${dailyTarget} completed`}
                                >
                                  <div className="calendar-day-number">{date.getDate()}</div>
                                  {completions > 0 && (
                                    <>
                                      {/* Small circle indicator for mobile */}
                                      <div className="completion-indicator mobile-only" style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        fontSize: '8px',
                                        fontWeight: 'bold'
                                      }}>
                                        {completions}
                                      </div>
                                      {/* Text label for desktop */}
                                      <div className="completion-label desktop-only">
                                        {completions}×
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            }
                            
                            return days;
                        } // End of else block for regular habits
                          })()}
                        </div>
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
                            {note.date ? (() => {
                              // Handle potential timezone issues by creating date properly
                              let date;
                              if (note.date.includes('T')) {
                                // Full ISO timestamp - use as is
                                date = new Date(note.date);
                              } else {
                                // Date-only string - treat as local date, not UTC
                                const [year, month, day] = note.date.split('-');
                                date = new Date(year, month - 1, day, new Date().getHours(), new Date().getMinutes());
                              }
                              
                              const dateStr = date.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              });
                              const timeStr = date.toLocaleTimeString('en-US', { 
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              });
                              return `${dateStr} at ${timeStr}`;
                            })() : 'No date'}
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