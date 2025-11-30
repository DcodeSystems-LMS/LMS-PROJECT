import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Card from '@/components/base/Card';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check URL hash fragments (Supabase uses hash for tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        // Check for errors first
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error || 'Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/auth/signin');
          }, 3000);
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          console.log('Setting session from callback tokens...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage(sessionError.message || 'Failed to set session. Please try again.');
            setTimeout(() => {
              navigate('/auth/signin');
            }, 3000);
            return;
          }

          // Check the type of callback
          if (type === 'recovery') {
            // Password reset callback
            console.log('Password reset callback detected');
            setStatus('success');
            setMessage('Email verified! Redirecting to password reset...');
            setTimeout(() => {
              navigate('/auth/reset-password');
            }, 1500);
            return;
          } else if (type === 'signup' || type === 'invite' || !type) {
            // Email verification callback
            console.log('Email verification callback detected');
            
            // Wait a moment for session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Get the current user after session is set
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Error getting user:', userError);
              setStatus('error');
              setMessage('Failed to verify user. Please try again.');
              setTimeout(() => {
                navigate('/auth/signin');
              }, 3000);
              return;
            }
            
            if (user) {
              // Check if email is now confirmed
              if (user.email_confirmed_at) {
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to sign in...');
                
                // Sign out to force fresh login (optional - you can keep user signed in)
                await supabase.auth.signOut();
                
                setTimeout(() => {
                  navigate('/auth/signin', { 
                    state: { 
                      verified: true,
                      message: 'Email verified successfully! Please sign in to continue.' 
                    } 
                  });
                }, 2000);
              } else {
                // Email not confirmed yet - might need to refresh
                console.log('Email not confirmed, waiting and retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Retry getting user
                const { data: { user: retryUser } } = await supabase.auth.getUser();
                if (retryUser?.email_confirmed_at) {
                  setStatus('success');
                  setMessage('Email verified successfully! Redirecting to sign in...');
                  await supabase.auth.signOut();
                  setTimeout(() => {
                    navigate('/auth/signin', { 
                      state: { 
                        verified: true,
                        message: 'Email verified successfully! Please sign in to continue.' 
                      } 
                    });
                  }, 2000);
                } else {
                  setStatus('error');
                  setMessage('Email verification failed. Please try again or request a new verification email.');
                  setTimeout(() => {
                    navigate('/auth/signin');
                  }, 3000);
                }
              }
            } else {
              setStatus('error');
              setMessage('Unable to verify user. Please try again.');
              setTimeout(() => {
                navigate('/auth/signin');
              }, 3000);
            }
            return;
          }
        } else {
          // No tokens in URL, check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Already authenticated, redirect based on user role
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email_confirmed_at) {
              // Email is confirmed, redirect to dashboard
              setStatus('success');
              setMessage('Already authenticated! Redirecting...');
              setTimeout(() => {
                navigate('/student/dashboard');
              }, 1500);
            } else {
              // Email not confirmed yet
              setStatus('error');
              setMessage('Please verify your email first.');
              setTimeout(() => {
                navigate('/auth/signin');
              }, 3000);
            }
          } else {
            // No session and no tokens
            setStatus('error');
            setMessage('Invalid or expired verification link. Please request a new one.');
            setTimeout(() => {
              navigate('/auth/signin');
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => {
          navigate('/auth/signin');
        }, 3000);
      }
    };

    // Clear hash from URL immediately to prevent token exposure
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
                <i className="ri-loader-4-line text-4xl animate-spin"></i>
              </div>
              <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                Verifying...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 text-green-600 mb-4">
                <i className="ri-check-circle-line text-4xl"></i>
              </div>
              <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                Success!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message || 'Verification successful! Redirecting...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 text-red-600 mb-4">
                <i className="ri-error-warning-line text-4xl"></i>
              </div>
              <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message || 'An error occurred during verification.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Back to Sign In →
                </button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthCallback;

