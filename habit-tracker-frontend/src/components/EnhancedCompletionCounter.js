import React, { useState, useEffect } from 'react';
import api from '../api';

function EnhancedCompletionCounter({ habit, onCompletionChange }) {
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const today = new Date().toISOString().slice(0, 10);

  // Calculate today's completions from completedDates
  useEffect(() => {
    if (habit.completedDates) {
      const count = habit.completedDates.filter(date => 
        date.slice(0, 10) === today
      ).length;
      setTodayCount(count);
    }
  }, [habit.completedDates, today]);

  const addCompletion = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      await api.post(`/habits/${habit.id}/completions`, {
        date: new Date().toISOString()
      });
      setTodayCount(prev => prev + 1);
      if (onCompletionChange) onCompletionChange(habit.id, todayCount + 1);
    } catch (error) {
      console.error('Error adding completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeCompletion = async () => {
    if (loading || todayCount === 0) return;
    setLoading(true);
    
    try {
      await api.delete(`/habits/${habit.id}/completions`, {
        data: { date: today }
      });
      setTodayCount(prev => Math.max(0, prev - 1));
      if (onCompletionChange) onCompletionChange(habit.id, Math.max(0, todayCount - 1));
    } catch (error) {
      console.error('Error removing completion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get target count for today if using structured frequency
  const getTargetCount = () => {
    if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
      const { count, period } = habit.expectedFrequency;
      if (period === 'day') {
        return count;
      }
    }
    return null;
  };

  const targetCount = getTargetCount();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <button
        onClick={removeCompletion}
        disabled={loading || todayCount === 0}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #ccc',
          borderRadius: '50%',
          backgroundColor: todayCount === 0 ? '#f5f5f5' : '#ff5722',
          color: todayCount === 0 ? '#ccc' : 'white',
          cursor: todayCount === 0 ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        −
      </button>
      
      <div style={{
        minWidth: '60px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {todayCount}{targetCount ? `/${targetCount}` : ''}
        <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
          today
        </div>
      </div>
      
      <button
        onClick={addCompletion}
        disabled={loading}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #ccc',
          borderRadius: '50%',
          backgroundColor: '#4caf50',
          color: 'white',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>
      
      {targetCount && todayCount >= targetCount && (
        <div style={{
          marginLeft: '8px',
          fontSize: '20px',
          color: '#4caf50'
        }}>
          ✓
        </div>
      )}
    </div>
  );
}

export default EnhancedCompletionCounter;
