import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { videoExtractionService, VideoStream } from '../../services/videoExtractionService';
import { instantPreloadService, predictivePreload, instantLoad } from '../../services/instantPreloadService';
import SimpleDCODESpinner from '../base/SimpleDCODESpinner';

interface HLSQuality {
  height: number;
  width: number;
  bitrate: number;
  level: number;
  name: string;
}

interface CustomVideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  title?: string;
  forceCustomPlayer?: boolean;
  progressCheckpoints?: number[];
  onProgressCheckpoint?: (currentTime: number, checkpoint: number) => Promise<boolean>;
  className?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUrl,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Format time to show hours when duration > 60 minutes
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      // Show hours:minutes:seconds format (e.g., 2:25:43)
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Show minutes:seconds format (e.g., 25:43)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
  
  // Basic state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Video streams
  const [availableStreams, setAvailableStreams] = useState<VideoStream[]>([]);
  const [directVideoUrl, setDirectVideoUrl] = useState<string | null>(null);
  const [directAudioUrl, setDirectAudioUrl] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [currentStreamType, setCurrentStreamType] = useState<'combined' | 'separate' | 'video' | 'audio'>('combined');
  const [initialized, setInitialized] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<{start: number, end: number}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showSkipIndicator, setShowSkipIndicator] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showArrowSkipIndicator, setShowArrowSkipIndicator] = useState(false);
  const [arrowSkipAmount, setArrowSkipAmount] = useState(0);
  
  // HLS-related state
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [hlsQualities, setHlsQualities] = useState<HLSQuality[]>([]);
  const [currentHLSQuality, setCurrentHLSQuality] = useState<number>(-1);
  const [isHLSStream, setIsHLSStream] = useState(false);
  const [hlsStats, setHlsStats] = useState({
    bandwidth: 0,
    droppedFrames: 0,
    loadedFragments: 0,
    bufferedSegments: 0
  });
  
  // HLS-like seeking features for regular videos
  const [hlsLikeSeeking, setHlsLikeSeeking] = useState(false);
  const [seekSegments, setSeekSegments] = useState<{start: number, end: number, quality: string}[]>([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [seekBuffer, setSeekBuffer] = useState<{start: number, end: number}[]>([]);
  const [adaptiveSeeking, setAdaptiveSeeking] = useState(true);
  const [seekPerformance, setSeekPerformance] = useState({
    lastSeekTime: 0,
    seekDuration: 0,
    seekAccuracy: 0
  });
  
  // 1080p optimization features
  const [highQualityOptimization, setHighQualityOptimization] = useState(true);
  const [preloadStrategy, setPreloadStrategy] = useState<'aggressive' | 'balanced' | 'conservative'>('aggressive');
  const [bufferOptimization, setBufferOptimization] = useState(true);
  const [extractionSpeed, setExtractionSpeed] = useState<'fast' | 'balanced' | 'quality'>('fast');
  const [adaptiveBufferSize, setAdaptiveBufferSize] = useState(30); // Dynamic buffer size
  
  // Simplified seeking system with fast mode
  const [seekingSync, setSeekingSync] = useState({
    isSeeking: false,
    targetTime: 0,
    syncTolerance: 0.2, // 200ms tolerance (more forgiving)
    maxSyncAttempts: 2, // Reduced attempts for faster response
    currentSyncAttempt: 0,
    fastMode: true // Enable fast seeking mode
  });
  const [seekingPerformance, setSeekingPerformance] = useState({
    totalSeeks: 0,
    successfulSeeks: 0,
    lastSeekDuration: 0
  });
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [syncCooldown, setSyncCooldown] = useState(false);
  const [lastSyncCall, setLastSyncCall] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Network speed detection using local resources
  useEffect(() => {
    const detectNetworkSpeed = async () => {
      try {
        // Use the backend server for network speed detection instead of external resources
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://49.204.168.41:3001';
        const startTime = performance.now();
        const response = await fetch(`${backendUrl}/api/health`, { 
          method: 'GET',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration < 50) {
          setNetworkSpeed('fast');
        } else if (duration < 150) {
          setNetworkSpeed('medium');
        } else {
          setNetworkSpeed('slow');
        }
        
        console.log(`🌐 Network Speed: ${networkSpeed} (${duration.toFixed(0)}ms)`);
      } catch (error) {
        console.warn('Network speed detection failed, using fallback method:', error);
        
        // Fallback: Use navigator.connection if available
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          if (connection.effectiveType) {
            switch (connection.effectiveType) {
              case '4g':
                setNetworkSpeed('fast');
                break;
              case '3g':
                setNetworkSpeed('medium');
                break;
              case '2g':
              case 'slow-2g':
                setNetworkSpeed('slow');
                break;
              default:
                setNetworkSpeed('medium');
            }
            console.log(`🌐 Network Speed (fallback): ${networkSpeed} (${connection.effectiveType})`);
          } else {
            setNetworkSpeed('medium'); // Default to medium
            console.log('🌐 Network Speed: medium (default)');
          }
        } else {
          setNetworkSpeed('medium'); // Default to medium
          console.log('🌐 Network Speed: medium (default)');
        }
      }
    };
    
    detectNetworkSpeed();
  }, []);

  // Handle video URL changes
  useEffect(() => {
    if (directVideoUrl && videoRef.current) {
      // Reset duration when new video loads
      setDuration(0);
      setCurrentTime(0);
      setAudioLoaded(false);
      setAudioError(false);
      setSyncCooldown(false);
      setLastSyncTime(0);
      setLastSyncCall(0);
      console.log('🔄 Video URL changed, resetting duration and audio states');
    }
  }, [directVideoUrl]);

  // Handle volume and muted state changes for video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      console.log(`🔊 Video element: volume=${volume}, muted=${isMuted}`);
    }
  }, [volume, isMuted]);

  // Handle video URL changes - ensure video element is properly reloaded when quality changes
  // This ensures the video element always uses the selected quality URL
  useEffect(() => {
    if (videoRef.current && directVideoUrl) {
      const currentSrc = videoRef.current.src || '';
      const newSrc = directVideoUrl;
      
      // Only reload if the URL actually changed (avoid unnecessary reloads)
      if (currentSrc !== newSrc) {
        console.log(`🔄 Video URL changed - Updating video element to use selected quality`);
        console.log(`   Selected Quality: ${currentQuality}`);
        console.log(`   Old URL: ${currentSrc.substring(0, 80)}...`);
        console.log(`   New URL: ${newSrc.substring(0, 80)}...`);
        
        // Store playback state
        const wasPlaying = !videoRef.current.paused;
        const currentTime = videoRef.current.currentTime;
        
        // Update video source to use selected quality
        videoRef.current.pause();
        videoRef.current.src = newSrc;
        videoRef.current.load();
        
        // Restore playback position and state after load
        const handleCanPlay = () => {
          if (videoRef.current) {
            videoRef.current.currentTime = currentTime;
            if (wasPlaying) {
              videoRef.current.play().catch(err => {
                console.warn('Failed to auto-play after quality change:', err);
              });
            }
            videoRef.current.removeEventListener('canplay', handleCanPlay);
          }
        };
        
        videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      }
    }
  }, [directVideoUrl, currentQuality]);

  // Handle audio URL changes - ensure audio element is properly updated
  useEffect(() => {
    if (audioRef.current && directAudioUrl) {
      console.log('🔄 Setting new audio URL:', directAudioUrl);
      audioRef.current.src = directAudioUrl;
      audioRef.current.load();
      setAudioLoaded(false);
      setAudioError(false);
    } else if (audioRef.current && !directAudioUrl) {
      // Clear audio element if no audio URL
      console.log('🔄 Clearing audio element (no audio URL)');
      audioRef.current.src = '';
      audioRef.current.load();
      setAudioLoaded(false);
      setAudioError(false);
    }
  }, [directAudioUrl]);

  // Handle stream type changes - ensure proper audio handling
  useEffect(() => {
    console.log(`🎬 Stream type changed to: ${currentStreamType}`);
    if (currentStreamType === 'combined') {
      // For combined streams, ensure audio element is cleared
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        console.log('🔄 Audio element cleared for combined stream');
      }
      setDirectAudioUrl(null);
      setAudioLoaded(false);
      setAudioError(false);
    }
  }, [currentStreamType]);

  // Enhanced Audio-Video sync function with cooldown to prevent seeking loops
  const syncAudioWithVideo = () => {
    // Only sync for separate streams - combined streams don't need sync
    if (currentStreamType !== 'separate') {
      return;
    }
    
    if (videoRef.current && audioRef.current && audioRef.current.src) {
      const now = Date.now();
      
      // Throttle sync calls to prevent excessive seeking
      if (now - lastSyncCall < 100) { // Only sync every 100ms
        return;
      }
      setLastSyncCall(now);
      
      const videoTime = videoRef.current.currentTime;
      const audioTime = audioRef.current.currentTime;
      const timeDiff = Math.abs(videoTime - audioTime);
      
      // Prevent rapid sync corrections that cause seeking loops
      if (syncCooldown && (now - lastSyncTime) < 1000) { // 1 second cooldown
        return;
      }
      
      // More aggressive sync during seeking or if difference is significant
      const syncThreshold = (isSeeking || seekingSync.isSeeking) ? 0.1 : 0.2; // Use both seeking states
      
      if (timeDiff > syncThreshold) {
        console.log('🔄 Syncing audio with video:', videoTime.toFixed(3), 'vs', audioTime.toFixed(3), `(diff: ${timeDiff.toFixed(3)}s)`);
        
        // Set cooldown to prevent rapid corrections
        setSyncCooldown(true);
        setLastSyncTime(now);
        
        // Clear cooldown after delay
        setTimeout(() => {
          setSyncCooldown(false);
        }, 1000);
        
        audioRef.current.currentTime = videoTime;
        
        // If video is playing but audio is paused, resume audio (only if audio is loaded)
        if (!videoRef.current.paused && audioRef.current.paused && audioRef.current.src && !audioError) {
          audioRef.current.play().catch(err => {
            console.warn('Failed to resume audio during sync:', err);
            // Try to reload audio if it consistently fails
            if (audioRef.current.readyState === 0) { // HAVE_NOTHING
              console.log('🔄 Audio not loaded, attempting to reload');
              audioRef.current.load();
            }
          });
        }
      }
    }
  };

  // HLS Utility Functions
  const isHLSURL = (url: string): boolean => {
    return url.includes('.m3u8') || url.includes('hls') || url.includes('m3u8');
  };

  const initializeHLS = (url: string) => {
    if (!Hls.isSupported()) {
      console.log('HLS not supported, falling back to native video');
      return false;
    }

    if (hlsInstance) {
      hlsInstance.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      maxFragLookUpTolerance: 0.25,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      liveDurationInfinity: true,
      liveBackBufferLength: 0,
      maxLiveSyncPlaybackRate: 1.5,
      liveSyncDuration: 2,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 1000,
      startFragPrefetch: true,
      testBandwidth: true,
      progressive: false
    });

    hls.loadSource(url);
    hls.attachMedia(videoRef.current!);

    // HLS Event Handlers
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log('🎬 HLS Manifest parsed:', data);
      setIsHLSStream(true);
      
      // Extract quality levels
      const qualities: HLSQuality[] = data.levels.map((level, index) => ({
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        level: index,
        name: `${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`
      }));
      
      setHlsQualities(qualities);
      setCurrentHLSQuality(hls.currentLevel);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      console.log('🔄 HLS Quality switched to:', data.level);
      setCurrentHLSQuality(data.level);
    });

    hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
      setHlsStats(prev => ({
        ...prev,
        loadedFragments: prev.loadedFragments + 1
      }));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('❌ HLS Error:', data);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('🔄 Fatal network error, trying to recover...');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('🔄 Fatal media error, trying to recover...');
            hls.recoverMediaError();
            break;
          default:
            console.log('🔄 Fatal error, destroying HLS...');
            hls.destroy();
            break;
        }
      }
    });

    hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
      setHlsStats(prev => ({
        ...prev,
        bandwidth: data.details.totalduration ? Math.round(data.details.totalduration * 8) : 0
      }));
    });

    setHlsInstance(hls);
    return true;
  };

  const changeHLSQuality = (level: number) => {
    if (hlsInstance && hlsInstance.levels.length > level) {
      hlsInstance.currentLevel = level;
      setCurrentHLSQuality(level);
    }
  };

  const getHLSStats = () => {
    if (!hlsInstance) return null;
    
    return {
      currentLevel: hlsInstance.currentLevel,
      levels: hlsInstance.levels.length,
      bandwidth: hlsStats.bandwidth,
      loadedFragments: hlsStats.loadedFragments,
      bufferedSegments: hlsStats.bufferedSegments
    };
  };

  // HLS-like seeking functions for regular videos
  const createSeekSegments = (duration: number, quality: string) => {
    const segmentDuration = 10; // 10-second segments like HLS
    const segments = [];
    
    for (let i = 0; i < duration; i += segmentDuration) {
      segments.push({
        start: i,
        end: Math.min(i + segmentDuration, duration),
        quality: quality
      });
    }
    
    setSeekSegments(segments);
    console.log(`🎬 Created ${segments.length} seek segments for ${quality} quality`);
  };

  const findNearestSegment = (seekTime: number) => {
    return seekSegments.find(segment => 
      seekTime >= segment.start && seekTime <= segment.end
    );
  };

  const hlsLikeSeek = (seekTime: number) => {
    if (!videoRef.current || !adaptiveSeeking) {
      // Fallback to regular seeking
      videoRef.current.currentTime = seekTime;
      return;
    }

    const startTime = performance.now();
    console.log(`🎯 HLS-like seeking to ${seekTime.toFixed(2)}s`);

    // Find the nearest segment
    const targetSegment = findNearestSegment(seekTime);
    if (targetSegment) {
      console.log(`🎯 Found segment: ${targetSegment.start}-${targetSegment.end}s (${targetSegment.quality})`);
      setCurrentSegment(seekSegments.indexOf(targetSegment));
    }

    // Perform the seek
    videoRef.current.currentTime = seekTime;

    // Measure seek performance
    const endTime = performance.now();
    const seekDuration = endTime - startTime;
    const seekAccuracy = Math.abs(videoRef.current.currentTime - seekTime);

    setSeekPerformance({
      lastSeekTime: seekTime,
      seekDuration: seekDuration,
      seekAccuracy: seekAccuracy
    });

    console.log(`✅ HLS-like seek completed in ${seekDuration.toFixed(2)}ms (accuracy: ${seekAccuracy.toFixed(3)}s)`);

    // Update seek buffer
    updateSeekBuffer(seekTime);
  };

  // Comprehensive audio-video sync verification
  const verifyAudioVideoSync = () => {
    // Only verify sync for separate streams - combined streams don't need sync
    if (currentStreamType !== 'separate') {
      return;
    }
    
    if (!videoRef.current || !audioRef.current || !audioRef.current.src || audioError) {
      return;
    }
    
    const videoTime = videoRef.current.currentTime;
    const audioTime = audioRef.current.currentTime;
    const timeDiff = Math.abs(videoTime - audioTime);
    const videoPlaying = !videoRef.current.paused;
    const audioPlaying = !audioRef.current.paused;
    
    // Check 1: Time sync correction
    if (timeDiff > 0.1) {
      console.log(`🔧 Sync correction: Video=${videoTime.toFixed(2)}s, Audio=${audioTime.toFixed(2)}s, Diff=${timeDiff.toFixed(2)}s`);
      audioRef.current.currentTime = videoTime;
    }
    
    // Check 2: Audio not playing while video is playing
    if (videoPlaying && !audioPlaying) {
      console.log('🔧 Audio not playing while video is playing - resuming audio');
      audioRef.current.currentTime = videoTime;
      audioRef.current.play().then(() => {
        console.log('🎯 Audio resumed after detection');
      }).catch(() => {
        console.warn('Failed to resume audio after detection');
      });
    }
    
    // Check 3: Audio playing while video is paused (shouldn't happen)
    if (!videoPlaying && audioPlaying) {
      console.log('🔧 Audio playing while video is paused - pausing audio');
      audioRef.current.pause();
    }
    
    // Check 4: Audio ready state issues
    if (audioRef.current.readyState < 2) { // HAVE_CURRENT_DATA
      console.log('🔧 Audio not ready, attempting to load');
      audioRef.current.load();
    }
  };

  // YouTube-style seeking function with perfect sync
  const youtubeStyleSeek = (targetTime: number) => {
    if (!videoRef.current) return;
    
    const wasPlaying = !videoRef.current.paused;
    
    // Set seeking state to prevent conflicts with native events
    setSeekingSync(prev => ({ ...prev, isSeeking: true }));
    
    // Step 1: Set both audio and video to the same time simultaneously (only for separate streams)
    videoRef.current.currentTime = targetTime;
    if (audioRef.current && currentStreamType === 'separate') {
      audioRef.current.currentTime = targetTime;
    }
    
    // Step 2: Resume both audio and video simultaneously for perfect sync
    if (wasPlaying) {
      // Start both video and audio at exactly the same time
      const videoPlayPromise = videoRef.current.play().catch(() => {});
      
      // Try to play audio - check if audio element exists and has a source (only for separate streams)
      if (audioRef.current && audioRef.current.src && !audioError && currentStreamType === 'separate') {
        const audioPlayPromise = audioRef.current.play().catch(() => {});
        
        // Wait for both to start playing to ensure sync
        Promise.all([videoPlayPromise, audioPlayPromise]).then(() => {
          // Both are now playing in perfect sync
          console.log(`🎯 YouTube-style seek completed: ${targetTime.toFixed(1)}s (Perfect Sync)`);
          
          // Clear seeking state
          setSeekingSync(prev => ({ ...prev, isSeeking: false }));
          
          // Verify sync after a short delay
          setTimeout(() => {
            verifyAudioVideoSync();
            forceAudioResumeAfterSeek();
          }, 100);
        }).catch(() => {
          // If any fail, try individual recovery
          videoRef.current.play().catch(() => {});
          if (audioRef.current && audioRef.current.src && !audioError) {
            audioRef.current.play().catch(() => {});
          }
          setSeekingSync(prev => ({ ...prev, isSeeking: false }));
        });
      } else {
        // Only video available or audio error
        console.log(`🎯 YouTube-style seek: Audio not available (src: ${audioRef.current?.src}, error: ${audioError})`);
        videoPlayPromise.then(() => {
          console.log(`🎯 YouTube-style seek completed: ${targetTime.toFixed(1)}s (Video Only)`);
          setSeekingSync(prev => ({ ...prev, isSeeking: false }));
        });
      }
    } else {
      // Not playing, just clear seeking state
      setSeekingSync(prev => ({ ...prev, isSeeking: false }));
    }
  };

  // Fast seeking function with perfect sync
  const fastSeek = (targetTime: number) => {
    if (!videoRef.current) return;
    
    const wasPlaying = !videoRef.current.paused;
    
    // Step 1: Set both audio and video to the same time simultaneously (only for separate streams)
    videoRef.current.currentTime = targetTime;
    if (audioRef.current && currentStreamType === 'separate') {
      audioRef.current.currentTime = targetTime;
    }
    
    // Step 2: Resume both audio and video simultaneously for perfect sync
    if (wasPlaying) {
      // Start both video and audio at exactly the same time
      const videoPlayPromise = videoRef.current.play().catch(() => {});
      
      if (audioRef.current && audioLoaded && !audioError && currentStreamType === 'separate') {
        const audioPlayPromise = audioRef.current.play().catch(() => {});
        
        // Wait for both to start playing to ensure sync
        Promise.all([videoPlayPromise, audioPlayPromise]).then(() => {
          console.log(`⚡ Fast seek completed: ${targetTime.toFixed(1)}s (Perfect Sync)`);
        }).catch(() => {
          // If any fail, try individual recovery
          videoRef.current.play().catch(() => {});
          if (audioRef.current && audioLoaded && !audioError) {
            audioRef.current.play().catch(() => {});
          }
        });
      } else {
        // Only video available
        videoPlayPromise.then(() => {
          console.log(`⚡ Fast seek completed: ${targetTime.toFixed(1)}s (Video Only)`);
        });
      }
    }
  };

  // Simplified seeking with audio-video synchronization
  const enhancedSeek = async (targetTime: number) => {
    if (!videoRef.current) {
      return;
    }

    // Use YouTube-style seeking by default
    youtubeStyleSeek(targetTime);
    return;

    const seekStartTime = performance.now();
    
    // Initialize seeking state
    setSeekingSync(prev => ({
      ...prev,
      isSeeking: true,
      targetTime: targetTime,
      currentSyncAttempt: 0
    }));

    try {
      // Step 1: Pause both audio and video
      const wasPlaying = !videoRef.current.paused;
      videoRef.current.pause();
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      // Step 2: Preload around seek point to reduce buffering
      if (videoRef.current) {
        // Set aggressive preload for faster seeking
        videoRef.current.preload = 'auto';
        
        // Preload by seeking to nearby points
        const preloadTime = targetTime + 5; // Preload 5 seconds ahead
        if (preloadTime < videoRef.current.duration) {
          videoRef.current.currentTime = preloadTime;
          setTimeout(() => {
            videoRef.current.currentTime = targetTime;
          }, 5);
        } else {
          videoRef.current.currentTime = targetTime;
        }
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
      }

      // Step 3: Minimal wait for faster seeking
      await new Promise(resolve => setTimeout(resolve, 10));

      // Step 4: Resume playback simultaneously if it was playing
      if (wasPlaying) {
        // Start both video and audio at the same time
        const playPromises = [];
        
        // Start video
        const videoPlayPromise = videoRef.current.play();
        playPromises.push(videoPlayPromise);
        
        // Start audio if available
        if (audioRef.current && audioLoaded && !audioError) {
          const audioPlayPromise = audioRef.current.play();
          playPromises.push(audioPlayPromise);
        }
        
        // Wait for both to start playing
        Promise.all(playPromises).then(() => {
          // Both video and audio are now playing
        }).catch(() => {
          // If any fail, try individual recovery
          videoRef.current.play().catch(() => {});
          if (audioRef.current && audioLoaded && !audioError) {
            audioRef.current.play().catch(() => {});
          }
        });
      }

      // Update performance stats
      const seekEndTime = performance.now();
      const totalSeekTime = seekEndTime - seekStartTime;
      
      setSeekingPerformance(prev => ({
        ...prev,
        totalSeeks: prev.totalSeeks + 1,
        successfulSeeks: prev.successfulSeeks + 1,
        lastSeekDuration: totalSeekTime
      }));

    } catch (error) {
      setSeekingPerformance(prev => ({
        ...prev,
        totalSeeks: prev.totalSeeks + 1,
        lastSeekDuration: performance.now() - seekStartTime
      }));
    } finally {
      setSeekingSync(prev => ({
        ...prev,
        isSeeking: false,
        currentSyncAttempt: 0
      }));
    }
  };

  // Enhanced audio resumption check with simultaneous playback
  const checkAudioResumption = () => {
    // Only check audio resumption for separate streams
    if (currentStreamType !== 'separate') return;
    
    if (!audioRef.current || !videoRef.current) return;
    
    const videoPlaying = !videoRef.current.paused;
    const audioPlaying = !audioRef.current.paused;
    
    // Try to resume audio if video is playing but audio is not
    if (videoPlaying && !audioPlaying && audioRef.current.src && !audioError) {
      // Sync audio time to video time first
      audioRef.current.currentTime = videoRef.current.currentTime;
      
      // Start audio to play with video
      audioRef.current.play().then(() => {
        console.log('🎯 Audio resumed successfully with video');
      }).catch(() => {
        // If audio fails, try again with a longer delay
        setTimeout(() => {
          if (audioRef.current && !videoRef.current.paused) {
            audioRef.current.currentTime = videoRef.current.currentTime;
            audioRef.current.play().catch(() => {
              console.warn('Audio resumption failed after retry');
            });
          }
        }, 100);
      });
    }
  };

  // Force audio resumption after seeking
  const forceAudioResumeAfterSeek = () => {
    // Only force audio resumption for separate streams
    if (currentStreamType !== 'separate') return;
    
    if (!audioRef.current || !videoRef.current) return;
    
    const videoPlaying = !videoRef.current.paused;
    const audioPlaying = !audioRef.current.paused;
    
    console.log('🔧 Force audio resume check:', {
      videoPlaying,
      audioPlaying,
      audioSrc: audioRef.current.src,
      audioError,
      audioReadyState: audioRef.current.readyState
    });
    
    // Force audio to play if video is playing but audio is not
    if (videoPlaying && !audioPlaying && audioRef.current.src) {
      console.log('🔧 Forcing audio to resume...');
      
      // Sync audio time to video time
      audioRef.current.currentTime = videoRef.current.currentTime;
      
      // Try multiple times to play audio
      const tryPlayAudio = (attempt: number) => {
        if (attempt > 3) {
          console.warn('🔧 Audio resumption failed after 3 attempts');
          return;
        }
        
        audioRef.current.play().then(() => {
          console.log(`🎯 Audio resumed successfully on attempt ${attempt}`);
        }).catch((error) => {
          console.warn(`🔧 Audio play attempt ${attempt} failed:`, error);
          setTimeout(() => tryPlayAudio(attempt + 1), 200 * attempt);
        });
      };
      
      tryPlayAudio(1);
    }
  };

  // Simplified audio resumption with simultaneous playback
  const forceAudioResume = () => {
    if (!audioRef.current || !videoRef.current) return;
    
    const videoPlaying = !videoRef.current.paused;
    const audioPlaying = !audioRef.current.paused;
    
    if (videoPlaying && !audioPlaying && audioLoaded && !audioError) {
      // Sync audio time to video time
      audioRef.current.currentTime = videoRef.current.currentTime;
      
      // Start audio and ensure it plays with video
      audioRef.current.play().then(() => {
        // Audio started successfully
      }).catch(() => {
        // If audio fails, try again after a short delay
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }, 100);
      });
    }
  };


  const updateSeekBuffer = (seekTime: number) => {
    if (!videoRef.current) return;

    const buffer: {start: number, end: number}[] = [];
    const buffered = videoRef.current.buffered;

    for (let i = 0; i < buffered.length; i++) {
      buffer.push({
        start: buffered.start(i),
        end: buffered.end(i)
      });
    }

    setSeekBuffer(buffer);
  };

  const getSeekBufferHealth = () => {
    if (!videoRef.current || !seekBuffer.length) return 0;

    const currentTime = videoRef.current.currentTime;
    const currentBuffer = seekBuffer.find(buffer => 
      currentTime >= buffer.start && currentTime <= buffer.end
    );

    if (currentBuffer) {
      return currentBuffer.end - currentTime;
    }

    return 0;
  };

  const adaptiveSeekQuality = (seekTime: number) => {
    if (!availableStreams.length) return;

    const bufferHealth = getSeekBufferHealth();
    let targetQuality = currentQuality;

    // Adaptive quality based on buffer health
    if (bufferHealth < 5) {
      // Low buffer - use lower quality for faster seeking
      targetQuality = '360p';
    } else if (bufferHealth < 15) {
      // Medium buffer - use medium quality
      targetQuality = '480p';
    } else {
      // Good buffer - use higher quality
      targetQuality = '720p';
    }

    // Switch quality if needed
    if (targetQuality !== currentQuality) {
      console.log(`🔄 Adaptive seeking: Switching to ${targetQuality} for better seek performance`);
      switchToQuality(targetQuality);
    }
  };

  // Quality-specific Optimization Functions
  const optimizeForQuality = (quality: string) => {
    if (highQualityOptimization) {
      console.log(`🎬 Optimizing for ${quality} playback...`);
      
      // Quality-specific buffer sizes
      const qualityBuffers = {
        '360p': 45,
        '480p': 35,
        '720p': 25,
        '1080p': 15,
        '1440p': 12,
        '2160p': 10
      };
      
      const bufferSize = qualityBuffers[quality as keyof typeof qualityBuffers] || 30;
      setAdaptiveBufferSize(bufferSize);
      
      // Quality-specific preload strategies
      const preloadStrategies = {
        '360p': 'conservative', // Lower quality, less aggressive preloading
        '480p': 'balanced',
        '720p': 'aggressive',
        '1080p': 'aggressive',
        '1440p': 'aggressive',
        '2160p': 'aggressive'
      };
      
      const preloadStrategy = preloadStrategies[quality as keyof typeof preloadStrategies] || 'balanced';
      setPreloadStrategy(preloadStrategy as any);
      
      // Quality-specific extraction speeds
      const extractionSpeeds = {
        '360p': 'quality', // Lower quality, focus on quality over speed
        '480p': 'balanced',
        '720p': 'fast',
        '1080p': 'fast',
        '1440p': 'fast',
        '2160p': 'fast'
      };
      
      const extractionSpeed = extractionSpeeds[quality as keyof typeof extractionSpeeds] || 'balanced';
      setExtractionSpeed(extractionSpeed as any);
      
      console.log(`✅ ${quality} optimizations applied: Buffer=${bufferSize}s, Preload=${preloadStrategy}, Extraction=${extractionSpeed}`);
    } else {
      // Reset to normal settings when optimization is disabled
      setAdaptiveBufferSize(30);
      setPreloadStrategy('balanced');
      setExtractionSpeed('balanced');
    }
  };

  const getOptimalBufferSize = (quality: string, networkSpeed: string) => {
    const baseBuffer = {
      '360p': 45,
      '480p': 35,
      '720p': 25,
      '1080p': 15,
      '1440p': 12,
      '2160p': 10
    };

    const networkMultiplier = {
      'slow': 1.5,
      'medium': 1.0,
      'fast': 0.7
    };

    const qualityBuffer = baseBuffer[quality as keyof typeof baseBuffer] || 30;
    const networkFactor = networkMultiplier[networkSpeed as keyof typeof networkMultiplier] || 1.0;

    return Math.round(qualityBuffer * networkFactor);
  };

  const optimizeExtractionForQuality = (quality: string) => {
    console.log(`🚀 Optimizing extraction for ${quality}...`);
    
    const extractionConfigs = {
      '360p': {
        priority: 'quality', // Lower quality, focus on quality over speed
        format: 'mp4',
        quality: 'best',
        bufferSize: 2048, // Smaller buffer for lower quality
        concurrent: false
      },
      '480p': {
        priority: 'balanced',
        format: 'mp4',
        quality: 'best',
        bufferSize: 4096, // Standard buffer
        concurrent: false
      },
      '720p': {
        priority: 'speed',
        format: 'mp4',
        quality: 'best',
        bufferSize: 6144, // Larger buffer for faster extraction
        concurrent: true
      },
      '1080p': {
        priority: 'speed',
        format: 'mp4',
        quality: 'best',
        bufferSize: 8192, // Large buffer for fast extraction
        concurrent: true
      },
      '1440p': {
        priority: 'speed',
        format: 'mp4',
        quality: 'best',
        bufferSize: 10240, // Larger buffer for 1440p
        concurrent: true
      },
      '2160p': {
        priority: 'speed',
        format: 'mp4',
        quality: 'best',
        bufferSize: 12288, // Largest buffer for 4K extraction
        concurrent: true
      }
    };
    
    return extractionConfigs[quality as keyof typeof extractionConfigs] || {
      priority: 'balanced',
      format: 'mp4',
      quality: 'best',
      bufferSize: 4096,
      concurrent: false
    };
  };

  const preloadNextSegments = (currentTime: number, quality: string) => {
    // Don't preload if video hasn't loaded metadata yet
    if (!videoRef.current || !videoRef.current.duration || videoRef.current.duration === 0 || isNaN(videoRef.current.duration)) {
      return;
    }
    
    // Don't preload if video is stuck at 0 and not ready
    if (currentTime === 0 && videoRef.current.readyState < 2) {
      return;
    }
    
    if (preloadStrategy === 'aggressive') {
      // Quality-specific preload segments
      const preloadSegments = {
        '360p': 2, // Conservative preloading for lower quality
        '480p': 2,
        '720p': 3, // Aggressive preloading for higher quality
        '1080p': 3
      };
      
      const segmentCount = preloadSegments[quality as keyof typeof preloadSegments] || 2;
      const nextSegments = [];
      
      for (let i = 1; i <= segmentCount; i++) {
        nextSegments.push(currentTime + (i * 10));
      }
      
      nextSegments.forEach(segmentTime => {
        if (segmentTime < duration) {
          // Only log occasionally to reduce console spam
          if (Math.floor(currentTime) % 10 === 0) {
            console.log(`📥 Preloading ${quality} segment at ${segmentTime}s`);
          }
        }
      });
    } else if (preloadStrategy === 'balanced') {
      // Reduced logging - only log every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        console.log(`⚖️ Balanced preloading for ${quality}...`);
      }
      
      // Preload next 2 segments for balanced approach
      const nextSegments = [currentTime + 10, currentTime + 20];
      
      nextSegments.forEach(segmentTime => {
        if (segmentTime < duration) {
          // Silent preloading
        }
      });
    } else if (preloadStrategy === 'conservative') {
      // Preload only next 1 segment for conservative approach
      const nextSegment = currentTime + 10;
      
      if (nextSegment < duration) {
        // Silent preloading
      }
    }
  };

  const monitorQualityPerformance = () => {
    if (highQualityOptimization && videoRef.current && videoRef.current.duration > 0) {
      const bufferHealth = getSeekBufferHealth();
      const isBuffering = videoRef.current?.readyState < 3;
      
      // Only log every 10 seconds to reduce console spam
      if (Math.floor(videoRef.current.currentTime) % 10 === 0) {
        console.log(`📊 ${currentQuality} Performance: Buffer=${bufferHealth.toFixed(1)}s, Buffering=${isBuffering}`);
      }
      
      // Quality-specific buffer adjustments
      const qualityThresholds = {
        '360p': { low: 10, high: 50, reduce: 5, increase: 40 },
        '480p': { low: 8, high: 40, reduce: 4, increase: 30 },
        '720p': { low: 5, high: 30, reduce: 3, increase: 20 },
        '1080p': { low: 3, high: 20, reduce: 2, increase: 15 }
      };
      
      const thresholds = qualityThresholds[currentQuality as keyof typeof qualityThresholds];
      
      if (thresholds) {
        // Auto-adjust buffer size based on performance
        if (bufferHealth < thresholds.low && isBuffering) {
          console.log(`⚠️ ${currentQuality} buffering detected, reducing buffer size...`);
          setAdaptiveBufferSize(thresholds.reduce);
        } else if (bufferHealth > thresholds.high && !isBuffering) {
          console.log(`✅ ${currentQuality} performing well, increasing buffer size...`);
          setAdaptiveBufferSize(thresholds.increase);
        }
      }
    }
  };

  // Double-tap to skip forward (like YouTube)
  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    
    if (timeDiff < 300) { // Double tap within 300ms
      if (videoRef.current && duration > 0) {
        const skipAmount = 10; // Skip 10 seconds forward
        const newTime = Math.min(videoRef.current.currentTime + skipAmount, duration);
        
        // Show skip indicator
        setShowSkipIndicator(true);
        setTimeout(() => setShowSkipIndicator(false), 1000);
        
        // Use YouTube-style seeking for double-tap
        youtubeStyleSeek(newTime);
        
        console.log(`⏩ Double-tap: Skipped forward to ${newTime.toFixed(1)}s`);
      }
    }
    
    setLastTapTime(currentTime);
  };

  // Check if URL is a direct video file
  const isDirectVideoUrl = (url: string): boolean => {
    if (!url) return false;
    
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv', '.flv', '.wmv'];
    const lowerUrl = url.toLowerCase();
    
    // Check for video file extensions
    const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext));
    
    // Check for Supabase storage URLs
    const isSupabaseUrl = url.includes('supabase') || url.includes('storage.googleapis.com');
    
    // Check for direct video URLs (not YouTube, not HLS)
    const isNotYouTube = !url.includes('youtube.com') && !url.includes('youtu.be');
    const isNotHLS = !url.includes('.m3u8') && !url.includes('hls');
    
    return (hasVideoExtension || isSupabaseUrl) && isNotYouTube && isNotHLS;
  };

  // JET SPEED loading - start immediately when videoUrl is available
  useEffect(() => {
    if (videoUrl) {
      // Reset retry count for new video
      setRetryCount(0);
      
      // Clear audio element and reset audio state for new video
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        console.log('🔄 Audio element cleared for new video');
      }
      setDirectAudioUrl(null);
      setAudioLoaded(false);
      setAudioError(false);
      
      const startTime = performance.now();
      console.log('🚀 JET SPEED: Starting immediate video loading...');
      
      // Check if this is a direct video file (Supabase storage, MP4, etc.)
      if (isDirectVideoUrl(videoUrl)) {
        console.log('🎬 Direct video file detected (Supabase/Storage), optimizing for fast loading...');
        setIsLoading(true);
        setIsHLSStream(false);
        
        // Check if it's a Supabase URL for special optimization
        const isSupabaseUrl = videoUrl.includes('supabase') || videoUrl.includes('storage.googleapis.com');
        
        if (isSupabaseUrl) {
          console.log('⚡ Supabase video detected - Applying fast loading optimizations...');
          
          // Preload video metadata immediately for faster start
          const preloadVideo = async () => {
            try {
              // Create a hidden video element to preload metadata
              const preloadVideoEl = document.createElement('video');
              preloadVideoEl.preload = 'metadata';
              preloadVideoEl.crossOrigin = 'anonymous';
              preloadVideoEl.style.display = 'none';
              
              // Set up event handlers
              preloadVideoEl.addEventListener('loadedmetadata', () => {
                console.log('✅ Supabase video metadata preloaded - Ready for instant playback');
                document.body.removeChild(preloadVideoEl);
                setIsLoading(false);
              });
              
              preloadVideoEl.addEventListener('error', (e) => {
                console.warn('⚠️ Supabase video metadata preload error:', e);
                if (document.body.contains(preloadVideoEl)) {
                  document.body.removeChild(preloadVideoEl);
                }
                setIsLoading(false);
              });
              
              // Start loading metadata immediately
              preloadVideoEl.src = videoUrl;
              document.body.appendChild(preloadVideoEl);
              preloadVideoEl.load();
              
              // Also fetch the first chunk to start buffering
              try {
                const response = await fetch(videoUrl, {
                  method: 'HEAD', // Just get headers to check if range requests are supported
                  headers: {
                    'Range': 'bytes=0-1048576' // Request first 1MB
                  }
                });
                
                if (response.status === 206) {
                  console.log('✅ Range requests supported - Fast loading enabled');
                }
              } catch (fetchErr) {
                // Ignore fetch errors, video will still load normally
                console.log('ℹ️ Range request check failed, using standard loading');
              }
            } catch (err) {
              console.warn('⚠️ Preload error:', err);
              setIsLoading(false);
            }
          };
          
          // Start preloading immediately
          preloadVideo();
        }
        
        // Create a simple video stream object for direct videos
        const directStream: VideoStream = {
          url: videoUrl,
          quality: 'auto',
          type: 'combined'
        };
        
        setAvailableStreams([directStream]);
        setDirectVideoUrl(videoUrl);
        setCurrentQuality('auto');
        setCurrentStreamType('combined');
        setInitialized(true);
        
        // For Supabase videos, keep loading state until metadata is ready
        if (!isSupabaseUrl) {
          setIsLoading(false);
          console.log('✅ Direct video loaded successfully');
        }
        return;
      }
      
      // Check if this is an HLS stream
      if (isHLSURL(videoUrl)) {
        console.log('🎬 HLS stream detected, initializing HLS player...');
        setIsLoading(true);
        setIsHLSStream(true);
        
        if (initializeHLS(videoUrl)) {
          setDirectVideoUrl(videoUrl);
          setInitialized(true);
          setIsLoading(false);
          return;
        } else {
          console.log('❌ HLS initialization failed, falling back to regular video');
        }
      }
      
      // Check for JET SPEED cached streams first
      const cachedStreams = instantPreloadService.getPreloadedStreams(videoUrl);
      if (cachedStreams.length > 0) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        console.log(`🚀 JET SPEED: Found cached streams! Loading in ${duration}ms...`);
        
        // Validate cached streams don't contain embed URLs or expired URLs
        const cachedVideoUrl = cachedStreams[0].url;
        if (cachedVideoUrl.includes('youtube.com/embed/')) {
          console.error('❌ Cached stream contains embed URL, clearing cache and retrying');
          instantPreloadService.clearAllPreloadedVideos();
          // Continue to fresh extraction below
        } else if (instantPreloadService.isGoogleVideoUrlExpired(cachedVideoUrl)) {
          console.warn('⚠️ Cached Google Video URL is expired, clearing cache and re-extracting...');
          instantPreloadService.clearPreloadedVideo(videoUrl);
          // Continue to fresh extraction below
        } else {
          setAvailableStreams(cachedStreams);
          setDirectVideoUrl(cachedVideoUrl);
          // Start with highest quality available, prioritizing combined streams
          const highestQuality = cachedStreams.reduce((highest, current) => {
            const currentNum = parseInt(current.quality.replace('p', ''));
            const highestNum = parseInt(highest.quality.replace('p', ''));
            
            // Prioritize combined streams over separate streams
            if (current.type === 'combined' && highest.type !== 'combined') {
              return current;
            }
            if (highest.type === 'combined' && current.type !== 'combined') {
              return highest;
            }
            
            // If both are same type, choose higher quality
            return currentNum > highestNum ? current : highest;
          });
          setCurrentQuality(highestQuality.quality);
          setCurrentStreamType(highestQuality.type);
          console.log(`🎬 Initial stream selected: ${highestQuality.quality} (${highestQuality.type})`);
          if (highestQuality.type === 'separate' && highestQuality.audioUrl) {
            setDirectAudioUrl(highestQuality.audioUrl);
          }
          setInitialized(true);
          setIsLoading(false);
          return;
        }
      }
      
      // If no cache, start ULTRA-FAST instant loading
      console.log('🚀 JET SPEED: Starting ultra-fast instant loading...');
      instantLoad(videoUrl)
        .then(streams => {
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          
          if (streams.length > 0) {
            console.log(`🚀 JET SPEED: Extraction complete in ${duration}ms!`);
            
            // Validate that we have a proper direct video URL, not an embed URL
            const videoUrl = streams[0].url;
            if (videoUrl.includes('youtube.com/embed/')) {
              console.error('❌ Received embed URL instead of direct video URL');
              setError('This video cannot be played with custom controls. The video may be private or restricted.');
              setIsLoading(false);
              return;
            }
            
            // Check if the URL is a direct Google Video URL that might be expired
            if (videoUrl.includes('googlevideo.com')) {
              console.warn('⚠️ Received direct Google Video URL - may expire soon');
              // We'll still try to use it, but add a retry mechanism
            }
            
            setAvailableStreams(streams);
            setDirectVideoUrl(videoUrl);
            // Start with highest quality available, prioritizing combined streams
            const highestQuality = streams.reduce((highest, current) => {
              const currentNum = parseInt(current.quality.replace('p', ''));
              const highestNum = parseInt(highest.quality.replace('p', ''));
              
              // Prioritize combined streams over separate streams
              if (current.type === 'combined' && highest.type !== 'combined') {
                return current;
              }
              if (highest.type === 'combined' && current.type !== 'combined') {
                return highest;
              }
              
              // If both are same type, choose higher quality
              return currentNum > highestNum ? current : highest;
            });
            setCurrentQuality(highestQuality.quality);
            setCurrentStreamType(highestQuality.type);
            console.log(`🎬 Initial stream selected: ${highestQuality.quality} (${highestQuality.type})`);
            if (highestQuality.type === 'separate' && highestQuality.audioUrl) {
              setDirectAudioUrl(highestQuality.audioUrl);
            }
            
            // Enable HLS-like seeking for regular videos
            setHlsLikeSeeking(true);
            setAdaptiveSeeking(true);
            console.log('🎬 HLS-like seeking enabled for regular video');
            
            setInitialized(true);
            setIsLoading(false);
          }
        })
        .catch(err => {
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          console.error(`❌ JET SPEED: Extraction failed after ${duration}ms:`, err);
          
          // Check if this might be a direct video URL that failed extraction
          if (isDirectVideoUrl(videoUrl)) {
            console.log('🎬 Attempting direct video fallback for:', videoUrl);
            
            // Create a simple video stream object for direct videos
            const directStream: VideoStream = {
              url: videoUrl,
              quality: 'auto',
              type: 'combined'
            };
            
            setAvailableStreams([directStream]);
            setDirectVideoUrl(videoUrl);
            setCurrentQuality('auto');
            setCurrentStreamType('combined');
            setInitialized(true);
            setIsLoading(false);
            console.log('✅ Direct video fallback loaded successfully');
            return;
          }
          
          // Handle specific error types
          if (err.message?.includes('private')) {
            setError('This video is private and requires authentication to access.');
          } else if (err.message?.includes('unlisted')) {
            setError('This unlisted video cannot be accessed at this time.');
          } else if (err.message?.includes('restricted')) {
            setError('This video is restricted and cannot be played.');
          } else {
            setError('Failed to load video');
          }
          
          setIsLoading(false);
        });
    }
  }, [videoUrl]);

  // This is now handled by ULTRA-INSTANT loading above

  // Quality switching function
  const switchToQuality = (quality: string, isManual = false) => {
    // Find all streams with the requested quality
    const matchingStreams = availableStreams.filter(stream => stream.quality === quality);
    if (matchingStreams.length === 0) return;
    
    // Prioritize combined streams over separate streams for the same quality
    const targetStream = matchingStreams.reduce((best, current) => {
      if (current.type === 'combined' && best.type !== 'combined') {
        return current;
      }
      if (best.type === 'combined' && current.type !== 'combined') {
        return best;
      }
      // If both are same type, return the first one (they should be equivalent)
      return best;
    });
    
    const currentTime = videoRef.current?.currentTime || 0;
    const wasPlaying = !videoRef.current?.paused;
    
    console.log(`🎯 Switching to ${quality} quality${isManual ? ' (manual)' : ' (adaptive)'} - Using ${targetStream.type} stream`);
    
    // Apply quality-specific optimizations
    optimizeForQuality(quality);
    
    // Get optimal buffer size for this quality
    const optimalBuffer = getOptimalBufferSize(quality, networkSpeed);
    setAdaptiveBufferSize(optimalBuffer);
    
    // If manual selection, stabilize quality for the entire video
    if (isManual) {
      setManualQualityOverride(true);
      setQualityStabilized(true);
      console.log('🔒 Quality stabilized for entire video after manual selection');
    }
    
    // Pause video temporarily
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Set new video URL and force reload
    console.log(`📹 Setting video URL for ${quality}:`, targetStream.url.substring(0, 100) + '...');
    console.log(`📊 Stream details:`, {
      quality: targetStream.quality,
      type: targetStream.type,
      width: targetStream.width,
      height: targetStream.height,
      url: targetStream.url.substring(0, 80) + '...'
    });
    
    setDirectVideoUrl(targetStream.url);
    setCurrentQuality(quality);
    setCurrentStreamType(targetStream.type);
    
    // Set audio URL if separate
    if (targetStream.type === 'separate' && targetStream.audioUrl) {
      console.log(`🔊 Setting audio URL:`, targetStream.audioUrl.substring(0, 100) + '...');
      setDirectAudioUrl(targetStream.audioUrl);
    } else {
      setDirectAudioUrl(null);
    }
    
    // Force video element to reload with new source - ensure it uses the selected quality
    if (videoRef.current) {
      // Pause and update source to selected quality URL
      videoRef.current.pause();
      
      // Ensure we're using the exact URL from the selected quality stream
      const qualityUrl = targetStream.url;
      console.log(`🔄 Reloading video element with ${quality} quality URL`);
      
      // Update source directly
      videoRef.current.src = qualityUrl;
      videoRef.current.load(); // Force reload with new quality
      
      // Wait for metadata to load before seeking and playing
      const handleLoadedMetadata = () => {
        if (videoRef.current && videoRef.current.src === qualityUrl) {
          const actualWidth = videoRef.current.videoWidth;
          const actualHeight = videoRef.current.videoHeight;
          console.log(`✅ Video loaded for ${quality}`);
          console.log(`   Expected: ${targetStream.width}x${targetStream.height}`);
          console.log(`   Actual: ${actualWidth}x${actualHeight}`);
          console.log(`   URL: ${qualityUrl.substring(0, 100)}...`);
          
          // Restore playback position
          videoRef.current.currentTime = currentTime;
          
          if (audioRef.current && targetStream.type === 'separate' && targetStream.audioUrl) {
            audioRef.current.currentTime = currentTime;
          }
          
          // Resume playback if it was playing
          if (wasPlaying) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log(`▶️ Video resumed at ${quality} quality`);
              }).catch(err => {
                console.warn('Failed to play after quality switch:', err);
              });
            }
            
            if (audioRef.current && targetStream.type === 'separate' && targetStream.audioUrl) {
              audioRef.current.play().catch(err => {
                console.warn('Failed to play audio after quality switch:', err);
              });
            }
          }
          
          // Remove the event listener after use
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      
      // Also handle canplay event as backup
      const handleCanPlay = () => {
        if (videoRef.current && videoRef.current.src === qualityUrl && wasPlaying) {
          videoRef.current.play().catch(() => {});
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
      videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
    }
  };

  // Buffering handlers
  const handleBufferingStart = () => {
    console.log('⏳ Buffering started - maintaining sync');
    setIsBuffering(true);
    
    // Don't pause audio during buffering - let it continue to maintain sync
    // The sync system will handle any drift automatically
  };

  const handleBufferingEnd = () => {
    console.log('✅ Buffering ended - ensuring perfect sync');
    setIsBuffering(false);
    
    // Ensure perfect sync after buffering
    if (videoRef.current && audioRef.current && audioRef.current.src && !audioError) {
      // Sync audio time with video time
      audioRef.current.currentTime = videoRef.current.currentTime;
      
      // If video is playing, ensure audio is also playing
      if (!videoRef.current.paused && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          console.log('🎯 Audio resumed in perfect sync after buffering');
        }).catch(err => {
          console.warn('Audio resume failed after buffering:', err);
          // Try again after a short delay
          setTimeout(() => {
            if (audioRef.current && !videoRef.current.paused) {
              audioRef.current.currentTime = videoRef.current.currentTime;
              audioRef.current.play().catch(() => {});
            }
          }, 100);
        });
      }
    }
  };

  // Advanced buffering strategies
  const [bufferTarget, setBufferTarget] = useState(30); // Target buffer in seconds
  const [adaptiveBuffering, setAdaptiveBuffering] = useState(true);
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [predictivePreloading, setPredictivePreloading] = useState(true);
  const [userBehaviorPattern, setUserBehaviorPattern] = useState<'linear' | 'seek-heavy' | 'pause-heavy'>('linear');
  const [adaptiveQuality, setAdaptiveQuality] = useState(true);
  const [qualityHistory, setQualityHistory] = useState<{quality: string, timestamp: number, bufferHealth: number}[]>([]);
  const [manualQualityOverride, setManualQualityOverride] = useState(false);
  const [forceHighQuality, setForceHighQuality] = useState(false);
  const [qualityStabilized, setQualityStabilized] = useState(false);
  const [initialQualitySet, setInitialQualitySet] = useState(false);
  const [wasPlayingBeforeTabSwitch, setWasPlayingBeforeTabSwitch] = useState(false);
  const [showTabSwitchNotification, setShowTabSwitchNotification] = useState(false);

  // Set initial quality based on network speed and stabilize it
  const setInitialQualityBasedOnNetwork = () => {
    if (availableStreams.length === 0 || initialQualitySet) return;
    
    let targetQuality: string;
    
    switch (networkSpeed) {
      case 'fast':
        // Fast network: Use highest available quality (prioritize 2160p, 1440p, then 1080p)
        targetQuality = availableStreams.find(s => s.quality === '2160p')?.quality ||
                      availableStreams.find(s => s.quality === '1440p')?.quality ||
                      availableStreams.find(s => s.quality === '1080p')?.quality ||
                      availableStreams.reduce((highest, current) => {
                        const currentNum = parseInt(current.quality.replace('p', ''));
                        const highestNum = parseInt(highest.quality.replace('p', ''));
                        return currentNum > highestNum ? current : highest;
                      }).quality;
        break;
      case 'medium':
        // Medium network: Use 1080p, 1440p, or highest available below 2160p
        targetQuality = availableStreams.find(s => s.quality === '1440p')?.quality ||
                      availableStreams.find(s => s.quality === '1080p')?.quality ||
                      availableStreams.find(s => s.quality === '720p')?.quality ||
                      availableStreams[0].quality;
        break;
      case 'slow':
        // Slow network: Use 720p or lower
        targetQuality = availableStreams.find(s => s.quality === '720p')?.quality ||
                      availableStreams.find(s => s.quality === '480p')?.quality ||
                      availableStreams[0].quality;
        break;
      default:
        targetQuality = availableStreams[0].quality;
    }
    
    console.log(`🎯 INITIAL QUALITY: Setting ${targetQuality} for ${networkSpeed} network`);
    switchToQuality(targetQuality, false);
    setInitialQualitySet(true);
    setQualityStabilized(true);
  };

  // Force highest quality function
  const forceHighestQuality = () => {
    if (availableStreams.length === 0) return;
    
    const highestQuality = availableStreams.reduce((highest, current) => {
      const currentNum = parseInt(current.quality.replace('p', ''));
      const highestNum = parseInt(highest.quality.replace('p', ''));
      
      // Prioritize combined streams over separate streams
      if (current.type === 'combined' && highest.type !== 'combined') {
        return current;
      }
      if (highest.type === 'combined' && current.type !== 'combined') {
        return highest;
      }
      
      // If both are same type, choose higher quality
      return currentNum > highestNum ? current : highest;
    });
    
    console.log(`🚀 FORCE HIGH QUALITY: Switching to ${highestQuality.quality}`);
    setForceHighQuality(true);
    setManualQualityOverride(true);
    setQualityStabilized(true); // Stabilize after manual selection
    switchToQuality(highestQuality.quality, true);
  };

  // Keyboard shortcuts for quality control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Press 'H' to force highest quality
      if (e.key.toLowerCase() === 'h' && e.ctrlKey) {
        e.preventDefault();
        forceHighestQuality();
      }
      // Press 'A' to toggle adaptive quality
      if (e.key.toLowerCase() === 'a' && e.ctrlKey) {
        e.preventDefault();
        setAdaptiveQuality(prev => !prev);
        console.log(`🔄 Adaptive quality ${!adaptiveQuality ? 'enabled' : 'disabled'}`);
      }
      // Press 'S' to toggle quality stabilization
      if (e.key.toLowerCase() === 's' && e.ctrlKey) {
        e.preventDefault();
        setQualityStabilized(prev => !prev);
        console.log(`🔒 Quality stabilization ${!qualityStabilized ? 'enabled' : 'disabled'}`);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [adaptiveQuality, availableStreams]);

  // Set initial quality based on network speed when streams are available
  useEffect(() => {
    if (availableStreams.length > 0 && networkSpeed && !initialQualitySet) {
      // Wait a bit for network speed detection to complete
      setTimeout(() => {
        setInitialQualityBasedOnNetwork();
      }, 1000);
    }
  }, [availableStreams, networkSpeed, initialQualitySet]);

  // Pause video when tab becomes hidden (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - pause if playing
        if (videoRef.current && !videoRef.current.paused) {
          console.log('📱 Tab hidden: Pausing video');
          setWasPlayingBeforeTabSwitch(true);
          videoRef.current.pause();
          if (audioRef.current && !audioRef.current.paused && currentStreamType === 'separate') {
            audioRef.current.pause();
          }
          setIsPlaying(false);
        }
      } else {
        // Tab became visible - show notification if video was paused due to tab switch
        if (wasPlayingBeforeTabSwitch && videoRef.current) {
          console.log('📱 Tab visible: Video was playing before, showing notification');
          setShowTabSwitchNotification(true);
          setWasPlayingBeforeTabSwitch(false);
          
          // Hide notification after 3 seconds
          setTimeout(() => {
            setShowTabSwitchNotification(false);
          }, 3000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wasPlayingBeforeTabSwitch]);

  // Track buffered ranges with advanced analytics
  const handleProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const buffered = video.buffered;
      const ranges: {start: number, end: number}[] = [];
      
      for (let i = 0; i < buffered.length; i++) {
        ranges.push({
          start: buffered.start(i),
          end: buffered.end(i)
        });
      }
      
      setBufferedRanges(ranges);
      
      // Advanced buffering analytics
      if (adaptiveBuffering && ranges.length > 0) {
        const currentTime = video.currentTime;
        const totalBuffered = ranges.reduce((total, range) => total + (range.end - range.start), 0);
        const bufferAhead = ranges[0]?.end - currentTime || 0;
        
        // Adjust buffer target based on network conditions
        if (bufferAhead < 10 && networkSpeed === 'fast') {
          setBufferTarget(60); // More aggressive buffering for fast connections
        } else if (bufferAhead < 5 && networkSpeed === 'medium') {
          setBufferTarget(30); // Standard buffering
        } else if (bufferAhead < 3 && networkSpeed === 'slow') {
          setBufferTarget(15); // Conservative buffering for slow connections
        }
        
        // Log buffering performance
        console.log(`📊 Buffer Analytics: ${bufferAhead.toFixed(1)}s ahead, ${totalBuffered.toFixed(1)}s total, Target: ${bufferTarget}s`);
        
        // STABLE QUALITY: Only adapt if quality is not stabilized and not manually overridden
        if (adaptiveQuality && !manualQualityOverride && !forceHighQuality && !qualityStabilized && availableStreams.length > 1) {
          const bufferHealth = bufferAhead / bufferTarget;
          
          // Record quality history for analysis
          setQualityHistory(prev => {
            const newHistory = [...prev, {
              quality: currentQuality,
              timestamp: Date.now(),
              bufferHealth: bufferHealth
            }].slice(-5); // Keep last 5 entries only
            
            // Only make quality changes if buffer is extremely low (emergency downgrade)
            if (bufferHealth < 0.1 && currentQuality !== '360p') {
              // Emergency: Buffer is critically low, downgrade quality
              const lowerQuality = availableStreams.find(s => 
                parseInt(s.quality.replace('p', '')) < parseInt(currentQuality.replace('p', ''))
              );
              if (lowerQuality) {
                console.log(`🚨 EMERGENCY: Downgrading to ${lowerQuality.quality} (buffer health: ${(bufferHealth * 100).toFixed(1)}%)`);
                switchToQuality(lowerQuality.quality);
                setQualityStabilized(true); // Stabilize after emergency change
              }
            }
            
            return newHistory;
          });
        }
        
        // Predictive preloading based on user behavior
        if (predictivePreloading && video.duration > 0) {
          const progressPercent = (currentTime / video.duration) * 100;
          
          // Preload next segments based on user behavior pattern
          if (userBehaviorPattern === 'linear' && progressPercent > 80) {
            // User watches linearly, preload end of video
            console.log('🔮 Predictive: Preloading end segments for linear viewer');
            predictivePreload(videoUrl, userBehaviorPattern, currentTime, video.duration);
          } else if (userBehaviorPattern === 'seek-heavy' && bufferAhead < 20) {
            // User seeks frequently, maintain larger buffer
            console.log('🔮 Predictive: Maintaining large buffer for seek-heavy user');
            setBufferTarget(Math.max(bufferTarget, 45));
            predictivePreload(videoUrl, userBehaviorPattern, currentTime, video.duration);
          } else if (userBehaviorPattern === 'pause-heavy' && bufferAhead < 10) {
            // User pauses frequently, smaller buffer is fine
            console.log('🔮 Predictive: Optimizing buffer for pause-heavy user');
            setBufferTarget(Math.min(bufferTarget, 20));
            predictivePreload(videoUrl, userBehaviorPattern, currentTime, video.duration);
          }
        }
      }
    }
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      // Enter fullscreen - make the container fullscreen, not just the video
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Fullscreen state tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // When entering fullscreen, show controls and reset auto-hide timer
      if (isNowFullscreen) {
        handleMouseMove(); // This will show controls and reset the auto-hide timer
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            videoRef.current.pause();
            if (audioRef.current && currentStreamType === 'separate') {
              audioRef.current.pause();
            }
              } else {
            videoRef.current.play();
            if (audioRef.current && currentStreamType === 'separate') {
              audioRef.current.play();
            }
          }
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        // Only control audio element for separate streams
        if (audioRef.current && currentStreamType === 'separate') {
          audioRef.current.volume = volume;
        }
        setIsMuted(false);
            } else {
        videoRef.current.volume = 0;
        // Only control audio element for separate streams
        if (audioRef.current && currentStreamType === 'separate') {
          audioRef.current.volume = 0;
        }
        setIsMuted(true);
      }
    }
          break;
        case 'KeyP':
          e.preventDefault();
          togglePiP();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current && duration > 0) {
            const newTime = Math.max(0, videoRef.current.currentTime - 5); // Skip back 5 seconds
            // Use YouTube-style seeking for arrow keys
            youtubeStyleSeek(newTime);
            
            // Show skip indicator
            setArrowSkipAmount(-5);
            setShowArrowSkipIndicator(true);
            setTimeout(() => setShowArrowSkipIndicator(false), 1000);
            
            console.log(`⏪ Arrow Left: Skipped back to ${newTime.toFixed(1)}s`);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current && duration > 0) {
            const newTime = Math.min(duration, videoRef.current.currentTime + 5); // Skip forward 5 seconds
            // Use YouTube-style seeking for arrow keys
            youtubeStyleSeek(newTime);
            
            // Show skip indicator
            setArrowSkipAmount(5);
            setShowArrowSkipIndicator(true);
            setTimeout(() => setShowArrowSkipIndicator(false), 1000);
            
            console.log(`⏩ Arrow Right: Skipped forward to ${newTime.toFixed(1)}s`);
          }
          break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault();
          if (videoRef.current && duration > 0) {
            const percentage = parseInt(e.code.replace('Digit', '')) / 10; // 0-9 becomes 0%-90%
            const newTime = duration * percentage;
            videoRef.current.currentTime = newTime;
            if (audioRef.current) audioRef.current.currentTime = newTime;
            console.log(`🔢 Number ${e.code.replace('Digit', '')}: Jumped to ${(percentage * 100).toFixed(0)}% (${newTime.toFixed(1)}s)`);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted, volume, duration]);

  // Language change function
  const changeLanguage = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageMenu(false);
    console.log(`🌐 Language changed to: ${language}`);
    
    // Here you could implement logic to:
    // 1. Update subtitles/captions
    // 2. Change audio track if available
    // 3. Update UI language
    // 4. Fetch different video streams if needed
  };

  // Close language menu when settings menu closes
  useEffect(() => {
    if (!showSettingsMenu) {
      setShowLanguageMenu(false);
    }
  }, [showSettingsMenu]);

  // Auto-hide controls with slow animation after 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000); // 3 seconds before starting fade animation
    };

    if (isPlaying) {
      resetTimeout();
      } else {
      setShowControls(true);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying]);

  // Mouse movement detection
  const handleMouseMove = () => {
    setShowControls(true);
  };



  // Playback speed control
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      if (audioRef.current) audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Picture-in-Picture toggle
  const togglePiP = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.warn('Picture-in-Picture not supported:', error);
    }
  };

  // User behavior tracking
  const [seekCount, setSeekCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [lastSeekTime, setLastSeekTime] = useState(0);

  // Enhanced seeking function with proper sync handling
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
    
    if (!videoRef.current || !duration) return;
    
    console.log('🎯 Seeking to:', newTime, 'seconds');
    
    // Track seeking behavior
    const now = Date.now();
    setSeekCount(prev => prev + 1);
    setLastSeekTime(now);
    
    // Analyze user behavior pattern
    if (seekCount > 5) {
      setUserBehaviorPattern('seek-heavy');
      console.log('🔍 User behavior: Seek-heavy detected');
    }
    
    setIsSeeking(true);
    setSyncCooldown(false); // Reset sync cooldown when seeking starts
    const wasPlaying = !videoRef.current.paused;
    
    // CRITICAL: Pause both video and audio before seeking to prevent desync
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Set new time immediately
    videoRef.current.currentTime = newTime;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    
    // Use the video's seeked event for more reliable seeking
    const handleSeekComplete = () => {
      console.log('🎯 Seek completed via event, resuming playback');
      setIsSeeking(false);
      
      if (wasPlaying && videoRef.current) {
        // Ensure both video and audio are at the same time before playing
        if (audioRef.current) {
          audioRef.current.currentTime = videoRef.current.currentTime;
        }
        
        // Play both video and audio simultaneously for immediate sync
        const playVideo = videoRef.current.play();
        const playAudio = audioRef.current && directAudioUrl && audioLoaded && !audioError ? audioRef.current.play() : Promise.resolve();
        
        Promise.all([playVideo, playAudio]).then(() => {
          console.log('🎯 Both video and audio resumed simultaneously after seek');
        }).catch(err => {
          console.warn('Playback failed after seek:', err);
          // Try to play video even if audio fails
          videoRef.current?.play().catch(videoErr => {
            console.warn('Video play failed after seek:', videoErr);
          });
          
          // If audio failed, try to reload it
          if (audioRef.current && directAudioUrl) {
            console.log('🔄 Attempting to reload audio after seek failure');
            audioRef.current.load();
            setTimeout(() => {
              if (audioRef.current && !videoRef.current?.paused) {
                audioRef.current.currentTime = videoRef.current.currentTime;
                audioRef.current.play().catch(audioErr => {
                  console.warn('Audio reload failed after seek:', audioErr);
                });
              }
            }, 500);
          }
        });
      }
      
      // Clean up event listener
      videoRef.current?.removeEventListener('seeked', handleSeekComplete);
    };
    
    // Add event listener for when seeking is complete
    videoRef.current?.addEventListener('seeked', handleSeekComplete);
    
    // Fallback timeout in case seeked event doesn't fire
    setTimeout(() => {
      if (isSeeking) {
        console.log('🎯 Seek timeout fallback - forcing completion');
        handleSeekComplete();
      }
    }, 1000); // Increased timeout for better reliability
  };

  // Handle mouse events for dragging
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden aspect-video w-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* Tab Switch Notification */}
      {showTabSwitchNotification && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center">
            <i className="ri-pause-circle-line mr-2"></i>
            <span className="text-sm">Video paused - switched tabs</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="custom-video-player-container relative w-full h-full">
        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-10">
          {/* Picture-in-Picture Button */}
          <button
            onClick={togglePiP}
            className="text-white hover:text-blue-400 transition-colors bg-black/30 p-2 rounded-full hover:bg-black/50"
            title="Picture-in-Picture"
          >
            <i className="ri-picture-in-picture-fill text-xl"></i>
          </button>
        </div>

      {/* Video Element */}
         {directVideoUrl && (
      <video
        ref={videoRef}
             src={directVideoUrl}
             key={`video-${currentQuality}-${directVideoUrl.substring(0, 50)}`}
        className="w-full h-full object-contain cursor-pointer"
             preload={directVideoUrl.includes('supabase') ? 'auto' : 'auto'}
             playsInline
             controls={false}
             muted={isMuted}
             crossOrigin="anonymous"
             onDoubleClick={handleDoubleTap}
             onLoadStart={() => {
               console.log('🔄 Video load started, src:', directVideoUrl);
               setIsLoading(true);
               if (directVideoUrl.includes('supabase')) {
                 console.log('🚀 Supabase video load started - Optimizing for fast playback...');
                 // Ensure aggressive preloading for Supabase videos
                 if (videoRef.current) {
                   videoRef.current.preload = 'auto';
                   // Don't call load() here - it causes infinite reload loop
                   // Video will load automatically when src is set
                 }
               }
             }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const actualWidth = videoRef.current.videoWidth;
                const actualHeight = videoRef.current.videoHeight;
                const isSupabaseVideo = directVideoUrl?.includes('supabase') || false;
                
                console.log(`📐 Video metadata loaded - Actual resolution: ${actualWidth}x${actualHeight}, Selected quality: ${currentQuality}`);
                
                if (isSupabaseVideo) {
                  console.log('⚡ Supabase video metadata loaded - Starting aggressive buffering...');
                  // For Supabase videos, start buffering immediately
                  if (videoRef.current.readyState >= 2) {
                    // Video has enough data to start playing
                    console.log('✅ Supabase video ready for playback');
                    setIsLoading(false);
                  }
                }
                
                // Verify the resolution matches the selected quality
                const expectedHeight = parseInt(currentQuality.replace('p', '')) || 0;
                if (expectedHeight > 0 && Math.abs(actualHeight - expectedHeight) > 50) {
                  console.warn(`⚠️ Resolution mismatch! Expected ~${expectedHeight}p but got ${actualHeight}p`);
                  console.warn(`   Current URL: ${directVideoUrl?.substring(0, 100)}...`);
                } else if (expectedHeight > 0) {
                  console.log(`✅ Resolution matches selected quality: ${currentQuality} (${actualHeight}p)`);
                }
              }
            }}
            onTimeUpdate={() => {
          if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
            setDuration(videoRef.current.duration);
                onTimeUpdate?.(videoRef.current.currentTime, videoRef.current.duration);
                
                // Sync audio with video during playback
                syncAudioWithVideo();
                
                // Monitor quality performance (reduced frequency - only every 5 seconds)
                if (Math.floor(videoRef.current.currentTime) % 5 === 0 && Math.floor(videoRef.current.currentTime) > 0) {
                  monitorQualityPerformance();
                }
                
                // Preload next segments for current quality (reduced frequency - only when video is playing)
                if (Math.floor(videoRef.current.currentTime) % 10 === 0 && 
                    !videoRef.current.paused && 
                    videoRef.current.readyState >= 2 &&
                    videoRef.current.duration > 0) {
                  preloadNextSegments(videoRef.current.currentTime, currentQuality);
                }
                
                // Check audio resumption (reduced frequency)
                if (!seekingSync.isSeeking && Math.floor(videoRef.current.currentTime) % 3 === 0) {
                  checkAudioResumption();
                }
                
                // Enhanced sync verification after seeking and buffering
                if (!seekingSync.isSeeking && !isBuffering && Math.floor(videoRef.current.currentTime) % 2 === 0) {
                  verifyAudioVideoSync();
                }
                
                // More frequent audio resumption check (every second)
                if (!seekingSync.isSeeking && !isBuffering && Math.floor(videoRef.current.currentTime) % 1 === 0) {
                  checkAudioResumption();
                }
          }
        }}
            onPlay={() => {
              setIsPlaying(true);
              setShowControls(true); // Show controls when video starts playing
            }}
            onPause={() => {
              setIsPlaying(false);
              setShowControls(true); // Show controls when video is paused
              
              // Track pause behavior
              setPauseCount(prev => prev + 1);
              if (pauseCount > 3) {
                setUserBehaviorPattern('pause-heavy');
                console.log('🔍 User behavior: Pause-heavy detected');
              }
            }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
            onWaiting={handleBufferingStart}
            onSeeking={() => {
              console.log('🎯 Video seeking started');
              setIsSeeking(true);
              
              // Only handle native seeking events (not our YouTube-style seeking)
              if (!seekingSync.isSeeking) {
                // For native seeking, sync audio immediately
                if (audioRef.current && videoRef.current) {
                  audioRef.current.currentTime = videoRef.current.currentTime;
                }
              }
              
              // Update seek buffer during seeking
              if (videoRef.current) {
                updateSeekBuffer(videoRef.current.currentTime);
              }
            }}
            onSeeked={() => {
              console.log('🎯 Video seeking completed (native event)');
              setIsSeeking(false);
              
              // Only handle native seeking events (not our YouTube-style seeking)
              if (!seekingSync.isSeeking && audioRef.current && videoRef.current && audioRef.current.src) {
                // Ensure perfect sync after native seeking
                audioRef.current.currentTime = videoRef.current.currentTime;
                console.log('🎯 Audio synced to video time (native seek):', videoRef.current.currentTime);
                
                // If video is playing, ensure audio is also playing simultaneously
                if (!videoRef.current.paused && audioRef.current.paused && audioRef.current.src && !audioError) {
                  audioRef.current.play().then(() => {
                    console.log('🎯 Audio resumed in perfect sync after native seek');
                  }).catch(() => {
                    // If audio fails, try again after a short delay
                    setTimeout(() => {
                      if (audioRef.current && !videoRef.current.paused) {
                        audioRef.current.currentTime = videoRef.current.currentTime;
                        audioRef.current.play().catch(() => {});
                      }
                    }, 100);
                  });
                }
              }
            }}
          onCanPlay={() => {
              handleBufferingEnd();
              if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                setDuration(videoRef.current.duration);
                console.log('✅ Video can play, duration set:', videoRef.current.duration);
              }
            }}
            onCanPlayThrough={() => {
              handleBufferingEnd();
              if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                setDuration(videoRef.current.duration);
                console.log('✅ Video can play through, duration set:', videoRef.current.duration);
              }
            }}
            onLoadedData={() => setIsLoading(false)}
            onProgress={handleProgress}
          onError={(e) => {
              console.error('❌ Video load error:', e);
              console.error('❌ Video src:', directVideoUrl);
              console.error('❌ Video element:', videoRef.current);
              
              // Check if the source is an embed URL
              if (directVideoUrl?.includes('youtube.com/embed/')) {
                setError('This video cannot be played with custom controls. Please try a different video or check if the video is public.');
              } else if (directVideoUrl?.includes('googlevideo.com') && retryCount < 3) {
                // Direct Google Video URL has likely expired
                console.warn(`⚠️ Direct Google Video URL appears to have expired, attempting to re-extract... (attempt ${retryCount + 1}/3)`);
                setError('Video URL has expired. Attempting to refresh...');
                
                // Clear the current URL and retry extraction
                setDirectVideoUrl(null);
                setDirectAudioUrl(null);
                setIsLoading(true);
                setRetryCount(prev => prev + 1);
                
                // Retry extraction after a short delay
                setTimeout(() => {
                  if (videoUrl) {
                    console.log('🔄 Retrying video extraction...');
                    // Clear the cached streams to force fresh extraction
                    instantPreloadService.clearPreloadedVideo(videoUrl);
                    instantPreloadService.preloadVideo(videoUrl)
                      .then(streams => {
                        if (streams.length > 0) {
                          const newVideoUrl = streams[0].url;
                          if (!newVideoUrl.includes('youtube.com/embed/')) {
                            setAvailableStreams(streams);
                            setDirectVideoUrl(newVideoUrl);
                            setCurrentQuality(streams[0].quality);
                            if (streams[0].type === 'separate' && streams[0].audioUrl) {
                              setDirectAudioUrl(streams[0].audioUrl);
                            }
                            setError(null);
                            setIsLoading(false);
                            setRetryCount(0); // Reset retry count on success
                            console.log('✅ Video extraction retry successful');
                          } else {
                            setError('This video cannot be played with custom controls. The video may be private or restricted.');
                            setIsLoading(false);
                          }
                        } else {
                          setError('Failed to load video. Please try again later.');
                          setIsLoading(false);
                        }
                      })
                      .catch(err => {
                        console.error('❌ Retry extraction failed:', err);
                        setError('Failed to load video. Please try again later.');
                        setIsLoading(false);
                      });
                  }
                }, 1000);
              } else if (directVideoUrl?.includes('googlevideo.com') && retryCount >= 3) {
                setError('Video URL has expired multiple times. Please refresh the page to try again.');
                setIsLoading(false);
              } else {
                setError('Video failed to load. Please check your internet connection and try again.');
              }
            }}
            onLoadedMetadata={() => {
              console.log('✅ Video metadata loaded');
              if (videoRef.current && videoRef.current.duration) {
                setDuration(videoRef.current.duration);
                console.log('✅ Video duration set:', videoRef.current.duration);
                
                // Create seek segments for HLS-like seeking
                if (hlsLikeSeeking && !isHLSStream) {
                  createSeekSegments(videoRef.current.duration, currentQuality);
                }
              }
          }}
        />
      )}

         {/* Video Placeholder when no URL */}
         {!directVideoUrl && (
           <div className="w-full h-full flex items-center justify-center bg-gray-800">
             <div className="text-center text-white">
               <i className="ri-video-line text-4xl mb-2 opacity-50"></i>
               <div className="text-sm opacity-75">Video will load here</div>
                </div>
              </div>
            )}
        
        {/* Audio Element */}
            {directAudioUrl && (
        <audio
          ref={audioRef}
          src={directAudioUrl}
          preload="auto"
          onLoadStart={() => {
            console.log('🔄 Audio load started, src:', directAudioUrl);
            setAudioLoaded(false);
            setAudioError(false);
          }}
          onLoadedData={() => {
            console.log('✅ Audio data loaded successfully');
            setAudioLoaded(true);
            setAudioError(false);
          }}
          onCanPlay={() => {
            console.log('✅ Audio can play');
            setAudioLoaded(true);
            setAudioError(false);
          }}
          onError={(e) => {
            console.error('❌ Audio loading error:', e);
            setAudioError(true);
            setAudioLoaded(false);
            // If audio fails to load, we'll continue with video-only playback
          }}
          onSeeking={() => {
            console.log('🎯 Audio seeking started');
          }}
          onSeeked={() => {
            console.log('🎯 Audio seeking completed');
          }}
          onTimeUpdate={() => {
            // Let the main sync function handle audio-video synchronization
            // This prevents duplicate sync attempts that cause seeking loops
          }}
          />
        )}
        
        {/* Loading State */}
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center space-y-3">
              {/* DCODE Spinner */}
              <SimpleDCODESpinner size="lg" className="text-white" />
              <div className="text-white text-sm font-medium">Loading video...</div>
            </div>
              </div>
            )}

        {/* Skip Forward Indicator */}
        {showSkipIndicator && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/70 rounded-full p-4 flex items-center space-x-2">
              <i className="ri-skip-forward-fill text-2xl text-white"></i>
              <span className="text-white font-semibold">+10s</span>
          </div>
        </div>
      )}

        {/* Arrow Key Skip Indicator */}
        {showArrowSkipIndicator && (
          <div className={`absolute inset-y-0 flex items-center pointer-events-none ${
            arrowSkipAmount > 0 ? 'right-1/4' : 'left-1/4'
          }`}>
            <div className="bg-black/70 rounded-full p-4 flex items-center space-x-2">
              {arrowSkipAmount > 0 ? (
                <i className="ri-skip-forward-fill text-2xl text-white"></i>
              ) : (
                <i className="ri-skip-back-fill text-2xl text-white"></i>
              )}
              <span className="text-white font-semibold">
                {arrowSkipAmount > 0 ? `+${arrowSkipAmount}s` : `${arrowSkipAmount}s`}
              </span>
            </div>
          </div>
        )}

        {/* Buffering Overlay */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex items-center space-x-2 bg-black/70 rounded-lg px-4 py-2">
              <SimpleDCODESpinner size="sm" />
              <span className="text-white text-sm font-medium">Buffering...</span>
            </div>
          </div>
        )}

        {/* Seeking Overlay */}
        {isSeeking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex items-center space-x-2 text-white">
              <div className="animate-pulse rounded-full h-6 w-6 bg-blue-500"></div>
              <span>Seeking...</span>
          </div>
        </div>
      )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center max-w-md mx-4">
              <div className="text-red-400 text-lg font-semibold mb-4">
                {error.includes('private') ? '🔒 Private Video' : 
                 error.includes('unlisted') ? '🔗 Unlisted Video' : 
                 error.includes('restricted') ? '🚫 Restricted Video' : 
                 '❌ Video Error'}
              </div>
              <div className="text-white text-sm mb-4">{error}</div>
              
              {/* Action buttons for different error types */}
              {error.includes('private') && (
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs">
                    Private videos require YouTube account access
                  </div>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Watch on YouTube
                  </a>
                </div>
              )}
              
              {error.includes('unlisted') && (
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs">
                    This unlisted video may have access restrictions
                  </div>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Try on YouTube
                  </a>
                </div>
              )}
              
              {error.includes('restricted') && (
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs">
                    This video has viewing restrictions
                  </div>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    View on YouTube
                  </a>
                </div>
              )}
              
              {error.includes('expired') && retryCount < 3 && (
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs">
                    Video URL has expired. Click to retry.
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setDirectVideoUrl(null);
                      setDirectAudioUrl(null);
                      setIsLoading(true);
                      setRetryCount(prev => prev + 1);
                      
                      setTimeout(() => {
                        if (videoUrl) {
                          // Clear the cached streams to force fresh extraction
                          instantPreloadService.clearPreloadedVideo(videoUrl);
                          instantPreloadService.preloadVideo(videoUrl)
                            .then(streams => {
                              if (streams.length > 0) {
                                const newVideoUrl = streams[0].url;
                                if (!newVideoUrl.includes('youtube.com/embed/')) {
                                  setAvailableStreams(streams);
                                  setDirectVideoUrl(newVideoUrl);
                                  setCurrentQuality(streams[0].quality);
                                  if (streams[0].type === 'separate' && streams[0].audioUrl) {
                                    setDirectAudioUrl(streams[0].audioUrl);
                                  }
                                  setRetryCount(0);
                                  setIsLoading(false);
                                } else {
                                  setError('This video cannot be played with custom controls. The video may be private or restricted.');
                                  setIsLoading(false);
                                }
                              } else {
                                setError('Failed to load video. Please try again later.');
                                setIsLoading(false);
                              }
                            })
                            .catch(err => {
                              console.error('❌ Manual retry failed:', err);
                              setError('Failed to load video. Please try again later.');
                              setIsLoading(false);
                            });
                        }
                      }, 500);
                    }}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Retry ({3 - retryCount} attempts left)
                  </button>
                </div>
              )}
              
              {error.includes('expired') && retryCount >= 3 && (
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs">
                    Multiple retry attempts failed. Please refresh the page.
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              )}
            </div>
        </div>
      )}

          {/* Progress Bar */}
        <div className={`absolute bottom-20 left-4 right-4 group transition-opacity duration-1000 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            className="relative h-2 bg-gray-600 rounded-full border border-gray-500/30 shadow-inner group-hover:h-3 transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              if (!duration || !videoRef.current) return;
              
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              const newTime = percentage * duration;
              
              console.log('🎯 Clicked on timeline, seeking to:', newTime, 'seconds');
              
              // YouTube-style: Allow rapid seeking without blocking
              // No need to prevent multiple seeks - YouTube allows rapid clicking
              
              // Use YouTube-style seeking
              youtubeStyleSeek(newTime);
              
              // Fallback to regular seeking (commented out in favor of enhanced seeking)
              /*
              const syntheticEvent = {
                target: { value: newTime.toString() }
              } as React.ChangeEvent<HTMLInputElement>;
                
              handleSeek(syntheticEvent);
              */
            }}
          >
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 0;
                height: 0;
                background: transparent;
                cursor: pointer;
              }
              input[type="range"]::-moz-range-thumb {
                width: 0;
                height: 0;
                background: transparent;
                border: none;
                cursor: pointer;
              }
              input[type="range"]::-ms-thumb {
                width: 0;
                height: 0;
                background: transparent;
                border: none;
                cursor: pointer;
              }
            `}</style>
            {/* Buffered portions */}
            {bufferedRanges.map((range, index) => (
              <div
                key={index}
                className="absolute top-0 h-full bg-gray-400 rounded-full"
                style={{
                  left: duration ? `${(range.start / duration) * 100}%` : '0%',
                  width: duration ? `${((range.end - range.start) / duration) * 100}%` : '0%',
                  minWidth: '2px'
                }}
              />
            ))}
            {/* Played portion */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-sm"
              style={{ 
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                minWidth: currentTime > 0 ? '4px' : '0px',
                boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
              }}
            />
            {/* Seek input with custom styling */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="absolute top-0 left-0 w-full h-full cursor-pointer z-20"
              style={{
                background: 'transparent',
                WebkitAppearance: 'none',
                appearance: 'none',
                opacity: 0.01 // Very low opacity but still clickable
              }}
            />
            
            {/* Custom circular thumb */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 ${
                isDragging ? 'w-6 h-6 bg-blue-400' : 'w-4 h-4 bg-blue-500 hover:w-5 hover:h-5'
              }`}
              style={{
                left: duration ? `calc(${(currentTime / duration) * 100}% - ${isDragging ? '12px' : '8px'})` : '0px',
                zIndex: 10,
                boxShadow: isDragging ? '0 0 8px rgba(59, 130, 246, 0.8)' : '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
            {/* Seeking indicator */}
            {isSeeking && (
              <div className="absolute top-0 left-0 w-full h-full bg-blue-400/30 rounded-full pointer-events-none" />
            )}
          </div>
          </div>

        {/* Basic Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-4 px-4 transition-opacity duration-1000 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
              {/* Left side controls */}
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) {
                    // Pause both video and audio
                    videoRef.current.pause();
                    if (audioRef.current && currentStreamType === 'separate') {
                      audioRef.current.pause();
                    }
                  } else {
                    // Play video first, then sync audio (only for separate streams)
                    videoRef.current.play().then(() => {
                      if (audioRef.current && currentStreamType === 'separate') {
                        // Sync audio time with video time before playing
                        audioRef.current.currentTime = videoRef.current.currentTime;
                        audioRef.current.play().catch(err => {
                          console.warn('Audio play failed:', err);
                        });
                      }
                    }).catch(err => {
                      console.warn('Video play failed:', err);
                    });
                  }
                }
              }}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <i className="ri-pause-fill text-white text-xl"></i>
              ) : (
                <i className="ri-play-fill text-white text-xl ml-0.5"></i>
              )}
              </button>
            
            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

              {/* Audio Resumption Button */}

              {/* Volume Control */}
              <div 
                className="flex items-center space-x-2 relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isMuted) {
                      videoRef.current.volume = volume;
                      // Only control audio element for separate streams
                      if (audioRef.current && currentStreamType === 'separate') {
                        audioRef.current.volume = volume;
                      }
                      setIsMuted(false);
                    } else {
                      videoRef.current.volume = 0;
                      // Only control audio element for separate streams
                      if (audioRef.current && currentStreamType === 'separate') {
                        audioRef.current.volume = 0;
                      }
                      setIsMuted(true);
                    }
                  }
                }}
                  className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? (
                  <i className="ri-volume-mute-fill text-xl"></i>
                ) : (
                  <i className="ri-volume-up-fill text-xl"></i>
                )}
                </button>
              
                {/* Volume Slider with smooth animation */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      if (videoRef.current) {
                        videoRef.current.volume = newVolume;
                        // Only control audio element for separate streams
                        if (audioRef.current && currentStreamType === 'separate') {
                          audioRef.current.volume = newVolume;
                        }
                        setIsMuted(newVolume === 0);
                      }
                    }}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`,
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                </div>
              </div>

            </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-3">
                {/* Quality Button */}
                {availableStreams.length > 1 && (
                <div className="relative">
                  <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-blue-400 transition-colors text-sm font-medium bg-black/30 px-3 py-1 rounded-md border border-white/20 hover:border-blue-400"
                      title="Select video quality"
                  >
                    <i className="ri-hd-line mr-1"></i>
                    {currentQuality}
                      <i className="ri-arrow-down-s-line ml-1"></i>
                  </button>
                  
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[120px] z-20 border border-white/20 shadow-lg">
                      <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10 mb-1">
                        {isHLSStream ? 'HLS Quality' : 'Video Quality'}
                      </div>
                      
                      {/* HLS Quality Options */}
                      {isHLSStream && hlsQualities.length > 0 ? (
                        <>
                          <button
                            onClick={() => {
                              changeHLSQuality(-1); // Auto quality
                              setShowQualityMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 transition-colors flex items-center justify-between ${
                              currentHLSQuality === -1 ? 'text-blue-400 bg-blue-400/10' : 'text-white'
                            }`}
                          >
                            <span>Auto</span>
                            <span className="text-xs text-gray-400">Adaptive</span>
                          </button>
                          {hlsQualities.map((quality, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                changeHLSQuality(quality.level);
                                setShowQualityMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 transition-colors flex items-center justify-between ${
                                quality.level === currentHLSQuality ? 'text-blue-400 bg-blue-400/10' : 'text-white'
                              }`}
                            >
                              <span>{quality.name}</span>
                              <span className="text-xs text-gray-400">
                                {quality.width}x{quality.height}
                              </span>
                            </button>
                          ))}
                        </>
                      ) : (
                        /* Regular Video Quality Options */
                        availableStreams.map((stream, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              console.log(`🎯 User selected quality: ${stream.quality}`);
                              switchToQuality(stream.quality, true); // isManual = true to lock quality
                              setShowQualityMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 transition-colors flex items-center justify-between ${
                              stream.quality === currentQuality ? 'text-blue-400 bg-blue-400/10' : 'text-white'
                            }`}
                          >
                            <span>{stream.quality}</span>
                            <span className="text-xs text-gray-400">
                              {stream.width}x{stream.height}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

                {/* Playback Speed Button */}
                <div className="relative">
              <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="text-white hover:text-blue-400 transition-colors text-sm font-medium bg-black/30 px-3 py-1 rounded-md border border-white/20 hover:border-blue-400"
                    title="Playback speed"
              >
                    <i className="ri-speed-line mr-1"></i>
                    {playbackRate}x
                    <i className="ri-arrow-down-s-line ml-1"></i>
              </button>
                  
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[100px] z-20 border border-white/20 shadow-lg">
                      <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10 mb-1">
                        Speed
            </div>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => {
                            changePlaybackRate(speed);
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/20 transition-colors ${
                            speed === playbackRate ? 'text-blue-400 bg-blue-400/10' : 'text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
        </div>
      )}
                </div>

                {/* Settings Button */}
                <div className="relative">
          <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="text-white hover:text-blue-400 transition-colors"
                    title="Settings"
          >
                    <i className="ri-settings-3-fill text-xl"></i>
          </button>
                  
                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[180px] z-20 border border-white/20 shadow-lg">
                      <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10 mb-1">
                        Settings
                      </div>
                      
                      {/* HLS Stats */}
                      {isHLSStream && (
                        <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                          <div className="font-medium mb-2">HLS Stream Info:</div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>Bandwidth: {Math.round(hlsStats.bandwidth / 1000)}kbps</div>
                            <div>Quality Levels: {hlsQualities.length}</div>
                            <div>Loaded Fragments: {hlsStats.loadedFragments}</div>
                            <div>Current Level: {currentHLSQuality === -1 ? 'Auto' : hlsQualities[currentHLSQuality]?.name || 'Unknown'}</div>
                          </div>
                        </div>
                      )}

                      {/* Quality Optimization Controls */}
                      <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                        <div className="font-medium mb-2">🎬 Quality Optimization:</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">High Quality Optimization</span>
                            <button
                              onClick={() => setHighQualityOptimization(!highQualityOptimization)}
                              className={`w-8 h-4 rounded-full transition-colors ${
                                highQualityOptimization ? 'bg-blue-600' : 'bg-gray-600'
                              }`}
                            >
                              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                highQualityOptimization ? 'translate-x-4' : 'translate-x-0.5'
                              }`}></div>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Buffer Optimization</span>
                            <button
                              onClick={() => setBufferOptimization(!bufferOptimization)}
                              className={`w-8 h-4 rounded-full transition-colors ${
                                bufferOptimization ? 'bg-green-600' : 'bg-gray-600'
                              }`}
                            >
                              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                bufferOptimization ? 'translate-x-4' : 'translate-x-0.5'
                              }`}></div>
                            </button>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-300">Preload Strategy:</span>
                            <select
                              value={preloadStrategy}
                              onChange={(e) => setPreloadStrategy(e.target.value as any)}
                              className="w-full text-xs bg-gray-700 text-white rounded px-2 py-1"
                            >
                              <option value="aggressive">Aggressive (720p/1080p/1440p/2160p)</option>
                              <option value="balanced">Balanced (480p)</option>
                              <option value="conservative">Conservative (360p)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-300">Extraction Speed:</span>
                            <select
                              value={extractionSpeed}
                              onChange={(e) => setExtractionSpeed(e.target.value as any)}
                              className="w-full text-xs bg-gray-700 text-white rounded px-2 py-1"
                            >
                              <option value="fast">Fast (720p/1080p/1440p/2160p)</option>
                              <option value="balanced">Balanced (480p)</option>
                              <option value="quality">Quality (360p)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* YouTube-style Seeking Controls */}
                      <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                        <div className="font-medium mb-2">🎯 YouTube-style Seeking:</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Seeking Mode</span>
                            <div className="px-2 py-1 rounded text-xs bg-red-600">
                              YouTube Style
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Audio-Video Sync</span>
                            <div className={`px-2 py-1 rounded text-xs ${
                              videoRef.current && audioRef.current && audioRef.current.src && !audioError 
                                ? Math.abs((videoRef.current?.currentTime || 0) - (audioRef.current?.currentTime || 0)) < 0.1
                                  ? 'bg-green-600' 
                                  : 'bg-yellow-600'
                                : 'bg-gray-600'
                            }`}>
                              {videoRef.current && audioRef.current && audioRef.current.src && !audioError 
                                ? Math.abs((videoRef.current?.currentTime || 0) - (audioRef.current?.currentTime || 0)) < 0.1
                                  ? 'Perfect Sync' 
                                  : 'Syncing...'
                                : 'Video Only'
                              }
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Audio Status</span>
                            <div className={`px-2 py-1 rounded text-xs ${
                              audioRef.current && audioRef.current.src && !audioError
                                ? !audioRef.current.paused
                                  ? 'bg-green-600'
                                  : 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}>
                              {audioRef.current && audioRef.current.src && !audioError
                                ? !audioRef.current.paused
                                  ? 'Playing'
                                  : 'Paused'
                                : 'Error'
                              }
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Seeking Status</span>
                            <div className={`px-2 py-1 rounded text-xs ${
                              isSeeking || seekingSync.isSeeking
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}>
                              {isSeeking || seekingSync.isSeeking ? 'Seeking...' : 'Ready'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Buffering Status</span>
                            <div className={`px-2 py-1 rounded text-xs ${
                              isBuffering
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}>
                              {isBuffering ? 'Buffering...' : 'Ready'}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>✅ Instant seeking (no delays)</div>
                            <div>✅ Rapid clicking allowed</div>
                            <div>✅ Arrow keys: ±5 seconds</div>
                            <div>✅ Smooth transitions</div>
                            <div>✅ Minimal buffering</div>
                            <div>✅ Perfect audio-video sync</div>
                            <div>✅ Automatic sync correction</div>
                            <div>✅ Sync maintained after buffering</div>
                            <div>✅ Enhanced sync verification</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Manual Sync Check</span>
                            <button
                              onClick={verifyAudioVideoSync}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              Check Sync
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Force Audio Resume</span>
                            <button
                              onClick={checkAudioResumption}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Resume Audio
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Force Audio After Seek</span>
                            <button
                              onClick={forceAudioResumeAfterSeek}
                              className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                            >
                              Force Resume
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Comprehensive Sync Test</span>
                            <button
                              onClick={() => {
                                console.log('🔍 Comprehensive Sync Test:');
                                console.log('Video Time:', videoRef.current?.currentTime?.toFixed(3));
                                console.log('Audio Time:', audioRef.current?.currentTime?.toFixed(3));
                                console.log('Video Playing:', !videoRef.current?.paused);
                                console.log('Audio Playing:', !audioRef.current?.paused);
                                console.log('Audio Ready State:', audioRef.current?.readyState);
                                console.log('Audio Loaded:', audioLoaded);
                                console.log('Audio Error:', audioError);
                                console.log('Is Seeking:', isSeeking);
                                console.log('Seeking Sync:', seekingSync.isSeeking);
                                console.log('Is Buffering:', isBuffering);
                                verifyAudioVideoSync();
                              }}
                              className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                            >
                              Test Sync
                            </button>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-gray-300">Sync Tolerance:</span>
                            <select
                              value={seekingSync.syncTolerance}
                              onChange={(e) => setSeekingSync(prev => ({ ...prev, syncTolerance: parseFloat(e.target.value) }))}
                              className="w-full text-xs bg-gray-700 text-white rounded px-2 py-1"
                            >
                              <option value={0.1}>Precise (100ms)</option>
                              <option value={0.2}>Standard (200ms)</option>
                              <option value={0.5}>Relaxed (500ms)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* HLS-like Seeking Controls */}
                      {!isHLSStream && (
                        <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                          <div className="font-medium mb-2">🎬 HLS-like Seeking:</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Enable HLS-like Seeking</span>
                              <button
                                onClick={() => setHlsLikeSeeking(!hlsLikeSeeking)}
                                className={`w-8 h-4 rounded-full transition-colors ${
                                  hlsLikeSeeking ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                              >
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                  hlsLikeSeeking ? 'translate-x-4' : 'translate-x-0.5'
                                }`}></div>
                              </button>
                            </div>
                            {hlsLikeSeeking && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-300">Adaptive Seeking</span>
                                <button
                                  onClick={() => setAdaptiveSeeking(!adaptiveSeeking)}
                                  className={`w-8 h-4 rounded-full transition-colors ${
                                    adaptiveSeeking ? 'bg-green-600' : 'bg-gray-600'
                                  }`}
                                >
                                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                                    adaptiveSeeking ? 'translate-x-4' : 'translate-x-0.5'
                                  }`}></div>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quality Performance Stats */}
                      {highQualityOptimization && (
                        <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                          <div className="font-medium mb-2">📊 {currentQuality} Performance:</div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>Buffer Size: {adaptiveBufferSize}s</div>
                            <div>Buffer Health: {getSeekBufferHealth().toFixed(1)}s</div>
                            <div>Preload Strategy: {preloadStrategy}</div>
                            <div>Extraction Speed: {extractionSpeed}</div>
                            <div>Network Speed: {networkSpeed}</div>
                            <div className={highQualityOptimization ? 'text-green-400' : 'text-yellow-400'}>
                              {highQualityOptimization ? `✓ ${currentQuality} Optimized` : '⚠️ Standard Mode'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Audio Status */}
                      <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                        <div className="font-medium mb-2">🔊 Audio Status:</div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <div>Audio Loaded: {audioLoaded ? '✅ Yes' : '❌ No'}</div>
                          <div>Audio Error: {audioError ? '❌ Yes' : '✅ No'}</div>
                          <div>Audio Playing: {audioRef.current && !audioRef.current.paused ? '✅ Yes' : '❌ No'}</div>
                          <div>Video Playing: {videoRef.current && !videoRef.current.paused ? '✅ Yes' : '❌ No'}</div>
                          <div>Audio Time: {audioRef.current ? audioRef.current.currentTime.toFixed(2) : '0.00'}s</div>
                          <div>Video Time: {videoRef.current ? videoRef.current.currentTime.toFixed(2) : '0.00'}s</div>
                          <div className={audioLoaded && !audioError ? 'text-green-400' : 'text-red-400'}>
                            {audioLoaded && !audioError ? '✅ Audio Ready' : '❌ Audio Issues'}
                          </div>
                        </div>
                      </div>

                      {/* Simplified Seeking Performance Stats */}
                      <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                        <div className="font-medium mb-2">📊 Seeking Stats:</div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <div>Total Seeks: {seekingPerformance.totalSeeks}</div>
                          <div>Successful Seeks: {seekingPerformance.successfulSeeks}</div>
                          <div>Success Rate: {seekingPerformance.totalSeeks > 0 ? ((seekingPerformance.successfulSeeks / seekingPerformance.totalSeeks) * 100).toFixed(1) : 0}%</div>
                          <div>Last Seek: {seekingPerformance.lastSeekDuration.toFixed(0)}ms</div>
                          <div className={seekingSync.isSeeking ? 'text-yellow-400' : 'text-green-400'}>
                            {seekingSync.isSeeking ? '⏳ Seeking...' : '✅ Ready'}
                          </div>
                        </div>
                      </div>

                      {/* HLS-like Seeking Stats */}
                      {hlsLikeSeeking && !isHLSStream && (
                        <div className="px-4 py-2 text-sm text-white border-b border-white/10">
                          <div className="font-medium mb-2">📊 HLS-like Seeking Performance:</div>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>Seek Segments: {seekSegments.length}</div>
                            <div>Current Segment: {currentSegment + 1}</div>
                            <div>Buffer Health: {getSeekBufferHealth().toFixed(1)}s</div>
                            <div>Last Seek: {seekPerformance.seekDuration.toFixed(0)}ms</div>
                            <div>Seek Accuracy: {seekPerformance.seekAccuracy.toFixed(3)}s</div>
                            <div className={adaptiveSeeking ? 'text-green-400' : 'text-yellow-400'}>
                              {adaptiveSeeking ? '✓ Adaptive Seeking Active' : '🔒 Manual Seeking'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Keyboard Shortcuts Info */}
                      <div className="px-4 py-2 text-sm text-white">
                        <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <div>Space - Play/Pause</div>
                          <div>F - Fullscreen</div>
                          <div>M - Mute</div>
                          <div>P - Picture-in-Picture</div>
                          <div>← → - Skip 5s</div>
                          <div>0-9 - Jump to %</div>
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div className="px-4 py-2 text-sm text-white border-t border-white/10">
                        <div className="font-medium mb-2">Language:</div>
                        <div className="relative">
                          <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="w-full text-left text-xs bg-white/10 hover:bg-white/20 rounded px-3 py-2 flex items-center justify-between transition-colors"
                          >
                            <span>
                              {selectedLanguage === 'en' && '🇺🇸 English'}
                              {selectedLanguage === 'hi' && '🇮🇳 हिन्दी'}
                              {selectedLanguage === 'te' && '🇮🇳 తెలుగు'}
                            </span>
                            <i className={`ri-arrow-${showLanguageMenu ? 'up' : 'down'}-s-line`}></i>
                          </button>
                          
                          {showLanguageMenu && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 rounded border border-white/20 z-30">
                              <button
                                onClick={() => changeLanguage('en')}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-white/20 transition-colors ${
                                  selectedLanguage === 'en' ? 'bg-blue-600/50' : ''
                                }`}
                              >
                                🇺🇸 English
                              </button>
                              <button
                                onClick={() => changeLanguage('hi')}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-white/20 transition-colors ${
                                  selectedLanguage === 'hi' ? 'bg-blue-600/50' : ''
                                }`}
                              >
                                🇮🇳 हिन्दी (Hindi)
                              </button>
                              <button
                                onClick={() => changeLanguage('te')}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-white/20 transition-colors ${
                                  selectedLanguage === 'te' ? 'bg-blue-600/50' : ''
                                }`}
                              >
                                🇮🇳 తెలుగు (Telugu)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="px-4 py-2 text-sm text-white border-t border-white/10">
                        <div className="font-medium mb-1">Video Info:</div>
                        <div className="text-xs text-gray-300">
                          <div>Quality: {currentQuality}</div>
                          <div>Speed: {playbackRate}x</div>
                          <div>Duration: {formatTime(duration)}</div>
                        </div>
                      </div>
        </div>
      )}
                </div>

                  {/* Fullscreen Button */}
          <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors"
                  title="Toggle fullscreen (F)"
                >
                    {isFullscreen ? (
                      <i className="ri-fullscreen-exit-fill text-xl"></i>
                    ) : (
                      <i className="ri-fullscreen-fill text-xl"></i>
                    )}
          </button>
        </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default CustomVideoPlayer;