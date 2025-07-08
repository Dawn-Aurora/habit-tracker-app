import React, { useEffect, useRef } from 'react';

const ScrollManager = ({ children, preserveScrollKey, className, style }) => {
  const containerRef = useRef(null);
  const scrollPositions = useRef(new Map());

  // Save scroll position when component unmounts or key changes
  useEffect(() => {
    const saveScrollPosition = () => {
      if (containerRef.current && preserveScrollKey) {
        scrollPositions.current.set(preserveScrollKey, containerRef.current.scrollTop);
      }
    };

    // Save on unmount
    return saveScrollPosition;
  }, [preserveScrollKey]);

  // Restore scroll position when component mounts or key changes
  useEffect(() => {
    if (containerRef.current && preserveScrollKey) {
      const savedPosition = scrollPositions.current.get(preserveScrollKey);
      if (savedPosition !== undefined) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = savedPosition;
          }
        });
      }
    }
  }, [preserveScrollKey, children]);

  // Throttled scroll position saving
  useEffect(() => {
    let throttleTimer = null;
    
    const handleScroll = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        if (containerRef.current && preserveScrollKey) {
          scrollPositions.current.set(preserveScrollKey, containerRef.current.scrollTop);
        }
        throttleTimer = null;
      }, 100); // Throttle to every 100ms
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (throttleTimer) {
          clearTimeout(throttleTimer);
        }
      };
    }
  }, [preserveScrollKey]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ScrollManager;
