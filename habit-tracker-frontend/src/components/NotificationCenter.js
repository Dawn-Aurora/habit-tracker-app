import React, { useState, useEffect, useCallback } from 'react';
import { getErrorMessage, categorizeError, getErrorIcon } from '../utils/errorUtils';

const NotificationCenter = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notification-center" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
};

const Notification = ({ id, type, message, error, autoDismiss = true, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300); // Match CSS animation duration
  }, [onDismiss]);

  // Auto-dismiss after timeout
  useEffect(() => {
    if (autoDismiss && type !== 'error') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, type === 'success' ? 4000 : 6000);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, type, handleDismiss]);

  if (!isVisible) return null;

  // Enhanced error message if error object is provided
  const displayMessage = error ? getErrorMessage(error) : message;
  const errorCategory = error ? categorizeError(error) : null;
  const icon = error ? getErrorIcon(errorCategory) : getNotificationIcon(type);

  const getStyles = () => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isLeaving ? 'translateX(100%)' : 'translateX(0)',
      opacity: isLeaving ? 0 : 1,
      fontFamily: 'var(--font-family)',
      fontSize: '14px',
      lineHeight: '1.4',
      maxWidth: '100%',
      wordBreak: 'break-word'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#f0f9f0',
          borderColor: '#4caf50',
          color: '#2e7d32'
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#fff5f5',
          borderColor: '#f44336',
          color: '#c62828'
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#fffbf0',
          borderColor: '#ff9800',
          color: '#ef6c00'
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#f0f8ff',
          borderColor: '#2196f3',
          color: '#1565c0'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#f8f9fa',
          borderColor: '#6c757d',
          color: '#495057'
        };
    }
  };

  return (
    <div 
      style={getStyles()}
      onClick={handleDismiss}
      className="notification"
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>
        {icon}
      </span>
      
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: '500', 
          marginBottom: displayMessage !== message ? '4px' : '0' 
        }}>
          {displayMessage}
        </div>
        
        {/* Show additional context for errors */}
        {error && error.response && (
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.8, 
            marginTop: '4px' 
          }}>
            {error.response.status && `Status: ${error.response.status}`}
            {error.response.statusText && ` (${error.response.statusText})`}
          </div>
        )}
        
        {/* Show retry hint for retryable errors */}
        {error && errorCategory === 'network' && (
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.8, 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            Click to retry or check your connection
          </div>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          opacity: 0.6,
          padding: '0',
          marginLeft: '8px',
          flexShrink: 0
        }}
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper methods for common notification types
  const showSuccess = (message) => addNotification({ type: 'success', message });
  const showError = (message, error = null) => addNotification({ 
    type: 'error', 
    message, 
    error,
    autoDismiss: false // Keep errors visible until manually dismissed
  });
  const showWarning = (message) => addNotification({ type: 'warning', message });
  const showInfo = (message) => addNotification({ type: 'info', message });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default NotificationCenter;