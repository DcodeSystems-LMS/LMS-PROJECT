export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  directUrl?: string;
  isYouTube: boolean;
}

class VideoService {
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

  // Get video information (for now, we'll use a mock approach)
  async getVideoInfo(url: string): Promise<VideoInfo | null> {
    if (!this.isYouTubeUrl(url)) {
      return null;
    }

    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) return null;

    // For now, we'll return mock data
    // In a real implementation, you would use YouTube API or a service like youtube-dl
    return {
      id: videoId,
      title: 'Video Title', // This would be fetched from YouTube API
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '0:00', // This would be fetched from YouTube API
      isYouTube: true
    };
  }

  // Get direct video URL (this is a simplified approach)
  // Note: In a real implementation, you would need a backend service to extract direct URLs
  async getDirectVideoUrl(youtubeUrl: string): Promise<string | null> {
    if (!this.isYouTubeUrl(youtubeUrl)) {
      return youtubeUrl; // Return as-is if not YouTube
    }

    const videoId = this.extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return null;

    // For demonstration, we'll return a placeholder
    // In reality, you would need a backend service that uses youtube-dl or similar
    // to extract the actual video stream URL
    return `https://example.com/video-stream/${videoId}`;
  }

  // Convert YouTube URL to embed URL (fallback for when direct streaming isn't available)
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

  // Get video thumbnail
  getVideoThumbnail(url: string): string | null {
    const videoId = this.extractYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  }
}

export const videoService = new VideoService();
