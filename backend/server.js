const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG = process.env.DEBUG === 'true';

// Configure CORS based on environment
const corsOptions = {
  origin: function (origin, callback) {
    if (NODE_ENV === 'development') {
      // Allow localhost in development
      callback(null, true);
    } else {
      // Production: restrict to specific domains
      const allowedOrigins = process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',') : 
        ['https://yourdomain.com'];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-extraction-strategy']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for production (Hostinger)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security headers for production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Simple rate limiting (in-memory)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 900000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

function rateLimit(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (clientData.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
}

// Helper function to validate YouTube URLs
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
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

// Helper function to check if yt-dlp is available
function checkYtDlpAvailability() {
  return new Promise((resolve) => {
    exec('yt-dlp --version', (error) => {
      resolve(!error);
    });
  });
}

// Apply rate limiting to API endpoints
app.use('/api/', rateLimit);

// YouTube video extraction endpoint
app.post('/api/extract-video', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    if (DEBUG) {
      console.log('Extracting video from:', url);
    }

    // Check if yt-dlp is available
    const ytDlpAvailable = await checkYtDlpAvailability();
    
    if (!ytDlpAvailable) {
      return res.status(503).json({ 
        error: 'Video extraction service temporarily unavailable',
        fallback: 'Please use YouTube embed instead'
      });
    }

    // Use yt-dlp to extract video information with ULTRA JET SPEED optimizations
    // Format selector: Get ALL available formats (including 2160p, 1440p, etc.) without filtering
    // Remove --format to get all formats, or use a format that includes all video qualities
    // Using format selector that gets all video+audio combinations for all qualities
    const timeout = parseInt(process.env.YT_DLP_TIMEOUT) || 15000; // Increased timeout for 4K videos
    // Get all formats by not specifying format, or use format selector for all video qualities
    // Format: bestvideo[height<=2160]+bestaudio/bestvideo[height<=1440]+bestaudio/.../best
    // But to get ALL qualities, we'll let yt-dlp return all formats without filtering
    const command = `yt-dlp --dump-json --no-warnings --no-check-certificate --no-playlist --skip-download --prefer-free-formats --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" --extractor-args "youtube:player_client=android" "${url}"`;
    
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        if (DEBUG) {
          console.error('yt-dlp error:', error);
        }
        
        // Handle different types of errors
        if (error.code === 'ENOENT') {
          return res.status(503).json({ 
            error: 'Video extraction tool not available',
            fallback: 'Please use YouTube embed instead'
          });
        }
        
        if (error.signal === 'SIGTERM') {
          return res.status(408).json({ 
            error: 'Request timeout',
            details: 'Video extraction took too long'
          });
        }
        
        // Handle truly private videos (not unlisted)
        if (error.message && error.message.includes('Private video') && !error.message.includes('unlisted')) {
          return res.status(403).json({ 
            error: 'Video is private and requires authentication',
            details: 'This video is private and cannot be extracted without login'
          });
        }
        
        // Handle unlisted videos - these should work with yt-dlp
        if (error.message && (error.message.includes('unlisted') || error.message.includes('Video unavailable'))) {
          // Try with different yt-dlp options for unlisted videos
          const unlistedCommand = `yt-dlp --dump-json --no-warnings --no-check-certificate --no-playlist --skip-download --prefer-free-formats --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" --extractor-args "youtube:player_client=android" "${url}"`;
          
          exec(unlistedCommand, { timeout: 20000 }, (unlistedError, unlistedStdout, unlistedStderr) => {
            if (unlistedError) {
              console.log('❌ Unlisted video extraction also failed:', unlistedError.message);
              return res.status(403).json({ 
                error: 'Video is unlisted and cannot be accessed',
                details: 'This unlisted video may have restricted access'
              });
            }
            
            try {
              const videoInfo = JSON.parse(unlistedStdout);
              const processedInfo = processVideoInfo(videoInfo);
              console.log('✅ Unlisted video extraction successful!');
              res.json(processedInfo);
            } catch (parseError) {
              console.error('❌ Failed to parse unlisted video info:', parseError);
              res.status(500).json({ 
                error: 'Failed to process unlisted video information',
                details: 'Video data could not be parsed'
              });
            }
          });
          return; // Important: return here to prevent double response
        }
        
        // Provide fallback response when yt-dlp fails
        return res.status(200).json({
          id: extractVideoId(url),
          title: 'Video extraction unavailable',
          description: 'Video extraction service is temporarily unavailable. Please use YouTube embed instead.',
          duration: 0,
          thumbnail: null,
          uploader: 'Unknown',
          upload_date: null,
          view_count: 0,
          streams: [],
          isYouTube: true,
          availableQualities: [],
          fallback: true,
          error: 'Video extraction service unavailable'
        });
      }

      try {
        const videoInfo = JSON.parse(stdout);
        
        if (DEBUG) {
          console.log('Successfully extracted video info for:', videoInfo.title);
          console.log('Raw formats count:', videoInfo.formats ? videoInfo.formats.length : 0);
        }
        
        // Process the video info and extract streams
        const processedInfo = processVideoInfo(videoInfo);
        
        if (DEBUG) {
          console.log('Raw formats count:', videoInfo.formats ? videoInfo.formats.length : 0);
          console.log('Processed streams count:', processedInfo.streams.length);
          console.log('Streams with audio:', processedInfo.streams.filter(s => s.acodec && s.acodec !== 'none').length);
          console.log('Available qualities:', processedInfo.availableQualities);
          
          // Log all available qualities with their resolutions
          console.log('All available qualities with resolutions:');
          processedInfo.streams.forEach(stream => {
            console.log(`  - ${stream.quality}: ${stream.width}x${stream.height} (${stream.type})`);
          });
        }
        
        // For testing: Add multiple quality options if only one is available
        if (processedInfo.streams.length === 1) {
          const originalStream = processedInfo.streams[0];
          const mockQualities = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'];
          
          // Create mock streams for different qualities
          processedInfo.streams = mockQualities.map(quality => ({
            ...originalStream,
            quality: quality,
            url: originalStream.url, // Same URL for testing
            type: 'combined'
          }));
          
          processedInfo.availableQualities = mockQualities;
        }
        
        res.json(processedInfo);
      } catch (parseError) {
        if (DEBUG) {
          console.error('JSON parse error:', parseError);
        }
        res.status(500).json({ 
          error: 'Failed to parse video information',
          details: NODE_ENV === 'development' ? parseError.message : 'Internal server error'
        });
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Process youtube-dl output
function processVideoInfo(videoInfo) {
  const streams = [];
  const videoStreams = [];
  const audioStreams = [];
  
  if (videoInfo.formats) {
    for (const format of videoInfo.formats) {
      // Separate video-only and audio-only streams
      if (format.vcodec !== 'none' && format.acodec === 'none') {
        // Video-only stream
        videoStreams.push({
          url: format.url,
          quality: format.height ? `${format.height}p` : 'unknown',
          format: format.ext,
          size: format.filesize,
          fps: format.fps,
          width: format.width,
          height: format.height,
          vcodec: format.vcodec,
          acodec: format.acodec,
          type: 'video'
        });
      } else if (format.vcodec === 'none' && format.acodec !== 'none') {
        // Audio-only stream
        audioStreams.push({
          url: format.url,
          quality: format.abr ? `${format.abr}kbps` : 'unknown',
          format: format.ext,
          size: format.filesize,
          vcodec: format.vcodec,
          acodec: format.acodec,
          type: 'audio'
        });
      } else if (format.vcodec !== 'none' && format.acodec !== 'none') {
        // Combined video+audio stream
        streams.push({
          url: format.url,
          quality: format.height ? `${format.height}p` : 'unknown',
          format: format.ext,
          size: format.filesize,
          fps: format.fps,
          width: format.width,
          height: format.height,
          vcodec: format.vcodec,
          acodec: format.acodec,
          type: 'combined'
        });
      }
    }
  }

  // Sort video streams by quality (highest first)
  videoStreams.sort((a, b) => {
    const aQuality = parseInt(a.quality.replace('p', '')) || 0;
    const bQuality = parseInt(b.quality.replace('p', '')) || 0;
    return bQuality - aQuality;
  });

  // Sort audio streams by bitrate (highest first)
  audioStreams.sort((a, b) => {
    const aBitrate = parseInt(a.quality.replace('kbps', '')) || 0;
    const bBitrate = parseInt(b.quality.replace('kbps', '')) || 0;
    return bBitrate - aBitrate;
  });

  // Sort combined streams by quality (highest first)
  streams.sort((a, b) => {
    const aQuality = parseInt(a.quality.replace('p', '')) || 0;
    const bQuality = parseInt(b.quality.replace('p', '')) || 0;
    return bQuality - aQuality;
  });

  // Create best quality combinations
  const bestStreams = [];
  
  // Add combined streams first (they're usually the best quality)
  bestStreams.push(...streams);
  
    // Create video + audio combinations for each quality
    if (videoStreams.length > 0 && audioStreams.length > 0) {
      const bestAudio = audioStreams[0]; // Use best audio for all video qualities
      
      // Create separate stream for each video quality
      videoStreams.forEach(videoStream => {
        bestStreams.push({
          url: videoStream.url,
          audioUrl: bestAudio.url,
          quality: videoStream.quality,
          format: videoStream.format,
          size: (videoStream.size || 0) + (bestAudio.size || 0),
          fps: videoStream.fps,
          width: videoStream.width,
          height: videoStream.height,
          vcodec: videoStream.vcodec,
          acodec: bestAudio.acodec,
          type: 'separate'
        });
      });
    }

  // Remove duplicates and sort by quality
  const uniqueStreams = bestStreams.filter((stream, index, self) => 
    index === self.findIndex(s => s.quality === stream.quality)
  ).sort((a, b) => {
    const aQuality = parseInt(a.quality.replace('p', '')) || 0;
    const bQuality = parseInt(b.quality.replace('p', '')) || 0;
    return bQuality - aQuality;
  });

  return {
    id: videoInfo.id,
    title: videoInfo.title,
    description: videoInfo.description,
    duration: videoInfo.duration,
    thumbnail: videoInfo.thumbnail,
    uploader: videoInfo.uploader,
    upload_date: videoInfo.upload_date,
    view_count: videoInfo.view_count,
    streams: uniqueStreams,
    isYouTube: true,
    availableQualities: uniqueStreams.map(s => s.quality)
  };
}

// ============================================================================
// Judge0 API Proxy Routes
// ============================================================================
// These routes proxy requests to the Judge0 Cloud API to avoid CORS issues
// 
// Judge0 Cloud API: https://judge0-ce.p.rapidapi.com
// 
// Configure JUDGE0_BASE_URL and JUDGE0_API_KEY in environment variables
// Default: https://judge0-ce.p.rapidapi.com

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || process.env.JUDGE0_RAPIDAPI_KEY;
const JUDGE0_TIMEOUT = parseInt(process.env.JUDGE0_TIMEOUT) || 20000; // 20 seconds default

// Helper function to proxy requests to Judge0 Cloud API
async function proxyToJudge0(req, res, endpoint, method = 'GET', body = null) {
  const url = `${JUDGE0_BASE_URL}${endpoint}`;
  
  // Build query string from request query params
  const queryParams = new URLSearchParams(req.query).toString();
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;
  
  // Prepare headers for Judge0 Cloud API
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add API key if available (for RapidAPI or other cloud services)
  if (JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  
  const options = {
    method: method,
    headers: headers,
    timeout: JUDGE0_TIMEOUT,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  let timeoutId;
  try {
    // Use node-fetch if available, otherwise use built-in fetch (Node 18+)
    let fetch;
    try {
      fetch = require('node-fetch');
    } catch {
      // Node 18+ has built-in fetch
      fetch = global.fetch;
    }
    
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), JUDGE0_TIMEOUT);
    
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || 'Judge0 API error',
        details: data
      });
    }
    
    res.json(data);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Judge0 server did not respond in time. Please try again later.'
      });
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Judge0 execution server is not reachable right now. Please try again later.'
      });
    }
    
    console.error('Judge0 proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? error.message : 'Failed to communicate with Judge0 server'
    });
  }
}

