import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Truck, Package, AlertCircle, MapPin, ChevronRight } from "lucide-react";
import { TrackingEvent, Shipment } from "@shared/schema";

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
                    <div className="h-[400px] bg-gray-200 rounded-md overflow-hidden relative">
                      {/* This would be a real map in a production app */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <p className="text-gray-500">Interactive map with live location would appear here</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Current Location: {vehicleLocation.lat.toFixed(4)}, {vehicleLocation.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Vehicle Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current Speed:</span>
                            <span>{vehicleLocation.speed} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Heading:</span>
                            <span>{vehicleLocation.heading}° NE</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Update:</span>
                            <span>2 minutes ago</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Estimated Delivery</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Distance Remaining:</span>
                            <span>245 km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Est. Arrival Time:</span>
                            <span>Tomorrow, 10:30 AM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Weather at Destination:</span>
                            <span>Cloudy, 15°C</span>
                          </div>
                        </div>
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
                                  {new Date(event.timestamp).toLocaleString()}
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
