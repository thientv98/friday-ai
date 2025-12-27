'use client';

import { useEffect } from 'react';

/**
 * Fix viewport height on iOS Safari
 * iOS Safari doesn't properly handle 100vh when address bar is visible/hidden
 */
export default function ViewportFix() {
  useEffect(() => {
    // Set CSS custom property for viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // iOS specific: handle viewport changes when address bar shows/hides
    let lastHeight = window.innerHeight;
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (Math.abs(currentHeight - lastHeight) > 150) {
        // Significant height change, likely address bar
        setVH();
        lastHeight = currentHeight;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      resizeObserver.disconnect();
    };
  }, []);

  return null;
}

