import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
  private _googleProvider: GoogleAuthProvider;

  private constructor() {
    try {
      this.app = initializeApp(firebaseConfig);
      this._auth = getAuth(this.app);
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
      
      // Provide more context for the error
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