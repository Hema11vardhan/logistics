import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Truck, Package, CheckCircle, AlertCircle } from 'lucide-react';

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
  mapType?: 'street' | 'satellite' | 'hybrid';
  showTraffic?: boolean;
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

// Current location icon with pulsing effect
const currentLocationIcon = divIcon({
  className: '',
  html: `
    <div class="flex items-center justify-center">
      <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-75 animate-ping"></div>
      <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom icons based on status
const getIcon = (status?: string) => {
  if (status === 'current') {
    return currentLocationIcon;
  }
  
  switch (status?.toLowerCase()) {
    case 'delivered':
      return new Icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'leaflet-marker-icon-green'
      });
    case 'delayed':
    case 'problem':
      return new Icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'leaflet-marker-icon-red'
      });
    case 'in transit':
      return new Icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        className: 'leaflet-marker-icon-blue'
      });
    default:
      return defaultIcon;
  }
};

// Map type component to handle tile layer switching
function MapTypeLayer({ mapType = 'street', showTraffic = false }: { mapType?: 'street' | 'satellite' | 'hybrid', showTraffic?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    // Force map to recalculate size when component mounts or updates
    map.invalidateSize();
  }, [map]);
  
  // Choose the appropriate tile layer based on mapType
  if (mapType === 'satellite') {
    return (
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      />
    );
  } else if (mapType === 'hybrid') {
    return (
      <>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
        <TileLayer
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
          attribution="Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap"
          subdomains="abcd"
        />
      </>
    );
  }
  
  // Default to street map (OpenStreetMap)
  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {showTraffic && (
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
        />
      )}
    </>
  );
}

// Auto-pan to current location
function AutoPanToCurrentLocation({ point }: { point: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    if (point) {
      map.panTo(point, { animate: true });
    }
  }, [map, point]);
  
  return null;
}

export default function LocationMap({
  locations,
  currentLocation,
  showRoute = true,
  zoom = 12,
  height = '400px',
  width = '100%',
  className = '',
  mapType = 'street',
  showTraffic = false
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
  
  // Helper to calculate distance between points
  const calculateRouteDistance = (points: LatLngExpression[]): string => {
    if (points.length < 2) return '0 km';
    
    const calculateDistance = (pt1: LatLngExpression, pt2: LatLngExpression): number => {
      let lat1: number = 0;
      let lon1: number = 0;
      let lat2: number = 0;
      let lon2: number = 0;
      
      // Handle different types of LatLngExpression
      if (Array.isArray(pt1)) {
        lat1 = Number(pt1[0]);
        lon1 = Number(pt1[1]);
      } else if (typeof pt1 === 'object' && pt1 !== null) {
        lat1 = typeof pt1.lat === 'function' ? pt1.lat() : Number(pt1.lat);
        lon1 = typeof pt1.lng === 'function' ? pt1.lng() : Number(pt1.lng);
      }
      
      if (Array.isArray(pt2)) {
        lat2 = Number(pt2[0]);
        lon2 = Number(pt2[1]);
      } else if (typeof pt2 === 'object' && pt2 !== null) {
        lat2 = typeof pt2.lat === 'function' ? pt2.lat() : Number(pt2.lat);
        lon2 = typeof pt2.lng === 'function' ? pt2.lng() : Number(pt2.lng);
      }
      
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c; // Distance in km
      return distance;
    };
    
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(points[i], points[i+1]);
    }
    
    return `${totalDistance.toFixed(1)} km`;
  };

  // Load Leaflet styles on component mount
  useEffect(() => {
    // This is to make sure the map container properly renders
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
    
    // Add custom CSS for marker icons
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-marker-icon-green { filter: hue-rotate(90deg); }
      .leaflet-marker-icon-red { filter: hue-rotate(320deg); }
      .leaflet-marker-icon-blue { filter: hue-rotate(220deg); }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ height, width }} className={className + " relative"}>
      {/* Route distance indicator */}
      {showRoute && routePoints.length > 1 && (
        <div className="absolute top-2 right-2 z-[1000] bg-white bg-opacity-80 text-black text-xs px-2 py-1 rounded shadow">
          Distance: {calculateRouteDistance(routePoints)}
        </div>
      )}
      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        zoomControl={false}
      >
        {/* Map type layer */}
        <MapTypeLayer mapType={mapType} showTraffic={showTraffic} />
        
        {/* Add zoom control in a better position */}
        <ZoomControl position="bottomright" />
        
        {/* Auto-pan to current location */}
        {currentLocation && (
          <AutoPanToCurrentLocation 
            point={[currentLocation.lat, currentLocation.lng] as LatLngExpression} 
          />
        )}
        
        {/* Display historical locations */}
        {locations.map((location, index) => (
          <Marker 
            key={`loc-${index}`}
            position={[location.lat, location.lng]}
            icon={getIcon(location.status)}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-base block mb-1">{location.label || 'Location update'}</strong>
                {location.status && <div className="mb-1"><span className="font-medium">Status:</span> {location.status}</div>}
                {location.timestamp && (
                  <div className="text-gray-600">
                    <span className="font-medium">Time:</span> {formatTime(location.timestamp)}
                  </div>
                )}
              </div>
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
              <div className="text-sm">
                <strong className="text-base block mb-1">{currentLocation.label || 'Current Location'}</strong>
                {currentLocation.status && <div className="mb-1"><span className="font-medium">Status:</span> {currentLocation.status}</div>}
                {currentLocation.timestamp && (
                  <div className="text-gray-600">
                    <span className="font-medium">Updated:</span> {formatTime(currentLocation.timestamp)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Draw route line if multiple points exist and showRoute is true */}
        {showRoute && routePoints.length > 1 && (
          <Polyline 
            positions={routePoints} 
            color="#8B5CF6" 
            weight={4} 
            opacity={0.8}
            dashArray={currentLocation?.status === 'in transit' ? undefined : '6, 10'} 
          />
        )}
      </MapContainer>
    </div>
  );
}