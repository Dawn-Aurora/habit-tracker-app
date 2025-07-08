import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

function EnhancedCompletionCounter({ habit, onCompletionChange }) {
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);

  // Get target count and period for display
  const getTargetInfo = useCallback(() => {
    if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
      const { count, period } = habit.expectedFrequency;
      return { count, period };
    }
    return null;
  }, [habit.expectedFrequency]);

  // Calculate period completions from completedDates
  useEffect(() => {
    if (habit.completedDates) {
      const targetInfo = getTargetInfo();
      const period = targetInfo ? targetInfo.period : 'day';
      
      let count = 0;
      if (period === 'day') {
        // Count completions for today (timestamps can include multiple per day)
        count = habit.completedDates.filter(dateTime => 
          dateTime.slice(0, 10) === today
        ).length;
      } else if (period === 'week') {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        count = habit.completedDates.filter(dateTime => {
          const completionDate = new Date(dateTime);
          return completionDate >= weekStart && completionDate <= weekEnd;
        }).length;
      } else if (period === 'month') {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        count = habit.completedDates.filter(dateTime => {
          const completionDate = new Date(dateTime);
          return completionDate >= monthStart && completionDate <= monthEnd;
        }).length;
      } else if (period === 'year') {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        
        count = habit.completedDates.filter(dateTime => {
          const completionDate = new Date(dateTime);
          return completionDate >= yearStart && completionDate <= yearEnd;
        }).length;
      }
      
      setTodayCount(count);
    }
  }, [habit.completedDates, getTargetInfo, today]);

  // Add completion
  const addCompletion = async () => {
    try {
      setLoading(true);
      await api.post(`/habits/${habit.id}/complete`, {
        date: new Date().toISOString() // Send full timestamp
      });
      if (onCompletionChange) {
        onCompletionChange();
      }
    } catch (error) {
      console.error('Error adding completion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove completion
  const removeCompletion = async () => {
    try {
      setLoading(true);
      await api.delete(`/habits/${habit.id}/completions`);
      if (onCompletionChange) {
        onCompletionChange();
      }
    } catch (error) {
      console.error('Error removing completion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get display text based on period
  const getPeriodText = () => {
    const targetInfo = getTargetInfo();
    if (!targetInfo) return 'today';
    
    const { period } = targetInfo;
    switch (period) {
      case 'day': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      case 'year': return 'this year';
      default: return 'today';
    }
  };

  // Get target count for display
  const getTargetCount = () => {
    const targetInfo = getTargetInfo();
    return targetInfo ? targetInfo.count : 1;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const targetCount = getTargetCount();
    return Math.min((todayCount / targetCount) * 100, 100);
  };

  // Check if goal is complete
  const isComplete = todayCount >= getTargetCount();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      {/* Progress Text */}
      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: isComplete ? '#4caf50' : '#333',
        textAlign: 'center'
      }}>
        {todayCount}/{getTargetCount()} times {getPeriodText()}
      </div>
      
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${getProgressPercentage()}%`,
          height: '100%',
          backgroundColor: isComplete ? '#4caf50' : '#2196f3',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {/* Progress Percentage */}
      <div style={{
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        {Math.round(getProgressPercentage())}% complete
      </div>
      
      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <button
          onClick={removeCompletion}
          disabled={loading || todayCount === 0}
          aria-label={`Remove completion for ${habit.name}`}
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #ccc',
            borderRadius: '50%',
            backgroundColor: todayCount === 0 ? '#f5f5f5' : '#ff5722',
            color: todayCount === 0 ? '#ccc' : 'white',
            cursor: todayCount === 0 ? 'not-allowed' : 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onFocus={e => e.target.style.outline = '2px solid #ff5722'}
          onBlur={e => e.target.style.outline = 'none'}
        >
          −
        </button>
        
        <button
          onClick={addCompletion}
          disabled={loading}
          aria-label={`Add completion for ${habit.name}`}
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #ccc',
            borderRadius: '50%',
            backgroundColor: loading ? '#ccc' : '#4caf50',
            color: 'white',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onFocus={e => e.target.style.outline = '2px solid #4caf50'}
          onBlur={e => e.target.style.outline = 'none'}
        >
          +
        </button>
      </div>
      
      {/* Achievement Message */}
      {isComplete && (
        <div style={{
          fontSize: '14px',
          color: '#4caf50',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '4px'
        }}>
          🎉 Goal achieved!
        </div>
      )}
    </div>
  );
}

export default EnhancedCompletionCounter;
