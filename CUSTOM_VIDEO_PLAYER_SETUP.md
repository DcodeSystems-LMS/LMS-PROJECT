# Custom Video Player Setup Guide

This guide explains how to set up the custom video player that can extract and play video content from YouTube URLs instead of using the default YouTube embed.

## Overview

The custom video player system consists of:

1. **CustomVideoPlayer Component** - A React component that provides a custom video player interface
2. **VideoExtractionService** - A service that extracts direct video URLs from YouTube links
3. **Supabase Edge Function** - A backend function that uses youtube-dl to extract video streams
4. **Fallback System** - Falls back to YouTube embed if extraction fails

## Features

- ✅ Custom video player with full controls (play, pause, seek, volume, fullscreen)
- ✅ YouTube URL detection and video extraction
- ✅ Multiple quality options (720p, 480p, 360p)
- ✅ Automatic fallback to YouTube embed if extraction fails
- ✅ Progress tracking and resume functionality
- ✅ Responsive design with modern UI
- ✅ Loading states and error handling

## Setup Instructions

### 1. Frontend Setup (Already Complete)

The frontend components are already set up and ready to use:

- `src/components/feature/CustomVideoPlayer.tsx` - Main video player component
- `src/services/videoExtractionService.ts` - Video extraction service
- `src/services/videoService.ts` - Basic video utilities

### 2. Backend Setup (Required for Full Functionality)

To enable actual video extraction, you need to set up a backend service:

#### Option A: Supabase Edge Function (Recommended)

1. **Deploy the Edge Function:**
   ```bash
   # Deploy the extract-video function
   supabase functions deploy extract-video
   ```

2. **Update the Supabase URL:**
   In `src/services/videoExtractionService.ts`, update the `supabaseUrl`:
   ```typescript
   private supabaseUrl = 'https://your-actual-project-id.supabase.co/functions/v1/extract-video';
   ```

3. **Install youtube-dl in your Supabase environment:**
   You'll need to modify the Supabase function to include youtube-dl. This requires custom Docker configuration.

#### Option B: Custom Backend API

1. **Create a Node.js/Express API endpoint:**
   ```javascript
   // Example: /api/video/extract
   app.post('/api/video/extract', async (req, res) => {
     const { url } = req.body;
     
     // Use youtube-dl or ytdl-core to extract video info
     const videoInfo = await extractVideoInfo(url);
     
     res.json(videoInfo);
   });
   ```

2. **Update the service URL:**
   In `src/services/videoExtractionService.ts`, update the `baseUrl`:
   ```typescript
   private baseUrl = 'https://your-api-domain.com/api/video';
   ```

### 3. Environment Variables

Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## How It Works

### 1. Video URL Detection
When a video URL is provided, the system:
- Detects if it's a YouTube URL
- Extracts the video ID
- Attempts to get direct video streams

### 2. Video Extraction Process
```typescript
// 1. Extract video ID from YouTube URL
const videoId = extractVideoId('https://www.youtube.com/watch?v=VIDEO_ID');

// 2. Call backend service to get video streams
const videoInfo = await videoExtractionService.extractVideoInfo(url);

// 3. Select best quality stream
const streamUrl = await videoExtractionService.getBestStreamUrl(url, '720p');

// 4. Play video in custom player
<CustomVideoPlayer videoUrl={streamUrl} />
```

### 3. Fallback System
If video extraction fails:
- Falls back to YouTube embed iframe
- Maintains the same UI/UX
- No disruption to user experience

## Usage Examples

### Basic Usage
```tsx
import CustomVideoPlayer from '@/components/feature/CustomVideoPlayer';

<CustomVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=VIDEO_ID"
  title="Video Title"
  onTimeUpdate={(currentTime, duration) => {
    console.log(`Progress: ${currentTime}/${duration}`);
  }}
/>
```

### With Progress Tracking
```tsx
<CustomVideoPlayer
  videoUrl={lesson.videoUrl}
  title={lesson.title}
  onTimeUpdate={(currentTime, duration) => {
    // Save progress to database
    saveVideoProgress(lesson.id, currentTime, duration);
  }}
  onEnded={() => {
    // Mark lesson as completed
    markLessonComplete(lesson.id);
  }}
/>
```

## Customization

### Player Controls
The custom player includes:
- Play/Pause button
- Progress bar with seeking
- Volume control with mute
- Fullscreen toggle
- Time display (current/total)

### Styling
The player uses Tailwind CSS classes and can be customized:
```tsx
<CustomVideoPlayer
  videoUrl={url}
  className="rounded-xl shadow-lg" // Custom styling
/>
```

### Quality Selection
You can specify preferred quality:
```typescript
const streamUrl = await videoExtractionService.getBestStreamUrl(url, '1080p');
```

## Troubleshooting

### Common Issues

1. **Videos not loading:**
   - Check if the backend service is running
   - Verify YouTube URL format
   - Check browser console for errors

2. **Fallback to YouTube embed:**
   - This is normal behavior when extraction fails
   - Check backend service logs
   - Verify youtube-dl installation

3. **CORS errors:**
   - Ensure backend has proper CORS headers
   - Check Supabase function configuration

### Debug Mode
Enable debug logging:
```typescript
// In videoExtractionService.ts
console.log('Extracting video:', youtubeUrl);
console.log('Video info:', videoInfo);
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting on your backend API
2. **Authentication:** Add authentication for video extraction endpoints
3. **CORS:** Configure proper CORS policies
4. **Content Validation:** Validate YouTube URLs before processing

## Performance Optimization

1. **Caching:** Cache extracted video URLs to avoid repeated extraction
2. **CDN:** Use CDN for video streams if possible
3. **Lazy Loading:** Load video streams only when needed
4. **Quality Selection:** Allow users to choose video quality

## Future Enhancements

- [ ] Support for other video platforms (Vimeo, etc.)
- [ ] Adaptive bitrate streaming
- [ ] Video chapters and navigation
- [ ] Subtitle support
- [ ] Picture-in-picture mode
- [ ] Keyboard shortcuts
- [ ] Playback speed control

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify backend service is running
3. Test with different YouTube URLs
4. Check network requests in browser dev tools
