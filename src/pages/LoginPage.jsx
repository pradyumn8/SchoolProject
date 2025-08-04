import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { assets } from '../assets/assets';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { signup } from '../firebase';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/Card';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [signState, setSignState] = useState('Sign In');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
   const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, user, loading, error, onAuthStateChanged } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (onAuthStateChanged && user) {
      navigate('/dashboard');
    }
  }, [onAuthStateChanged, user, navigate]);

  // Show any store error as toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const validateForm = () => {
    const errors = {};
    if (signState === 'Sign Up' && !name.trim()) {
      errors.name = 'Name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // show first error as toast
      toast.error(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const user_auth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (signState === 'Sign In') {
        await toast.promise(
          login(email, password),
          {
            loading: 'Signing in…',
            success: 'Signed in successfully!',
            error: (err) => err.message || 'Sign in failed',
          }
        );
      } else {
        await toast.promise(
          signup(name, email, password),
          {
            loading: 'Creating account…',
            success: 'Account created!',
            error: (err) => err.message || 'Sign up failed',
          }
        );
      }
      navigate('/dashboard');
    } catch {
      // toast.promise already handled errors
    }
  };

  const handleFormSwitch = (newState) => {
    setSignState(newState);
    setName('');
    setEmail('');
    setPassword('');
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-full shadow-md">
            <img
              src={assets.logo}
              alt="School Logo"
              className="h-20 w-20 object-contain"
            />
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
    className="
      absolute
      top-1/2
      right-3
      text-gray-400
      hover:text-gray-600
      focus:outline-none
      "
  >
    {showPassword
      ? <EyeOff className="h-5 w-5" />
      : <Eye className="h-5 w-5" />
    }
  </button>
</div>

              {signState === 'Sign In' && (
                <div className="text-sm text-right">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </a>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                fullWidth
                isLoading={loading}
                icon={
                  !loading
                    ? signState === 'Sign In'
                      ? <LogIn className="h-4 w-4" />
                      : <UserPlus className="h-4 w-4" />
                    : undefined
                }
              >
                {signState}
              </Button>

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
