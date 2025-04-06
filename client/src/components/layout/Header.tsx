import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { Link } from "wouter";
import { Package, User, Sun, Moon, LogOut, Settings } from "lucide-react";

interface HeaderProps {
  minimal?: boolean;
}

export default function Header({ minimal = false }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "user":
        return "/user-dashboard";
      case "logistics":
        return "/logistics-dashboard";
      case "developer":
        return "/developer-dashboard";
      default:
        return "/login";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href={isAuthenticated ? getDashboardRoute() : "/"}>
            <div className="flex items-center cursor-pointer">
              <Package className="h-8 w-8 text-[#8B5CF6]" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Logistix</h1>
            </div>
          </Link>
        </div>
        
        {!minimal && !isAuthenticated && (
          <nav>
            <ul className="flex space-x-8">
              <li><a href="#" className="text-gray-500 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900">Features</a></li>
              <li><a href="#" className="text-gray-500 hover:text-gray-900">Contact</a></li>
            </ul>
          </nav>
        )}
        
        {isAuthenticated && user && (
          <div className="flex items-center">
            <div className="mr-4 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              <span className="text-sm text-gray-700">Connected to blockchain</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center relative">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-2">
                    {user.firstName ? user.firstName[0].toUpperCase() : <User size={16} />}
                  </div>
                  <span className="mr-1">{user.firstName || user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={getDashboardRoute()}>
                  <DropdownMenuItem>
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <Link href={`${getDashboardRoute()}/profile`}>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
