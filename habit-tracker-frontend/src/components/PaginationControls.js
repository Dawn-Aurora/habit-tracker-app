import React from 'react';

const PaginationControls = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  showLoadMore = true,
  loadMoreText = "Load More Habits"
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px',
      borderTop: '1px solid #e8eaed',
      backgroundColor: '#fafbfc',
      borderRadius: '0 0 12px 12px'
    }}>
      {/* Items Info */}
      <div style={{
        fontSize: '14px',
        color: '#5f6368',
        fontWeight: '500'
      }}>
        Showing {startItem}-{endItem} of {totalItems} habits
      </div>

      {/* Load More Button (if enabled and has next page) */}
      {showLoadMore && hasNextPage && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#3367d6';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4285f4';
            e.target.style.transform = 'none';
            e.target.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.3)';
          }}
        >
          <span>📄</span>
          {loadMoreText}
        </button>
      )}

      {/* Traditional Pagination (alternative to Load More) */}
      {!showLoadMore && totalPages > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            style={{
              padding: '8px 12px',
              backgroundColor: hasPrevPage ? '#fff' : '#f1f3f4',
              color: hasPrevPage ? '#4285f4' : '#9aa0a6',
              border: hasPrevPage ? '2px solid #4285f4' : '2px solid #e8eaed',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasPrevPage ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (hasPrevPage) {
                e.target.style.backgroundColor = '#4285f4';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (hasPrevPage) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#4285f4';
              }
            }}
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isCurrentPage = pageNum === currentPage;
              const showPage = pageNum === 1 || 
                             pageNum === totalPages || 
                             Math.abs(pageNum - currentPage) <= 1;
              
              if (!showPage) {
                if (pageNum === 2 && currentPage > 4) {
                  return <span key={pageNum} style={{ color: '#9aa0a6', padding: '0 4px' }}>...</span>;
                }
                if (pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                  return <span key={pageNum} style={{ color: '#9aa0a6', padding: '0 4px' }}>...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: isCurrentPage ? '#4285f4' : '#fff',
                    color: isCurrentPage ? '#fff' : '#4285f4',
                    border: '2px solid #4285f4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: isCurrentPage ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '40px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentPage) {
                      e.target.style.backgroundColor = '#4285f4';
                      e.target.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentPage) {
                      e.target.style.backgroundColor = '#fff';
                      e.target.style.color = '#4285f4';
                    }
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            style={{
              padding: '8px 12px',
              backgroundColor: hasNextPage ? '#fff' : '#f1f3f4',
              color: hasNextPage ? '#4285f4' : '#9aa0a6',
              border: hasNextPage ? '2px solid #4285f4' : '2px solid #e8eaed',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasNextPage ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (hasNextPage) {
                e.target.style.backgroundColor = '#4285f4';
                e.target.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (hasNextPage) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#4285f4';
              }
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Pagination Style Toggle */}
      {totalPages > 1 && (
        <button
          onClick={() => {
            // This would be passed as a prop to toggle pagination mode
            // For now, just show the text
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: '#5f6368',
            border: '1px solid #dadce0',
            borderRadius: '15px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f1f3f4';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {showLoadMore ? 'Switch to Page Numbers' : 'Switch to Load More'}
        </button>
      )}
    </div>
  );
};

export default PaginationControls;
