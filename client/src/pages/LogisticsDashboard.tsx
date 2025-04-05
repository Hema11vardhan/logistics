import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Chatbot from "@/components/common/Chatbot";
import SpaceVisualizer from "@/components/dashboard/SpaceVisualizer";
import TokenizedSpaces from "@/components/dashboard/TokenizedSpaces";
import BlockchainStatus from "@/components/dashboard/BlockchainStatus";
import VehicleManagement from "@/components/logistics/VehicleManagement";
import ShipmentManagement from "@/components/logistics/ShipmentManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function LogisticsDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const section = params.section || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "logistics") {
      // Redirect to appropriate dashboard if role doesn't match
      navigate(`/${user.role}-dashboard`);
    }
  }, [user, navigate]);

  // Query for user's spaces
  const { data: spaces } = useQuery<any[]>({
    queryKey: [user ? `/api/spaces?userId=${user.id}` : null],
    enabled: !!user,
  });

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
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-1">Total Spaces</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold">{spaces ? spaces.length : 0}</div>
                        <div className="text-sm text-green-600">+12% from last month</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-1">Active Shipments</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold">18</div>
                        <div className="text-sm text-green-600">+5% from last month</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-1">Space Utilization</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold">78%</div>
                        <div className="text-sm text-green-600">+3% from last month</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-1">Revenue</h3>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold">$23,450</div>
                        <div className="text-sm text-green-600">+15% from last month</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                    <ul className="divide-y divide-gray-200">
                      <li className="py-3">
                        <div className="flex space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-900">Space token {spaces && spaces[0] ? spaces[0].tokenId : "#T-0x8F3E"} created successfully</p>
                            <p className="text-xs text-gray-500">10 minutes ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="py-3">
                        <div className="flex space-x-3">
                          <RefreshCw className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-900">User request for token #T-0x3F1A</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="py-3">
                        <div className="flex space-x-3">
                          <CheckCircle className="h-6 w-6 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-900">Payment received for token #T-0x7A2D</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="py-3">
                        <div className="flex space-x-3">
                          <AlertCircle className="h-6 w-6 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-900">Space token verification pending for #T-0x2B4C</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="py-3">
                        <div className="flex space-x-3">
                          <XCircle className="h-6 w-6 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-900">Space token listing expired for #T-0x9D1E</p>
                            <p className="text-xs text-gray-500">5 hours ago</p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Blockchain Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <BlockchainStatus />
                  
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Space Utilization</h2>
                      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Space utilization chart would be displayed here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/logistics-dashboard/space-management")}
                  >
                    Create New Space
                  </Button>
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/logistics-dashboard/vehicles")}
                  >
                    Manage Vehicles
                  </Button>
                  <Button 
                    className="h-auto py-6 bg-[#8B5CF6] hover:bg-[#7c4df1]"
                    onClick={() => navigate("/logistics-dashboard/shipments")}
                  >
                    View Shipments
                  </Button>
                </div>
              </>
            )}

            {section === "space-management" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Space Management</h1>
                <SpaceVisualizer />
                <TokenizedSpaces />
              </>
            )}
            
            {section === "vehicles" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Vehicles</h1>
                <VehicleManagement />
              </>
            )}
            
            {section === "shipments" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Shipments</h1>
                <ShipmentManagement />
              </>
            )}
            
            {section === "payments" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payments</h1>
                {/* Payments content would go here */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">Payment history and details will be displayed here.</p>
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
