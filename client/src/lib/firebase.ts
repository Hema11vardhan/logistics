import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  }.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Login with Google using popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      
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
    return { success: false, error: "No redirect result" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};