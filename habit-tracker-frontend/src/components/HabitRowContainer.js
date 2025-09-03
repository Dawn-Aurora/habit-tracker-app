import React, { useState, useRef, useEffect, useCallback } from 'react';
import MobileHabitCard from './MobileHabitCard';
import ExternalActionButtons from './ExternalActionButtons';
import '../styles/external-action-buttons.css';

function HabitRowContainer({ 
  habit, 
  onComplete, 
  onEdit, 
  onDelete, 
  onAddNote, 
  onMetricView,
  isSelected, 
  onSelect,
  showSelection = false 
}) {
  const [showActions, setShowActions] = useState(false);
  const containerRef = useRef(null);

  // Touch gesture handling
  useEffect(() => {
    if (!containerRef.current) return;

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
      
      // Check if it's a horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          Math.abs(deltaX) > minSwipeDistance && 
          deltaTime < maxSwipeTime) {
        
        if (deltaX < 0) {
          // Swipe left - show actions
          setShowActions(true);
        } else if (deltaX > 0) {
          // Swipe right - hide actions
          setShowActions(false);
        }
      }
    };

    // Click outside to close actions
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };

    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('click', handleClickOutside);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Close actions when any action is performed
  const handleActionPerformed = useCallback(() => {
    setShowActions(false);
  }, []);

  const wrappedOnEdit = useCallback((habit) => {
    onEdit(habit);
    handleActionPerformed();
  }, [onEdit, handleActionPerformed]);

  const wrappedOnDelete = useCallback((habitId) => {
    onDelete(habitId);
    handleActionPerformed();
  }, [onDelete, handleActionPerformed]);

  const wrappedOnAddNote = useCallback((habit) => {
    onAddNote(habit);
    handleActionPerformed();
  }, [onAddNote, handleActionPerformed]);

  const wrappedOnMetricView = useCallback((habit) => {
    onMetricView(habit);
    handleActionPerformed();
  }, [onMetricView, handleActionPerformed]);

  return (
    <div 
      ref={containerRef}
      className={`habit-row-container ${showActions ? 'actions-visible' : ''}`}
    >
      <MobileHabitCard
        habit={habit}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddNote={onAddNote}
        onMetricView={onMetricView}
        isSelected={isSelected}
        onSelect={onSelect}
        showSelection={showSelection}
        showSwipeHint={!showActions}
        disableSwipeActions={true} // Disable the card's own swipe handling
      />
      
      <ExternalActionButtons
        habit={habit}
        onEdit={wrappedOnEdit}
        onAddNote={wrappedOnAddNote}
        onMetricView={wrappedOnMetricView}
        onDelete={wrappedOnDelete}
      />
    </div>
  );
}

export default HabitRowContainer;
