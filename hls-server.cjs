const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files from hls-output directory
app.use('/hls', express.static(path.join(__dirname, 'hls-output')));

// API endpoint to list available HLS videos
app.get('/api/hls-videos', (req, res) => {
  try {
    const hlsDir = path.join(__dirname, 'hls-output');
    
    if (!fs.existsSync(hlsDir)) {
      return res.json({ videos: [] });
    }

    const videos = fs.readdirSync(hlsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const videoDir = path.join(hlsDir, dirent.name);
        const playlistPath = path.join(videoDir, 'playlist.m3u8');
        
        if (fs.existsSync(playlistPath)) {
          return {
            id: dirent.name,
            name: dirent.name,
            hlsUrl: `http://localhost:${PORT}/hls/${dirent.name}/playlist.m3u8`,
            directory: videoDir
          };
        }
        return null;
      })
      .filter(video => video !== null);

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get specific video info
app.get('/api/hls-video/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    const videoDir = path.join(__dirname, 'hls-output', videoId);
    const playlistPath = path.join(videoDir, 'playlist.m3u8');

    if (!fs.existsSync(playlistPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoInfo = {
      id: videoId,
      name: videoId,
      hlsUrl: `http://localhost:${PORT}/hls/${videoId}/playlist.m3u8`,
      directory: videoDir,
      playlistExists: true
    };

    res.json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HLS Server is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 HLS Server started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🎬 HLS files served from: /hls/`);
  console.log(`📋 API endpoints:`);
  console.log(`   - GET /api/hls-videos - List all available videos`);
  console.log(`   - GET /api/hls-video/:id - Get specific video info`);
  console.log(`   - GET /health - Health check`);
  console.log(`\n💡 Example HLS URL: http://localhost:${PORT}/hls/your-video-id/playlist.m3u8`);
});

module.exports = app;
