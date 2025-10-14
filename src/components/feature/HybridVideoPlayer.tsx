import React, { useState, useRef, useEffect } from 'react';
import { videoExtractionService } from '@/services/videoExtractionService';

interface HybridVideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const HybridVideoPlayer: React.FC<HybridVideoPlayerProps> = ({
  videoUrl,
  title = 'Video',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isYouTube, setIsYouTube] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    if (videoExtractionService.isYouTubeUrl(videoUrl)) {
      setIsYouTube(true);
      setEmbedUrl(videoExtractionService.convertToEmbedUrl(videoUrl));
    } else {
      setIsYouTube(false);
      setEmbedUrl(videoUrl);
    }
  }, [videoUrl]);

  // Pause video when tab becomes hidden (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        console.log('📱 Tab hidden: Pausing hybrid video');
        handlePause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (iframeRef.current) {
      // Send play command to iframe
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handlePause = () => {
    if (iframeRef.current) {
      // Send pause command to iframe
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      setIsPlaying(false);
      onPause?.();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (iframeRef.current) {
      const seekTime = parseFloat(e.target.value);
      // Send seek command to iframe
      iframeRef.current.contentWindow?.postMessage(`{"event":"command","func":"seekTo","args":"${seekTime},true"}`, '*');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (iframeRef.current) {
      const volume = parseInt(e.target.value);
      // Send volume command to iframe
      iframeRef.current.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":"${volume}"}`, '*');
    }
  };

  const toggleMute = () => {
    if (iframeRef.current) {
      // Send mute/unmute command to iframe
      iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
    }
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  // Listen for iframe events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'video-progress':
          onTimeUpdate?.(data.currentTime, data.duration);
          break;
        case 'video-ended':
          setIsPlaying(false);
          onEnded?.();
          break;
        case 'video-paused':
          setIsPlaying(false);
          onPause?.();
          break;
        case 'video-playing':
          setIsPlaying(true);
          onPlay?.();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPlay, onPause, onEnded, onTimeUpdate]);

  if (!isYouTube) {
    // For non-YouTube videos, use regular video element
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`} style={{ aspectRatio: '16/9' }}>
        <video
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            onTimeUpdate?.(video.currentTime, video.duration);
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`} 
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube iframe with custom parameters */}
      <iframe
        ref={iframeRef}
        src={`${embedUrl}&enablejsapi=1&origin=${window.location.origin}&controls=0&modestbranding=1&rel=0&showinfo=0`}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Custom Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-4 transition-opacity duration-300">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <i className={`ri-${isPlaying ? 'pause' : 'play'}-line text-2xl`}></i>
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <i className="ri-volume-up-line text-xl"></i>
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                YouTube Video
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                <i className="ri-fullscreen-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
          >
            <i className="ri-play-line text-4xl"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default HybridVideoPlayer;
