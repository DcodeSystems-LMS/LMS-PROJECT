import React, { useState } from 'react';
import CustomVideoPlayer from '../feature/CustomVideoPlayer';

const SupabaseVideoTest: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('🎬 Video started playing');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('⏸️ Video paused');
  };

  const handleEnded = () => {
    setIsPlaying(false);
    console.log('🏁 Video ended');
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    console.log(`⏱️ Time: ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Supabase Video Test</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Supabase Video URL:
        </label>
        <input
          type="url"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="https://your-project.supabase.co/storage/v1/object/public/course-videos/video.mp4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {testUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Video Player Test</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <CustomVideoPlayer
              videoUrl={testUrl}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
              title="Test Video"
              className="w-full"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Status:</strong> {isPlaying ? 'Playing' : 'Paused'}</p>
            <p><strong>URL:</strong> {testUrl}</p>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Test Instructions:</h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Upload a video to your Supabase storage bucket</li>
          <li>Copy the public URL of the video</li>
          <li>Paste it in the input field above</li>
          <li>Check if the video loads and plays correctly</li>
          <li>Test video controls (play, pause, seek, volume)</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseVideoTest;
