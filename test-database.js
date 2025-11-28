// Database Test Script
// Run this in your browser console on https://app.dcodesys.in

const testDatabase = async () => {
  console.log('🔍 Testing Supabase Database...');
  
  try {
    // Test 1: Check if Supabase client is working
    console.log('✅ Supabase client loaded');
    
    // Test 2: Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError);
    } else {
      console.log('✅ Profiles data:', profiles);
      console.log(`📊 Found ${profiles.length} profiles`);
      
      // Check for students
      const students = profiles.filter(p => p.role === 'student');
      console.log(`👨‍🎓 Found ${students.length} students`);
    }
    
    // Test 3: Check courses table
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(5);
    
    if (coursesError) {
      console.error('❌ Courses error:', coursesError);
    } else {
      console.log('✅ Courses data:', courses);
      console.log(`📚 Found ${courses.length} courses`);
    }
    
    // Test 4: Check enrollments table
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(5);
    
    if (enrollmentsError) {
      console.error('❌ Enrollments error:', enrollmentsError);
    } else {
      console.log('✅ Enrollments data:', enrollments);
      console.log(`📝 Found ${enrollments.length} enrollments`);
    }
    
    // Test 5: Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.email : 'Not logged in');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
};

// Run the test
testDatabase();
