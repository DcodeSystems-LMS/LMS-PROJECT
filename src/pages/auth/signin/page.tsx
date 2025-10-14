
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import Button from '@/components/base/Button';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await authService.signIn(email, password);
      setSuccess('Successfully signed in! Redirecting...');
      
      // Navigate based on user role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    setResetSuccess('');

    try {
      await authService.resetPassword(resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox and spam folder.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="https://static.readdy.ai/image/9a8f01f834659f0ab66072bb9b6ee657/94d4f47a77f88d2925bb5eae1005561d.png" 
              alt="DCODE Systems" 
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>


        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                <i className="ri-check-circle-line mr-2"></i>
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
                <i className="ri-mail-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <i className="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="py-3 text-base font-semibold"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="ri-login-circle-line mr-2"></i>
                  Sign In
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
              <p className="text-gray-600">Enter your email to receive a password reset link</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                <i className="ri-check-circle-line mr-2"></i>
                {resetSuccess}
              </div>
            )}

            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
                <i className="ri-mail-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={resetLoading}
                fullWidth
                className="py-3 text-base font-semibold"
              >
                {resetLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Send Reset Link
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                fullWidth
                className="py-3 text-base font-semibold"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Sign In
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
