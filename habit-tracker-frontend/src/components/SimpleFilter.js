import React, { useState, useEffect, useRef } from 'react';
import './SimpleFilter.css';

const SimpleFilter = ({ 
  habits, 
  onFilterChange, 
  searchTerm,
  setSearchTerm 
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Habits', icon: '📋' },
    { id: 'today', label: 'Due Today', icon: '🎯' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'archived', label: 'Archived', icon: '📦' }
  ];

  // Get count for each filter
  const getFilterCount = (filterId) => {
    let filtered = habits;

    switch (filterId) {
      case 'all':
        return habits.length;
        
      case 'today':
        filtered = habits.filter(habit => {
          if (!habit.expectedFrequency) return true;
          if (typeof habit.expectedFrequency === 'object') {
            const { period } = habit.expectedFrequency;
            return period === 'day';
          }
          return true;
        });
        break;
        
      case 'favorites':
        filtered = habits.filter(habit => {
          const completions = habit.completedDates ? habit.completedDates.length : 0;
          return completions >= 5;
        });
        break;
        
      case 'archived':
        filtered = habits.filter(habit => {
          if (!habit.completedDates || habit.completedDates.length === 0) {
            return true;
          }
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const hasRecentCompletion = habit.completedDates.some(date => {
            const completionDate = new Date(date);
            return completionDate >= twoWeeksAgo;
          });
          return !hasRecentCompletion;
        });
        break;
        
      default:
        return 0;
    }
    
    return filtered.length;
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setShowDropdown(false);
    
    // Get filtered habits with the new filter
    let filtered = habits;

    // Apply search filter first
    if (searchTerm) {
      filtered = filtered.filter(habit => 
        habit.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply main filter
    switch (filterId) {
      case 'today':
        filtered = filtered.filter(habit => {
          if (!habit.expectedFrequency) return true;
          if (typeof habit.expectedFrequency === 'object') {
            const { period } = habit.expectedFrequency;
            return period === 'day';
          }
          return true;
        });
        break;
        
      case 'favorites':
        filtered = filtered.filter(habit => {
          const completions = habit.completedDates ? habit.completedDates.length : 0;
          return completions >= 5;
        });
        break;
        
      case 'archived':
        filtered = filtered.filter(habit => {
          if (!habit.completedDates || habit.completedDates.length === 0) {
            return true;
          }
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const hasRecentCompletion = habit.completedDates.some(date => {
            const completionDate = new Date(date);
            return completionDate >= twoWeeksAgo;
          });
          return !hasRecentCompletion;
        });
        break;
        
      case 'all':
      default:
        // No additional filtering needed
        break;
    }
    
    onFilterChange(filtered, filterId);
  };

  // Get current filter option
  const currentFilter = filterOptions.find(opt => opt.id === activeFilter);

  return (
    <div className="simple-filter-container">
      {/* Search Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search habits by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="filter-dropdown-container" ref={dropdownRef}>
        <button 
          className="filter-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="filter-icon">{currentFilter.icon}</span>
          <span className="filter-label">{currentFilter.label}</span>
          <span className="filter-count">{getFilterCount(activeFilter)}</span>
          <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
        </button>

        {showDropdown && (
          <div className="filter-dropdown-menu">
            {filterOptions.map(option => (
              <button
                key={option.id}
                className={`filter-option ${activeFilter === option.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFilterChange(option.id);
                }}
              >
                <span className="option-icon">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-count">{getFilterCount(option.id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleFilter;
