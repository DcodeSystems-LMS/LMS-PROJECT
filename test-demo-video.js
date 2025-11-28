// Test Demo Video URL and Bucket Access
console.log('🎬 Testing Demo Video Access...');

const testDemoVideo = async () => {
  try {
    // Demo video URL
    const demoVideoUrl = 'https://supabase.dcodesys.in/storage/v1/object/public/demo-videos/DCodesystems_LMS_Demo_Video_Generation.mp4';
    
    console.log('📹 Demo Video URL:', demoVideoUrl);
    
    // Test if the video URL is accessible
    const response = await fetch(demoVideoUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log('✅ Demo video is accessible!');
      console.log('📊 Video details:');
      console.log('   - Content-Type:', response.headers.get('content-type'));
      console.log('   - Content-Length:', response.headers.get('content-length'));
      console.log('   - Last-Modified:', response.headers.get('last-modified'));
      
      // Test video element creation
      const video = document.createElement('video');
      video.src = demoVideoUrl;
      video.preload = 'metadata';
      
      video.addEventListener('loadedmetadata', () => {
        console.log('🎥 Video metadata loaded:');
        console.log('   - Duration:', video.duration, 'seconds');
        console.log('   - Video Width:', video.videoWidth);
        console.log('   - Video Height:', video.videoHeight);
        console.log('   - Ready State:', video.readyState);
      });
      
      video.addEventListener('error', (e) => {
        console.error('❌ Video loading error:', e);
      });
      
      video.load();
      
    } else {
      console.log('❌ Demo video is not accessible');
      console.log('📋 Response status:', response.status);
      console.log('📋 Response status text:', response.statusText);
      
      if (response.status === 404) {
        console.log('💡 The video file might not exist in the demo-videos bucket');
        console.log('💡 Please check:');
        console.log('   1. The bucket "demo-videos" exists in your Supabase storage');
        console.log('   2. The file "DCodesystems_LMS_Demo_Video_Generation.mp4" is uploaded');
        console.log('   3. The bucket is set to public');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('💡 This might be a CORS issue or network problem');
  }
};

// Run the test
testDemoVideo();













