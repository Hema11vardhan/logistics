import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define typescript interfaces for our component
interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
  timestamp?: Date;
  status?: string;
}

interface LocationMapProps {
  locations: LocationPoint[];
  currentLocation?: LocationPoint;
  showRoute?: boolean;
  zoom?: number;
  height?: string;
  width?: string;
  className?: string;
}

// Create default icon for markers
const defaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icons based on status
const getIcon = (status?: string) => {
  // Default to the standard Leaflet icon
  return defaultIcon;
};

export default function LocationMap({
  locations,
  currentLocation,
  showRoute = true,
  zoom = 12,
  height = '400px',
  width = '100%',
  className = ''
}: LocationMapProps) {
  // Add location points to an array, starting with historical locations and ending with current
  const allLocations = [...locations];
  if (currentLocation) {
    allLocations.push(currentLocation);
  }

  // If there are no locations, use a default center (New York City)
  const defaultCenter: LatLngExpression = [40.7128, -74.0060];
  
  // Center map on current location or the last reported location
  const center = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] as LatLngExpression
    : locations.length > 0 
      ? [locations[locations.length - 1].lat, locations[locations.length - 1].lng] as LatLngExpression
      : defaultCenter;

  // Create a polyline from all location points if showRoute is true
  const routePoints = allLocations.map(loc => [loc.lat, loc.lng] as LatLngExpression);

  // Format time from timestamp
  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  // Load Leaflet styles on component mount
  useEffect(() => {
    // This is to make sure the map container properly renders
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, []);

  return (
    <div style={{ height, width }} className={className}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Display historical locations */}
        {locations.map((location, index) => (
          <Marker 
            key={`loc-${index}`}
            position={[location.lat, location.lng]}
            icon={getIcon(location.status)}
          >
            <Popup>
              {location.label || 'Location update'}<br />
              {location.status && <strong>Status: {location.status}<br /></strong>}
              {location.timestamp && `Time: ${formatTime(location.timestamp)}`}
            </Popup>
          </Marker>
        ))}
        
        {/* Display current location with different styling if available */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]} 
            icon={getIcon('current')}
          >
            <Popup>
              {currentLocation.label || 'Current Location'}<br />
              {currentLocation.status && <strong>Status: {currentLocation.status}<br /></strong>}
              {currentLocation.timestamp && `Updated: ${formatTime(currentLocation.timestamp)}`}
            </Popup>
          </Marker>
        )}
        
        {/* Draw route line if multiple points exist and showRoute is true */}
        {showRoute && routePoints.length > 1 && (
          <Polyline positions={routePoints} color="blue" weight={3} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
}