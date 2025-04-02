import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
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
    <aside className={cn("w-64 bg-gray-800 text-white", className)}>
      <nav className="mt-5 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== baseRoute && location.startsWith(link.href));
          
          return (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "mr-4 h-6 w-6",
                  isActive ? "text-gray-300" : "text-gray-400"
                )} />
                {link.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
