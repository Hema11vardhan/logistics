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
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
