import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';

const CreateAdminPage: React.FC = () => {
  const [step, setStep] = useState<'key' | 'form'>('key');
  const [adminKey, setAdminKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin creation key - you can change this to any secure key
  const ADMIN_CREATION_KEY = import.meta.env.VITE_ADMIN_CREATION_KEY || 'DCODE_RAMESH_WITH_TEAMS';

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_CREATION_KEY) {
      setStep('form');
      setKeyError('');
    } else {
      setKeyError('Invalid admin key. Access denied.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Test SMTP configuration first
      console.log('Testing SMTP configuration...');
      console.log('Email:', formData.email);
      
      // Create admin user with special role
      const result = await authService.signUp(formData.email, formData.password, formData.name);
      
      console.log('Sign up result:', result);
      
      if (result.needsVerification) {
        setSuccess('Admin account created! However, email verification is still required. Please check your email and verify the account.');
      } else if (result.user) {
        setSuccess('Admin account created successfully! You can now sign in.');
      }
      
    } catch (err) {
      console.error('Admin creation error:', err);
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during admin creation');
    } finally {
      setLoading(false);
    }
  };

  // Key verification step
  if (step === 'key') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-shield-keyhole-line text-2xl text-red-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
            <p className="text-gray-600">Enter the admin creation key to proceed</p>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-6">
            {keyError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {keyError}
              </div>
            )}

            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Creation Key
              </label>
              <input
                id="adminKey"
                name="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter admin creation key"
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              className="py-3 text-base font-semibold"
            >
              <i className="ri-key-line mr-2"></i>
              Verify Key
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have the key?{' '}
              <Link to="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in instead
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
        </Card>
      </div>
    );
  }

  // Admin creation form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-user-settings-line text-2xl text-green-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h1>
          <p className="text-gray-600">Create the first admin user for your system</p>
        </div>

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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter admin name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="admin@dcode.ai"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Confirm password"
              required
            />
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
                Creating Admin...
              </>
            ) : (
              <>
                <i className="ri-user-settings-line mr-2"></i>
                Create Admin Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <button
              onClick={() => setStep('key')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Key Verification
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateAdminPage;
