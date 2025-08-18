import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

function RouteAnimation({ routePoints, isAnimating = true }) {
  const map = useMap();
  const animationRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;

    // Create animated polyline
    const polyline = L.polyline(routePoints, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
      className: 'animated-route'
    }).addTo(map);

    polylineRef.current = polyline;

    // Animate the dash
    if (isAnimating) {
      let offset = 0;
      animationRef.current = setInterval(() => {
        offset = (offset + 1) % 20;
        polyline.setStyle({ dashOffset: offset });
      }, 100);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
    };
  }, [routePoints, isAnimating, map]);

  return null;
}

export default RouteAnimation;
