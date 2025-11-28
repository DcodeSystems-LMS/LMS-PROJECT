// Simple test to check if explanation field is working
// This test can be run in the browser console on the actual application

console.log('🧪 Testing Explanation Field Saving...');
console.log('=====================================');

// Test 1: Check if Supabase client is available
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase client not found. Please run this test on the application page.');
  console.log('💡 Instructions:');
  console.log('1. Go to your application (https://app.dcodesys.in)');
  console.log('2. Login as a mentor');
  console.log('3. Go to Assessments page');
  console.log('4. Open browser console (F12)');
  console.log('5. Run this test script');
} else {
  console.log('✅ Supabase client found');
  
  // Test 2: Check if we can access the questions table
  const testDatabaseAccess = async () => {
    try {
      console.log('🔍 Testing database access...');
      
      // Check if we can query questions table
      const { data, error } = await window.supabase
        .from('questions')
        .select('id, question_text, explanation')
        .limit(1);
      
      if (error) {
        console.error('❌ Database access error:', error);
        console.log('💡 This might be due to:');
        console.log('- RLS policies blocking access');
        console.log('- User not authenticated');
        console.log('- User not having mentor role');
        return;
      }
      
      console.log('✅ Database access successful');
      console.log('📊 Sample question data:', data);
      
      // Test 3: Check if explanation field exists in recent questions
      const { data: recentQuestions, error: recentError } = await window.supabase
        .from('questions')
        .select('id, question_text, explanation, created_at')
        .not('explanation', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentError) {
        console.error('❌ Error fetching recent questions:', recentError);
      } else {
        console.log('📝 Recent questions with explanations:');
        console.table(recentQuestions);
        
        if (recentQuestions && recentQuestions.length > 0) {
          console.log('✅ Explanation field is working! Found', recentQuestions.length, 'questions with explanations');
        } else {
          console.log('⚠️ No questions with explanations found. This could mean:');
          console.log('- No questions have been created yet');
          console.log('- Explanation field is not being saved');
          console.log('- Questions were created without explanations');
        }
      }
      
    } catch (err) {
      console.error('❌ Test failed:', err);
    }
  };
  
  // Run the test
  testDatabaseAccess();
}

console.log('=====================================');
console.log('📋 Manual Test Steps:');
console.log('1. Go to Assessments page');
console.log('2. Create a new question');
console.log('3. Fill in the explanation field');
console.log('4. Save the question');
console.log('5. Check if explanation appears in the question list');
console.log('6. Run this test again to verify database storage');




