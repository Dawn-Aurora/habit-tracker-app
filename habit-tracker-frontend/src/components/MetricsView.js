import React, { useState, useEffect } from 'react';
import api from '../api';

function MetricsView({ habitId, onClose }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    setLoading(true);
    setError('');
    
    api.get(`/habits/${habitId}/metrics`)
      .then(res => {
        setMetrics(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setError('Error loading metrics: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      });
  }, [habitId]);

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '24px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}>
        Loading metrics...
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '24px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '400px'
    }}>
      <h3 style={{ marginTop: 0 }}>Habit Metrics</h3>
      
      {error ? (
        <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>
      ) : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '16px', 
              backgroundColor: '#e3f2fd',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
                {metrics.currentStreak}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>Current Streak</div>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: '16px', 
              backgroundColor: '#e8f5e8',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
                {metrics.totalCompletions}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>Total Completions</div>
            </div>
          </div>
            <div style={{ 
            textAlign: 'center', 
            padding: '16px', 
            backgroundColor: '#fff3e0',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ff9800' }}>
              {(metrics.completionRate * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>This Week Completion Rate</div>
          </div>
          
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
            <div><strong>Expected Frequency:</strong> {metrics.expectedFrequency || 'Not set'}</div>
          </div>
        </div>
      ) : null}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button 
          onClick={onClose}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2196f3', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default MetricsView;
