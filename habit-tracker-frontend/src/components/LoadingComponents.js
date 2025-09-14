import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  color = '#667eea',
  overlay = false 
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '20px', height: '20px', borderWidth: '2px' };
      case 'large':
        return { width: '48px', height: '48px', borderWidth: '4px' };
      case 'xlarge':
        return { width: '64px', height: '64px', borderWidth: '5px' };
      default: // medium
        return { width: '32px', height: '32px', borderWidth: '3px' };
    }
  };

  const sizeStyles = getSizeStyles();
  
  const spinnerStyle = {
    ...sizeStyles,
    border: `${sizeStyles.borderWidth} solid #f3f3f3`,
    borderTop: `${sizeStyles.borderWidth} solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: showText ? '0 auto 12px' : '0 auto'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: overlay ? '40px' : '20px',
    ...(overlay && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    })
  };

  const textStyle = {
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {showText && <div style={textStyle}>{text}</div>}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const SkeletonLoader = ({ 
  lines = 3, 
  height = '20px', 
  spacing = '12px',
  animated = true 
}) => {
  const skeletonStyle = {
    height,
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginBottom: spacing,
    ...(animated && {
      backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite'
    })
  };

  const containerStyle = {
    padding: '20px'
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: lines }, (_, i) => (
        <div 
          key={i}
          style={{
            ...skeletonStyle,
            width: i === lines - 1 ? '60%' : '100%', // Last line shorter
            marginBottom: i === lines - 1 ? '0' : spacing
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

const LoadingButton = ({ 
  loading, 
  children, 
  disabled, 
  onClick,
  className = '',
  style = {},
  loadingText = 'Please wait...',
  spinnerColor = '#ffffff',
  ...props 
}) => {
  const buttonStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.7 : 1,
    transition: 'all 0.2s ease',
    ...style
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: `2px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <button
      className={className}
      style={buttonStyle}
      disabled={loading || disabled}
      onClick={loading ? undefined : onClick}
      {...props}
    >
      {loading && <div style={spinnerStyle}></div>}
      {loading ? loadingText : children}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

const InlineLoader = ({ 
  text = 'Loading...', 
  color = '#667eea',
  size = 'small'
}) => {
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    fontSize: '14px',
    color: '#666'
  };

  const dotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: color,
    animation: 'pulse 1.5s ease-in-out infinite'
  };

  return (
    <div style={containerStyle}>
      <div style={dotStyle}></div>
      <div style={dotStyle}></div>
      <div style={dotStyle}></div>
      <span>{text}</span>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        div:nth-child(1) { animation-delay: 0s; }
        div:nth-child(2) { animation-delay: 0.2s; }
        div:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export { LoadingSpinner, SkeletonLoader, LoadingButton, InlineLoader };
export default LoadingSpinner;