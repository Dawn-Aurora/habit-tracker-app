import React, { useState } from 'react';

const QuickActions = ({ 
  selectedHabits, 
  onSelectAll, 
  onClearSelection, 
  onBulkComplete, 
  onBulkArchive, 
  onBulkDelete,
  totalHabits 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const hasSelection = selectedHabits.length > 0;
  const isAllSelected = selectedHabits.length === totalHabits && totalHabits > 0;

  if (totalHabits === 0) return null;

  const handleBulkAction = (action, confirmText) => {
    if (selectedHabits.length === 0) return;
    
    setShowConfirmDialog({
      action,
      confirmText,
      count: selectedHabits.length
    });
  };

  const confirmAction = () => {
    const { action } = showConfirmDialog;
    
    switch (action) {
      case 'complete':
        onBulkComplete(selectedHabits);
        break;
      case 'archive':
        onBulkArchive(selectedHabits);
        break;
      case 'delete':
        onBulkDelete(selectedHabits);
        break;
      default:
        break;
    }
    
    setShowConfirmDialog(null);
    onClearSelection();
  };

  return (
    <>
      <div style={{
        position: 'relative',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8eaed',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: hasSelection ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Selection Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#5f6368',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectAll();
                  } else {
                    onClearSelection();
                  }
                }}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#4285f4'
                }}
              />
              {hasSelection ? (
                <span style={{ color: '#4285f4', fontWeight: '600' }}>
                  {selectedHabits.length} selected
                </span>
              ) : (
                <span>Select All ({totalHabits})</span>
              )}
            </label>
            
            {hasSelection && (
              <button
                onClick={onClearSelection}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5f6368',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Actions Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasSelection}
            style={{
              padding: '8px 16px',
              backgroundColor: hasSelection ? '#4285f4' : '#f1f3f4',
              color: hasSelection ? '#fff' : '#9aa0a6',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚡</span>
            Quick Actions
            <span style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
        </div>

        {/* Expanded Actions */}
        {isExpanded && hasSelection && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 100
          }}>
            <button
              onClick={() => handleBulkAction('complete', 'mark as completed today')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#34a853',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#137333';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#34a853';
              }}
            >
              ✅ Complete Today
            </button>

            <button
              onClick={() => handleBulkAction('archive', 'archive')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f57c00';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ff9800';
              }}
            >
              📦 Archive
            </button>

            <button
              onClick={() => handleBulkAction('delete', 'permanently delete')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ea4335',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#d33b2c';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ea4335';
              }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333'
            }}>
              Confirm Bulk Action
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              color: '#666',
              lineHeight: 1.5
            }}>
              Are you sure you want to <strong>{showConfirmDialog.confirmText}</strong> {' '}
              <strong>{showConfirmDialog.count}</strong> habit{showConfirmDialog.count > 1 ? 's' : ''}?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f3f4',
                  color: '#5f6368',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ea4335',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
