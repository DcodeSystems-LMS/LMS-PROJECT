import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching profile data...');
      
      const user = await authService.getCurrentUser();
      console.log('🔄 Current user:', user);
      
      if (user) {
        // Get additional profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('🔄 Profile data from database:', profileData);
        console.log('🔄 Profile error:', profileError);

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Profile fetch error:', profileError);
        }

        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: profileData?.name || user.name || 'Admin User',
          role: profileData?.role || user.role || 'admin',
          avatar: profileData?.avatar || user.avatar,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: profileData?.updated_at || user.updated_at || new Date().toISOString(),
        };

        console.log('✅ Final user profile:', userProfile);
        setProfile(userProfile);
        setEditForm({
          name: userProfile.name,
          email: userProfile.email,
        });
      } else {
        console.error('❌ No user found');
        setError('No user found. Please log in again.');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!profile) return;

      console.log('🔄 Updating profile for user:', profile.id);
      console.log('🔄 New name:', editForm.name);

      // Update profile in Supabase profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw updateError;
      }

      console.log('✅ Profile updated in database');

      // Also update user metadata in auth.users table
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          name: editForm.name,
        }
      });

      if (authUpdateError) {
        console.error('❌ Auth update error:', authUpdateError);
        // Don't throw error here as profile update succeeded
      } else {
        console.log('✅ Auth metadata updated');
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        name: editForm.name,
        updated_at: new Date().toISOString(),
      } : null);

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      console.log('✅ Profile sync completed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="ri-error-warning-line text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <i className="ri-user-line text-6xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900">No Profile Found</h3>
          <p className="text-gray-500">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-check-line text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Profile Header */}
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={profile.avatar}
                  alt={profile.name}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {getInitials(profile.name)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <i className="ri-shield-check-line mr-1"></i>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit Profile
                  </button>
                  <button
                    onClick={fetchProfile}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-900">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <p className="text-gray-900 capitalize">{profile.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{profile.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <p className="text-gray-900">{formatDate(profile.created_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(profile.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <i className="ri-key-line mr-2"></i>
              Change Password
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <i className="ri-download-line mr-2"></i>
              Download Data
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <i className="ri-delete-bin-line mr-2"></i>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
