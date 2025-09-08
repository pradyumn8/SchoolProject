import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff } from 'lucide-react';
import { assets } from '../assets/assets';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from '../components/ui/Card';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { signInWithGoogle } from '../firebase'; // <-- NEW
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // for optional post-signup profile write

const LoginPage = () => {
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user, error, clearError } = useAuthStore();

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const lastErrorRef = useRef("");
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      toast.dismiss();
      toast.error(error);
      clearError?.();
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errs = {};
    if (signState === "Sign Up" && !name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email is invalid";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setFormErrors(errs);
    if (Object.keys(errs).length) {
      toast.dismiss(); toast.error(Object.values(errs)[0]); return false;
    }
    return true;
  };

  const mapAuthError = (err) => {
    switch (err?.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/wrong-password": return "Incorrect email or password.";
      case "auth/user-not-found": return "No account found with that email.";
      case "auth/too-many-requests": return "Too many attempts. Try again later.";
      case "auth/email-already-in-use": return "Email is already registered.";
      case "auth/invalid-email": return "Invalid email address.";
      case "auth/weak-password": return "Password is too weak (min 6 characters).";
      default: return err?.friendly || err?.message || "Authentication failed.";
    }
  };

  const user_auth = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;

    setSubmitting(true);
    toast.dismiss();
    clearError?.();

    try {
      if (signState === "Sign In") {
        await toast.promise(
          signInWithEmailAndPassword(auth, email, password),
          { success: "Signed in successfully!", error: (err) => mapAuthError(err) }
        );
      } else {
        const res = await toast.promise(
          createUserWithEmailAndPassword(auth, email, password),
          { success: "Account created!", error: (err) => mapAuthError(err) }
        );
        // Optional: also create a profile doc for email/password signups
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          name,
          email: res.user.email,
          authProvider: "local",
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSwitch = (next) => {
    setSignState(next);
    setName(""); setEmail(""); setPassword("");
    setFormErrors({}); lastErrorRef.current = "";
    clearError?.(); toast.dismiss();
  };

  // NEW: Google handler
  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    toast.dismiss();
    try {
      await toast.promise(
        signInWithGoogle(),
        // { success: "Signed in with Google!", error: (err) => mapAuthError(err) }
      );
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md">
            <img src={assets.logo} alt="School Logo" className="h-20 w-20 object-contain" />
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {signState === 'Sign In' ? 'Welcome' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {signState === 'Sign In'
                ? 'Enter your credentials to access the dashboard'
                : 'Fill in your details to create a new account'}
            </CardDescription>
          </CardHeader>

          <form onSubmit={user_auth}>
            <CardContent className="space-y-4">
              {signState === 'Sign Up' && (
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  error={formErrors.name}
                  fullWidth
                  required
                />
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                error={formErrors.email}
                fullWidth
                required
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  error={formErrors.password}
                  fullWidth
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  className="absolute top-1/2 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {signState === 'Sign In' && (
                <div className="text-sm text-right">
                  <Link to="/reset-password" className="font-medium text-primary-600 hover:text-primary-500 hover:cursor-pointer hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}
              {/* sign in button */}
              <Button type="submit" fullWidth disabled={submitting}>
                {signState}
              </Button>
              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                onClick={handleGoogle}
                disabled={submitting}
                className="mt-6 w-full rounded-full border border-gray-200 py-3 px-4
              flex items-center justify-center font-medium text-gray-900
              hover:bg-blue-500 transition"
              >
                <img
                  alt="Google"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="h-5 w-5  "
                />
                <span className="font-medium">Continue with Google</span>
              </Button>

            </CardContent>

            <CardFooter className="flex flex-col space-y-4">


              <div className="text-center text-sm">
                {signState === 'Sign In' ? (
                  <p className="text-gray-600">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={() => handleFormSwitch('Sign Up')}
                      className="font-medium text-primary-600 hover:text-primary-500 underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleFormSwitch('Sign In')}
                      className="font-medium text-primary-600 hover:text-primary-500 underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
