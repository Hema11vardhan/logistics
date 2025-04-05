import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useWeb3 } from "@/lib/web3";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CreditCard, Calendar, BarChart3 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const { account } = useWeb3();
  const [, navigate] = useLocation();
  const params = useParams();
  const section = params.section || "";
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<LogisticsSpace | null>(null);
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
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
  const { data: shipments, isLoading: shipmentsLoading } = useQuery<any[]>({
    queryKey: [user ? `/api/shipments?userId=${user.id}` : null],
    enabled: !!user,
  });
  
  // Add state for selected shipment
  const [selectedShipment, setSelectedShipment] = useState<number | null>(null);
  
  // Function to get status badge
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
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

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
                {shipmentsLoading ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="spinner mb-4"></div>
                      <p className="text-gray-500">Loading your shipments...</p>
                    </CardContent>
                  </Card>
                ) : shipments && shipments.length > 0 ? (
                  <div className="space-y-4">
                    {Array.isArray(shipments) && shipments.map((shipment: any) => (
                      <Card key={shipment.id} className="shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex flex-wrap justify-between items-center mb-4">
                            <div>
                              <h3 className="text-base font-medium text-gray-900">
                                Shipment #{shipment.id} - {shipment.goodsType}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(shipment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="mt-2 lg:mt-0">
                              {getStatusBadge(shipment.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Weight</p>
                              <p className="text-sm font-medium">{shipment.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Dimensions</p>
                              <p className="text-sm font-medium">{shipment.length}m × {shipment.width}m × {shipment.height}m</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Transaction ID</p>
                              <p className="text-sm font-medium">{shipment.transactionId || "Pending"}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              className="mr-2"
                              onClick={() => setSelectedShipment(shipment.id)}
                            >
                              View Details
                            </Button>
                            <Button 
                              onClick={() => {
                                setSelectedShipment(shipment.id);
                                navigate("/user-dashboard/tracking");
                              }}
                              className="bg-[#8B5CF6] hover:bg-[#7c4df1]"
                            >
                              Track Shipment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">You don't have any shipments yet.</p>
                      <Button 
                        className="mt-4 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                        onClick={() => navigate("/user-dashboard/find-shipping")}
                      >
                        Book a Shipment
                      </Button>
                    </CardContent>
                  </Card>
                )}
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
                
                {/* Query for user's transactions */}
                {user && (
                  <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment History</h2>
                      <p className="text-gray-600 mb-6">View your complete payment history and transaction details.</p>
                      
                      {shipmentsLoading ? (
                        <div className="text-center py-10">
                          <div className="spinner mb-4"></div>
                          <p className="text-gray-500">Loading payment history...</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {shipments && Array.isArray(shipments) && shipments.length > 0 ? (
                                shipments.map((shipment: any) => (
                                  <tr key={shipment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(shipment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {shipment.transactionId ? (
                                        <span className="font-mono">{shipment.transactionId}</span>
                                      ) : (
                                        <span className="text-gray-400">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      ${shipment.totalCost ? shipment.totalCost.toFixed(2) : "0.00"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {shipment.paymentMethod || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {shipment.transactionId ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          Completed
                                        </span>
                                      ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {shipment.transactionId && (
                                        <Button 
                                          variant="link" 
                                          size="sm"
                                          onClick={() => {
                                            // This would open a receipt or navigate to receipt page
                                            toast({
                                              title: "Receipt",
                                              description: `Transaction receipt for shipment #${shipment.id}`,
                                              variant: "default"
                                            });
                                          }}
                                        >
                                          View
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                    No payment records found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Payment Methods */}
                <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
                    <p className="text-gray-600 mb-6">Manage your payment methods for faster checkout.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">MetaMask Wallet</h3>
                            <p className="text-sm text-gray-500">
                              {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'No wallet connected'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center">
                          <div className="bg-purple-100 rounded-full p-2 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Credit/Debit Cards</h3>
                            <p className="text-sm text-gray-500">Manage your payment cards</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Add Card</Button>
                      </div>
                    </div>
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
