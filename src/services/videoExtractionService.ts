export interface VideoStream {
  url: string;
  quality: string;
  type: 'video' | 'audio' | 'combined' | 'separate';
  audioUrl?: string;
  acodec?: string;
  vcodec?: string;
  filesize?: number;
  fps?: number;
  width?: number;
  height?: number;
}

class VideoExtractionService {
  // Get backend URL from environment or use default
  private getBackendUrl(): string {
    return import.meta.env.VITE_BACKEND_URL || 'http://49.204.168.41:3001';
  }

  // Check backend health status
  async checkHealth(): Promise<{
    status: string;
    message: string;
    environment?: string;
    uptime?: number;
    ytDlpAvailable?: boolean;
    timestamp?: string;
    version?: string;
  }> {
    try {
      const backendUrl = this.getBackendUrl();
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking backend health:', error);
      throw error;
    }
  }

  // Extract YouTube video ID from various URL formats
  private extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
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
  }

  // Check if URL is a YouTube URL
  isYouTubeUrl(url: string): boolean {
    return this.extractYouTubeVideoId(url) !== null;
  }

  // Check if URL is an HLS stream
  isHlsUrl(url: string): boolean {
    return url.includes('.m3u8') || url.includes('hls') || url.includes('stream');
  }

  // Convert embed URL to regular YouTube URL
  convertEmbedToRegularUrl(url: string): string {
    if (!url) return url;
    
    if (url.includes('youtube.com/embed/')) {
      const videoId = this.extractYouTubeVideoId(url);
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    return url;
  }

  // Convert YouTube URL to embed URL
  convertToEmbedUrl(url: string): string {
    if (!url) return '';
    
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    const videoId = this.extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  }

  // Extract video ID from URL
  extractVideoId(url: string): string | null {
    return this.extractYouTubeVideoId(url);
  }

  // Get available streams for a YouTube video
  async getAvailableStreams(url: string): Promise<VideoStream[]> {
    if (!this.isYouTubeUrl(url)) {
      throw new Error('URL is not a valid YouTube URL');
    }

    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }

    try {
      // JET SPEED: Call the backend API with ultra-fast settings
      const backendUrl = this.getBackendUrl();
      console.log('🚀 JET SPEED: Starting ultra-fast extraction...');
      
      // JET SPEED: Use AbortController for timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${backendUrl}/api/extract-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ Backend extraction failed (${response.status}):`, errorData.error || 'Unknown error');
        
        // Handle different types of errors
        if (response.status === 403) {
          if (errorData.error?.includes('private')) {
            throw new Error('This video is private and requires authentication to access.');
          } else if (errorData.error?.includes('unlisted')) {
            throw new Error('This unlisted video cannot be accessed at this time.');
          } else {
            throw new Error('This video is restricted and cannot be played.');
          }
        }
        
        // For other errors, throw proper error instead of using embed URL
        throw new Error(`Video extraction failed: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully extracted ${data.streams?.length || 0} streams for video ${videoId}`);
      
      // Transform backend response to VideoStream format
      const streams: VideoStream[] = data.streams?.map((stream: any) => ({
        url: stream.url,
        quality: stream.quality,
        type: stream.type,
        audioUrl: stream.audioUrl,
        acodec: stream.acodec,
        vcodec: stream.vcodec,
        filesize: stream.size,
        fps: stream.fps,
        width: stream.width,
        height: stream.height
      })) || [];

      return streams;

    } catch (error) {
      console.error('Error extracting video streams:', error);
      
      // Re-throw the error instead of using embed URL fallback
      throw error;
    }
  }

  // Get video information
  async getVideoInfo(url: string): Promise<{
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    isYouTube: boolean;
  } | null> {
    if (!this.isYouTubeUrl(url)) {
      return null;
    }

    const videoId = this.extractVideoId(url);
    if (!videoId) return null;

    try {
      // Call the backend API to get video information
      const backendUrl = this.getBackendUrl();
      const response = await fetch(`${backendUrl}/api/extract-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id || videoId,
          title: data.title || 'Unknown Title',
          thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: data.duration ? `${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}` : 'Unknown',
          isYouTube: true
        };
      }
    } catch (error) {
      console.warn('Failed to get video info from backend:', error);
    }

    // Fallback to basic video info
    return {
      id: videoId,
      title: 'Video Title',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 'Unknown',
      isYouTube: true
    };
  }
}

export const videoExtractionService = new VideoExtractionService();