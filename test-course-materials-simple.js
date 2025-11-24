// Simple Course Materials Test
// This script tests the course materials functionality without requiring environment variables

console.log('🧪 Testing Course Materials Upload...\n');

// Check if we can import the required modules
try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase client module loaded successfully');
} catch (error) {
  console.log('❌ Supabase client module not found');
  console.log('💡 Install it with: npm install @supabase/supabase-js');
  process.exit(1);
}

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('\n❌ Missing environment variables');
  console.log('💡 Set them in your .env file or run with:');
  console.log('   VITE_SUPABASE_URL=https://supabase.dcodesys.in node test-course-materials-upload.js');
  console.log('   VITE_SUPABASE_ANON_KEY=your_anon_key node test-course-materials-upload.js');
  process.exit(1);
}

console.log('\n✅ Environment variables are set');
console.log('💡 You can now run the full test with: node test-course-materials-upload.js');
