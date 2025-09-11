import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/useResponsive';
import '../styles/mobile-navigation.css';

function MobileNavigation({ 
  activeView, 
  
  onViewChange, 
  completedToday = 0, 
  totalHabits = 0, 
  user, 
  onLogout 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // PWA functionality
  const { isInstallable, isInstalled, installApp } = usePWA();

  // Auto-hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      id: 'habits',
      label: 'Habits',
      icon: '✅',
      badge: `${completedToday}/${totalHabits}`,
      color: 'var(--success-color)'
    },
    {
      id: 'add',
      label: 'Add',
      icon: '➕',
      color: 'var(--primary-color)'
    },
    {
      id: 'analytics',
      label: 'Insights',
      icon: '📈',
      color: 'var(--accent-color)'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      color: 'var(--gray-600)'
    }
  ];

  const handleNavClick = (itemId) => {
    if (itemId === 'profile') {
      // Show profile menu instead of changing view
      setShowProfileMenu(true);
    } else {
      onViewChange(itemId);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className={`mobile-nav ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="mobile-nav-container">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ '--item-color': item.color }}
            >
              <div className="mobile-nav-icon">
                {item.icon}
                {item.badge && (
                  <span className="mobile-nav-badge">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div className="mobile-profile-overlay" onClick={() => setShowProfileMenu(false)}>
          <div className="mobile-profile-menu" onClick={e => e.stopPropagation()}>
            <div className="profile-header">
              <div className="profile-info-section">
                <div className="profile-avatar">
                  👤
                </div>
                <div className="profile-info">
                  <h3 style={{color: '#333'}}>{user?.name || 'User'}</h3>
                  <p>{user?.email}</p>
                </div>
              </div>
              <button 
                className="profile-close-btn"
                onClick={() => setShowProfileMenu(false)}
                aria-label="Close profile menu"
              >
                ✕
              </button>
            </div>
            
            <div className="profile-actions">
              <button 
                className="profile-action-btn"
                onClick={() => {
                  alert('Settings feature coming soon!');
                  setShowProfileMenu(false);
                }}
              >
                <span className="action-icon">⚙️</span>
                Settings
              </button>
              <button 
                className="profile-action-btn"
                onClick={() => {
                  alert('Dark mode feature coming soon!');
                  setShowProfileMenu(false);
                }}
              >
                <span className="action-icon">🌙</span>
                Dark Mode
              </button>
              {isInstallable && !isInstalled && (
                <button 
                  className="profile-action-btn"
                  onClick={() => {
                    installApp();
                    setShowProfileMenu(false);
                  }}
                >
                  <span className="action-icon">📱</span>
                  Install App
                </button>
              )}
              {isInstalled && (
                <button className="profile-action-btn" disabled>
                  <span className="action-icon">✅</span>
                  App Installed
                </button>
              )}
              <button 
                className="profile-action-btn logout"
                onClick={() => {
                  onLogout();
                  setShowProfileMenu(false);
                }}
              >
                <span className="action-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Spacer */}
      <div className="mobile-nav-spacer" />
    </>
  );
}

export default MobileNavigation;
