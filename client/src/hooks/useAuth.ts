import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useWeb3 } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle, handleRedirectResult, subscribeToAuthChanges, signOutFromFirebase } from '@/lib/firebase';

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
  logout: () => Promise<void>;
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
  logout: async () => Promise.resolve(),
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

  // Check if user is already logged in on mount and listen for Firebase auth changes
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

    // Check local storage first
    checkAuth();
    
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      console.log("Firebase auth state changed:", firebaseUser?.email || "logged out");
      
      // Only attempt auto-login if we have a Firebase user
      if (firebaseUser && firebaseUser.email) {
        // Check if we need to auto-login this user
        const storedUser = localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        
        // If no user is logged in locally, try to log them in automatically
        if (!currentUser) {
          console.log("Firebase user detected, attempting login with email:", firebaseUser.email);
          
          try {
            // Try to authenticate the user on our system
            const response = await apiRequest('/api/auth/login', { 
              method: 'POST',
              data: { email: firebaseUser.email }
            });
            const userData = await response.json();
            
            console.log("Successfully logged in user after Firebase auth state change");
            
            // Update state and local storage
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // No need to navigate - this could happen after redirect and we don't want
            // to interrupt an ongoing flow
          } catch (err) {
            // User not found in our system
            console.log("Firebase user not found in our system after auth state change");
          }
        }
      }
    });
    
    // Unsubscribe from Firebase on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Login with username/password
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/auth/login', { 
        method: 'POST',
        data: { username, password }
      });
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

  // Login with Google
  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Starting Google authentication process");
      // Use Firebase Google authentication
      const result = await signInWithGoogle();
      
      // If this is a redirect on mobile, we'll return quickly as the actual auth will happen on redirect return
      if (result.redirected) {
        setLoading(false);
        // Toast to inform the user they're being redirected
        toast({
          title: "Google Login",
          description: "Redirecting to Google for authentication...",
          variant: "default"
        });
        console.log("Redirecting to Google authentication...");
        return false;
      }
      
      if (!result.success || !result.user?.email) {
        console.error("Google login failed:", result.error);
        throw new Error(result.error || 'Failed to authenticate with Google');
      }
      
      console.log("Google authentication successful, checking if user exists in our system");
      
      try {
        // Check if user exists with this email
        const userData = await apiRequest('/api/auth/login', { 
          method: 'POST',
          data: { email: result.user.email }
        });
        
        console.log("User found in our system:", userData.username);
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.firstName || userData.username}!`,
          variant: "default"
        });
        
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
        console.log("User not found in our system with this Google account. Offering auto-registration.");
        
        // Ask if they want to register with a specific role
        const confirmRegistration = window.confirm(
          "No account found with this Google email. Would you like to create a new account?"
        );
        
        if (confirmRegistration) {
          // Ask for role selection
          const userRole = window.prompt(
            "Please choose a role for your account (user, logistics, developer):",
            "user"
          );
          
          if (!userRole) {
            throw new Error('User canceled role selection');
          }
          
          // Validate role
          const validatedRole = ['user', 'logistics', 'developer'].includes(userRole.toLowerCase()) 
            ? userRole.toLowerCase() as 'user' | 'logistics' | 'developer'
            : 'user'; // Default to user if invalid entry
          
          // Extract name parts - handle if displayName is undefined
          const nameParts = (result.user.displayName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          // Generate a username from the email (remove special chars)
          const username = (result.user.email.split('@')[0] || 'user')
            .replace(/[^a-zA-Z0-9]/g, '');
          
          console.log(`Auto-registering Google user with role: ${validatedRole}`);
          
          // Register new user
          const registerData: RegisterData = {
            username,
            email: result.user.email,
            password: `google_${Date.now()}`, // Generate a random password
            firstName,
            lastName,
            role: validatedRole,
          };
          
          try {
            const registerResult = await register(registerData);
            
            if (registerResult) {
              toast({
                title: "Registration Successful",
                description: `Your account has been created with the ${validatedRole} role.`,
                variant: "default"
              });
            }
            
            return registerResult;
          } catch (registerError: any) {
            // Check if the error is because the user already exists
            if (registerError.message && registerError.message.includes("already exists")) {
              // Try login again - the user might have been created by another process
              try {
                const userData = await apiRequest('/api/auth/login', { 
                  method: 'POST',
                  data: { email: result.user.email }
                });
                
                console.log("User found after failed registration - using existing account");
                
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                
                toast({
                  title: "Login successful",
                  description: `Welcome back, ${userData.firstName || userData.username}!`,
                  variant: "default"
                });
                
                // Redirect to appropriate dashboard based on role
                if (userData.role === 'user') {
                  navigate('/user-dashboard');
                } else if (userData.role === 'logistics') {
                  navigate('/logistics-dashboard');
                } else if (userData.role === 'developer') {
                  navigate('/developer-dashboard');
                }
                
                return true;
              } catch (retryLoginErr) {
                throw registerError; // Re-throw the original error if retrying login fails
              }
            } else {
              throw registerError;
            }
          }
        } else {
          // User doesn't want to auto-register, redirect to sign-up page with pre-filled data
          toast({
            title: "Registration required",
            description: "Please register with your Google account to continue.",
            variant: "default"
          });
          
          // Pre-fill registration form with Google data
          navigate('/login?tab=signup&email=' + encodeURIComponent(result.user.email || '') + 
                  '&name=' + encodeURIComponent(result.user.displayName || ''));
          
          return false;
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login with Google';
      setError(errorMessage);
      toast({
        title: "Google Login Failed",
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
      const result = await connectWallet();
      
      if (!result || !result.accounts || result.accounts.length === 0) {
        throw new Error('Failed to connect to MetaMask');
      }
      
      const walletAddress = result.accounts[0];
      
      // Have user sign a message to verify wallet ownership
      const message = `Sign this message to verify your wallet ownership: ${Date.now()}`;
      let signature;
      
      try {
        if (window.ethereum) {
          signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, walletAddress]
          });
        } else {
          throw new Error('MetaMask extension not detected');
        }
      } catch (signError: any) {
        throw new Error(`Failed to sign message: ${signError.message}`);
      }
      
      if (!signature) {
        throw new Error('Wallet verification failed: No signature provided');
      }
      
      // Try to login with wallet address
      try {
        const userData = await apiRequest('/api/auth/login', { 
          method: 'POST',
          data: {
            walletAddress,
            walletSignature: signature,
            signedMessage: message
          }
        });
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: "MetaMask Login Successful",
          description: `Wallet verified successfully. Welcome back!`,
          variant: "default"
        });
        
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
        // Handle wallet not registered case - offer quick registration
        const autoRegister = window.confirm(
          "This wallet is not registered. Would you like to register now with this MetaMask wallet?"
        );
        
        if (autoRegister) {
          try {
            // Generate a username from the wallet address
            const shortWallet = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
            const username = `user_${shortWallet}`;
            const email = `${shortWallet}@blocklogistics.example`;
            
            // Auto-register this wallet
            const registerData: RegisterData = {
              username,
              email,
              password: Date.now().toString(), // Random password for auto-registration
              role: 'user', // Default role
              walletAddress
            };
            
            const registerResult = await register(registerData);
            
            if (registerResult) {
              toast({
                title: "Wallet registered successfully",
                description: "Your wallet has been registered and you are now logged in.",
                variant: "default"
              });
              return true;
            } else {
              throw new Error("Auto-registration failed");
            }
          } catch (registerErr) {
            toast({
              title: "Registration failed",
              description: "There was an error registering your wallet. Please try the manual registration.",
              variant: "destructive"
            });
            
            // Pre-fill registration form with wallet address
            navigate('/login?tab=signup&walletAddress=' + encodeURIComponent(walletAddress));
            return false;
          }
        } else {
          // If user doesn't want to auto-register, redirect to manual signup
          toast({
            title: "Wallet not registered",
            description: "This wallet is not registered. Please sign up first.",
            variant: "default"
          });
          
          // Pre-fill registration form with wallet address
          navigate('/login?tab=signup&walletAddress=' + encodeURIComponent(walletAddress));
          
          return false;
        }
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
      // Check if user already exists first
      try {
        const checkResponse = await apiRequest('/api/auth/login', { 
          method: 'POST',
          data: { email: userData.email }
        });
        
        // If we get here, the user already exists, so just log them in
        console.log("User already exists with this email, logging in instead of registering");
        
        setUser(checkResponse);
        localStorage.setItem('user', JSON.stringify(checkResponse));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${checkResponse.firstName || checkResponse.username}!`,
          variant: "default"
        });
        
        // Redirect to appropriate dashboard based on role
        if (checkResponse.role === 'user') {
          navigate('/user-dashboard');
        } else if (checkResponse.role === 'logistics') {
          navigate('/logistics-dashboard');
        } else if (checkResponse.role === 'developer') {
          navigate('/developer-dashboard');
        }
        
        return true;
      } catch (checkErr) {
        // User doesn't exist, proceed with registration
        console.log("User doesn't exist, proceeding with registration");
      }
      
      // Perform the registration
      const newUser = await apiRequest('/api/auth/register', {
        method: 'POST',
        data: userData
      });
      
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
  const logout = async () => {
    // First, sign out from Firebase (if using Google authentication)
    try {
      console.log("Signing out from Firebase...");
      const firebaseResult = await signOutFromFirebase();
      if (!firebaseResult.success) {
        console.error("Error signing out from Firebase:", firebaseResult.error);
      } else {
        console.log("Firebase signout successful");
      }
    } catch (err) {
      console.error("Failed to sign out from Firebase:", err);
    }
    
    // Clear MetaMask connection if connected
    try {
      if (window.ethereum) {
        console.log("Clearing MetaMask connection state");
        // There's no direct disconnect method in MetaMask, but we can clear our local state
      }
    } catch (err) {
      console.error("Error clearing wallet connection:", err);
    }

    // Clear user data from state and local storage
    console.log("Clearing local user data...");
    setUser(null);
    localStorage.removeItem('user');
    
    // Give Firebase auth state change time to propagate
    // This prevents the immediate auto-login that might happen
    // when Firebase auth state is still in memory
    setTimeout(() => {
      // Redirect to login page
      navigate('/login');
      
      // Display toast message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
    }, 100);
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
