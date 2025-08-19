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
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg border`}>
        <div className="text-center p-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Location data unavailable</p>
          <p className="text-gray-400 text-sm mt-1">Tracking information will update when location is available</p>
        </div>
      </div>
    );
  }

  // Check if required data is available before rendering the map
  if (!parcel.location.lat || !parcel.location.lng) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg border`}>
        <div className="text-center p-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Invalid location data</p>
          <p className="text-gray-400 text-sm mt-1">Unable to display map with current data</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className={`relative ${className} rounded-lg overflow-hidden shadow-lg border`}>
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
            zoom={15}
          />
          
          {routePoints.length > 0 && (
            <Polyline 
              positions={routePoints} 
              pathOptions={{ color: '#3b82f6', weight: 4 }} 
            />
          )}
          
          {currentLocation && (
            <Marker 
              position={currentLocation} 
              icon={truckIcon}
            >
              <Popup className="custom-popup">
                <div className="font-semibold">Current Location</div>
                <div className="text-sm">{parcel.status}</div>
              </Popup>
            </Marker>
          )}
          
          {parcel?.destination?.lat && parcel?.destination?.lng && (
            <Marker 
              position={[parcel.destination.lat, parcel.destination.lng]} 
              icon={destinationIcon}
            >
              <Popup className="custom-popup">
                <div className="font-semibold">Destination</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          <button 
            onClick={() => {
              if (mapRef.current && currentLocation) {
                mapRef.current.flyTo(currentLocation, 15, { duration: 1 });
              }
            }}
            className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Center on current location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-white px-4 py-3 rounded-lg shadow-md flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              parcel.status === 'delivered' ? 'bg-green-500' :
              parcel.status === 'in transit' ? 'bg-blue-500' :
              parcel.status === 'processing' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm font-medium capitalize">{parcel.status}</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // If there's an error rendering the map, show a fallback UI
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg border`}>
        <div className="text-center p-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Map unavailable</p>
          <p className="text-gray-400 text-sm mt-1">Unable to display map visualization</p>
        </div>
      </div>
    );
  }
}

export default MapWithLiveTracking;