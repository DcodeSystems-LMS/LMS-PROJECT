import React, { useEffect, useState } from 'react';

interface YouTubeEmbedProps {
  videoUrl: string;
  title?: string;
  className?: string;
  allowFullScreen?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  showFullscreen?: boolean;
}

/**
 * YouTube Embed Component
 * 
 * Important URL parameters:
 * - rel=0 → Hide suggested videos at end
 * - modestbranding=1 → Small YouTube logo
 * - showinfo=0 → Hide title bar (deprecated but still works sometimes)
 * - controls=0 → Hide player controls (but play/pause still works)
 * - fs=0 → Hide fullscreen button
 * - iv_load_policy=3 → Video annotations off
 * - autoplay=1 → Auto play (optional)
 * - mute=1 → Mute (required for autoplay sometimes)
 * - loop=1 → Loop video (requires playlist parameter with same videoId)
 */
const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoUrl,
  title = 'YouTube Video',
  className = '',
  allowFullScreen = false,
  autoplay = false,
  muted = false,
  loop = false,
  controls = false, // Default: hide controls (play/pause still works)
  showFullscreen = false, // Default: hide fullscreen button
}) => {
  const [embedUrl, setEmbedUrl] = useState('');

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // If it's already an embed URL, extract the ID
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/youtube\.com\/embed\/([^?&]+)/);
      return match ? match[1] : null;
    }
    
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  useEffect(() => {
    const videoId = extractVideoId(videoUrl);
    
    if (videoId) {
      const params = new URLSearchParams();
      
      // Essential parameters for clean UI
      params.append('rel', '0'); // Hide suggested videos at end
      params.append('modestbranding', '1'); // Small YouTube logo
      params.append('showinfo', '0'); // Hide title bar (deprecated but works sometimes)
      params.append('controls', controls ? '1' : '0'); // Hide/show player controls
      params.append('fs', showFullscreen ? '1' : '0'); // Hide/show fullscreen button
      params.append('iv_load_policy', '3'); // Video annotations off
      
      // Optional parameters
      if (autoplay) {
        params.append('autoplay', '1');
        // If autoplay is enabled, mute is often required by browsers
        if (muted) {
          params.append('mute', '1');
        }
      }
      if (muted && !autoplay) {
        params.append('mute', '1');
      }
      if (loop) {
        params.append('loop', '1');
        params.append('playlist', videoId); // Required for loop to work
      }
      
      // Use youtube.com domain (can also use youtube-nocookie.com for privacy)
      const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      setEmbedUrl(embedUrl);
    } else {
      // If we can't extract video ID, try to use the URL as-is
      setEmbedUrl(videoUrl);
    }
  }, [videoUrl, autoplay, muted, loop, controls, showFullscreen]);

  if (!embedUrl) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden flex items-center justify-center ${className}`} style={{ aspectRatio: '16/9' }}>
        <div className="text-center text-white">
          <i className="ri-video-line text-4xl mb-2"></i>
          <p>Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`youtube-container ${className}`}
      style={{
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        background: '#000',
        borderRadius: '0.5rem'
      }}
    >
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allowFullScreen={allowFullScreen}
        allow="autoplay; encrypted-media; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;

