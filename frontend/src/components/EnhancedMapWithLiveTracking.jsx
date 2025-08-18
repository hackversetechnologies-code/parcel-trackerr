import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import RouteAnimation from './RouteAnimation';
import { calculateETA, calculateDistance } from '@/utils/etaCalculator';
import { useEventTracking } from '@/hooks/useAnalytics';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const createCustomIcon = (color, size = 20) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

function EnhancedMapWithLiveTracking({ 
  parcel, 
  showRoute = true, 
  className = "h-96",
  interactive = true 
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const trackEvent = useEventTracking();
  const mapRef = useRef(null);

  useEffect(() => {
    if (parcel?.location) {
      const location = [parcel.location.lat, parcel.location.lng];
      setCurrentLocation(location);
      
      if (parcel.destination) {
        const dist = calculateDistance(
          parcel.location.lat, parcel.location.lng,
          parcel.destination.lat, parcel.destination.lng
        );
        setDistance(dist);
        
        const calculatedEta = calculateETA(dist);
        setEta(calculatedEta);
      }
    }
  }, [parcel]);

  const routePoints = parcel?.location && parcel?.destination ? [
    [parcel.location.lat, parcel.location.lng],
    [parcel.destination.lat, parcel.destination.lng]
  ] : [];

  const handleMapClick = () => {
    trackEvent('map_interaction', { action: 'click' });
  };

  if (!parcel?.location) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl`}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
          </div>
          <p className="text-gray-600">Location data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} rounded-xl overflow-hidden shadow-2xl`}>
      <MapContainer
        ref={mapRef}
        center={currentLocation || [parcel.location.lat, parcel.location.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        onClick={handleMapClick}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={currentLocation} zoom={currentLocation ? 15 : 13} />
        
        {showRoute && routePoints.length > 0 && (
          <RouteAnimation routePoints={routePoints} isAnimating={parcel.status !== 'delivered'} />
        )}
        
        {parcel.location && (
          <Marker 
            position={[parcel.location.lat, parcel.location.lng]} 
            icon={createCustomIcon('#3b82f6', 24)}
          >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{parcel.status}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {parcel.location.address || 'Current location'}
                </p>
                {eta && (
                  <p className="text-xs font-medium text-blue-600">
                    ETA: {eta.formatted}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {parcel.destination && (
          <Marker 
            position={[parcel.destination.lat, parcel.destination.lng]} 
            icon={createCustomIcon('#ef4444', 20)}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1">Destination</h3>
                <p className="text-xs text-gray-600">
                  {parcel.destination.address || 'Delivery address'}
                </p>
                {distance && (
                  <p className="text-xs text-gray-500 mt-1">
                    Distance: {distance.toFixed(1)} km
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button 
          onClick={() => {
            if (currentLocation && mapRef.current) {
              mapRef.current.flyTo(currentLocation, 15, { duration: 1 });
            }
          }}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
          title="Center on current location"
          aria-label="Center map on current location"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      {/* Status Badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              parcel.status === 'delivered' ? 'bg-green-500' :
              parcel.status === 'in transit' ? 'bg-blue-500' :
              parcel.status === 'processing' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium">{parcel.status}</span>
            {eta && (
              <span className="text-xs text-gray-500">ETA: {eta.formatted}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedMapWithLiveTracking;
