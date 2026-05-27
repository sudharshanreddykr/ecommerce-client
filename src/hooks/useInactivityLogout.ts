import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute

export const useInactivityLogout = () => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        logout();
        // Use a custom event or toast instead of alert for better UX in production
        console.warn('Session expired due to inactivity');
        window.location.href = '/login?reason=inactivity';
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    if (isAuthenticated) {
      resetTimer();
      events.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);
};
