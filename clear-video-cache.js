// Script to clear problematic video cache
// Run this in browser console to clear cached streams for private videos

function clearVideoCache() {
  const keys = Object.keys(localStorage);
  const videoCacheKeys = keys.filter(key => key.startsWith('ultra_fast_streams_'));
  
  console.log('Found video cache keys:', videoCacheKeys);
  
  videoCacheKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && data.streams && data.streams.length > 0) {
        const firstStream = data.streams[0];
        if (firstStream.url && firstStream.url.includes('youtube.com/embed/')) {
          console.log('Clearing problematic cache for:', key);
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.log('Error parsing cache for:', key);
    }
  });
  
  console.log('Video cache cleared!');
}

// Auto-run
clearVideoCache();