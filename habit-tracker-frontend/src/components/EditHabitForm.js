import React, { useState } from 'react';

function EditHabitForm({ habit, onEditHabit, onCancel }) {
  // Helper function to extract frequency value and count
  const getFrequencyData = (expectedFreq) => {
    if (!expectedFreq) return { period: 'daily', count: 1 };
    if (typeof expectedFreq === 'string') {
      return { period: expectedFreq, count: 1 };
    }
    if (typeof expectedFreq === 'object' && expectedFreq.period) {
      return {
        period: expectedFreq.period === 'day' ? 'daily' : 
                expectedFreq.period === 'week' ? 'weekly' :
                expectedFreq.period === 'month' ? 'monthly' :
                expectedFreq.period === 'year' ? 'yearly' : 'daily',
        count: expectedFreq.count || 1
      };
    }
    return { period: 'daily', count: 1 };
  };

  // Helper function to extract category from tags
  const getCategoryValue = (tags) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return 'health';
    return tags[0] || 'health';
  };

  const frequencyData = getFrequencyData(habit.expectedFrequency);
  const [formData, setFormData] = useState({
    name: habit.name || '',
    frequency: frequencyData.period,
    count: frequencyData.count,
    category: getCategoryValue(habit.tags)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      // Map frontend fields to backend API fields with structured frequency
      const backendData = {
        name: formData.name.trim(),
        expectedFrequency: JSON.stringify({
          count: parseInt(formData.count),
          period: formData.frequency === 'daily' ? 'day' :
                 formData.frequency === 'weekly' ? 'week' :
                 formData.frequency === 'monthly' ? 'month' :
                 formData.frequency === 'yearly' ? 'year' : 'day'
        }),
        tags: [formData.category]
      };
      onEditHabit(habit.id, backendData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onCancel}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          border: 'none',
          outline: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '24px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✏️</span>
            Edit Habit
          </h3>
          <button
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div style={{ padding: '24px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Habit Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Habit Name *
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Exercise, Read, Meditate"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Frequency */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Target Count */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Target Count ({formData.frequency === 'daily' ? 'times per day' :
                            formData.frequency === 'weekly' ? 'times per week' :
                            formData.frequency === 'monthly' ? 'times per month' :
                            'times per year'})
              </label>
              <input
                name="count"
                type="number"
                min="1"
                max="100"
                value={formData.count}
                onChange={handleChange}
                placeholder="e.g., 1, 3, 5"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px'
            }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
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
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span>✅</span>
                Update Habit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditHabitForm;