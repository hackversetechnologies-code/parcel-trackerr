import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom icons for different statuses
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const truckIcon = createCustomIcon('#3b82f6');
const destinationIcon = createCustomIcon('#ef4444');

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);

  return null;
}

function MapWithLiveTracking({ 
  parcel, 
  showRoute = true, 
  className = "h-96",
  interactive = true 
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (parcel?.location) {
      setCurrentLocation([parcel.location.lat, parcel.location.lng]);
    }
    
    if (showRoute && parcel?.location && parcel?.destination) {
      const points = [
        [parcel.location.lat, parcel.location.lng],
        [parcel.destination.lat, parcel.destination.lng]
      ];
      setRoutePoints(points);
    }
  }, [parcel, showRoute]);

  if (!parcel?.location) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
        <div className="text-center">
          <div className="animate-pulse text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500">Location data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} rounded-lg overflow-hidden shadow-lg`}>
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
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater 
          center={currentLocation} 
          zoom={currentLocation ? 15 : 13} 
        />
        
        {routePoints.length > 0 && showRoute && (
          <Polyline 
            positions={routePoints} 
            pathOptions={{ 
              color: '#3b82f6', 
              weight: 4, 
              opacity: 0.7,
              dashArray: '5, 10'
            }} 
          />
        )}
        
        {parcel.location && (
          <Marker 
            position={[parcel.location.lat, parcel.location.lng]} 
            icon={truckIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{parcel.status}</h3>
                <p className="text-xs text-gray-600">{parcel.location.address || 'Current location'}</p>
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
            icon={destinationIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">Destination</h3>
                <p className="text-xs text-gray-600">{parcel.destination.address || 'Delivery address'}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <button 
          onClick={() => {
            if (mapRef.current && currentLocation) {
              mapRef.current.flyTo(currentLocation, 15, { duration: 1 });
            }
          }}
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title="Center on current location"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      {/* Status Badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              parcel.status === 'delivered' ? 'bg-green-500' :
              parcel.status === 'in transit' ? 'bg-blue-500' :
              parcel.status === 'processing' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium">{parcel.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapWithLiveTracking;
