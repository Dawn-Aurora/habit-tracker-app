import React from 'react';
import SimpleFilter from './SimpleFilter';
import QuickActions from './QuickActions';
import { useResponsive } from '../hooks/useResponsive';
import './FloatingHeader.css';

const FloatingHeader = ({
  // Filter props
  habits,
  onFilterChange,
  searchTerm,
  setSearchTerm,
  
  // Quick Actions props
  selectedHabits,
  onSelectAll,
  onClearSelection,
  onBulkComplete,
  onBulkArchive,
  onBulkDelete,
  totalHabits
}) => {
  const responsive = useResponsive();

  return (
    <div className="floating-header">
      <div className="floating-header-content">
        {/* Your Habits Title - Always Visible */}
        <div className="your-habits-header">
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Your Habits
            {totalHabits > 0 && (
              <span style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '4px 12px',
                borderRadius: '20px',
                minWidth: '24px',
                textAlign: 'center'
              }}>
                {totalHabits}
              </span>
            )}
          </h2>
        </div>

        {/* Desktop Layout: Side by side */}
        {responsive.isDesktop ? (
          <div className="floating-header-desktop">
            <div className="floating-header-left">
              <SimpleFilter 
                habits={habits}
                onFilterChange={onFilterChange}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            <div className="floating-header-right">
              <QuickActions
                selectedHabits={selectedHabits}
                onSelectAll={onSelectAll}
                onClearSelection={onClearSelection}
                onBulkComplete={onBulkComplete}
                onBulkArchive={onBulkArchive}
                onBulkDelete={onBulkDelete}
                totalHabits={totalHabits}
              />
            </div>
          </div>
        ) : (
          /* Mobile Layout: Stacked */
          <div className="floating-header-mobile">
            <SimpleFilter 
              habits={habits}
              onFilterChange={onFilterChange}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <QuickActions
              selectedHabits={selectedHabits}
              onSelectAll={onSelectAll}
              onClearSelection={onClearSelection}
              onBulkComplete={onBulkComplete}
              onBulkArchive={onBulkArchive}
              onBulkDelete={onBulkDelete}
              totalHabits={totalHabits}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingHeader;
