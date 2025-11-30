import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle password reset callback from Supabase
    const handleResetCallback = async () => {
      try {
        setCheckingLink(true);
        
        // Check URL hash fragments (Supabase uses hash for tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        // Check if this is a password recovery callback
        if (type === 'recovery' && (accessToken || refreshToken)) {
          // Set the session using the tokens from the URL
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setError('Invalid or expired reset link. Please request a new password reset.');
              setIsValidLink(false);
            } else {
              setIsValidLink(true);
              // Clear hash from URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else {
            // Try to get session if already authenticated
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setIsValidLink(true);
            } else {
              setError('Invalid or expired reset link. Please request a new password reset.');
              setIsValidLink(false);
            }
          }
        } else {
          // Check if user already has a session (might have been set automatically)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsValidLink(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsValidLink(false);
          }
        }
      } catch (err) {
        console.error('Error handling reset callback:', err);
        setError('Error validating reset link. Please request a new password reset.');
        setIsValidLink(false);
      } finally {
        setCheckingLink(false);
      }
    };

    handleResetCallback();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking reset link
  if (checkingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
              <i className="ri-loader-4-line text-4xl animate-spin"></i>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Verifying Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we validate your password reset link...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600">
              <i className="ri-check-line text-4xl"></i>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been updated successfully. Redirecting to sign in...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error if link is invalid
  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-600 mb-4">
              <i className="ri-error-warning-line text-4xl"></i>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600 mb-6">
              {error || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/auth/signin')}
                className="w-full"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/auth/signin', { state: { showForgotPassword: true } })}
                className="w-full"
              >
                <i className="ri-mail-line mr-2"></i>
                Request New Reset Link
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth/signin')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;

