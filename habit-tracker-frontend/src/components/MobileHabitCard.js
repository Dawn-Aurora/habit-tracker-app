import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/mobile-habit-card.css';

function MobileHabitCard({ 
  habit, 
  onComplete, 
  onEdit, 
  onDelete, 
  onAddNote, 
  onMetricView,
  isSelected, 
  onSelect,
  showSelection = false,
  showSwipeHint = true,
  disableSwipeActions = false
}) {
  const [showActions, setShowActions] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const cardRef = useRef(null);

  const handleQuickComplete = useCallback(async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      await onComplete(habit.id);
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleting, onComplete, habit.id]);

  // Touch gesture handling with effect to ensure element exists
  useEffect(() => {
    if (!cardRef.current || disableSwipeActions) return;

    let startX = 0;
    let startY = 0;
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;
      
      if (deltaTime > maxSwipeTime) return;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          setShowActions(false); // Swipe right to hide actions
        } else {
          setShowActions(true); // Swipe left to show actions
        }
      } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY < 0) {
          handleQuickComplete(); // Swipe up to complete
        }
      }
    };

    const element = cardRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disableSwipeActions, handleQuickComplete]);

  const isCompletedToday = () => {
    if (!habit.completedDates || !Array.isArray(habit.completedDates)) return false;
    const today = new Date().toISOString().slice(0, 10);
    return habit.completedDates.includes(today);
  };

  const getStreakInfo = () => {
    if (!habit.completedDates || !Array.isArray(habit.completedDates)) {
      return { current: 0, best: 0 };
    }

    const sortedDates = [...habit.completedDates].sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;

    const today = new Date();
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
      } else if (i > 0) { // Allow one day gap if it's today
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate best streak
    let consecutiveDays = 0;
    let lastDate = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      
      if (!lastDate || (lastDate - currentDate) === 86400000) { // 24 hours
        consecutiveDays++;
        bestStreak = Math.max(bestStreak, consecutiveDays);
      } else {
        consecutiveDays = 1;
      }
      
      lastDate = currentDate;
    }

    return { current: currentStreak, best: bestStreak };
  };

  const getFrequencyText = () => {
    if (!habit.frequency) return 'Daily';
    
    const { type, days, interval } = habit.frequency;
    
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        if (days && days.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const selectedDays = days.map(day => dayNames[day]).join(', ');
          return `Weekly: ${selectedDays}`;
        }
        return `Every ${interval || 1} week(s)`;
      case 'monthly':
        return `Every ${interval || 1} month(s)`;
      default:
        return 'Custom';
    }
  };

  const streak = getStreakInfo();
  const completed = isCompletedToday();

  return (
    <div 
      ref={cardRef}
      className={`mobile-habit-card ${completed ? 'completed' : ''} ${showActions ? 'actions-visible' : ''} ${isSelected ? 'selected' : ''}`}
    >
      {/* Selection Checkbox */}
      {showSelection && (
        <div className="habit-selection">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(habit.id, e.target.checked)}
            className="selection-checkbox"
          />
        </div>
      )}

      {/* Main Card Content */}
      <div className="habit-main-content">
        {/* Header with Title and Completion */}
        <div className="habit-header">
          <div className="habit-title-section">
            <h3 className="habit-title">{habit.name}</h3>
            {habit.description && (
              <p className="habit-description">{habit.description}</p>
            )}
          </div>
          
          <button
            className={`quick-complete-btn ${completed ? 'completed' : ''} ${isCompleting ? 'loading' : ''}`}
            onClick={handleQuickComplete}
            disabled={isCompleting}
          >
            {isCompleting ? '⏳' : completed ? '✅' : '⭕'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="habit-stats">
          {(() => {
            // Check if this is an annual habit
            const isAnnualHabit = habit.expectedFrequency && 
              typeof habit.expectedFrequency === 'object' && 
              habit.expectedFrequency.period === 'year';
            
            if (isAnnualHabit) {
              // For annual habits, show only frequency and total completions
              return (
                <>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-text">{getFrequencyText()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-text">Total: {habit.completedDates?.length || 0}</span>
                  </div>
                </>
              );
            } else {
              // For other habits, show normal stats
              return (
                <>
                  <div className="stat-item">
                    <span className="stat-icon">🔥</span>
                    <span className="stat-text">{streak.current} day streak</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-text">{getFrequencyText()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🏆</span>
                    <span className="stat-text">Best: {streak.best}</span>
                  </div>
                </>
              );
            }
          })()}
        </div>

        {/* Tags */}
        {habit.tags && habit.tags.length > 0 && (
          <div className="habit-tags">
            {habit.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="habit-tag">
                {tag}
              </span>
            ))}
            {habit.tags.length > 3 && (
              <span className="habit-tag-more">+{habit.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Swipe Hint */}
        {showSwipeHint && !disableSwipeActions && (
          <div className="swipe-hint">
            <span className="hint-text">⬅️ Swipe for actions</span>
          </div>
        )}
      </div>

      {/* External Action Buttons Panel */}
      <div className="habit-actions">
        <button
          className="action-btn edit"
          onClick={() => onEdit(habit)}
        >
          <span className="action-icon">✏️</span>
          <span className="action-label">Edit</span>
        </button>
        
        <button
          className="action-btn note"
          onClick={() => onAddNote(habit)}
        >
          <span className="action-icon">📝</span>
          <span className="action-label">Note</span>
        </button>
        
        <button
          className="action-btn metric"
          onClick={() => onMetricView(habit)}
        >
          <span className="action-icon">📊</span>
          <span className="action-label">Stats</span>
        </button>
        
        <button
          className="action-btn delete"
          onClick={() => onDelete(habit.id)}
        >
          <span className="action-icon">🗑️</span>
          <span className="action-label">Delete</span>
        </button>
      </div>
    </div>
  );
}

export default MobileHabitCard;
