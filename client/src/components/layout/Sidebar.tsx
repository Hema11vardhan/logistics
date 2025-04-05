import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Search,
  Truck,
  Package,
  CreditCard,
  Settings,
  Map,
  BarChart3,
  User,
  Users,
  Database,
  Activity,
  Box,
  LayersIcon,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ className, isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Use prop or internal state
  const isVisible = isOpen !== undefined ? isOpen : sidebarOpen;
  
  // Handle window resize
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // Handle toggle 
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
  
  const isUserRole = user?.role === "user";
  const isLogisticsRole = user?.role === "logistics";
  const isDeveloperRole = user?.role === "developer";
  
  const baseRoute = isUserRole 
    ? "/user-dashboard" 
    : isLogisticsRole 
      ? "/logistics-dashboard" 
      : "/developer-dashboard";

  const userLinks = [
    { href: `${baseRoute}`, label: "Dashboard", icon: Home },
    { href: `${baseRoute}/find-shipping`, label: "Find Shipping", icon: Search },
    { href: `${baseRoute}/shipments`, label: "My Shipments", icon: Package },
    { href: `${baseRoute}/tracking`, label: "Tracking", icon: Map },
    { href: `${baseRoute}/payments`, label: "Payments", icon: CreditCard },
    { href: `${baseRoute}/settings`, label: "Settings", icon: Settings },
  ];

  const logisticsLinks = [
    { href: `${baseRoute}`, label: "Dashboard", icon: Home },
    { href: `${baseRoute}/space-management`, label: "Space Management", icon: LayersIcon },
    { href: `${baseRoute}/vehicles`, label: "Vehicles", icon: Truck },
    { href: `${baseRoute}/shipments`, label: "Shipments", icon: Package },
    { href: `${baseRoute}/payments`, label: "Payments", icon: CreditCard },
    { href: `${baseRoute}/settings`, label: "Settings", icon: Settings },
  ];

  const developerLinks = [
    { href: `${baseRoute}`, label: "Dashboard", icon: Home },
    { href: `${baseRoute}/users`, label: "Users", icon: Users },
    { href: `${baseRoute}/logistics`, label: "Logistics", icon: Truck },
    { href: `${baseRoute}/transactions`, label: "Transactions", icon: CreditCard },
    { href: `${baseRoute}/analytics`, label: "Analytics", icon: BarChart3 },
    { href: `${baseRoute}/blockchain`, label: "Blockchain", icon: Database },
    { href: `${baseRoute}/monitoring`, label: "Monitoring", icon: Activity },
  ];

  // Choose the correct links based on user role
  const links = isUserRole 
    ? userLinks 
    : isLogisticsRole 
      ? logisticsLinks 
      : developerLinks;

  return (
    <>
      {/* Mobile hamburger menu */}
      <button 
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        {isVisible ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={handleToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform",
          isVisible ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0", // Always visible on large screens
          className
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Logistics App</h2>
          {isMobile && (
            <button onClick={handleToggle} className="text-gray-300 hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>
        
        <nav className="mt-5 px-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== baseRoute && location.startsWith(link.href));
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={isMobile ? handleToggle : undefined}
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "mr-4 h-6 w-6",
                  isActive ? "text-purple-400" : "text-gray-400 group-hover:text-gray-300"
                )} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
