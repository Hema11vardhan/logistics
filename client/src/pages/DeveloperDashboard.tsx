import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Chatbot from "@/components/common/Chatbot";
import AnalyticsCharts from "@/components/developer/AnalyticsCharts";
import DeveloperStats from "@/components/developer/DeveloperStats";
import TransactionList from "@/components/developer/TransactionList";
import BlockchainMonitor from "@/components/developer/BlockchainMonitor";
import UserManagement from "@/components/developer/UserManagement";
import LogisticsManagement from "@/components/developer/LogisticsManagement";
import { Card, CardContent } from "@/components/ui/card";

export default function DeveloperDashboard() {
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
    } else if (user.role !== "developer") {
      // Redirect to appropriate dashboard if role doesn't match
      navigate(`/${user.role}-dashboard`);
    }
  }, [user, navigate]);

  // API queries
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user && user.role === "developer",
  });

  const { data: spaces } = useQuery({
    queryKey: ['/api/spaces'],
    enabled: !!user && user.role === "developer",
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user && user.role === "developer",
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Developer Dashboard</h1>
                
                {/* Stats Cards */}
                <DeveloperStats 
                  userStats={users}
                  spaceStats={spaces}
                  transactionStats={transactions}
                  isLoading={!users || !spaces || !transactions}
                />
                
                {/* Analytics Charts */}
                <AnalyticsCharts className="mb-8" />
                
                {/* Blockchain Status */}
                <div className="grid grid-cols-1 gap-8 mb-8">
                  <BlockchainMonitor />
                </div>
                
                {/* Recent Transactions */}
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
                <TransactionList limit={5} />
              </>
            )}

            {section === "users" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Management</h1>
                <UserManagement />
              </>
            )}
            
            {section === "analytics" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
                <AnalyticsCharts />
              </>
            )}
            
            {section === "logistics" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Logistics Management</h1>
                <LogisticsManagement />
              </>
            )}
            
            {section === "blockchain" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Blockchain Monitor</h1>
                <BlockchainMonitor />
              </>
            )}
            
            {section === "transactions" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Transactions</h1>
                <TransactionList />
              </>
            )}
            
            {section === "settings" && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">System settings and configuration options will be displayed here.</p>
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