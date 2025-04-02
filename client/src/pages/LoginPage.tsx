import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/hooks/useAuth";
import { Package } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [currentRole, setCurrentRole] = useState<"user" | "logistics" | "developer">("user");
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    switch (currentRole) {
      case "user":
        navigate("/user-dashboard");
        break;
      case "logistics":
        navigate("/logistics-dashboard");
        break;
      case "developer":
        navigate("/developer-dashboard");
        break;
    }
  }

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
  };

  const handleRoleChange = (role: "user" | "logistics" | "developer") => {
    setCurrentRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header minimal={true} />

      <main className="flex-grow flex">
        <div className="flex flex-col md:flex-row w-full">
          {/* Hero Section */}
          <div 
            className="hero-gradient hidden md:flex md:w-1/2 p-12 flex-col justify-center items-center text-white" 
            style={{ background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)" }}
          >
            <Package className="h-24 w-24 mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-center">Blockchain-Powered Logistics</h2>
            <p className="text-lg text-center mb-8">Secure, transparent, and efficient logistics management on the blockchain</p>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="font-bold text-xl mb-2">Tokenized Space</div>
                <p className="text-sm">Convert logistics space into blockchain tokens</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="font-bold text-xl mb-2">Smart Contracts</div>
                <p className="text-sm">Automated, transparent agreements</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="font-bold text-xl mb-2">Real-time Tracking</div>
                <p className="text-sm">Monitor shipments with blockchain validation</p>
              </div>
              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="font-bold text-xl mb-2">Secure Payments</div>
                <p className="text-sm">Cryptocurrency and traditional payment options</p>
              </div>
            </div>
          </div>

          {/* Login Forms */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
            <div className="w-full max-w-md">
              {/* Login/Signup Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  className={`flex-1 py-2 px-4 text-center border-b-2 font-medium ${
                    activeTab === "login" 
                      ? "border-[#8B5CF6] text-[#8B5CF6]" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("login")}
                >
                  Sign In
                </button>
                <button 
                  className={`flex-1 py-2 px-4 text-center border-b-2 font-medium ${
                    activeTab === "signup" 
                      ? "border-[#8B5CF6] text-[#8B5CF6]" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("signup")}
                >
                  Sign Up
                </button>
              </div>

              {activeTab === "login" ? (
                <LoginForm 
                  onRoleChange={handleRoleChange} 
                  currentRole={currentRole} 
                  onTabChange={handleTabChange} 
                />
              ) : (
                <SignUpForm 
                  onRoleChange={handleRoleChange} 
                  currentRole={currentRole} 
                  onTabChange={handleTabChange} 
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
