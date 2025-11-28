import { instantPreloadService, instantLoad } from './instantPreloadService';

class GlobalPreloader {
  private isInitialized = false;
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // Popular video URLs that should be preloaded globally
  private popularVideos = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll (popular test video)
    // Add more popular video URLs here
  ];

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    console.log('🌍 GLOBAL PRELOADER: Initializing...');
    this.isInitialized = true;
    
    // Start preloading popular videos after a short delay
    setTimeout(() => {
      this.preloadPopularVideos();
    }, 2000);
  }

  // Add video to preload queue
  addToPreloadQueue(videoUrl: string) {
    if (!this.preloadQueue.includes(videoUrl)) {
      this.preloadQueue.push(videoUrl);
      console.log('🌍 GLOBAL PRELOADER: Added to queue:', videoUrl);
      
      // Start processing queue if not already running
      if (!this.isPreloading) {
        this.processQueue();
      }
    }
  }

  // Preload popular videos
  private async preloadPopularVideos() {
    console.log('🌍 GLOBAL PRELOADER: Starting popular videos preload...');
    
    for (const videoUrl of this.popularVideos) {
      try {
        await instantLoad(videoUrl);
        console.log('🌍 GLOBAL PRELOADER: Preloaded popular video:', videoUrl);
      } catch (error) {
        console.warn('🌍 GLOBAL PRELOADER: Failed to preload popular video:', videoUrl, error);
      }
      
      // Small delay between preloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Process the preload queue
  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    console.log('🌍 GLOBAL PRELOADER: Processing queue with', this.preloadQueue.length, 'videos');
    
    while (this.preloadQueue.length > 0) {
      const videoUrl = this.preloadQueue.shift()!;
      
      try {
        await instantLoad(videoUrl);
        console.log('🌍 GLOBAL PRELOADER: Processed:', videoUrl);
      } catch (error) {
        console.warn('🌍 GLOBAL PRELOADER: Failed to process:', videoUrl, error);
      }
      
      // Small delay between processing
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.isPreloading = false;
    console.log('🌍 GLOBAL PRELOADER: Queue processing completed');
  }

  // Get preload status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      queueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading,
      popularVideosCount: this.popularVideos.length
    };
  }
}

// Create global instance
export const globalPreloader = new GlobalPreloader();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Start global preloader immediately
  globalPreloader;
}
