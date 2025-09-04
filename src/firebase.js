// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import toast from "react-hot-toast"; // used by existing helpers

// --- Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAlu9pwiGXYXdpKRKSRbTlhDBgi77A1Mm4",
  authDomain: "schoolauth-879d6.firebaseapp.com",
  projectId: "schoolauth-879d6",
  storageBucket: "schoolauth-879d6.appspot.com",
  messagingSenderId: "91322502157",
  appId: "1:91322502157:web:66477ab126eb42330b5944",
  measurementId: "G-GEGVKT7E5D",
};

// --- Initialize once ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---------- GOOGLE SIGN-IN ----------
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    // Create Firestore profile if it doesn't exist
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        authProvider: "google",
        createdAt: serverTimestamp(),
      });
    }

    return user;
  } catch (error) {
    // Common helpful mapping for UI
    if (error?.code === "auth/account-exists-with-different-credential") {
      error.friendly =
        "An account with this email exists with a different sign-in method. Try using Email/Password, then link Google from profile.";
    }
    throw error;
  }
};

// ---------- Existing helpers (kept as-is) ----------
const signup = async (name, email, password) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      authProvider: "local",
      createdAt: serverTimestamp(),
    });
    toast.success("Account created successfully!");
    return user;
  } catch (error) {
    let errorMessage = "Failed to create account";
    switch (error?.code) {
      case "auth/email-already-in-use": errorMessage = "Email is already registered"; break;
      case "auth/weak-password":        errorMessage = "Password is too weak (minimum 6 characters)"; break;
      case "auth/invalid-email":        errorMessage = "Invalid email address"; break;
      case "auth/operation-not-allowed":errorMessage = "Email/password sign-up is disabled in Firebase"; break;
      case "permission-denied":         errorMessage = "You don't have permission to save user data"; break;
      default:                          errorMessage = error.message || errorMessage;
    }
    toast.error(errorMessage);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    let errorMessage = "Failed to sign in";
    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":      errorMessage = "No account found with this email"; break;
        case "auth/wrong-password":      errorMessage = "Incorrect password"; break;
        case "auth/invalid-email":       errorMessage = "Invalid email address"; break;
        case "auth/user-disabled":       errorMessage = "Account has been disabled"; break;
        case "auth/too-many-requests":   errorMessage = "Too many failed attempts. Try again later"; break;
        case "auth/operation-not-allowed": errorMessage = "Email/password authentication is not enabled"; break;
        case "auth/invalid-credential":  errorMessage = "Invalid email or password"; break;
        default:                          errorMessage = error.code.split("/")[1].split("-").join(" ");
      }
    }
    toast.error(errorMessage);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    toast.success("Signed out successfully!");
  } catch (error) {
    toast.error("Failed to sign out");
    throw error;
  }
};

async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email, {
    url: "http://localhost:5173/reset-password",
    handleCodeInApp: true,
  });
  alert("Password reset email sent!");
}

export { signup, login, logout, forgotPassword };
