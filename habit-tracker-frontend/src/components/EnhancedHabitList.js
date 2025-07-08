import React, { useState } from 'react';
import EnhancedCompletionCounter from './EnhancedCompletionCounter';
import FilterTabs from './FilterTabs';
import PaginationControls from './PaginationControls';
import ScrollManager from './ScrollManager';
import QuickActions from './QuickActions';
import KeyboardShortcuts from './KeyboardShortcuts';

function EnhancedHabitList({ habits, onEdit, onDelete, onMarkComplete, onAddNote, onViewMetrics, onCompletionChange }) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtered habits state
  const [filteredHabits, setFilteredHabits] = useState(habits || []);
  
  // Inactive habits state
  const [showInactiveHabits, setShowInactiveHabits] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [usePagination, setUsePagination] = useState(true);
  const [paginationStyle, setPaginationStyle] = useState('loadMore'); // 'loadMore' or 'traditional'
  
  // Selection state for bulk actions
  const [selectedHabits, setSelectedHabits] = useState([]);
  
  // Search ref for keyboard shortcuts
  const searchInputRef = React.useRef(null);
  
  // Helper function to determine if a habit is recently active (within 7 days)
  const isRecentlyActive = (habit) => {
    if (!habit.completedDates || !Array.isArray(habit.completedDates) || habit.completedDates.length === 0) {
      return false;
    }
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return habit.completedDates.some(date => {
      const completionDate = new Date(date);
      return completionDate >= sevenDaysAgo;
    });
  };

  // Update filtered habits when habits prop changes
  React.useEffect(() => {
    setFilteredHabits(habits || []);
  }, [habits]);

  // Handle filter changes from FilterTabs
  const handleFilterChange = (newFilteredHabits) => {
    setFilteredHabits(newFilteredHabits);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Pagination logic
  const getPaginatedHabits = (habitsList) => {
    if (!usePagination) return habitsList;
    
    if (paginationStyle === 'loadMore') {
      // Load More style: show all items up to current page
      return habitsList.slice(0, currentPage * itemsPerPage);
    } else {
      // Traditional pagination: show only current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return habitsList.slice(startIndex, endIndex);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePaginationStyleToggle = () => {
    setPaginationStyle(paginationStyle === 'loadMore' ? 'traditional' : 'loadMore');
    setCurrentPage(1); // Reset to first page
  };

  // Bulk action handlers
  const handleSelectAll = () => {
    const allDisplayedHabits = [...activeHabits, ...inactiveHabits].map(habit => habit.id);
    setSelectedHabits(allDisplayedHabits);
  };

  const handleClearSelection = () => {
    setSelectedHabits([]);
  };

  const handleHabitSelect = (habitId, isSelected) => {
    if (isSelected) {
      setSelectedHabits(prev => [...prev, habitId]);
    } else {
      setSelectedHabits(prev => prev.filter(id => id !== habitId));
    }
  };

  const handleBulkComplete = (habitIds) => {
    const today = new Date().toISOString().slice(0, 10);
    habitIds.forEach(habitId => {
      onMarkComplete(habitId, today);
    });
  };

  const handleBulkArchive = (habitIds) => {
    // For now, we'll simulate archiving by marking habits as inactive
    // In a real implementation, this would update a status field
    console.log('Archiving habits:', habitIds);
  };

  const handleBulkDelete = (habitIds) => {
    habitIds.forEach(habitId => {
      onDelete(habitId);
    });
  };

  // Keyboard shortcut handlers
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      // Fallback: find search input in FilterTabs
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  if (!habits || habits.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontSize: '18px'
      }}>
        No habits found. Add your first habit to get started!
      </div>
    );
  }

  // Separate active and inactive habits from the filtered results
  const activeHabits = filteredHabits.filter(habit => isRecentlyActive(habit));
  const inactiveHabits = filteredHabits.filter(habit => !isRecentlyActive(habit));

  // Apply pagination
  const paginatedActiveHabits = getPaginatedHabits(activeHabits);
  const paginatedInactiveHabits = getPaginatedHabits(inactiveHabits);

  const formatFrequency = (expectedFrequency) => {
    if (!expectedFrequency) return '';
    
    if (typeof expectedFrequency === 'object' && expectedFrequency !== null) {
      const { count, period } = expectedFrequency;
      return `${count} time${count === 1 ? '' : 's'} per ${period}`;
    }
    return expectedFrequency || '';
  };

  const getCompletionRate = (habit) => {
    if (!habit.completedDates || !Array.isArray(habit.completedDates)) {
      return null;
    }
    
    if (typeof habit.expectedFrequency === 'object' && habit.expectedFrequency !== null) {
      const { count, period } = habit.expectedFrequency;
      const today = new Date();
      
      if (period === 'day') {
        const todayCount = habit.completedDates.filter(date => 
          date.slice(0, 10) === today.toISOString().slice(0, 10)
        ).length;
        return Math.min((todayCount / count) * 100, 100);
      }
      
      if (period === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekCompletions = habit.completedDates.filter(date => {
          const completionDate = new Date(date);
          return completionDate >= weekStart && completionDate <= weekEnd;
        }).length;
        
        return Math.min((weekCompletions / count) * 100, 100);
      }
    }
    
    return null;
  };

  const renderHabitCard = (habit, index) => {
    // Add safety checks for habit object
    if (!habit || !habit.id || !habit.name) {
      console.warn('EnhancedHabitList - Skipping invalid habit:', habit);
      return null;
    }
    
    const completionRate = getCompletionRate(habit);
    const isStructuredFrequency = typeof habit.expectedFrequency === 'object';
    const isSelected = selectedHabits.includes(habit.id);
    
    return (
      <div 
        key={habit.id} 
        data-habit-index={index}
        style={{ 
          border: isSelected ? '2px solid #4285f4' : '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '16px',
          backgroundColor: isSelected ? '#f8f9ff' : '#fafafa',
          boxShadow: isSelected ? '0 4px 12px rgba(66, 133, 244, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Header with selection */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleHabitSelect(habit.id, e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                accentColor: '#4285f4',
                cursor: 'pointer'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                fontSize: '18px',
                fontWeight: '600',
                color: '#333'
              }}>
                {habit.name}
              </h3>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                {formatFrequency(habit.expectedFrequency)}
                {completionRate !== null && (
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: completionRate >= 100 ? '#4caf50' : completionRate >= 70 ? '#ff9800' : '#f44336',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {Math.round(completionRate)}%
                  </span>
                )}
              </div>
              
              {/* Tags */}
              {habit.tags && Array.isArray(habit.tags) && habit.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {habit.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} style={{
                      backgroundColor: '#e3f2fd',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#1976d2'
                    }}>
                      🏷️ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Completion Counter for structured frequency */}
          {isStructuredFrequency && (
            <EnhancedCompletionCounter 
              habit={habit} 
              onCompletionChange={onCompletionChange}
            />
          )}
        </div>
        
        {/* Recent Completions */}
        {habit.completedDates && Array.isArray(habit.completedDates) && habit.completedDates.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Recent completions:
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {habit.completedDates.slice(-5).reverse().map((date, dateIndex) => (
                <span key={dateIndex} style={{
                  backgroundColor: '#e8f5e8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#2e7d32'
                }}>
                  {new Date(date).toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!isStructuredFrequency && (
            <button 
              onClick={() => onMarkComplete(habit.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Mark Complete
            </button>
          )}
          
          <button 
            onClick={() => onEdit(habit)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
          
          <button 
            onClick={() => onAddNote(habit)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Add Note
          </button>
          
          <button 
            onClick={() => onViewMetrics(habit)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Metrics
          </button>
          
          <button 
            onClick={() => onDelete(habit.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <ScrollManager 
      preserveScrollKey={`habits-${filteredHabits.length}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100vh',
        overflow: 'auto'
      }}
    >
      {/* Quick Actions */}
      <QuickActions
        selectedHabits={selectedHabits}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkComplete={handleBulkComplete}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        totalHabits={[...activeHabits, ...inactiveHabits].length}
      />

      {/* Filter Tabs with Search */}
      <FilterTabs 
        habits={habits}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        habits={[...activeHabits, ...inactiveHabits]}
        onMarkComplete={onMarkComplete}
        onEdit={onEdit}
        onSearch={handleSearchFocus}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        selectedHabits={selectedHabits}
      />

      {/* Pagination Settings */}
      {filteredHabits.length > 5 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e8eaed'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#5f6368',
            fontWeight: '500'
          }}>
            <input
              type="checkbox"
              checked={usePagination}
              onChange={(e) => setUsePagination(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#4285f4'
              }}
            />
            Enable Pagination
          </label>
          
          {usePagination && (
            <>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={20}>20 per page</option>
              </select>
              
              <button
                onClick={handlePaginationStyleToggle}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fff',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#5f6368',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f3f4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                }}
              >
                {paginationStyle === 'loadMore' ? '📄 Load More Style' : '📑 Page Numbers'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Active Habits Section */}
      {activeHabits.length > 0 && (
        <div>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#4caf50' }}>🟢</span>
            Active Habits ({activeHabits.length})
            {usePagination && paginationStyle === 'loadMore' && paginatedActiveHabits.length < activeHabits.length && (
              <span style={{ 
                fontSize: '12px', 
                color: '#666', 
                fontWeight: '400',
                backgroundColor: '#f1f3f4',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                Showing {paginatedActiveHabits.length} of {activeHabits.length}
              </span>
            )}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(usePagination ? paginatedActiveHabits : activeHabits).map((habit, index) => renderHabitCard(habit, index))}
          </div>
          
          {/* Pagination Controls for Active Habits */}
          {usePagination && activeHabits.length > itemsPerPage && (
            <PaginationControls
              totalItems={activeHabits.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              showLoadMore={paginationStyle === 'loadMore'}
              loadMoreText="Load More Active Habits"
            />
          )}
        </div>
      )}

      {/* Inactive Habits Section */}
      {inactiveHabits.length > 0 && (
        <div>
          <button
            onClick={() => setShowInactiveHabits(!showInactiveHabits)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: showInactiveHabits ? '#fff3e0' : '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ff9800' }}>🟡</span>
              Inactive Habits ({inactiveHabits.length})
              <span style={{ fontSize: '12px', color: '#999' }}>
                (no activity in 7+ days)
              </span>
            </span>
            <span style={{ fontSize: '18px', transform: showInactiveHabits ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              ▼
            </span>
          </button>
          
          {showInactiveHabits && (
            <div style={{ 
              marginTop: '16px',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              opacity: 0.8
            }}>
              {(usePagination ? paginatedInactiveHabits : inactiveHabits).map((habit, index) => renderHabitCard(habit, index + activeHabits.length))}
              
              {/* Pagination Controls for Inactive Habits */}
              {usePagination && inactiveHabits.length > itemsPerPage && (
                <PaginationControls
                  totalItems={inactiveHabits.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  showLoadMore={paginationStyle === 'loadMore'}
                  loadMoreText="Load More Inactive Habits"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* No habits found message */}
      {filteredHabits.length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontSize: '16px'
        }}>
          No habits found matching "{searchTerm}"
        </div>
      )}
    </ScrollManager>
  );
}

export default EnhancedHabitList;