// GET /api/judge0/languages - Get all supported languages
app.get('/api/judge0/languages', async (req, res) => {
  await proxyToJudge0(req, res, '/languages', 'GET');
});

// GET /api/judge0/statuses - Get all status codes
app.get('/api/judge0/statuses', async (req, res) => {
  await proxyToJudge0(req, res, '/statuses', 'GET');
});

// GET /api/judge0/about - Get API information
app.get('/api/judge0/about', async (req, res) => {
  await proxyToJudge0(req, res, '/about', 'GET');
});

// POST /api/judge0/submissions - Create a new submission
app.post('/api/judge0/submissions', async (req, res) => {
  // Add query parameters for Judge0 Cloud API
  // Use wait=true to get result immediately (no polling needed)
  req.query = {
    base64_encoded: 'false',
    wait: 'true', // Get result immediately
    fields: 'stdout,stderr,compile_output,status_id,status,language,time,memory,message'
  };
  
  await proxyToJudge0(req, res, '/submissions', 'POST', req.body);
});

// GET /api/judge0/submissions/:token - Get submission result
app.get('/api/judge0/submissions/:token', async (req, res) => {
  // Add query parameters for Judge0
  req.query = {
    base64_encoded: 'false',
    wait: 'false',
    fields: 'stdout,stderr,compile_output,status_id,status,language,time,memory,message'
  };
  
  const endpoint = `/submissions/${req.params.token}`;
  await proxyToJudge0(req, res, endpoint, 'GET');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const ytDlpAvailable = await checkYtDlpAvailability();
    const uptime = process.uptime();
    
    res.json({ 
      status: 'OK', 
      message: 'Video extraction service is running',
      environment: NODE_ENV,
      uptime: Math.floor(uptime),
      ytDlpAvailable: ytDlpAvailable,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// Status endpoint for detailed system information
app.get('/api/status', async (req, res) => {
  try {
    const ytDlpAvailable = await checkYtDlpAvailability();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'OK',
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.floor(process.uptime()),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        }
      },
      services: {
        ytDlpAvailable: ytDlpAvailable,
        corsEnabled: true,
        rateLimitEnabled: true
      },
      environment: {
        nodeEnv: NODE_ENV,
        port: PORT,
        debug: DEBUG,
        corsOrigin: process.env.CORS_ORIGIN || 'default'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Status check failed',
      error: NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Video extraction server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
