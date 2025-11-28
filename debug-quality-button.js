// Advanced Quality Button Debug Script
// Copy and paste this into your browser console

console.log('🔍 Advanced Quality Button Debug');
console.log('================================');

// Function to find all possible quality button elements
function findQualityButton() {
    console.log('\n🎯 Searching for Quality Button Elements...');
    
    // Try different possible selectors
    const selectors = [
        '.quality-button',
        '[class*="quality"]',
        '[class*="Quality"]',
        'button[title*="quality"]',
        'button[title*="Quality"]',
        'button[title*="video quality"]',
        'button[title*="Video Quality"]',
        'button:has(.ri-hd-line)',
        'button:has(.ri-settings-line)',
        'button:has(.ri-settings-3-line)'
    ];
    
    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} element(s) with selector: ${selector}`);
                elements.forEach((el, index) => {
                    console.log(`  ${index + 1}. Text: "${el.textContent.trim()}", Visible: ${el.offsetParent !== null}`);
                });
            }
        } catch (e) {
            // Some selectors might not be supported
        }
    });
}

// Function to check video player state
function checkVideoPlayerState() {
    console.log('\n📺 Checking Video Player State...');
    
    const video = document.querySelector('video');
    if (video) {
        console.log('✅ Video element found');
        console.log('Video details:', {
            src: video.src,
            currentSrc: video.currentSrc,
            readyState: video.readyState,
            networkState: video.networkState,
            duration: video.duration,
            currentTime: video.currentTime
        });
        
        // Check if it's a YouTube URL
        const isYouTube = video.src.includes('youtube.com') || video.src.includes('youtu.be');
        console.log('Is YouTube URL:', isYouTube);
        
        // Check if it's using custom player vs embed
        const isEmbed = document.querySelector('iframe[src*="youtube.com"]');
        console.log('Using YouTube embed:', !!isEmbed);
        console.log('Using custom player:', !isEmbed && isYouTube);
        
    } else {
        console.log('❌ No video element found');
    }
}

// Function to check for React component state
function checkReactState() {
    console.log('\n⚛️ Checking for React Component State...');
    
    // Look for React DevTools data
    const reactRoot = document.querySelector('#root') || document.querySelector('[data-reactroot]');
    if (reactRoot) {
        console.log('✅ React root found');
        
        // Try to find React fiber nodes
        const reactKey = Object.keys(reactRoot).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
        if (reactKey) {
            console.log('✅ React internal instance found');
        }
    }
    
    // Check for any global React state
    if (window.React) {
        console.log('✅ React library found');
    }
    
    // Check for any component state in window
    const stateKeys = Object.keys(window).filter(key => 
        key.includes('video') || key.includes('Video') || 
        key.includes('player') || key.includes('Player') ||
        key.includes('quality') || key.includes('Quality')
    );
    
    if (stateKeys.length > 0) {
        console.log('🔍 Found potential state keys:', stateKeys);
    }
}

// Function to check for available streams data
function checkStreamsData() {
    console.log('\n📊 Checking for Streams Data...');
    
    // Check if debug functions are available
    if (typeof window.debugQualityButton === 'function') {
        console.log('✅ debugQualityButton function available');
        window.debugQualityButton();
    } else {
        console.log('❌ debugQualityButton function not available');
    }
    
    if (typeof window.debugVideoPlayer === 'function') {
        console.log('✅ debugVideoPlayer function available');
        window.debugVideoPlayer();
    } else {
        console.log('❌ debugVideoPlayer function not available');
    }
    
    // Look for any global variables that might contain stream data
    const possibleKeys = [
        'availableStreams',
        'streams',
        'videoStreams',
        'qualityStreams',
        'currentQuality',
        'selectedQuality'
    ];
    
    possibleKeys.forEach(key => {
        if (window[key] !== undefined) {
            console.log(`✅ Found global variable: ${key}`, window[key]);
        }
    });
}

// Function to check DOM for quality-related elements
function checkQualityElements() {
    console.log('\n🔍 Checking for Quality-Related Elements...');
    
    // Look for any elements with quality-related text
    const allElements = document.querySelectorAll('*');
    const qualityElements = [];
    
    allElements.forEach(el => {
        const text = el.textContent || '';
        const title = el.title || '';
        const className = el.className || '';
        
        if (text.match(/\d+p/) || // Contains quality like "1080p"
            title.toLowerCase().includes('quality') ||
            className.toLowerCase().includes('quality') ||
            text.toLowerCase().includes('quality')) {
            qualityElements.push({
                element: el,
                text: text.trim(),
                title: title,
                className: className,
                tagName: el.tagName
            });
        }
    });
    
    if (qualityElements.length > 0) {
        console.log(`✅ Found ${qualityElements.length} quality-related elements:`);
        qualityElements.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.tagName}: "${item.text}" (${item.className})`);
        });
    } else {
        console.log('❌ No quality-related elements found');
    }
}

// Function to wait for elements to load
function waitForQualityButton() {
    console.log('\n⏳ Waiting for Quality Button to Load...');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Attempt ${attempts}/${maxAttempts}: Checking for quality button...`);
        
        const qualityButton = document.querySelector('.quality-button');
        if (qualityButton) {
            console.log('✅ Quality button found after waiting!');
            console.log('Quality button details:', {
                text: qualityButton.textContent,
                visible: qualityButton.offsetParent !== null,
                disabled: qualityButton.disabled
            });
            clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
            console.log('❌ Quality button not found after waiting');
            clearInterval(checkInterval);
        }
    }, 1000);
}

// Main debug function
function runAdvancedDebug() {
    console.log('🚀 Running Advanced Quality Button Debug...\n');
    
    findQualityButton();
    checkVideoPlayerState();
    checkReactState();
    checkStreamsData();
    checkQualityElements();
    waitForQualityButton();
    
    console.log('\n✅ Advanced debug completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Check if video is still loading');
    console.log('2. Verify backend is returning stream data');
    console.log('3. Check if custom player is being used (not YouTube embed)');
    console.log('4. Look for any console errors during video loading');
}

// Export functions
window.findQualityButton = findQualityButton;
window.checkVideoPlayerState = checkVideoPlayerState;
window.checkReactState = checkReactState;
window.checkStreamsData = checkStreamsData;
window.checkQualityElements = checkQualityElements;
window.waitForQualityButton = waitForQualityButton;
window.runAdvancedDebug = runAdvancedDebug;

console.log('\n📋 Available debug functions:');
console.log('- findQualityButton(): Search for quality button elements');
console.log('- checkVideoPlayerState(): Check video player state');
console.log('- checkReactState(): Check React component state');
console.log('- checkStreamsData(): Check for streams data');
console.log('- checkQualityElements(): Find quality-related elements');
console.log('- waitForQualityButton(): Wait for quality button to load');
console.log('- runAdvancedDebug(): Run all debug functions');

// Auto-run the debug
runAdvancedDebug();
