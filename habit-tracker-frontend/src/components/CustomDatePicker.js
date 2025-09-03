import React, { useState, useRef, useEffect } from 'react';

function CustomDatePicker({ value, onChange, disabled = false, min = "2020-01-01", max = "2030-12-31", required = false, id, className, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      const date = new Date(value);
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate()
      };
    }
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate()
    };
  });
  
  const pickerRef = useRef(null);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i);
  }
  
  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate()
      });
    }
  }, [value]);
  
  const formatDisplayDate = () => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const handleDateSelect = (day) => {
    const newDate = new Date(selectedDate.year, selectedDate.month, day);
    const isoString = newDate.toISOString().slice(0, 10);
    setSelectedDate({ ...selectedDate, day });
    onChange({ target: { value: isoString } });
    setIsOpen(false);
  };
  
  const handleMonthChange = (month) => {
    setSelectedDate({ ...selectedDate, month });
  };
  
  const handleYearChange = (year) => {
    setSelectedDate({ ...selectedDate, year });
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate.year, selectedDate.month);
    const firstDay = getFirstDayOfMonth(selectedDate.year, selectedDate.month);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '32px', height: '32px' }}></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate.day;
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: isSelected ? '#4285f4' : 'transparent',
            color: isSelected ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: isSelected ? '600' : '400',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div ref={pickerRef} style={{ position: 'relative', ...style }}>
      <input
        id={id}
        type="text"
        readOnly
        value={formatDisplayDate()}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        placeholder="Select date..."
        className={className || 'modern-input'}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f3f4f6' : 'var(--input-bg-cream, #faf9f6)',
          fontSize: '16px',
          padding: '12px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb',
          transition: 'border-color 0.2s ease',
          width: '100%'
        }}
        disabled={disabled}
        required={required}
      />
      
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--wood-brown-bg, #e9ded0)',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 1001,
          padding: '16px',
          marginTop: '4px'
        }}>
          {/* Header with month and year selectors */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '8px'
          }}>
            <select
              value={selectedDate.month}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'var(--input-bg-cream, #faf9f6)',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedDate.year}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'var(--input-bg-cream, #faf9f6)',
                cursor: 'pointer',
                width: '80px'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          {/* Days of week header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px'
          }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                padding: '4px'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px'
          }}>
            {renderCalendar()}
          </div>
          
          {/* Quick actions */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const isoString = today.toISOString().slice(0, 10);
                setSelectedDate({
                  year: today.getFullYear(),
                  month: today.getMonth(),
                  day: today.getDate()
                });
                onChange({ target: { value: isoString } });
                setIsOpen(false);
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #4285f4',
                borderRadius: '6px',
                backgroundColor: 'var(--input-bg-cream, #faf9f6)',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#4285f4',
                fontWeight: '500',
                flex: 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4285f4';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--input-bg-cream, #faf9f6)';
                e.target.style.color = '#4285f4';
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#374151',
                flex: 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
