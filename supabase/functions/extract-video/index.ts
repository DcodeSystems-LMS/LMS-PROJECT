// Supabase Edge Function for extracting video streams from YouTube URLs
// This function uses youtube-dl to extract direct video URLs

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface VideoStream {
  url: string;
  quality: string;
  format: string;
  size?: number;
}

interface ExtractedVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  streams: VideoStream[];
  isYouTube: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // In a real implementation, you would use youtube-dl here
    // For now, we'll return mock data
    const mockResponse: ExtractedVideoInfo = {
      id: videoId,
      title: 'Sample Video Title',
      description: 'Sample video description',
      duration: 1800, // 30 minutes in seconds
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      streams: [
        {
          url: `https://example.com/video-streams/${videoId}/720p.mp4`,
          quality: '720p',
          format: 'mp4',
          size: 50000000 // 50MB
        },
        {
          url: `https://example.com/video-streams/${videoId}/480p.mp4`,
          quality: '480p',
          format: 'mp4',
          size: 30000000 // 30MB
        },
        {
          url: `https://example.com/video-streams/${videoId}/360p.mp4`,
          quality: '360p',
          format: 'mp4',
          size: 20000000 // 20MB
        }
      ],
      isYouTube: true
    }

    // Real implementation would look like this:
    /*
    const command = new Deno.Command('youtube-dl', {
      args: [
        '--dump-json',
        '--no-warnings',
        '--no-check-certificate',
        url
      ],
    })

    const { code, stdout, stderr } = await command.output()
    
    if (code !== 0) {
      throw new Error(`youtube-dl failed: ${new TextDecoder().decode(stderr)}`)
    }

    const videoInfo = JSON.parse(new TextDecoder().decode(stdout))
    
    // Process the video info and extract streams
    const processedInfo = processVideoInfo(videoInfo)
    */

    return new Response(
      JSON.stringify(mockResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error extracting video:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to extract video information' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

function processVideoInfo(videoInfo: any): ExtractedVideoInfo {
  // Process youtube-dl output and format it for our needs
  const streams: VideoStream[] = []
  
  if (videoInfo.formats) {
    for (const format of videoInfo.formats) {
      if (format.vcodec !== 'none' && format.acodec !== 'none') {
        streams.push({
          url: format.url,
          quality: format.height ? `${format.height}p` : 'unknown',
          format: format.ext,
          size: format.filesize
        })
      }
    }
  }

  return {
    id: videoInfo.id,
    title: videoInfo.title,
    description: videoInfo.description,
    duration: videoInfo.duration,
    thumbnail: videoInfo.thumbnail,
    streams: streams.sort((a, b) => {
      const aQuality = parseInt(a.quality.replace('p', ''))
      const bQuality = parseInt(b.quality.replace('p', ''))
      return bQuality - aQuality // Sort by quality descending
    }),
    isYouTube: true
  }
}
