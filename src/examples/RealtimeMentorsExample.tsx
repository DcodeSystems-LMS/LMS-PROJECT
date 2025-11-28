// Example: Real-time Mentors Page
import React from 'react';
import { useRealtimeProfiles } from '@/hooks/useRealtimeData';

const MentorsPage = () => {
  const { profiles, loading, error } = useRealtimeProfiles();

  // Filter mentors from all profiles
  const mentors = profiles.filter(profile => profile.role === 'mentor');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading mentors: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mentors ({mentors.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {mentor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{mentor.name}</h3>
                <p className="text-gray-600">{mentor.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {mentor.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorsPage;
