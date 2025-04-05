import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import UserDashboard from "@/pages/UserDashboard";
import LogisticsDashboard from "@/pages/LogisticsDashboard";
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { handleRedirectResult } from "@/lib/firebase";

// Component to handle auth redirects
function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handle Firebase auth redirects
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for auth redirects...");
        const result = await handleRedirectResult();
        
        if (result.success && result.user) {
          console.log("Redirect result processed successfully:", result.user.email);
          
          // Log detailed info to help debug
          console.log("Auth redirect details:", {
            email: result.user.email,
            displayName: result.user.displayName,
            uid: result.user.uid,
            hasToken: !!result.token
          });
          
          // Now we need to check if this user exists in our system
          // The actual login logic is handled in the useAuth hook's useEffect
          // which will be triggered when the redirect completes.
          
          // No need to do anything here as the AuthProvider will handle the rest
        } else if (!result.success) {
          console.log("No redirect result or auth in progress:", result.error);
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };
    
    // Check for redirects immediately when component mounts
    checkRedirectResult();
  }, []);
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Dashboard routes */}
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/user-dashboard/:section" component={UserDashboard} />
      <Route path="/logistics-dashboard" component={LogisticsDashboard} />
      <Route path="/logistics-dashboard/:section" component={LogisticsDashboard} />
      <Route path="/developer-dashboard" component={DeveloperDashboard} />
      <Route path="/developer-dashboard/:section" component={DeveloperDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthRedirectHandler>
          <Router />
          <Toaster />
        </AuthRedirectHandler>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
