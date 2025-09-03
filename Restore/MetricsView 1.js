import React, { useState, useEffect } from 'react';

// Helper function to generate GitHub-style heatmap colors
const getHeatmapColor = (completions, maxCompletions) => {
  if (completions === 0) return '#ebedf0'; // Light gray for no activity
  
  const intensity = Math.min(completions / Math.max(maxCompletions, 1), 1);
  
  // GitHub-style green color scheme
  if (intensity <= 0.25) return '#9be9a8'; // Light green
  if (intensity <= 0.5) return '#40c463';  // Medium green
  if (intensity <= 0.75) return '#30a14e'; // Dark green
  return '#216e39'; // Darkest green
};

// Helper function to generate GitHub-style yearly heatmap
const generateYearlyHeatmap = (completedDates) => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const weeks = [];
  const startDate = new Date(oneYearAgo);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
  
  // Calculate max completions for color scaling
  const dailyCompletions = {};
  completedDates.forEach(dateStr => {
    const date = dateStr.slice(0, 10);
    dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
  });
  const maxCompletions = Math.max(...Object.values(dailyCompletions), 1);
  
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
        color: getHeatmapColor(completions, maxCompletions),
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
    maxCompletions: maxCompletions,
    totalCompletions: Object.values(dailyCompletions).reduce((a, b) => a + b, 0)
  };
};

// Helper function to generate calendar data
const generateCalendarData = (completedDates, frequency, selectedDate = null) => {
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // For yearly habits, show GitHub-style heatmap
  if (frequency?.period === 'year') {
    return generateYearlyHeatmap(completedDates);
  }
  
  // For other frequencies, show enhanced monthly view with heatmap styling
  const referenceDate = selectedDate || today;
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
  
  // Calculate max completions for color scaling
  const dailyCompletions = {};
  completedDates.forEach(dateStr => {
    const date = dateStr.slice(0, 10);
    dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
  });
  const maxCompletions = Math.max(...Object.values(dailyCompletions), 1);
  
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
      color: getHeatmapColor(completions, maxCompletions)
    });
  }
  
  return { 
    type: 'month', 
    data: days,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    maxCompletions: maxCompletions
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
        
        // Calculate streak
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
            // Daily habits: show this week progress (count × 7)
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfWeek && d <= endOfWeek;
            }).length;
            
            expectedInPeriod = count * 7; // times per day × 7 days
            periodLabel = 'This Week Progress';
            
          } else if (period === 'week') {
            // Weekly habits: show this week progress
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfWeek && d <= endOfWeek;
            }).length;
            
            expectedInPeriod = count; // times per week
            periodLabel = 'This Week Progress';
            
          } else if (period === 'month') {
            // Monthly habits: show this month progress
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfMonth && d <= endOfMonth;
            }).length;
            
            expectedInPeriod = count; // times per month
            periodLabel = 'This Month Progress';
            
          } else if (period === 'year') {
            // Yearly habits: show this year progress
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            endOfYear.setHours(23, 59, 59, 999);
            
            periodCompletions = completedDates.filter(date => {
              const d = new Date(date);
              return d >= startOfYear && d <= endOfYear;
            }).length;
            
            expectedInPeriod = count; // times per year
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
            
            expectedInPeriod = 1;
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
        
        completionRate = Math.min((periodCompletions / expectedInPeriod) * 100, 100);
        
        // Calculate advanced analytics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Recent activity analysis
        const recentDates = completedDates.filter(date => new Date(date) >= thirtyDaysAgo);
        const weeklyDates = completedDates.filter(date => new Date(date) >= sevenDaysAgo);
        
        // Success rate trends
        const weeklySuccessRate = weeklyDates.length > 0 ? 
          Math.round((weeklyDates.length / 7) * 100) : 0;
        const monthlySuccessRate = recentDates.length > 0 ? 
          Math.round((recentDates.length / 30) * 100) : 0;
        
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
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-form">
          <div className="modal-header">
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span>
              <span>{selectedHabit.name} Analytics</span>
            </h3>
            <button 
              onClick={onClose}
              className="btn-close"
              aria-label="Close analytics"
            >
              ×
            </button>
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

            {/* Advanced Analytics */}
            <div className="modern-card" style={{ marginBottom: '24px' }}>
              <div className="modern-card-header">
                <h4 className="modern-card-title">📊 Advanced Analytics</h4>
              </div>
              <div className="modern-card-body">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px'
                }}>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>
                      {metrics.weeklySuccessRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      📈 Weekly Success Rate
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {metrics.monthlySuccessRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      📊 Monthly Success Rate
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                      {metrics.bestHour}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      ⏰ Best Time
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#06b6d4' }}>
                      {metrics.consistencyScore}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      🎯 Consistency Score
                    </div>
                  </div>
                </div>
                
                {/* Activity summary */}
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9',
                  fontSize: '14px',
                  color: '#0c4a6e'
                }}>
                  📈 <strong>Activity Summary:</strong> {metrics.activeDays} active days out of {metrics.totalDays} total days
                  ({Math.round((metrics.activeDays / metrics.totalDays) * 100)}% active rate)
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
                          title={`${day.day}: ${day.completions} completions`}
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
                <h4 className="modern-card-title">📅 {metrics.periodLabel}</h4>
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
                selectedHabit.expectedFrequency?.period === 'year' ? null : selectedMonth
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
                                      title={`${day.fullDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.completions} completions`}
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
                            <span>Less</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#ebedf0', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#9be9a8', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#40c463', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#30a14e', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#216e39', borderRadius: '2px' }} />
                            </div>
                            <span>More</span>
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
                                padding: '8px',
                                textAlign: 'center',
                                borderRadius: '8px',
                                minHeight: '40px',
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
                                position: 'relative'
                              }}
                              title={day.isCurrentMonth ? `${day.fullDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.completions} completions` : ''}
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
                              <span>{day.date}</span>
                              {day.completions > 1 && (
                                <span style={{
                                  fontSize: '10px',
                                  color: day.completions > 0 ? '#ffffff' : '#10b981',
                                  fontWeight: 'bold',
                                  backgroundColor: day.completions > 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
                                  padding: '2px 4px',
                                  borderRadius: '4px'
                                }}>
                                  {day.completions}×
                                </span>
                              )}
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
                            <span>Less</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#ebedf0', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#9be9a8', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#40c463', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#30a14e', borderRadius: '2px' }} />
                              <div style={{ width: '12px', height: '12px', backgroundColor: '#216e39', borderRadius: '2px' }} />
                            </div>
                            <span>More</span>
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
