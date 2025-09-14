import React, { useState, useEffect } from 'react';
import api from '../api';

function CompletionCounter({ habit, date = new Date().toISOString().slice(0, 10), onCompletionChange }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch completion count for the specified date
  useEffect(() => {
    const fetchCompletionCount = async () => {
      try {
        const response = await api.get(`/habits/${habit.id}/completions?date=${date}`);
        if (response.data.status === 'success') {
          setCount(response.data.data.count);
        }
      } catch (err) {
        console.error('Error fetching completion count:', err);
        // Fallback to counting completions from habit data
        if (habit.completedDates) {
          const dailyCount = habit.completedDates.filter(d => d.slice(0, 10) === date).length;
          setCount(dailyCount);
        }
      }
    };

    if (habit.id) {
      fetchCompletionCount();
    }
  }, [habit.id, habit.completedDates, date]);

  const handleIncrement = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(`/habits/${habit.id}/completions`, { 
        date: new Date(date + 'T' + new Date().toTimeString().slice(0, 8)).toISOString()
      });
      
      if (response.data.status === 'success') {
        setCount(prevCount => prevCount + 1);
        if (onCompletionChange) {
          onCompletionChange(habit.id, count + 1);
        }
      }
    } catch (err) {
      console.error('Error adding completion:', err);
      setError('Failed to add completion');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (loading || count <= 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.delete(`/habits/${habit.id}/completions`, { 
        data: { date }
      });
      
      if (response.data.status === 'success') {
        setCount(prevCount => Math.max(0, prevCount - 1));
        if (onCompletionChange) {
          onCompletionChange(habit.id, Math.max(0, count - 1));
        }
      }
    } catch (err) {
      console.error('Error removing completion:', err);
      setError('Failed to remove completion');
    } finally {
      setLoading(false);
    }
  };

  // Get target count based on habit's desired frequency
  const getTargetCount = () => {
    if (habit.desiredFrequency) {
      const { count: targetCount, period } = habit.desiredFrequency;
      if (period === 'day') {
        return targetCount;
      }
    }
    
    // Fallback: try to parse legacy frequency
    const frequency = habit.expectedFrequency || habit.frequency || '';
    if (frequency.toLowerCase().includes('daily') || frequency.includes('1 times/day')) {
      return 1;
    }
    if (frequency.includes('times/day')) {
      const match = frequency.match(/(\d+)\s*times\/day/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return 1; // Default to 1 per day
  };

  const targetCount = getTargetCount();
  const progressPercentage = Math.min((count / targetCount) * 100, 100);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '8px',
      padding: '12px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      minWidth: '120px'
    }}>
      <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
        {date === new Date().toISOString().slice(0, 10) ? 'Today' : date}
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        fontSize: '18px'
      }}>
        <button
          onClick={handleDecrement}
          disabled={loading || count <= 0}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid #2196f3',
            backgroundColor: count <= 0 ? '#f5f5f5' : 'white',
            color: count <= 0 ? '#ccc' : '#2196f3',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: loading || count <= 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
          }}
        >
          -
        </button>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '40px'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: count >= targetCount ? '#4caf50' : '#666'
          }}>
            {count}
          </div>
          {targetCount > 1 && (
            <div style={{ 
              fontSize: '10px', 
              color: '#999',
              marginTop: '-2px'
            }}>
              / {targetCount}
            </div>
          )}
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={loading}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid #4caf50',
            backgroundColor: 'white',
            color: '#4caf50',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
          }}
        >
          +
        </button>
      </div>
      
      {targetCount > 1 && (
        <div 
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={targetCount}
          aria-label={`Progress: ${count} of ${targetCount} completions`}
          style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: count >= targetCount ? '#4caf50' : '#2196f3',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
      
      {count >= targetCount && (
        <div style={{ 
          fontSize: '12px', 
          color: '#4caf50', 
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ✓ Goal achieved!
        </div>
      )}
      
      {error && (
        <div style={{ 
          fontSize: '11px', 
          color: '#d32f2f',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {loading && (
        <div style={{ 
          fontSize: '11px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Updating...
        </div>
      )}
    </div>
  );
}

export default CompletionCounter;
