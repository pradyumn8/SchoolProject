import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import {
    addDoc,
    collection,
    getFirestore
} from "firebase/firestore"; 
import toast from 'react-hot-toast';

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlu9pwiGXYXdpKRKSRbTlhDBgi77A1Mm4",
    authDomain: "schoolauth-879d6.firebaseapp.com",
    projectId: "schoolauth-879d6",
    storageBucket: "schoolauth-879d6.firebasestorage.app",
    messagingSenderId: "91322502157",
    appId: "1:91322502157:web:66477ab126eb42330b5944",
    measurementId: "G-GEGVKT7E5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// FIXED: Enhanced signup function with proper error handling
const signup = async (name, email, password) => {
  try {
    console.log("Attempting to create user with email:", email);

    // Create user in Firebase Authentication
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    console.log("User created successfully:", user.uid);

    // Store additional user info in Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      email,
      authProvider: "local",
      createdAt: new Date().toISOString()
    });

    console.log("User data stored in Firestore");

    toast.success("Account created successfully!");
    return user;

  } catch (error) {
    console.error("Signup error:", error);

    let errorMessage = "Failed to create account";

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Email is already registered";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak (minimum 6 characters)";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password sign-up is disabled in Firebase";
          break;
        default:
          errorMessage = error.message || "An unknown error occurred";
      }
    }

    toast.error(errorMessage);
    throw error; // So the calling component can catch it
  }
};


// FIXED: Enhanced login function with proper error handling
const login = async (email, password) => {
    try {
        console.log("Attempting to sign in user:", email);

        const result = await signInWithEmailAndPassword(auth, email, password);

        console.log("User signed in successfully:", result.user.uid);
        toast.success("Signed in successfully!");

        return result.user; 

    } catch (error) {
        console.error("Login error:", error);

        // FIXED: Better error handling
        let errorMessage = "Failed to sign in";

        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "Account has been disabled";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed attempts. Try again later";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "Email/password authentication is not enabled";
                    break;
                case 'auth/invalid-credential':
                    errorMessage = "Invalid email or password";
                    break;
                default:
                    errorMessage = error.code.split('/')[1].split('-').join(' ');
            }
        }

        toast.error(errorMessage);
        throw error; // Re-throw so the calling component can handle it
    }
}

// FIXED: Enhanced logout function with error handling
const logout = async () => {
    try {
        await signOut(auth);
        toast.success("Signed out successfully!");
        console.log("User signed out");
    } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to sign out");
        throw error;
    }
}

export { auth, db, login, signup, logout };