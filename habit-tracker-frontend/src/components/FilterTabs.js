import React, { useState, useMemo } from 'react';

const FilterTabs = ({ 
  habits, 
  onFilterChange, 
  searchTerm,
  setSearchTerm 
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  // Extract all unique tags from habits
  const allTags = useMemo(() => {
    const tagSet = new Set();
    habits.forEach(habit => {
      if (habit.tags && Array.isArray(habit.tags)) {
        habit.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [habits]);

  // Get today's date for filtering (reserved for future use)
  // const today = new Date().toISOString().slice(0, 10);

  // Filter habits based on active filter and selected tags
  const getFilteredHabits = () => {
    let filtered = habits;

    // Apply search filter first
    if (searchTerm) {
      filtered = filtered.filter(habit => 
        habit.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply main filter
    switch (activeFilter) {
      case 'today':
        // Habits that should be done today based on their frequency
        filtered = filtered.filter(habit => {
          if (!habit.expectedFrequency) return true;
          
          if (typeof habit.expectedFrequency === 'object') {
            const { period } = habit.expectedFrequency;
            return period === 'day'; // Daily habits show up in "Today"
          }
          return true;
        });
        break;
        
      case 'favorites':
        // For now, we'll consider habits with high completion rates as favorites
        // In the future, this could be a user-selectable property
        filtered = filtered.filter(habit => {
          const completions = habit.completedDates ? habit.completedDates.length : 0;
          return completions >= 5; // Habits completed at least 5 times
        });
        break;
        
      case 'archived':
        // Habits that haven't been completed in the last 14 days
        filtered = filtered.filter(habit => {
          if (!habit.completedDates || habit.completedDates.length === 0) {
            return true; // New habits without completions
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
        
      case 'tags':
        // Filter by selected tags
        if (selectedTags.length > 0) {
          filtered = filtered.filter(habit => {
            if (!habit.tags || !Array.isArray(habit.tags)) return false;
            return selectedTags.some(selectedTag => 
              habit.tags.includes(selectedTag)
            );
          });
        }
        break;
        
      case 'all':
      default:
        // No additional filtering
        break;
    }

    return filtered;
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    if (filterType !== 'tags') {
      setSelectedTags([]);
    }
    onFilterChange(getFilteredHabits());
  };

  // Handle tag selection/deselection
  const handleTagClick = (tag) => {
    let newSelectedTags;
    if (selectedTags.includes(tag)) {
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      newSelectedTags = [...selectedTags, tag];
    }
    setSelectedTags(newSelectedTags);
    
    // Update filtered habits
    setTimeout(() => {
      onFilterChange(getFilteredHabits());
    }, 0);
  };

  // Update filtered habits when dependencies change
  React.useEffect(() => {
    const filtered = getFilteredHabits();
    onFilterChange(filtered);
  }, [activeFilter, selectedTags, searchTerm, habits]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get count for each filter
  const getCounts = () => {
    const todayHabits = habits.filter(habit => {
      if (!habit.expectedFrequency) return true;
      if (typeof habit.expectedFrequency === 'object') {
        return habit.expectedFrequency.period === 'day';
      }
      return true;
    });

    const favoriteHabits = habits.filter(habit => {
      const completions = habit.completedDates ? habit.completedDates.length : 0;
      return completions >= 5;
    });

    const archivedHabits = habits.filter(habit => {
      if (!habit.completedDates || habit.completedDates.length === 0) return true;
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const hasRecentCompletion = habit.completedDates.some(date => {
        const completionDate = new Date(date);
        return completionDate >= twoWeeksAgo;
      });
      return !hasRecentCompletion;
    });

    return {
      all: habits.length,
      today: todayHabits.length,
      favorites: favoriteHabits.length,
      archived: archivedHabits.length,
      tags: allTags.length
    };
  };

  const counts = getCounts();

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Search Bar */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '20px',
        maxWidth: '450px'
      }}>
        <input
          type="text"
          placeholder="🔍 Search habits by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 45px 14px 20px',
            border: '2px solid #e8eaed',
            borderRadius: '30px',
            fontSize: '16px',
            backgroundColor: '#fafbfc',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4285f4';
            e.target.style.backgroundColor = '#fff';
            e.target.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e8eaed';
            e.target.style.backgroundColor = '#fafbfc';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#f1f3f4',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e8eaed';
              e.target.style.color = '#202124';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f1f3f4';
              e.target.style.color = '#5f6368';
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#fafbfc',
        borderRadius: '12px',
        border: '1px solid #e8eaed'
      }}>
        {[
          { key: 'all', label: 'All Habits', icon: '📋', count: counts.all, color: '#6c757d' },
          { key: 'today', label: 'Due Today', icon: '📅', count: counts.today, color: '#28a745' },
          { key: 'favorites', label: 'Favorites', icon: '⭐', count: counts.favorites, color: '#ffc107' },
          { key: 'archived', label: 'Archived', icon: '📦', count: counts.archived, color: '#6f42c1' },
          { key: 'tags', label: 'By Tags', icon: '🏷️', count: counts.tags, color: '#17a2b8' }
        ].map(({ key, label, icon, count, color }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            style={{
              padding: '10px 16px',
              border: activeFilter === key ? `2px solid ${color}` : '2px solid transparent',
              borderRadius: '25px',
              background: activeFilter === key 
                ? `linear-gradient(135deg, ${color}15, ${color}25)` 
                : '#fff',
              color: activeFilter === key ? color : '#555',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeFilter === key ? '600' : '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeFilter === key 
                ? `0 4px 12px ${color}30` 
                : '0 2px 4px rgba(0,0,0,0.1)',
              transform: activeFilter === key ? 'translateY(-1px)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== key) {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== key) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.transform = 'none';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <span>{label}</span>
            <span style={{
              backgroundColor: activeFilter === key ? color : '#6c757d',
              color: 'white',
              borderRadius: '12px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tag Selection (only show when Tags filter is active) */}
      {activeFilter === 'tags' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e1e5e9',
          marginTop: '8px'
        }}>
          <h4 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: '#333',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🏷️</span>
            Select Tags to Filter:
          </h4>
          
          {allTags.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              No tags found. Add tags to your habits to use tag filtering.
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                {allTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      style={{
                        padding: '8px 16px',
                        border: isSelected ? '2px solid #28a745' : '2px solid #dee2e6',
                        borderRadius: '20px',
                        background: isSelected 
                          ? 'linear-gradient(135deg, #28a74515, #28a74525)' 
                          : '#fff',
                        color: isSelected ? '#28a745' : '#495057',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isSelected ? '600' : '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected 
                          ? '0 3px 8px rgba(40, 167, 69, 0.3)' 
                          : '0 2px 4px rgba(0,0,0,0.1)',
                        transform: isSelected ? 'translateY(-1px)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = '#adb5bd';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#dee2e6';
                          e.target.style.transform = 'none';
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>🏷️</span>
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
              
              {selectedTags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  border: '1px solid #28a745'
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#155724',
                    fontWeight: '500'
                  }}>
                    Selected: {selectedTags.join(', ')}
                  </span>
                  <button
                    onClick={() => setSelectedTags([])}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #dc3545',
                      borderRadius: '15px',
                      background: '#fff',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                      e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.color = '#dc3545';
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Active Filter Display */}
      {(activeFilter !== 'all' || selectedTags.length > 0) && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#1565c0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '12px',
          border: '1px solid #bbdefb',
          boxShadow: '0 2px 4px rgba(25, 118, 210, 0.1)'
        }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span style={{ fontWeight: '500' }}>Active filter:</span>
          <strong style={{ 
            color: '#0d47a1',
            backgroundColor: '#fff',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            {activeFilter === 'tags' && selectedTags.length > 0 
              ? `Tags: ${selectedTags.join(', ')}`
              : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1).replace(/([A-Z])/g, ' $1')
            }
          </strong>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSelectedTags([]);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1565c0',
              cursor: 'pointer',
              fontSize: '16px',
              marginLeft: 'auto',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1565c020';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Clear all filters"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterTabs;
