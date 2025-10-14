const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

class YouTubeToHLSConverter {
  constructor() {
    this.outputDir = './hls-output';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async extractAndConvertToHLS(youtubeUrl, outputName) {
    try {
      console.log('🎬 Starting YouTube to HLS conversion...');
      console.log('📺 YouTube URL:', youtubeUrl);
      
      // Validate YouTube URL
      if (!ytdl.validateURL(youtubeUrl)) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video info
      const info = await ytdl.getInfo(youtubeUrl);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');
      const videoId = info.videoDetails.videoId;
      
      console.log('📋 Video Title:', info.videoDetails.title);
      console.log('⏱️ Duration:', info.videoDetails.lengthSeconds, 'seconds');

      // Create output directory for this video
      const videoOutputDir = path.join(this.outputDir, `${outputName || title}`);
      if (!fs.existsSync(videoOutputDir)) {
        fs.mkdirSync(videoOutputDir, { recursive: true });
      }

      // Get the best quality stream
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highest',
        filter: 'audioandvideo'
      });

      console.log('🎥 Selected Format:', format.qualityLabel, format.container);

      // Download video stream
      const videoStream = ytdl(youtubeUrl, { format });
      const outputPath = path.join(videoOutputDir, 'input.mp4');

      console.log('⬇️ Downloading video...');
      await this.downloadStream(videoStream, outputPath);

      // Convert to HLS
      console.log('🔄 Converting to HLS format...');
      const hlsPath = path.join(videoOutputDir, 'playlist.m3u8');
      await this.convertToHLS(outputPath, hlsPath, videoOutputDir);

      // Clean up input file
      fs.unlinkSync(outputPath);

      console.log('✅ Conversion completed!');
      console.log('📁 Output directory:', videoOutputDir);
      console.log('🎬 HLS playlist:', hlsPath);

      return {
        success: true,
        outputDir: videoOutputDir,
        playlistPath: hlsPath,
        videoId: videoId,
        title: info.videoDetails.title
      };

    } catch (error) {
      console.error('❌ Conversion failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async downloadStream(stream, outputPath) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(outputPath);
      
      stream.pipe(writeStream);
      
      stream.on('progress', (chunkLength, downloaded, total) => {
        const percent = (downloaded / total * 100).toFixed(2);
        process.stdout.write(`\r⬇️ Downloading: ${percent}%`);
      });

      writeStream.on('finish', () => {
        console.log('\n✅ Download completed');
        resolve();
      });

      writeStream.on('error', reject);
      stream.on('error', reject);
    });
  }

  async convertToHLS(inputPath, outputPath, outputDir) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-f hls',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts')
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('🔄 FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            process.stdout.write(`\r🔄 Converting: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('\n✅ HLS conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('\n❌ FFmpeg error:', err.message);
          reject(err);
        })
        .run();
    });
  }

  // Method to serve HLS files via HTTP
  generateHLSURL(videoId, baseURL = 'http://localhost:3001') {
    return `${baseURL}/hls/${videoId}/playlist.m3u8`;
  }
}

// Usage example
async function main() {
  const converter = new YouTubeToHLSConverter();
  
  // Example YouTube URL
  const youtubeUrl = 'https://youtu.be/fta78-pxNTo?si=QonnopIa8YkkYnBV';
  const outputName = 'c_language_tutorial';
  
  const result = await converter.extractAndConvertToHLS(youtubeUrl, outputName);
  
  if (result.success) {
    console.log('\n🎉 Success! Your video is now in HLS format');
    console.log('📁 Files created in:', result.outputDir);
    console.log('🎬 HLS URL:', converter.generateHLSURL(result.videoId));
    console.log('\n📋 Next steps:');
    console.log('1. Serve the HLS files via HTTP server');
    console.log('2. Use the HLS URL in your CustomVideoPlayer');
    console.log('3. The player will automatically detect and play the HLS stream');
  } else {
    console.log('\n❌ Conversion failed:', result.error);
  }
}

// Export for use in other modules
module.exports = YouTubeToHLSConverter;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
