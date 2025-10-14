// Debug script to check why availableStreams is not loading
// Copy and paste this into your browser console

console.log('🔍 Debugging Streams Loading Issue');
console.log('==================================');

// Check if debug functions are available and run them
if (typeof window.debugQualityButton === 'function') {
    console.log('\n🎯 Running debugQualityButton...');
    window.debugQualityButton();
} else {
    console.log('❌ debugQualityButton not available');
}

if (typeof window.debugVideoPlayer === 'function') {
    console.log('\n🎥 Running debugVideoPlayer...');
    window.debugVideoPlayer();
} else {
    console.log('❌ debugVideoPlayer not available');
}

// Check for any global variables that might contain stream data
console.log('\n📊 Checking for Stream Data Variables...');
const possibleKeys = [
    'availableStreams',
    'streams',
    'videoStreams',
    'qualityStreams',
    'currentQuality',
    'selectedQuality',
    'directVideoUrl',
    'directAudioUrl',
    'useCustomPlayer'
];

possibleKeys.forEach(key => {
    if (window[key] !== undefined) {
        console.log(`✅ Found: ${key} =`, window[key]);
    } else {
        console.log(`❌ Not found: ${key}`);
    }
});

// Check for React component state
console.log('\n⚛️ Checking React Component State...');
const reactRoot = document.querySelector('#root') || document.querySelector('[data-reactroot]');
if (reactRoot) {
    console.log('✅ React root found');
    
    // Try to find React fiber nodes
    const reactKey = Object.keys(reactRoot).find(key => 
        key.startsWith('__reactInternalInstance') || 
        key.startsWith('_reactInternalFiber') ||
        key.startsWith('__reactFiber')
    );
    
    if (reactKey) {
        console.log('✅ React internal instance found');
        const reactInstance = reactRoot[reactKey];
        console.log('React instance:', reactInstance);
    }
}

// Check for any elements with stream-related data
console.log('\n🔍 Searching for Stream-Related Elements...');
const allElements = document.querySelectorAll('*');
const streamElements = [];

allElements.forEach(el => {
    const text = el.textContent || '';
    const title = el.title || '';
    const className = el.className || '';
    
    if (text.includes('stream') || text.includes('Stream') ||
        text.includes('quality') || text.includes('Quality') ||
        text.includes('1080p') || text.includes('720p') ||
        title.includes('quality') || title.includes('Quality') ||
        className.includes('stream') || className.includes('quality')) {
        streamElements.push({
            element: el,
            text: text.trim().substring(0, 50),
            title: title,
            className: className,
            tagName: el.tagName
        });
    }
});

if (streamElements.length > 0) {
    console.log(`✅ Found ${streamElements.length} stream-related elements:`);
    streamElements.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.tagName}: "${item.text}" (${item.className})`);
    });
} else {
    console.log('❌ No stream-related elements found');
}

// Check for any loading states
console.log('\n⏳ Checking for Loading States...');
const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"], [class*="Spinner"]');
if (loadingElements.length > 0) {
    console.log(`✅ Found ${loadingElements.length} loading elements`);
    loadingElements.forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName}: ${el.className}`);
    });
} else {
    console.log('❌ No loading elements found');
}

// Check for error states
console.log('\n❌ Checking for Error States...');
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], [class*="failed"], [class*="Failed"]');
if (errorElements.length > 0) {
    console.log(`✅ Found ${errorElements.length} error elements`);
    errorElements.forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName}: ${el.className} - "${el.textContent.trim()}"`);
    });
} else {
    console.log('❌ No error elements found');
}

// Check network requests
console.log('\n🌐 Checking Network Requests...');
if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('resource');
    const apiRequests = networkEntries.filter(entry => 
        entry.name.includes('/api/') || 
        entry.name.includes('extract-video') ||
        entry.name.includes('localhost:5173')
    );
    
    if (apiRequests.length > 0) {
        console.log(`✅ Found ${apiRequests.length} API requests:`);
        apiRequests.forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.name} - Status: ${entry.responseStatus || 'Unknown'}`);
        });
    } else {
        console.log('❌ No API requests found');
    }
}

// Check for any console errors
console.log('\n🔍 Checking for Console Errors...');
const originalError = console.error;
const errors = [];

console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
};

// Restore after a short delay
setTimeout(() => {
    console.error = originalError;
    
    if (errors.length > 0) {
        console.log(`❌ Found ${errors.length} console errors:`);
        errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error}`);
        });
    } else {
        console.log('✅ No console errors found');
    }
}, 2000);

// Check if video is still loading
console.log('\n📺 Checking Video Loading State...');
const video = document.querySelector('video');
if (video) {
    console.log('Video loading state:', {
        readyState: video.readyState,
        networkState: video.networkState,
        duration: video.duration,
        currentTime: video.currentTime,
        src: video.src.substring(0, 100) + '...'
    });
    
    if (video.readyState < 3) {
        console.log('⚠️ Video is still loading (readyState < 3)');
    } else {
        console.log('✅ Video is loaded (readyState >= 3)');
    }
}

console.log('\n✅ Streams loading debug completed!');
console.log('\n💡 Possible issues:');
console.log('1. Backend API call failed or timed out');
console.log('2. Video extraction service not available');
console.log('3. React component not re-rendering after streams load');
console.log('4. Streams data not being set in component state');
console.log('5. Video player falling back to direct URL without streams');
