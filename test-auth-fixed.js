// Fixed Authentication Test Script
// Run this in your browser console on https://app.dcodesys.in

const testAuthentication = async () => {
  console.log('🔐 Testing Supabase Authentication...');
  
  try {
    // Test 1: Find Supabase client in the page
    let supabaseClient = null;
    
    // Try different ways to access Supabase
    if (window.supabase) {
      supabaseClient = window.supabase;
    } else if (window.__SUPABASE_CLIENT__) {
      supabaseClient = window.__SUPABASE_CLIENT__;
    } else {
      // Look for Supabase in React components
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        // Try to find Supabase from React context
        console.log('🔍 Looking for Supabase in React context...');
      }
    }
    
    if (!supabaseClient) {
      console.error('❌ Supabase client not found in global scope');
      console.log('💡 Try accessing it through the React app or check if it\'s loaded');
      
      // Alternative: Try to create a new Supabase client
      console.log('🔄 Attempting to create new Supabase client...');
      
      // Check if we can import/create Supabase
      if (typeof window !== 'undefined' && window.location) {
        console.log('📡 Current URL:', window.location.href);
        console.log('🔑 Looking for Supabase configuration...');
        
        // Try to find Supabase config in the page
        const scripts = document.querySelectorAll('script');
        let supabaseConfig = null;
        
        scripts.forEach(script => {
          if (script.textContent && script.textContent.includes('supabase')) {
            console.log('📜 Found script with Supabase:', script.textContent.substring(0, 200) + '...');
          }
        });
      }
      
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test 2: Check current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      console.error('❌ User check error:', userError);
    } else {
      console.log('👤 Current user:', user ? user.email : 'Not logged in');
    }
    
    // Test 3: Check session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) {
      console.error('❌ Session check error:', sessionError);
    } else {
      console.log('🔑 Session:', session ? 'Active' : 'No session');
    }
    
    // Test 4: Test profiles access
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles access error:', profilesError);
      console.log('Error details:', {
        code: profilesError.code,
        message: profilesError.message,
        details: profilesError.details,
        hint: profilesError.hint
      });
    } else {
      console.log('✅ Profiles access successful');
      console.log('📊 Sample profile:', profiles[0]);
    }
    
    // Test 5: Try to sign up a test user (if not logged in)
    if (!user) {
      console.log('🧪 Testing sign up...');
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Test User',
            role: 'student'
          }
        }
      });
      
      if (signUpError) {
        console.error('❌ Sign up error:', signUpError);
      } else {
        console.log('✅ Sign up successful:', signUpData);
      }
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
};

// Alternative: Try to access Supabase through the page's JavaScript
const findSupabaseInPage = () => {
  console.log('🔍 Searching for Supabase in page...');
  
  // Check window object
  console.log('Window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('supabase')));
  
  // Check if there's a global Supabase instance
  if (window.supabase) {
    console.log('✅ Found window.supabase');
    return window.supabase;
  }
  
  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚛️ React DevTools found, checking React components...');
  }
  
  return null;
};

// Run the test
console.log('🚀 Starting authentication test...');
const supabase = findSupabaseInPage();
if (supabase) {
  console.log('✅ Using found Supabase client');
  testAuthentication();
} else {
  console.log('❌ No Supabase client found, running diagnostic...');
  testAuthentication();
}
