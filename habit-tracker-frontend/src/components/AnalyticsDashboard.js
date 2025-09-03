import React, { useState, useMemo } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/analytics-responsive.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper function to categorize habits
export const getHabitCategory = (habitName) => {
  const name = habitName.toLowerCase();
  if (name.includes('exercise') || name.includes('workout') || name.includes('run') || name.includes('gym')) return 'Fitness';
  if (name.includes('read') || name.includes('book') || name.includes('study') || name.includes('learn')) return 'Learning';
  if (name.includes('meditat') || name.includes('mindful') || name.includes('journal')) return 'Wellness';
  if (name.includes('water') || name.includes('sleep') || name.includes('eat') || name.includes('diet')) return 'Health';
  if (name.includes('work') || name.includes('code') || name.includes('project')) return 'Productivity';
  return 'Other';
};

// Helper function to parse expected frequency
export const parseExpectedFrequency = (frequency) => {
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

function AnalyticsDashboard({ habits, onClose }) {
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [viewType, setViewType] = useState('overview'); // overview, habits, streaks
  const responsive = useResponsive();

  // Export functionality
  const exportToCSV = () => {
    const csvData = habits.map(habit => ({
      Name: habit.name,
      'Total Completions': habit.completedDates ? habit.completedDates.length : 0,
      'Expected Frequency': typeof habit.expectedFrequency === 'object' 
        ? `${habit.expectedFrequency.count} times per ${habit.expectedFrequency.period}`
        : habit.expectedFrequency || 'Daily',
      Tags: Array.isArray(habit.tags) ? habit.tags.join(', ') : '',
      'Creation Date': habit.startDate || 'Unknown',
      'Last Completion': habit.completedDates && habit.completedDates.length > 0 
        ? habit.completedDates[habit.completedDates.length - 1] 
        : 'Never'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalHabits: habits.length,
      habits: habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        expectedFrequency: habit.expectedFrequency,
        completedDates: habit.completedDates || [],
        tags: habit.tags || [],
        notes: habit.notes || [],
        startDate: habit.startDate,
        userId: habit.userId
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!habits || habits.length === 0) {
      return {
        totalHabits: 0,
        totalCompletions: 0,
        avgCompletionRate: 0,
        longestStreak: 0,
        currentStreak: 0,
        habitData: [],
        progressData: [],
        categoryData: []
      };
    }

    const daysRange = parseInt(timeRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysRange);

    let totalCompletions = 0;
    let longestStreak = 0;
    const habitStats = [];
    const dailyProgress = {};
    const categoryStats = {};

    habits.forEach(habit => {
      const completedDates = habit.completedDates || [];
      const recentCompletions = completedDates.filter(dateStr => {
        const date = new Date(dateStr);
        return date >= startDate && date <= endDate;
      });

      totalCompletions += recentCompletions.length;

      // Calculate completion rate for this habit based on expected frequency
      const expectedFreq = parseExpectedFrequency(habit.expectedFrequency || 'daily');
      const expectedCompletionsInPeriod = Math.ceil(daysRange / expectedFreq.periodDays * expectedFreq.timesPerPeriod);
      const completionRate = expectedCompletionsInPeriod > 0 
        ? Math.min((recentCompletions.length / expectedCompletionsInPeriod) * 100, 100)
        : 0;
      
      // Calculate streak for this habit
      const sortedDates = completedDates.map(d => new Date(d)).sort((a, b) => b - a);
      let currentStreak = 0;
      let tempStreak = 0;
      let maxStreak = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0 || 
            Math.abs(sortedDates[i] - sortedDates[i-1]) <= 24 * 60 * 60 * 1000 * 2) { // Within 2 days
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, tempStreak);
      
      if (maxStreak > longestStreak) longestStreak = maxStreak;

      habitStats.push({
        name: habit.name,
        completions: recentCompletions.length,
        completionRate: Math.round(completionRate),
        currentStreak: currentStreak,
        maxStreak: maxStreak
      });

      // Daily progress tracking
      recentCompletions.forEach(dateStr => {
        const day = new Date(dateStr).toISOString().split('T')[0];
        dailyProgress[day] = (dailyProgress[day] || 0) + 1;
      });

      // Category analysis (based on tags or habit name keywords)
      const category = habit.tags && habit.tags.length > 0 
        ? habit.tags[0] 
        : getHabitCategory(habit.name);
      categoryStats[category] = (categoryStats[category] || 0) + recentCompletions.length;
    });

    // Generate daily progress for chart
    const progressData = [];
    for (let i = daysRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      progressData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: dailyProgress[dayKey] || 0
      });
    }

    const avgCompletionRate = habits.length > 0 
      ? Math.round(habitStats.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)
      : 0;

    return {
      totalHabits: habits.length,
      totalCompletions,
      avgCompletionRate,
      longestStreak,
      currentStreak: habitStats.reduce((max, h) => Math.max(max, h.currentStreak), 0),
      habitData: habitStats,
      progressData,
      categoryData: Object.entries(categoryStats).map(([name, count]) => ({ name, count }))
    };
  }, [habits, timeRange]);

  // Chart configurations
  const progressChartData = {
    labels: analytics.progressData.map(d => d.date),
    datasets: [
      {
        label: 'Daily Completions',
        data: analytics.progressData.map(d => d.completions),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const habitComparisonData = {
    labels: analytics.habitData.map(h => {
      const name = h.name || 'Unnamed Habit';
      return name.length > 15 ? name.substring(0, 15) + '...' : name;
    }),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analytics.habitData.map(h => h.completionRate),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const categoryData = {
    labels: analytics.categoryData.map(c => c.name),
    datasets: [
      {
        data: analytics.categoryData.map(c => c.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  // Responsive chart options
  const { isMobile } = useResponsive();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 10 : 12,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        titleFont: {
          size: isMobile ? 10 : 12
        },
        bodyFont: {
          size: isMobile ? 10 : 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 8 : 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 8 : 10
          },
          maxRotation: isMobile ? 45 : 0
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          boxWidth: isMobile ? 10 : 12,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        titleFont: {
          size: isMobile ? 10 : 12
        },
        bodyFont: {
          size: isMobile ? 10 : 12
        }
      }
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-content">
        {/* Header */}
        <div className="analytics-header">
          <h2 className="analytics-title">📊 Analytics Dashboard</h2>
          <div className="analytics-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="analytics-select"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <div 
                title="📊 How Analytics Work:
• Habits Tab: Shows completion count, rate vs expected frequency, and streaks for each habit
• Streaks Tab: Shows consecutive days with any habit completion
• Completion Rate: (Actual completions / Expected completions) × 100%
• Expected completions calculated based on habit frequency and time period
• Streaks allow up to 2-day gaps for flexibility"
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'help',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                ?
              </div>
            </div>
            {!responsive.isMobile && (
              <>
                <button 
                  onClick={exportToCSV}
                  className="analytics-btn analytics-btn-export"
                >
                  📊 Export CSV
                </button>
                <button 
                  onClick={exportToJSON}
                  className="analytics-btn analytics-btn-export"
                  style={{ backgroundColor: '#2196f3' }}
                >
                  💾 Export JSON
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="analytics-btn analytics-btn-close"
            >
              {responsive.isMobile ? '✕' : '✕ Close'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="analytics-stats">
          <div className="analytics-stat-card">
            <div className="analytics-stat-value" style={{ color: '#1976d2' }}>
              {analytics.totalHabits}
            </div>
            <div className="analytics-stat-label">Total Habits</div>
          </div>
          <div className="analytics-stat-card">
            <div className="analytics-stat-value" style={{ color: '#4caf50' }}>
              {analytics.totalCompletions}
            </div>
            <div className="analytics-stat-label">Completions ({timeRange} days)</div>
          </div>
          <div className="analytics-stat-card">
            <div className="analytics-stat-value" style={{ color: '#ff9800' }}>
              {analytics.avgCompletionRate}%
            </div>
            <div className="analytics-stat-label">Avg Completion Rate</div>
          </div>
          <div className="analytics-stat-card">
            <div className="analytics-stat-value" style={{ color: '#e91e63' }}>
              {analytics.longestStreak}
            </div>
            <div className="analytics-stat-label">Longest Streak</div>
          </div>
        </div>

        {/* View Type Selector */}
        <div className="analytics-tabs">
          {['overview', 'habits', 'streaks', 'categories'].map(type => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`analytics-tab ${viewType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Chart Views */}
        {viewType === 'overview' && (
          <div className={`analytics-grid ${responsive.width <= 720 ? 'overview-sections' : ''}`}>
            <div className={responsive.width <= 720 ? 'overview-top-section' : 'analytics-grid'} style={responsive.width > 720 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' } : {}}>
              <div className="analytics-chart-container">
                <h3 className="analytics-chart-title">📈 Progress Over Time</h3>
                <div style={{ height: responsive.isMobile ? '250px' : '300px' }}>
                  <Line data={progressChartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="analytics-chart-container">
                <h3 className="analytics-chart-title">🎯 Category Breakdown</h3>
                <div style={{ height: responsive.isMobile ? '250px' : '300px' }}>
                  {analytics.categoryData.length > 0 ? (
                    <Doughnut data={categoryData} options={doughnutOptions} />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#666'
                    }}>
                      No category data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewType === 'habits' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>🏆 Habit Performance Comparison</h3>
            <div style={{ height: '400px', marginBottom: '24px' }}>
              {analytics.habitData.length > 0 ? (
                <Bar data={habitComparisonData} options={chartOptions} />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: '#666'
                }}>
                  No habit data available
                </div>
              )}
            </div>
            
            {/* Habit Details Table */}
            <div style={{ marginTop: '24px' }}>
              <h4>📋 Detailed Habit Statistics</h4>
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>Habit</th>
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>Completions</th>
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>Rate</th>
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>Current Streak</th>
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>Max Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.habitData.map((habit, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>{habit.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>{habit.completions}</td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          border: '1px solid #ddd',
                          fontSize: responsive.isMobile ? '0.8rem' : '1rem',
                          color: habit.completionRate >= 70 ? '#4caf50' : habit.completionRate >= 40 ? '#ff9800' : '#f44336'
                        }}>
                          {habit.completionRate}%
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>{habit.currentStreak}</td>
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: responsive.isMobile ? '0.8rem' : '1rem' }}>{habit.maxStreak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewType === 'streaks' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>🏅 Current Streaks</h3>
            <div style={{ padding: '12px' }}>
              {analytics.habitData.map((h, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  {h.name || 'Unnamed Habit'}: {h.currentStreak}
                </div>
              ))}
              {analytics.habitData.length === 0 && (
                <div style={{ color: '#666' }}>No habits to display streaks.</div>
              )}
            </div>
          </div>
        )}

        {viewType === 'categories' && (
          <div className="analytics-section">
            <h3 className="analytics-section-title">📂 Category Analysis</h3>
            <div className={`analytics-grid ${responsive.width <= 600 ? 'overview-sections' : ''}`} style={responsive.width > 600 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' } : {}}>
              <div className="analytics-chart-container">
                <h4 className="analytics-chart-title">Category Distribution</h4>
                <div style={{ height: responsive.isMobile ? '250px' : '300px' }}>
                  {analytics.categoryData.length > 0 ? (
                    <Doughnut data={categoryData} options={doughnutOptions} />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      color: '#666'
                    }}>
                      No category data available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="analytics-chart-container">
                <h4 className="analytics-chart-title">Category Performance</h4>
                <div className="category-performance">
                  {analytics.categoryData.map((category, index) => (
                    <div key={index} className="category-item">
                      <span className="category-name">{category.name}</span>
                      <span className="category-badge">
                        {category.count} completions
                      </span>
                    </div>
                  ))}
                  {analytics.categoryData.length === 0 && (
                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                      No category data available. Complete some habits to see analytics!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics.totalHabits === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <h3>📊 No Data Yet</h3>
            <p>Create some habits and mark them complete to see your analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
