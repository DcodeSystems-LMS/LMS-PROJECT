import { videoExtractionService, VideoStream } from './videoExtractionService';

class InstantPreloadService {
  private preloadedStreams: Map<string, VideoStream[]> = new Map();
  private extractionPromises: Map<string, Promise<VideoStream[]>> = new Map();
  private localStorageKey = 'ultra_fast_streams_';

  constructor() {
    // Load cached streams from localStorage on initialization
    this.loadCachedStreams();
  }

  private loadCachedStreams() {
    try {
      const keys = Object.keys(localStorage);
      const videoKeys = keys.filter(key => key.startsWith(this.localStorageKey));
      
      videoKeys.forEach(key => {
        const videoUrl = key.replace(this.localStorageKey, '');
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
          try {
            const streams = JSON.parse(cachedData);
            this.preloadedStreams.set(videoUrl, streams);
            console.log('⚡ Loaded cached streams for:', videoUrl, streams.length);
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.warn('Failed to load cached streams:', e);
    }
  }

  private saveToCache(videoUrl: string, streams: VideoStream[]) {
    try {
      const key = this.localStorageKey + videoUrl;
      localStorage.setItem(key, JSON.stringify(streams));
      console.log('💾 Cached streams for instant loading:', videoUrl);
    } catch (e) {
      console.warn('Failed to cache streams:', e);
    }
  }

  async preloadVideo(videoUrl: string): Promise<VideoStream[]> {
    // JET SPEED: Return cached streams immediately
    if (this.preloadedStreams.has(videoUrl)) {
      const cachedStreams = this.preloadedStreams.get(videoUrl)!;
      // Check if cached streams are still valid (not expired)
      if (cachedStreams.length > 0 && !this.isGoogleVideoUrlExpired(cachedStreams[0].url)) {
        console.log('🚀 JET SPEED: Using valid cached streams!');
        return Promise.resolve(cachedStreams);
      } else {
        // Clear expired cache
        console.log('🗑️ Cached streams expired, clearing cache...');
        this.clearPreloadedVideo(videoUrl);
      }
    }

    // Prevent duplicate extractions
    if (this.extractionPromises.has(videoUrl)) {
      console.log('🔄 JET SPEED: Waiting for ongoing extraction...');
      return this.extractionPromises.get(videoUrl)!;
    }

    console.log('🚀 JET SPEED: Starting ultra-fast extraction...');
    const startTime = performance.now();
    
    const promise = videoExtractionService.getAvailableStreams(videoUrl)
      .then(streams => {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        // Cache in memory
        this.preloadedStreams.set(videoUrl, streams);
        // Cache in localStorage for instant loading on page reload
        this.saveToCache(videoUrl, streams);
        this.extractionPromises.delete(videoUrl);
        
        console.log(`🚀 JET SPEED: Extraction complete in ${duration}ms and cached!`);
        return streams;
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        console.error(`❌ JET SPEED: Extraction failed after ${duration}ms:`, error);
        this.extractionPromises.delete(videoUrl);
        return [];
      });

    this.extractionPromises.set(videoUrl, promise);
    return promise;
  }

  getPreloadedStreams(videoUrl: string): VideoStream[] {
    return this.preloadedStreams.get(videoUrl) || [];
  }

  // Check if a Google Video URL is expired
  isGoogleVideoUrlExpired(url: string): boolean {
    if (!url.includes('googlevideo.com')) return false;
    
    try {
      const urlObj = new URL(url);
      const expireParam = urlObj.searchParams.get('expire');
      if (expireParam) {
        const expireTime = parseInt(expireParam);
        const currentTime = Math.floor(Date.now() / 1000);
        // Consider expired if less than 5 minutes remaining
        return (expireTime - currentTime) < 300;
      }
    } catch (e) {
      console.warn('Failed to parse Google Video URL:', e);
    }
    
    return false;
  }

  clearPreloadedVideo(videoUrl: string) {
    this.preloadedStreams.delete(videoUrl);
    this.extractionPromises.delete(videoUrl);
    // Also clear localStorage cache
    try {
      const key = this.localStorageKey + videoUrl;
      localStorage.removeItem(key);
      console.log('🗑️ Cleared cached streams for:', videoUrl);
    } catch (e) {
      console.warn('Failed to clear localStorage cache:', e);
    }
  }

  clearAllPreloadedVideos() {
    this.preloadedStreams.clear();
    this.extractionPromises.clear();
    // Also clear localStorage cache
    try {
      const keys = Object.keys(localStorage);
      const videoKeys = keys.filter(key => key.startsWith(this.localStorageKey));
      videoKeys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Failed to clear localStorage cache:', e);
    }
  }

  // Global preload function for immediate loading
  startGlobalPreload(videoUrl: string) {
    console.log('🌍 GLOBAL PRELOAD: Starting immediate extraction...');
    this.preloadVideo(videoUrl).catch(err => {
      console.warn('⚠️ Global preload failed:', err);
    });
  }

  // Ultra-fast extraction with parallel processing and intelligent caching
  async ultraFastExtraction(videoUrl: string): Promise<VideoStream[]> {
    console.log('⚡ ULTRA-FAST: Starting parallel extraction with intelligent caching...');
    
    // Check for pre-warmed cache first
    const preWarmedCache = this.getPreWarmedCache(videoUrl);
    if (preWarmedCache.length > 0) {
      console.log('⚡ ULTRA-FAST: Using pre-warmed cache!');
      return preWarmedCache;
    }
    
    // Start multiple extraction strategies in parallel
    const extractionPromises = [
      this.preloadVideo(videoUrl),
      this.preloadVideoWithFallback(videoUrl),
      this.preloadVideoWithUltraFastStrategy(videoUrl)
    ];
    
    try {
      // Return the first successful result
      const result = await Promise.race(extractionPromises);
      if (result.length > 0) {
        console.log('⚡ ULTRA-FAST: Parallel extraction successful!');
        
        // Pre-warm cache for future requests
        this.preWarmCache(videoUrl, result);
        
        return result;
      }
    } catch (error) {
      console.warn('⚡ ULTRA-FAST: Parallel extraction failed, trying fallback...');
    }
    
    // Fallback to regular extraction
    return this.preloadVideo(videoUrl);
  }

  // Fallback extraction with different settings
  private async preloadVideoWithFallback(videoUrl: string): Promise<VideoStream[]> {
    // This would use a different extraction strategy
    // For now, just use the regular method
    return this.preloadVideo(videoUrl);
  }

  // Ultra-fast extraction strategy
  private async preloadVideoWithUltraFastStrategy(videoUrl: string): Promise<VideoStream[]> {
    console.log('⚡ ULTRA-FAST: Using ultra-fast extraction strategy...');
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${backendUrl}/api/extract-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extraction-Strategy': 'ultra-fast'
        },
        body: JSON.stringify({ url: videoUrl }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ultra-fast extraction failed: ${response.status}`);
      }

      const data = await response.json();
      return this.processExtractionData(data, videoUrl);
    } catch (error) {
      console.warn('⚡ ULTRA-FAST: Ultra-fast strategy failed:', error);
      throw error;
    }
  }

  // Pre-warm cache for future requests
  private preWarmCache(videoUrl: string, streams: VideoStream[]) {
    try {
      const key = this.localStorageKey + videoUrl + '_prewarmed';
      localStorage.setItem(key, JSON.stringify({
        streams,
        timestamp: Date.now(),
        expires: Date.now() + (30 * 60 * 1000) // 30 minutes
      }));
      console.log('🔥 Pre-warmed cache for:', videoUrl);
    } catch (e) {
      console.warn('Failed to pre-warm cache:', e);
    }
  }

  // Get pre-warmed cache
  private getPreWarmedCache(videoUrl: string): VideoStream[] {
    try {
      const key = this.localStorageKey + videoUrl + '_prewarmed';
      const cachedData = localStorage.getItem(key);
      
      if (cachedData) {
        const { streams, expires } = JSON.parse(cachedData);
        
        if (Date.now() < expires) {
          console.log('🔥 Using pre-warmed cache for:', videoUrl);
          return streams;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to get pre-warmed cache:', e);
    }
    
    return [];
  }

  // Process extraction data
  private processExtractionData(data: any, videoUrl: string): VideoStream[] {
    if (!data || !data.formats) {
      return [];
    }

    const streams: VideoStream[] = [];
    const processedQualities = new Set<string>();

    // Process video formats
    data.formats.forEach((format: any) => {
      if (format.url && format.vcodec !== 'none' && format.acodec !== 'none') {
        const quality = this.determineQuality(format);
        
        if (!processedQualities.has(quality)) {
          streams.push({
            url: format.url,
            quality,
            type: 'combined',
            size: format.filesize,
            width: format.width,
            height: format.height
          });
          processedQualities.add(quality);
        }
      }
    });

    // Sort by quality preference
    return streams.sort((a, b) => {
      const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];
      const aIndex = qualityOrder.indexOf(a.quality);
      const bIndex = qualityOrder.indexOf(b.quality);
      return aIndex - bIndex;
    });
  }

  // Determine quality from format
  private determineQuality(format: any): string {
    if (format.height >= 2160) return '2160p';
    if (format.height >= 1440) return '1440p';
    if (format.height >= 1080) return '1080p';
    if (format.height >= 720) return '720p';
    if (format.height >= 480) return '480p';
    return '360p';
  }
}

export const instantPreloadService = new InstantPreloadService();

// Global function to start preloading immediately
export const startGlobalVideoPreload = (videoUrl: string) => {
  instantPreloadService.startGlobalPreload(videoUrl);
};

// Background preloading for popular videos
export const startBackgroundPreloading = () => {
  console.log('🌍 Starting background preloading for popular videos...');
  
  // Popular video URLs for preloading (you can customize this list)
  const popularVideos = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll (popular test video)
    // Add more popular video URLs here
  ];
  
  popularVideos.forEach((url, index) => {
    // Stagger the preloading to avoid overwhelming the system
    setTimeout(() => {
      instantPreloadService.ultraFastExtraction(url).catch(err => {
        console.warn(`Background preload failed for ${url}:`, err);
      });
    }, index * 5000); // 5 second intervals
  });
};

// Auto-start background preloading
if (typeof window !== 'undefined') {
  // Start background preloading after 10 seconds
  setTimeout(startBackgroundPreloading, 10000);
}

// Predictive preloading based on user behavior patterns
export const predictivePreload = async (videoUrl: string, userBehavior: 'linear' | 'seek-heavy' | 'pause-heavy', currentProgress: number, totalDuration: number): Promise<void> => {
  console.log('🔮 Predictive preloading for behavior:', userBehavior);
  
  try {
    switch (userBehavior) {
      case 'linear':
        // Linear viewers: preload next segments
        if (currentProgress / totalDuration > 0.7) {
          console.log('🔮 Linear viewer: Preloading final segments');
          await instantPreloadService.preloadVideo(videoUrl);
        }
        break;
        
      case 'seek-heavy':
        // Seek-heavy users: maintain large buffer and preload multiple segments
        console.log('🔮 Seek-heavy user: Maintaining large buffer');
        await instantPreloadService.ultraFastExtraction(videoUrl);
        break;
        
      case 'pause-heavy':
        // Pause-heavy users: conservative preloading
        console.log('🔮 Pause-heavy user: Conservative preloading');
        if (currentProgress / totalDuration > 0.9) {
          await instantPreloadService.preloadVideo(videoUrl);
        }
        break;
    }
  } catch (error) {
    console.warn('Predictive preloading failed:', error);
  }
};

// Smart cache warming for frequently accessed videos
export const warmCache = async (videoUrls: string[]): Promise<void> => {
  console.log('🔥 Warming cache for', videoUrls.length, 'videos');
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 3;
  for (let i = 0; i < videoUrls.length; i += batchSize) {
    const batch = videoUrls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(url => instantPreloadService.preloadVideo(url))
    );
    
    // Small delay between batches
    if (i + batchSize < videoUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Ultra-fast instant loading for page entry
export const instantLoad = async (videoUrl: string): Promise<VideoStream[]> => {
  console.log('⚡ INSTANT LOAD: Starting ultra-fast loading for', videoUrl);
  const startTime = performance.now();
  
  try {
    // Check memory cache first (fastest)
    const memoryCache = instantPreloadService.getPreloadedStreams(videoUrl);
    if (memoryCache.length > 0 && !instantPreloadService.isGoogleVideoUrlExpired(memoryCache[0].url)) {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      console.log(`⚡ INSTANT LOAD: Memory cache hit in ${duration}ms`);
      return memoryCache;
    }
    
    // Check localStorage cache (fast)
    const localStorageKey = 'ultra_fast_streams_' + videoUrl;
    const cachedData = localStorage.getItem(localStorageKey);
    if (cachedData) {
      try {
        const streams = JSON.parse(cachedData);
        if (streams.length > 0 && !instantPreloadService.isGoogleVideoUrlExpired(streams[0].url)) {
          // Restore to memory cache
          instantPreloadService.preloadedStreams.set(videoUrl, streams);
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          console.log(`⚡ INSTANT LOAD: localStorage cache hit in ${duration}ms`);
          return streams;
        }
      } catch (e) {
        localStorage.removeItem(localStorageKey);
      }
    }
    
    // If no cache, start ultra-fast extraction
    console.log('⚡ INSTANT LOAD: No cache found, starting ultra-fast extraction');
    const streams = await instantPreloadService.ultraFastExtraction(videoUrl);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`⚡ INSTANT LOAD: Extraction completed in ${duration}ms`);
    return streams;
    
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.error(`⚡ INSTANT LOAD: Failed after ${duration}ms:`, error);
    return [];
  }
};
