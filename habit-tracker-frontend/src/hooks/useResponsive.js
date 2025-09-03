import { useState, useEffect, useRef } from 'react';

// Custom hook for responsive design
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });
  
  const prevWidthRef = useRef(screenSize.width);

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    isLandscape: false,
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Skip responsive updates if modal is open to prevent layout shifts
      if (window.__MODAL_OPEN__) {
        return;
      }
      
      // Add debouncing to prevent rapid changes during modal operations
      const prevWidth = prevWidthRef.current;
      if (Math.abs(width - prevWidth) > 100 && Math.abs(width - prevWidth) < 600) {
        // Delay the update for potential modal-related changes
        setTimeout(() => {
          if (!window.__MODAL_OPEN__) {
            updateScreenInfo();
          }
        }, 100);
        return;
      }
      
      setScreenSize({ width, height });
      
      const isMobile = width <= 480;
      const isTablet = width > 480 && width <= 1024;
      const isDesktop = width > 1024;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isLandscape = width > height;
      
      prevWidthRef.current = width;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isLandscape,
      });
    };

    // Initial check
    updateScreenInfo();

    // Listen for resize events
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return {
    ...screenSize,
    ...deviceInfo,
    // Utility functions
    showMobileNav: deviceInfo.isMobile,
    showDesktopNav: !deviceInfo.isMobile,
    cardColumns: deviceInfo.isMobile ? 1 : deviceInfo.isTablet ? 2 : 3,
    itemsPerPage: deviceInfo.isMobile ? 5 : 10,
  };
}

// Custom hook for touch gestures
export function useTouchGestures(element, options = {}) {
  const [gestureState, setGestureState] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    swipeDistance: 0,
  });

  useEffect(() => {
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const minSwipeDistance = options.minSwipeDistance || 100;
    const maxSwipeTime = options.maxSwipeTime || 300;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;
      
      if (deltaTime > maxSwipeTime) return;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          setGestureState(prev => ({ ...prev, isSwipeRight: true }));
          options.onSwipeRight && options.onSwipeRight();
        } else {
          setGestureState(prev => ({ ...prev, isSwipeLeft: true }));
          options.onSwipeLeft && options.onSwipeLeft();
        }
      } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY > 0) {
          setGestureState(prev => ({ ...prev, isSwipeDown: true }));
          options.onSwipeDown && options.onSwipeDown();
        } else {
          setGestureState(prev => ({ ...prev, isSwipeUp: true }));
          options.onSwipeUp && options.onSwipeUp();
        }
      }

      // Reset gesture state after a short delay
      setTimeout(() => {
        setGestureState({
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: false,
          isSwipeDown: false,
          swipeDistance: 0,
        });
      }, 100);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, options]);

  return gestureState;
}

// Hook for detecting PWA capabilities
export function usePWA() {
  const [pwaInfo, setPwaInfo] = useState({
    isInstallable: false,
    isInstalled: false,
    deferredPrompt: null,
  });

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;
    
    setPwaInfo(prev => ({ ...prev, isInstalled }));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setPwaInfo(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (pwaInfo.deferredPrompt) {
      pwaInfo.deferredPrompt.prompt();
      const choiceResult = await pwaInfo.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPwaInfo(prev => ({
          ...prev,
          isInstallable: false,
          deferredPrompt: null,
        }));
      }
    }
  };

  return {
    ...pwaInfo,
    installApp,
  };
}
