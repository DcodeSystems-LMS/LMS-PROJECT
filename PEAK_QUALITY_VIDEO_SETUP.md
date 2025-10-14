# Peak Quality Video Extraction Setup

This guide explains how to set up the enhanced video extraction system that extracts YouTube videos at peak quality and plays them in your custom video player.

## 🎯 What's New

- **Peak Quality Extraction** - Automatically extracts the highest quality video streams available
- **Multiple Quality Options** - Provides multiple quality choices (1080p, 720p, 480p, etc.)
- **Smart Stream Selection** - Combines best video + audio streams for optimal quality
- **Quality Selection UI** - Users can choose their preferred video quality
- **Enhanced Backend** - Improved yt-dlp integration with better format selection

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install yt-dlp (recommended over youtube-dl)
pip3 install yt-dlp

# Verify installation
yt-dlp --version
```

### 2. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3001`

### 3. Test the Setup

```bash
# Run the test script
node test-video-extraction.js
```

## 🔧 How It Works

### Backend Improvements

The backend now:

1. **Extracts Multiple Formats** - Gets both combined and separate video/audio streams
2. **Prioritizes Quality** - Sorts streams by quality (highest first)
3. **Smart Combinations** - Creates best video + best audio combinations
4. **Format Optimization** - Uses `--format "best[height<=1080]/best"` for optimal quality
5. **Returns Structured Data** - Provides quality options and stream metadata

### Frontend Enhancements

The CustomVideoPlayer now:

1. **Auto-Detects Peak Quality** - Automatically selects the highest available quality
2. **Quality Selection UI** - Shows dropdown with available qualities
3. **Seamless Switching** - Changes quality without losing playback position
4. **Fallback Support** - Falls back to YouTube embed if extraction fails

## 📊 Quality Selection

The system provides these quality options:

- **1080p** - Full HD (highest quality)
- **720p** - HD quality
- **480p** - Standard quality
- **360p** - Lower quality (for slower connections)
- **240p** - Lowest quality

## 🎮 Usage Examples

### Basic Usage (Auto Peak Quality)

```tsx
import CustomVideoPlayer from '@/components/feature/CustomVideoPlayer';

<CustomVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=VIDEO_ID"
  title="Video Title"
  defaultQuality="1080p" // Will auto-select peak quality
/>
```

### With Quality Selection

```tsx
<CustomVideoPlayer
  videoUrl={lesson.videoUrl}
  title={lesson.title}
  defaultQuality="720p" // Default preference
  onTimeUpdate={(currentTime, duration) => {
    // Track progress
    saveVideoProgress(lesson.id, currentTime, duration);
  }}
/>
```

## 🔍 API Response Format

The backend now returns enhanced video information:

```json
{
  "id": "VIDEO_ID",
  "title": "Video Title",
  "description": "Video Description",
  "duration": 1800,
  "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
  "streams": [
    {
      "url": "https://direct-video-url.com/video.mp4",
      "quality": "1080p",
      "format": "mp4",
      "size": 50000000,
      "fps": 30,
      "vcodec": "avc1",
      "acodec": "mp4a",
      "type": "combined"
    },
    {
      "url": "https://direct-video-url.com/video-720p.mp4",
      "quality": "720p",
      "format": "mp4",
      "type": "combined"
    }
  ],
  "availableQualities": ["1080p", "720p", "480p"],
  "isYouTube": true
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Backend Not Starting
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Kill any process using port 3001
lsof -ti:3001 | xargs kill -9
```

#### 2. yt-dlp Not Found
```bash
# Install globally
pip3 install --user yt-dlp

# Add to PATH (Linux/Mac)
export PATH="$HOME/.local/bin:$PATH"
```

#### 3. No Streams Available
- Some videos may have download restrictions
- Try different YouTube videos
- Check if the video is publicly accessible

#### 4. Quality Selection Not Showing
- Ensure multiple quality streams are available
- Check browser console for errors
- Verify backend is returning multiple streams

### Debug Mode

Enable debug logging:

```typescript
// In videoExtractionService.ts
console.log('Available streams:', streams);
console.log('Selected quality:', selectedStream.quality);
```

## 🚀 Performance Tips

1. **Caching** - The backend caches extracted video info
2. **Lazy Loading** - Streams are loaded only when needed
3. **Quality Selection** - Users can choose appropriate quality for their connection
4. **Fallback** - Always falls back to YouTube embed if extraction fails

## 🔒 Security Considerations

1. **Rate Limiting** - Implement rate limiting on the backend
2. **Authentication** - Add API key authentication for production
3. **CORS** - Configure proper CORS policies
4. **Content Validation** - Validate YouTube URLs before processing

## 📱 Testing

### Test Different Videos

```bash
# Short video
node test-video-extraction.js

# Test with different YouTube URLs
curl -X POST http://localhost:3001/api/extract-video \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"}'
```

### Frontend Testing

1. Open your app in browser
2. Navigate to a course with YouTube video
3. Check that quality selection appears
4. Test quality switching
5. Verify peak quality is selected by default

## 🎉 Success Indicators

You'll know it's working when:

- ✅ Backend server starts without errors
- ✅ Test script shows multiple quality streams
- ✅ Custom player loads with peak quality
- ✅ Quality selection dropdown appears
- ✅ Quality switching works smoothly
- ✅ No iframe, pure HTML5 video element

## 🔄 Fallback Behavior

The system has multiple fallback layers:

1. **Peak Quality** → **Preferred Quality** → **First Available**
2. **Custom Player** → **YouTube Embed**
3. **Local Backend** → **Supabase Function** → **YouTube Embed**

This ensures videos always play, even if extraction fails.

## 📞 Support

If you encounter issues:

1. Check backend server logs
2. Verify yt-dlp installation
3. Test with different YouTube URLs
4. Check browser console for errors
5. Ensure backend is accessible from frontend

The system is designed to be robust with multiple fallback layers, so videos will always play even if extraction fails.
