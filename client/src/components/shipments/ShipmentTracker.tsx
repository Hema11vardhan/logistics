import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import LocationMap from '../maps/LocationMap';
import { apiRequest } from '@/lib/queryClient';

interface ShipmentTrackerProps {
  shipmentId: number;
}

interface TrackingEvent {
  id: number;
  shipmentId: number;
  latitude: number;
  longitude: number;
  status: string;
  message: string;
  timestamp: Date;
}

interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
  timestamp?: Date;
  status?: string;
}

export default function ShipmentTracker({ shipmentId }: ShipmentTrackerProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: trackingEvents, isLoading, isError } = useQuery({
    queryKey: ['/api/shipments', shipmentId, 'tracking', refreshKey],
    queryFn: async () => {
      return await apiRequest(`/api/shipments/${shipmentId}/tracking`);
    },
  });

  // Convert tracking events to location points for the map
  const getLocationPoints = (events: TrackingEvent[] = []): LocationPoint[] => {
    return events.map(event => ({
      lat: event.latitude,
      lng: event.longitude,
      label: event.message,
      timestamp: new Date(event.timestamp),
      status: event.status,
    }));
  };

  // Get current location (most recent event)
  const getCurrentLocation = (events: TrackingEvent[] = []): LocationPoint | undefined => {
    if (events.length === 0) return undefined;
    
    // Sort events by timestamp (newest first)
    const sortedEvents = [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const latest = sortedEvents[0];
    return {
      lat: latest.latitude,
      lng: latest.longitude,
      label: 'Current Location',
      timestamp: new Date(latest.timestamp),
      status: latest.status,
    };
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get formatted time for the latest update
  const getLastUpdateTime = (): string => {
    if (!trackingEvents || trackingEvents.length === 0) return 'No data';
    
    const latestEvent = [...trackingEvents].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return new Date(latestEvent.timestamp).toLocaleString();
  };

  // Get the current shipment status
  const getCurrentStatus = (): string => {
    if (!trackingEvents || trackingEvents.length === 0) return 'Unknown';
    
    const latestEvent = [...trackingEvents].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestEvent.status;
  };

  // Get badge color based on status
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'in transit':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-amber-500';
      case 'problem':
        return 'bg-red-500';
      case 'processing':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Shipment Tracking</CardTitle>
          <CardDescription>Real-time location tracking for shipment #{shipmentId}</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          title="Refresh tracking data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading tracking data</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : trackingEvents && trackingEvents.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(getCurrentStatus())}>
                {getCurrentStatus()}
              </Badge>
              <p className="text-sm text-muted-foreground">Last update: {getLastUpdateTime()}</p>
            </div>
            
            <LocationMap 
              locations={getLocationPoints(trackingEvents)}
              currentLocation={getCurrentLocation(trackingEvents)}
              showRoute={true}
              height="300px"
              zoom={10}
            />
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Tracking History</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {[...trackingEvents]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((event) => (
                    <div key={event.id} className="flex items-start space-x-2 text-sm">
                      <div className="min-w-[160px] text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <Badge variant="outline" className="h-5 min-w-[80px] flex items-center justify-center">
                        {event.status}
                      </Badge>
                      <div>{event.message}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p>No tracking data available yet for this shipment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}