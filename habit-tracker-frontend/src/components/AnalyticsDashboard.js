import React, { useState, useMemo } from 'react';
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
const getHabitCategory = (habitName) => {
  const name = habitName.toLowerCase();
  if (name.includes('exercise') || name.includes('workout') || name.includes('run') || name.includes('gym')) return 'Fitness';
  if (name.includes('read') || name.includes('book') || name.includes('study') || name.includes('learn')) return 'Learning';
  if (name.includes('meditat') || name.includes('mindful') || name.includes('journal')) return 'Wellness';
  if (name.includes('water') || name.includes('sleep') || name.includes('eat') || name.includes('diet')) return 'Health';
  if (name.includes('work') || name.includes('code') || name.includes('project')) return 'Productivity';
  return 'Other';
};

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

function AnalyticsDashboard({ habits, onClose }) {
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [viewType, setViewType] = useState('overview'); // overview, habits, streaks

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
    labels: analytics.habitData.map(h => h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name),
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

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
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        overflow: 'auto',
        width: '1000px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>📊 Analytics Dashboard</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button 
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
              {analytics.totalHabits}
            </div>
            <div style={{ color: '#666' }}>Total Habits</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
              {analytics.totalCompletions}
            </div>
            <div style={{ color: '#666' }}>Completions ({timeRange} days)</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3e0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ff9800' }}>
              {analytics.avgCompletionRate}%
            </div>
            <div style={{ color: '#666' }}>Avg Completion Rate</div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#fce4ec',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#e91e63' }}>
              {analytics.longestStreak}
            </div>
            <div style={{ color: '#666' }}>Longest Streak</div>
          </div>
        </div>

        {/* View Type Selector */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '8px'
        }}>
          {['overview', 'habits', 'categories'].map(type => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              style={{
                padding: '8px 16px',
                backgroundColor: viewType === type ? '#2196f3' : '#f5f5f5',
                color: viewType === type ? 'white' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Chart Views */}
        {viewType === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ marginBottom: '16px' }}>📈 Progress Over Time</h3>
              <div style={{ height: '300px' }}>
                <Line data={progressChartData} options={chartOptions} />
              </div>
            </div>
            
            <div>
              <h3 style={{ marginBottom: '16px' }}>🎯 Category Breakdown</h3>
              <div style={{ height: '300px' }}>
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
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Habit</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Completions</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Rate</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Current Streak</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Max Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.habitData.map((habit, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{habit.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{habit.completions}</td>
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center', 
                        border: '1px solid #ddd',
                        color: habit.completionRate >= 70 ? '#4caf50' : habit.completionRate >= 40 ? '#ff9800' : '#f44336'
                      }}>
                        {habit.completionRate}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{habit.currentStreak}</td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{habit.maxStreak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewType === 'categories' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>📂 Category Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4>Category Distribution</h4>
                <div style={{ height: '300px' }}>
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
              
              <div>
                <h4>Category Performance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.categoryData.map((category, index) => (
                    <div key={index} style={{
                      padding: '16px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>{category.name}</span>
                      <span style={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.9em'
                      }}>
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
