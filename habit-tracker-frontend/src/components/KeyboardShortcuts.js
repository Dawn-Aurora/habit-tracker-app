import React, { useEffect, useState } from 'react';

const KeyboardShortcuts = ({ 
  habits,
  onMarkComplete,
  onEdit,
  onSearch,
  onSelectAll,
  onClearSelection,
  selectedHabits
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [focusedHabitIndex, setFocusedHabitIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Global shortcuts
      switch (event.key.toLowerCase()) {
        case '/':
        case 'f':
          event.preventDefault();
          onSearch();
          break;
        
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onSelectAll();
          }
          break;
        
        case 'escape':
          event.preventDefault();
          onClearSelection();
          setFocusedHabitIndex(-1);
          setShowHelp(false);
          break;
        
        case '?':
          event.preventDefault();
          setShowHelp(!showHelp);
          break;
        
        // Navigation
        case 'j':
        case 'arrowdown':
          event.preventDefault();
          setFocusedHabitIndex(prev => 
            prev < habits.length - 1 ? prev + 1 : prev
          );
          break;
        
        case 'k':
        case 'arrowup':
          event.preventDefault();
          setFocusedHabitIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        
        // Actions on focused habit
        case ' ':
        case 'enter':
          event.preventDefault();
          if (focusedHabitIndex >= 0 && focusedHabitIndex < habits.length) {
            const habit = habits[focusedHabitIndex];
            if (event.key === ' ') {
              onMarkComplete(habit.id);
            } else if (event.key === 'enter') {
              onEdit(habit);
            }
          }
          break;
        
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [habits, focusedHabitIndex, showHelp, onMarkComplete, onEdit, onSearch, onSelectAll, onClearSelection]);

  // Auto-scroll to focused habit
  useEffect(() => {
    if (focusedHabitIndex >= 0) {
      const habitElement = document.querySelector(`[data-habit-index="${focusedHabitIndex}"]`);
      if (habitElement) {
        habitElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [focusedHabitIndex]);

  return (
    <>
      {/* Keyboard shortcuts indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100
      }}>
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#4285f4',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
          title="Keyboard shortcuts (Press ? for help)"
        >
          ⌨️
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {[
                { keys: ['/', 'F'], description: 'Focus search box' },
                { keys: ['?'], description: 'Show/hide this help' },
                { keys: ['Ctrl+A'], description: 'Select all habits' },
                { keys: ['Escape'], description: 'Clear selection and focus' },
                { keys: ['J', '↓'], description: 'Navigate down' },
                { keys: ['K', '↑'], description: 'Navigate up' },
                { keys: ['Space'], description: 'Complete focused habit' },
                { keys: ['Enter'], description: 'Edit focused habit' }
              ].map(({ keys, description }, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#333'
                  }}>
                    {description}
                  </span>
                  <div style={{
                    display: 'flex',
                    gap: '4px'
                  }}>
                    {keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && (
                          <span style={{ color: '#666', fontSize: '12px' }}>or</span>
                        )}
                        <kbd style={{
                          padding: '4px 8px',
                          backgroundColor: '#fff',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: '#5f6368'
                        }}>
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#e8f0fe',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a73e8'
            }}>
              <strong>💡 Tip:</strong> Use keyboard navigation to quickly manage your habits without reaching for the mouse!
            </div>
          </div>
        </div>
      )}

      {/* Visual focus indicator */}
      {focusedHabitIndex >= 0 && (
        <style>
          {`
            [data-habit-index="${focusedHabitIndex}"] {
              outline: 2px solid #4285f4 !important;
              outline-offset: 2px !important;
            }
          `}
        </style>
      )}
    </>
  );
};

export default KeyboardShortcuts;
