import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useWeb3 } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'logistics' | 'developer';
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithMetaMask: () => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'logistics' | 'developer';
  walletAddress?: string;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => false,
  loginWithGoogle: async () => false,
  loginWithMetaMask: async () => false,
  register: async () => false,
  logout: () => {},
  isAuthenticated: false
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { connectWallet, account } = useWeb3();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with username/password
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect to appropriate dashboard based on role
      if (userData.role === 'user') {
        navigate('/user-dashboard');
      } else if (userData.role === 'logistics') {
        navigate('/logistics-dashboard');
      } else if (userData.role === 'developer') {
        navigate('/developer-dashboard');
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google (simplified for demo)
  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would redirect to Google OAuth
      // For demo purposes, we'll just simulate a successful login
      toast({
        title: "Google Login",
        description: "Google login is not implemented in this demo.",
        variant: "default"
      });
      return false;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login with Google';
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with MetaMask
  const loginWithMetaMask = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Connect MetaMask
      await connectWallet();
      
      if (!account) {
        throw new Error('Failed to connect to MetaMask');
      }
      
      // Try to login with wallet address
      try {
        const response = await apiRequest('POST', '/api/auth/login', { walletAddress: account });
        const userData = await response.json();
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to appropriate dashboard based on role
        if (userData.role === 'user') {
          navigate('/user-dashboard');
        } else if (userData.role === 'logistics') {
          navigate('/logistics-dashboard');
        } else if (userData.role === 'developer') {
          navigate('/developer-dashboard');
        }
        
        return true;
      } catch (loginErr) {
        toast({
          title: "Wallet not registered",
          description: "This wallet is not registered. Please sign up first.",
          variant: "default"
        });
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login with MetaMask';
      setError(errorMessage);
      toast({
        title: "MetaMask login failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const newUser = await response.json();
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
        variant: "default"
      });
      
      // Redirect to appropriate dashboard based on role
      if (newUser.role === 'user') {
        navigate('/user-dashboard');
      } else if (newUser.role === 'logistics') {
        navigate('/logistics-dashboard');
      } else if (newUser.role === 'developer') {
        navigate('/developer-dashboard');
      }
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // The provider value
  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    loginWithMetaMask,
    register,
    logout,
    isAuthenticated: !!user
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
