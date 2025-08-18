import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4
const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-XXXXXXXXXX';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', GA4_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
}

export function useEventTracking() {
  return (eventName, eventParams = {}) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        ...eventParams,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', eventName, eventParams);
    }
  };
}

// Predefined events
export const trackParcelView = (trackingId, status) => {
  useEventTracking()('view_parcel', {
    tracking_id: trackingId,
    status: status,
  });
};

export const trackSearch = (query) => {
  useEventTracking()('search', {
    search_term: query,
  });
};

export const trackLogin = (method) => {
  useEventTracking()('login', {
    method: method,
  });
};

export const trackNotificationPermission = (granted) => {
  useEventTracking()('notification_permission', {
    granted: granted,
  });
};

export const trackMapInteraction = (action) => {
  useEventTracking()('map_interaction', {
    action: action,
  });
};

// Performance monitoring
export function usePerformanceTracking() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            useEventTracking()('page_performance', {
              load_time: Math.round(entry.loadEventEnd - entry.fetchStart),
              dom_content_loaded: Math.round(entry.domContentLoadedEventEnd - entry.fetchStart),
              first_paint: Math.round(entry.responseStart - entry.fetchStart),
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);
}
