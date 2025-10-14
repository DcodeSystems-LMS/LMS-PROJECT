// Test DataService Connection
// Run this in browser console to test if DataService is working

console.log('🧪 Testing DataService connection...');

// Test if DataService is available
if (typeof DataService !== 'undefined') {
  console.log('✅ DataService is available');
  
  // Test getCourses method
  DataService.getCourses()
    .then(courses => {
      console.log('✅ getCourses() successful:', courses);
      console.log(`📊 Found ${courses.length} courses`);
      
      if (courses.length > 0) {
        console.log('📝 First course:', courses[0]);
        console.log('👨‍🏫 Instructor info:', courses[0].instructor);
      }
    })
    .catch(error => {
      console.error('❌ getCourses() failed:', error);
    });
} else {
  console.error('❌ DataService is not available');
  console.log('Available globals:', Object.keys(window).filter(key => key.includes('Data')));
}

// Test Supabase connection
if (typeof supabase !== 'undefined') {
  console.log('✅ Supabase is available');
  
  supabase.from('courses').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection failed:', error);
      } else {
        console.log('✅ Supabase connection successful:', data);
      }
    });
} else {
  console.error('❌ Supabase is not available');
}
