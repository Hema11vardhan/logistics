import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Chatbot from "@/components/common/Chatbot";
import ShippingSearch, { SearchData } from "@/components/user/ShippingSearch";
import ShippingResults from "@/components/user/ShippingResults";
import SpaceCustomization, { CustomizationData } from "@/components/user/SpaceCustomization";
import PaymentGateway from "@/components/user/PaymentGateway";
import PaymentReceipt from "@/components/user/PaymentReceipt";
import LiveTracking from "@/components/user/LiveTracking";
import { useToast } from "@/hooks/use-toast";
import { LogisticsSpace } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Truck, CreditCard, Calendar, BarChart3 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const section = params.section || "";
  const { toast } = useToast();
  
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<LogisticsSpace | null>(null);
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "user") {
      // Redirect to appropriate dashboard if role doesn't match
      navigate(`/${user.role}-dashboard`);
    }
  }, [user, navigate]);

  // Search results query
  const { 
    data: searchResults, 
    isLoading: searchLoading,
    refetch: refetchSearchResults
  } = useQuery<LogisticsSpace[]>({
    queryKey: [searchData ? `/api/spaces?source=${searchData.source}&destination=${searchData.destination}` : null],
    enabled: !!searchData,
  });

  // Query for user's shipments count
  const { data: shipments } = useQuery({
    queryKey: [user ? `/api/shipments?userId=${user.id}` : null],
    enabled: !!user,
  });

  const handleSearch = (data: SearchData) => {
    setSearchData(data);
    // Reset the flow when initiating a new search
    setSelectedSpace(null);
    setCustomizationData(null);
    setTransactionId(null);
    setReceipt(null);
    refetchSearchResults();
  };

  const handleSelectSpace = (space: LogisticsSpace) => {
    setSelectedSpace(space);
    setCustomizationData(null);
    setTransactionId(null);
    setReceipt(null);
  };

  const handleProceedToPayment = (data: CustomizationData) => {
    setCustomizationData(data);
    setTransactionId(null);
    setReceipt(null);
  };

  const handlePaymentComplete = (transactionId: string, receiptData: any) => {
    setTransactionId(transactionId);
    setReceipt(receiptData);
    toast({
      title: "Payment Successful",
      description: "Your shipment has been booked successfully.",
      variant: "default"
    });
  };

  const handleViewTracking = () => {
    navigate("/user-dashboard/tracking");
  };

  // If user is not authenticated, show loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto">
            {section === "" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
                
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <Package className="h-6 w-6 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Shipments</p>
                        <h3 className="text-2xl font-bold">{Array.isArray(shipments) ? shipments.length : 0}</h3>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">In Transit</p>
                        <h3 className="text-2xl font-bold">2</h3>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-green-100 p-3 mr-4">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <h3 className="text-2xl font-bold">$2,450</h3>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="rounded-full bg-yellow-100 p-3 mr-4">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <h3 className="text-2xl font-bold">12</h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activity Chart */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-medium text-gray-900">Shipping Activity</h2>
                      <Button variant="outline" size="sm">View All</Button>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Shipping activity chart would appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions */}
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/user-dashboard/find-shipping")}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Find Shipping
                  </Button>
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/user-dashboard/tracking")}
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    Track Shipment
                  </Button>
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/user-dashboard/payments")}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    View Payments
                  </Button>
                </div>
              </>
            )}

            {section === "find-shipping" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Find Shipping</h1>
                
                <ShippingSearch onSearch={handleSearch} />
                
                <ShippingResults 
                  results={searchResults || []} 
                  loading={searchLoading}
                  searchData={searchData || undefined}
                  onSelectSpace={handleSelectSpace}
                />
                
                {selectedSpace && (
                  <SpaceCustomization 
                    space={selectedSpace}
                    onProceedToPayment={handleProceedToPayment}
                  />
                )}
                
                {customizationData && (
                  <PaymentGateway 
                    customizationData={customizationData}
                    space={selectedSpace}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
                
                {transactionId && receipt && (
                  <PaymentReceipt 
                    transactionId={transactionId}
                    receipt={receipt}
                    onViewTracking={handleViewTracking}
                  />
                )}
              </>
            )}
            
            {section === "shipments" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Shipments</h1>
                {/* My Shipments content would go here */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">Your shipments will be displayed here.</p>
                  </CardContent>
                </Card>
              </>
            )}
            
            {section === "tracking" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tracking</h1>
                <LiveTracking />
              </>
            )}
            
            {section === "payments" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payments</h1>
                {/* Payments content would go here */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">Your payment history will be displayed here.</p>
                  </CardContent>
                </Card>
              </>
            )}
            
            {section === "settings" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
                {/* Settings content would go here */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">Account settings will be displayed here.</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
      
      <Chatbot />
    </div>
  );
}
