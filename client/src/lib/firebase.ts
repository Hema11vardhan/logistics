import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged,
  signOut,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyDi6mDdrZWTpuLF-_l8EUcT3_t7wCSAM1s",

  authDomain: "logisticx-4dd07.firebaseapp.com",

  projectId: "logisticx-4dd07",

  storageBucket: "logisticx-4dd07.firebasestorage.app",

  messagingSenderId: "648334461773",

  appId: "1:648334461773:web:54f8f718674bdfbb8e0504",

  measurementId: "G-5QRLJYHSTS"

};


// Log if we have Firebase config loaded
console.log("Firebase config loaded:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
});

// Singleton implementation to avoid re-initialization
class FirebaseService {
  private static instance: FirebaseService;
  private app;
  private _auth: Auth;
  private _analytics;
  private _googleProvider: GoogleAuthProvider;

  private constructor() {
    try {
      this.app = initializeApp(firebaseConfig);
      this._auth = getAuth(this.app);
      
      // Initialize analytics if browser supports it
      try {
        this._analytics = getAnalytics(this.app);
        console.log("Firebase analytics initialized");
      } catch (analyticsError) {
        console.log("Firebase analytics not available in this environment");
      }
      
      console.log("Firebase initialized successfully");
      
      this._googleProvider = new GoogleAuthProvider();
      this._googleProvider.setCustomParameters({
        prompt: 'select_account' // Force account selection
      });
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      throw error;
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  get auth(): Auth {
    return this._auth;
  }

  get googleProvider(): GoogleAuthProvider {
    return this._googleProvider;
  }

  // Subscribe to auth state changes
  public subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(this._auth, callback);
  }

  // Login with Google using popup or redirect
  public async signInWithGoogle() {
    try {
      // Check for mobile devices and use redirect instead of popup
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log("Using redirect for mobile device");
        // Use redirect for mobile devices
        await signInWithRedirect(this._auth, this._googleProvider);
        return {
          success: true,
          redirected: true
        };
      } else {
        console.log("Using popup for desktop");
        // Use popup for desktop
        const result = await signInWithPopup(this._auth, this._googleProvider);
        
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        
        console.log("Google popup auth successful:", user.email);
        
        return {
          success: true,
          user: {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid
          },
          token
        };
      }
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      
      // Check for common error codes and provide better messages
      let errorMessage = error.message;
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked by your browser. Please enable pop-ups for this site.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'You closed the authentication window before completing sign-in.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'The authentication request was cancelled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized in Firebase. Please add this domain to the authorized domains list in your Firebase console.';
        console.error('IMPORTANT: Add this domain to your Firebase authorized domains: ' + window.location.origin);
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code
      };
    }
  }

  // Handle redirect result
  public async handleRedirectResult() {
    try {
      console.log("Checking for redirect result from Google authentication");
      const result = await getRedirectResult(this._auth);
      
      if (result) {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        
        console.log("Redirect authentication successful:", user.email);
        
        return {
          success: true,
          user: {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid
          },
          token
        };
      }
      
      console.log("No redirect result found");
      return { success: false, error: "No redirect result" };
    } catch (error: any) {
      console.error("Error handling redirect result:", error);
      
      // Check for specific errors
      let errorMessage = error.message;
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized in Firebase. Please add this domain to the authorized domains list in your Firebase console.';
        console.error('IMPORTANT: Add this domain to your Firebase authorized domains: ' + window.location.origin);
      }
      
      // Provide more context for the error
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code || 'unknown'
      };
    }
  }
  
  // Sign out from Firebase
  public async signOut() {
    try {
      await signOut(this._auth);
      console.log("Successfully signed out from Firebase");
      return { success: true };
    } catch (error: any) {
      console.error("Error signing out from Firebase:", error);
      return { 
        success: false, 
        error: error.message,
        errorCode: error.code || 'unknown'
      };
    }
  }
}

// Create singleton instance
const firebaseService = FirebaseService.getInstance();

// Export methods and properties to be used in the app
export const auth = firebaseService.auth;
export const googleProvider = firebaseService.googleProvider;
export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => 
  firebaseService.subscribeToAuthChanges(callback);
export const signInWithGoogle = () => firebaseService.signInWithGoogle();
export const handleRedirectResult = () => firebaseService.handleRedirectResult();
export const signOutFromFirebase = () => firebaseService.signOut();