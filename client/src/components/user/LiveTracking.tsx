import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Truck, Package, AlertCircle, MapPin, ChevronRight, RefreshCw, Map } from "lucide-react";
import { TrackingEvent, Shipment } from "@shared/schema";
import LocationMap from "../maps/LocationMap";

interface LiveTrackingProps {
  shipmentId?: number;
}

interface ShipmentWithDetails extends Shipment {
  space?: any;
  tracking?: TrackingEvent[];
}

export default function LiveTracking({ shipmentId }: LiveTrackingProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedShipment, setSelectedShipment] = useState<number | null>(shipmentId || null);
  const [activeTab, setActiveTab] = useState<string>("map");

  // Fetch user's shipments
  const { data: shipments, isLoading: shipmentsLoading } = useQuery<ShipmentWithDetails[]>({
    queryKey: [user ? `/api/shipments?userId=${user.id}` : null],
    enabled: !!user && !shipmentId,
  });

  // Fetch specific shipment details if shipmentId is provided
  const { data: shipmentDetails, isLoading: shipmentLoading } = useQuery<ShipmentWithDetails>({
    queryKey: [selectedShipment ? `/api/shipments/${selectedShipment}` : null],
    enabled: !!selectedShipment,
  });

  // Fetch tracking events for selected shipment
  const { data: trackingEvents, isLoading: trackingLoading } = useQuery<TrackingEvent[]>({
    queryKey: [selectedShipment ? `/api/shipments/${selectedShipment}/tracking` : null],
    enabled: !!selectedShipment,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Set the first shipment as selected if none is selected and we have data
  useEffect(() => {
    if (!selectedShipment && shipments && shipments.length > 0) {
      setSelectedShipment(shipments[0].id);
    }
  }, [shipments, selectedShipment]);

  // Combine shipment details with tracking data
  const currentShipment = shipmentDetails;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
      case "in_transit":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTrackingStatus = () => {
    if (!currentShipment) return null;
    
    const steps = [
      { id: "pending", label: "Shipment Created", icon: Package },
      { id: "confirmed", label: "Payment Confirmed", icon: CheckCircle },
      { id: "in_transit", label: "In Transit", icon: Truck },
      { id: "delivered", label: "Delivered", icon: MapPin },
    ];
    
    const currentStepIndex = steps.findIndex(step => step.id === currentShipment.status);
    
    return (
      <div className="my-6">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-[#8B5CF6]" 
              style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
            ></div>
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index <= currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    isActive ? 'bg-[#8B5CF6]' : 'bg-gray-200'
                  }`}>
                    <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-xs text-center mt-2 max-w-[80px]">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Mock location data for the map (in a real app, this would come from the backend)
  const vehicleLocation = {
    lat: 40.7128,
    lng: -74.006,
    heading: 45, // degrees clockwise from north
    speed: 65, // km/h
  };

  if (!user) {
    return (
      <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <CardContent className="p-6 text-center text-gray-500 py-10">
          Please log in to track your shipments.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Live Shipment Tracking</h2>
        <p className="text-gray-600 mb-6">
          Track your shipments in real-time with blockchain-verified location data.
        </p>
        
        {(shipmentsLoading || shipmentLoading) ? (
          <div className="py-10 text-center text-gray-500">
            Loading shipment data...
          </div>
        ) : shipments && shipments.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>You don't have any active shipments to track.</p>
            <Button 
              className="mt-4 bg-[#8B5CF6] hover:bg-[#7c4df1]"
              onClick={() => window.location.href = "/user-dashboard/find-shipping"}
            >
              Book a Shipment
            </Button>
          </div>
        ) : (
          <>
            {!shipmentId && shipments && shipments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Your Shipments</h3>
                <div className="space-y-2">
                  {shipments.map((shipment) => (
                    <div 
                      key={shipment.id}
                      className={`p-3 rounded-md border flex justify-between items-center cursor-pointer ${
                        selectedShipment === shipment.id 
                          ? 'border-[#8B5CF6] bg-purple-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedShipment(shipment.id)}
                    >
                      <div>
                        <div className="font-medium">Shipment #{shipment.id}</div>
                        <div className="text-sm text-gray-500">{shipment.goodsType} - {shipment.weight}kg</div>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(shipment.status)}
                        <ChevronRight className="h-5 w-5 ml-2 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentShipment ? (
              <>
                <div className="mb-4 flex flex-wrap justify-between items-center">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      Tracking Shipment #{currentShipment.id}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentShipment.goodsType} - {currentShipment.weight.toLocaleString()}kg
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    {getStatusBadge(currentShipment.status)}
                  </div>
                </div>
                
                {getTrackingStatus()}
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="map">Map View</TabsTrigger>
                    <TabsTrigger value="events">Event Log</TabsTrigger>
                  </TabsList>
                  <TabsContent value="map" className="mt-4">
                    <div className="relative mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Map className="h-5 w-5 text-gray-500" />
                        <div className="text-sm font-medium">Live Tracking Map</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => {
                            // Force refetch tracking data
                            const queryKey = selectedShipment ? `/api/shipments/${selectedShipment}/tracking` : null;
                            if (queryKey) {
                              toast({
                                title: "Updating location data",
                                description: "Fetching the latest tracking information",
                              });
                            }
                          }}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    {trackingLoading ? (
                      <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[#8B5CF6] border-r-transparent"></div>
                          <p className="mt-2 text-sm text-gray-500">Loading tracking data...</p>
                        </div>
                      </div>
                    ) : trackingEvents && trackingEvents.length > 0 ? (
                      <div className="h-[400px] rounded-md overflow-hidden">
                        <LocationMap 
                          locations={trackingEvents.map(event => ({
                            lat: event.latitude || 0,
                            lng: event.longitude || 0,
                            label: event.message || event.eventType,
                            status: event.status || undefined,
                            timestamp: event.timestamp ? new Date(event.timestamp) : undefined
                          }))}
                          currentLocation={
                            trackingEvents.length > 0 
                              ? (() => {
                                  // Find the most recent event
                                  const sortedEvents = [...trackingEvents].sort((a, b) => {
                                    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                                    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                                    return dateB - dateA;
                                  });
                                  const latest = sortedEvents[0];
                                  return {
                                    lat: latest.latitude || 0,
                                    lng: latest.longitude || 0,
                                    label: 'Current Location',
                                    status: latest.status || 'in_transit',
                                    timestamp: latest.timestamp ? new Date(latest.timestamp) : undefined
                                  };
                                })()
                              : undefined
                          }
                          showRoute={true}
                          zoom={10}
                          height="400px"
                          mapType="street"
                          showTraffic={true}
                          className="border border-gray-200"
                        />
                      </div>
                    ) : (
                      <div className="h-[400px] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        <div className="text-center px-4">
                          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <h4 className="text-gray-800 font-medium mb-2">No tracking data available</h4>
                          <p className="text-gray-500 text-sm max-w-md">
                            Tracking information will appear here once your shipment is in transit.
                            You'll be able to see real-time location updates on the map.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <Truck className="h-4 w-4 mr-1 text-[#8B5CF6]" />
                          Vehicle Status
                        </h4>
                        {trackingEvents && trackingEvents.length > 0 ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Current Status:</span>
                              <span className="font-medium">{currentShipment?.status === 'in_transit' ? 'Moving' : 'Stopped'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Last Location:</span>
                              <span className="font-medium">
                                {trackingEvents[0]?.location || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Last Update:</span>
                              <span className="font-medium">
                                {trackingEvents[0]?.timestamp 
                                  ? new Date(trackingEvents[0].timestamp).toLocaleTimeString() 
                                  : 'Unknown'
                                }
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500">
                            Vehicle status will appear when tracking begins
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-[#8B5CF6]" />
                          Delivery Information
                        </h4>
                        {currentShipment ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">From:</span>
                              <span className="font-medium">{currentShipment.space?.source || 'Unknown origin'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">To:</span>
                              <span className="font-medium">{currentShipment.space?.destination || 'Unknown destination'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Blockchain ID:</span>
                              <span className="font-medium text-xs">
                                {currentShipment.transactionId 
                                  ? `${currentShipment.transactionId.substring(0, 8)}...` 
                                  : 'Pending'
                                }
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500">
                            Delivery information unavailable
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="events" className="mt-4">
                    {trackingLoading ? (
                      <div className="text-center py-6 text-gray-500">
                        Loading tracking events...
                      </div>
                    ) : trackingEvents && trackingEvents.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {trackingEvents.map((event) => (
                              <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.eventType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.details || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 border rounded-md">
                        <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No tracking events available yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Events will appear here once your shipment is in transit.</p>
                      </div>
                    )}
                    
                    {/* Demo events for improved UI */}
                    {(!trackingEvents || trackingEvents.length === 0) && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Example Events Timeline</h4>
                        <div className="border-l-2 border-gray-200 pl-4 ml-4 space-y-6">
                          <div>
                            <div className="flex">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#8B5CF6] flex items-center justify-center -ml-[18px]">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">Order Confirmed</h5>
                                <p className="text-xs text-gray-500">May 25, 2023 - 14:30</p>
                                <p className="text-sm text-gray-700 mt-1">Your shipment has been confirmed and payment processed.</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#8B5CF6] flex items-center justify-center -ml-[18px]">
                                <Package className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">Shipment Picked Up</h5>
                                <p className="text-xs text-gray-500">May 26, 2023 - 09:15</p>
                                <p className="text-sm text-gray-700 mt-1">Carrier has picked up your shipment from origin.</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex opacity-50">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center -ml-[18px]">
                                <Truck className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">In Transit</h5>
                                <p className="text-xs text-gray-500">Estimated: May 27, 2023</p>
                                <p className="text-sm text-gray-700 mt-1">Your shipment is on the way to the destination.</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex opacity-50">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center -ml-[18px]">
                                <MapPin className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <h5 className="text-sm font-medium text-gray-900">Delivered</h5>
                                <p className="text-xs text-gray-500">Estimated: May 29, 2023</p>
                                <p className="text-sm text-gray-700 mt-1">Your shipment will be delivered to the destination.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="py-10 text-center text-gray-500">
                Select a shipment to view tracking details.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
