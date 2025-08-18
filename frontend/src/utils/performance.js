/**
 * Performance optimization utilities
 */

// Image optimization
export const optimizeImage = (src, options = {}) => {
  const { width = 800, height = 600, quality = 80, format = 'webp' } = options;
  
  // Use Cloudinary or similar service for production
  if (import.meta.env.PROD) {
    return `https://res.cloudinary.com/demo/image/upload/w_${width},h_${height},q_${quality},f_${format}/${src}`;
  }
  
  return src;
};

// Lazy loading images
export const lazyImage = (src, placeholder = '/placeholder.jpg') => {
  return {
    src,
    placeholder,
    blurDataURL: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`, // 20x20 blurred version
  };
};

// Bundle optimization
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/icons/sprite.svg',
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.includes('.woff2') ? 'font' : 'image';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Service worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, prompt user to refresh
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
};

// Cache management
export const clearOldCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name.includes('parcel-cache-v'));
    
    await Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
  }
};

// Memory management
export const cleanupMemory = () => {
  // Clear unused event listeners
  window.removeEventListener('resize', null);
  window.removeEventListener('scroll', null);
  
  // Clear unused intervals
  const intervals = window.setInterval(() => {}, 0);
  for (let i = 0; i < intervals; i++) {
    window.clearInterval(i);
  }
};
