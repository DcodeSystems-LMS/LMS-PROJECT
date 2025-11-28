# 🎥 Video Quality Selection Guide

Your custom video player now includes **quality selection** functionality that allows users to choose from different video quality options like 360p, 720p, 1080p, etc.

## 🎯 Features

### ✅ **Quality Selection Button**
- **Location**: Bottom-right corner of video player controls
- **Appearance**: Shows current quality (e.g., "1080p") with HD icon
- **Behavior**: Click to open quality selection dropdown

### ✅ **Quality Dropdown Menu**
- **Available Options**: 360p, 480p, 720p, 1080p, etc.
- **Current Selection**: Highlighted in blue with checkmark
- **Smooth Switching**: Changes quality without losing playback position

### ✅ **Auto Peak Quality**
- **Default Behavior**: Automatically loads highest available quality
- **Smart Selection**: Falls back to best available if preferred quality isn't available
- **Loading Indicator**: Shows quality being loaded during buffering

## 🎮 How to Use

### For Users:
1. **Start Video**: Click play on any YouTube video
2. **Find Quality Button**: Look for quality indicator in bottom-right controls
3. **Select Quality**: Click the quality button to see available options
4. **Choose Quality**: Click on desired quality (360p, 720p, 1080p, etc.)
5. **Enjoy**: Video switches to selected quality seamlessly

### For Developers:
```tsx
// Basic usage with quality selection
<CustomVideoPlayer
  videoUrl="https://www.youtube.com/watch?v=VIDEO_ID"
  title="Video Title"
  defaultQuality="1080p" // Preferred quality
/>

// With quality change callback
<CustomVideoPlayer
  videoUrl={videoUrl}
  onQualityChange={(quality) => {
    console.log('Quality changed to:', quality);
    // Save user preference
    saveUserQualityPreference(quality);
  }}
/>
```

## 🎨 Visual Design

### Quality Button:
- **Background**: Semi-transparent black with border
- **Icon**: HD icon (ri-hd-line) + current quality text
- **Hover**: Blue highlight with border color change
- **Dropdown Arrow**: Only shows when multiple qualities available

### Quality Menu:
- **Background**: Dark semi-transparent with border
- **Header**: "Video Quality" label
- **Options**: Each quality option with hover effects
- **Current Selection**: Blue text with checkmark icon
- **Positioning**: Appears above the quality button

## 🔧 Technical Details

### Backend Integration:
- **Stream Extraction**: Backend extracts multiple quality streams
- **Quality Sorting**: Streams sorted by quality (highest first)
- **Format Support**: Handles combined and separate video/audio streams
- **Response Format**: Returns structured quality data

### Frontend Implementation:
- **State Management**: Tracks current quality and available streams
- **Quality Switching**: Preserves playback position during quality changes
- **Error Handling**: Falls back to YouTube embed if extraction fails
- **Performance**: Lazy loads quality options only when needed

## 🚀 Quality Options

| Quality | Resolution | Use Case |
|---------|------------|----------|
| **1080p** | 1920×1080 | Best quality, requires good internet |
| **720p** | 1280×720 | High quality, balanced performance |
| **480p** | 854×480 | Standard quality, good for slower connections |
| **360p** | 640×360 | Lower quality, minimal bandwidth |
| **240p** | 426×240 | Lowest quality, very slow connections |

## 🛠️ Troubleshooting

### Quality Selection Not Showing:
1. **Check Backend**: Ensure backend server is running
2. **Multiple Streams**: Quality selection only shows when multiple qualities available
3. **Browser Console**: Check for JavaScript errors
4. **Network**: Verify backend API is accessible

### Quality Switching Issues:
1. **Stream Availability**: Some videos may have limited quality options
2. **Network Speed**: Very slow connections may not support high qualities
3. **Video Restrictions**: Some videos may have download/quality restrictions

### Backend Issues:
1. **yt-dlp Installation**: Ensure yt-dlp is properly installed
2. **Server Logs**: Check backend server logs for extraction errors
3. **API Response**: Verify backend returns multiple quality streams

## 📱 Testing

### Test Different Videos:
```bash
# Test with various YouTube videos
https://www.youtube.com/watch?v=dQw4w9WgXcQ  # Rick Roll
https://www.youtube.com/watch?v=9bZkp7q19f0  # Gangnam Style
https://www.youtube.com/watch?v=kJQP7kiw5Fk  # Despacito
```

### Expected Behavior:
- ✅ Quality button appears in video controls
- ✅ Clicking shows dropdown with available qualities
- ✅ Current quality is highlighted
- ✅ Switching preserves playback position
- ✅ Loading indicator shows during quality changes

## 🎉 Success Indicators

You'll know it's working when:

- ✅ **Quality Button Visible**: HD icon with current quality in controls
- ✅ **Dropdown Opens**: Clicking shows available quality options
- ✅ **Smooth Switching**: Quality changes without interruption
- ✅ **Position Preserved**: Playback position maintained during switches
- ✅ **Visual Feedback**: Current quality highlighted in dropdown
- ✅ **Loading States**: Quality shown during buffering

## 🔄 Fallback Behavior

The system has multiple fallback layers:

1. **Peak Quality** → **Preferred Quality** → **First Available**
2. **Custom Player** → **YouTube Embed**
3. **Local Backend** → **Supabase Function** → **YouTube Embed**

This ensures videos always play, even if quality selection fails.

## 📞 Support

If you encounter issues:

1. **Check Backend**: Ensure server is running on port 3001
2. **Verify Installation**: Confirm yt-dlp is installed and working
3. **Test Videos**: Try different YouTube URLs
4. **Browser Console**: Check for JavaScript errors
5. **Network Tab**: Verify API calls are successful

The quality selection feature is now fully implemented and ready to use! 🎥✨
