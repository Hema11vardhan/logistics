import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Truck, DollarSign, Package, Clock } from "lucide-react";

// Mock shipments for demonstration
const DEMO_SHIPMENTS = [
  {
    id: 1,
    trackingNumber: "SH123456789",
    source: "New York, NY",
    destination: "Chicago, IL",
    goodsType: "Electronics",
    weight: 750,
    dimensions: "2m × 1.5m × 1.8m",
    status: "in_transit",
    customer: "John Doe",
    customerEmail: "john.doe@example.com",
    spaceId: "T-0x8F3E7B4A",
    paymentStatus: "completed",
    paymentMethod: "metamask",
    amount: 1250,
    vehicleType: "18-Wheeler Truck",
    departureDate: new Date("2023-06-15"),
    estimatedArrival: new Date("2023-06-18"),
    lastUpdated: new Date("2023-06-16")
  },
  {
    id: 2,
    trackingNumber: "SH987654321",
    source: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    goodsType: "Furniture",
    weight: 1200,
    dimensions: "3m × 2m × 2.2m",
    status: "confirmed",
    customer: "Alice Smith",
    customerEmail: "alice.smith@example.com",
    spaceId: "T-0x7A2D9C1F",
    paymentStatus: "completed",
    paymentMethod: "credit_card",
    amount: 980,
    vehicleType: "Medium Cargo Van",
    departureDate: new Date("2023-06-20"),
    estimatedArrival: new Date("2023-06-22"),
    lastUpdated: new Date("2023-06-10")
  },
  {
    id: 3,
    trackingNumber: "SH456789123",
    source: "Seattle, WA",
    destination: "Portland, OR",
    goodsType: "Food & Groceries",
    weight: 500,
    dimensions: "1.5m × 1m × 1.2m",
    status: "delivered",
    customer: "Bob Johnson",
    customerEmail: "bob.johnson@example.com",
    spaceId: "T-0x3F1A6E5D",
    paymentStatus: "completed",
    paymentMethod: "upi",
    amount: 750,
    vehicleType: "Box Truck",
    departureDate: new Date("2023-06-01"),
    estimatedArrival: new Date("2023-06-02"),
    lastUpdated: new Date("2023-06-02")
  },
  {
    id: 4,
    trackingNumber: "SH321654987",
    source: "Miami, FL",
    destination: "Orlando, FL",
    goodsType: "Clothing",
    weight: 320,
    dimensions: "1.2m × 0.8m × 1m",
    status: "pending",
    customer: "Emma Davis",
    customerEmail: "emma.davis@example.com",
    spaceId: "T-0x5B2E9F4C",
    paymentStatus: "pending",
    paymentMethod: null,
    amount: 450,
    vehicleType: "Cargo Van",
    departureDate: new Date("2023-06-25"),
    estimatedArrival: new Date("2023-06-26"),
    lastUpdated: new Date("2023-06-08")
  }
];

export default function ShipmentManagement() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState(DEMO_SHIPMENTS);
  const [selectedTab, setSelectedTab] = useState("all");
  
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
  
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleUpdateStatus = (id: number, newStatus: string) => {
    const updatedShipments = shipments.map(shipment => 
      shipment.id === id ? {...shipment, status: newStatus, lastUpdated: new Date()} : shipment
    );
    
    setShipments(updatedShipments);
    
    toast({
      title: "Shipment Updated",
      description: `Shipment #${id} status changed to ${newStatus.replace('_', ' ')}`,
      variant: "default"
    });
  };
  
  const handleAddTrackingEvent = (id: number) => {
    toast({
      title: "Add Tracking Event",
      description: `Feature to add tracking event for shipment #${id} will be implemented soon.`,
      variant: "default"
    });
  };
  
  const filteredShipments = shipments.filter(shipment => {
    if (selectedTab === "all") return true;
    if (selectedTab === "active") return ["pending", "confirmed", "in_transit"].includes(shipment.status);
    if (selectedTab === "delivered") return shipment.status === "delivered";
    if (selectedTab === "pending_payment") return shipment.paymentStatus === "pending";
    return true;
  });
  
  // Calculate summary counts
  const pendingCount = shipments.filter(s => s.status === "pending").length;
  const inTransitCount = shipments.filter(s => s.status === "in_transit").length;
  const deliveredCount = shipments.filter(s => s.status === "delivered").length;
  const pendingPaymentCount = shipments.filter(s => s.paymentStatus === "pending").length;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Shipments</p>
              <h3 className="text-xl font-bold">{pendingCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Transit</p>
              <h3 className="text-xl font-bold">{inTransitCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <h3 className="text-xl font-bold">{deliveredCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <h3 className="text-xl font-bold">{pendingPaymentCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Shipments Table */}
      <Card>
        <CardContent className="p-6">
          <Tabs 
            defaultValue="all" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Shipments</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="pending_payment">Payment Pending</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={selectedTab} className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">{shipment.trackingNumber}</TableCell>
                          <TableCell>{shipment.source} → {shipment.destination}</TableCell>
                          <TableCell>{shipment.customer}</TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(shipment.paymentStatus)}</TableCell>
                          <TableCell>
                            {new Date(shipment.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {shipment.status === "confirmed" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(shipment.id, "in_transit")}
                                >
                                  Mark In Transit
                                </Button>
                              )}
                              {shipment.status === "in_transit" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(shipment.id, "delivered")}
                                >
                                  Mark Delivered
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddTrackingEvent(shipment.id)}
                              >
                                Add Event
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No shipments found in this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}