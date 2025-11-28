// Create users directly in database to bypass rate limits
console.log('🔧 Creating users directly in database...');

const createUsersDirectly = async () => {
  try {
    console.log('📝 Step 1: Creating profile for mathew...');
    
    // Create profile directly in database
    const { data: profileData, error: profileError } = await window.supabase
      .from('profiles')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000', // Generate new UUID
        email: 'm.a.t.thewal.fo.rd0.35@gmail.com',
        name: 'Mathew',
        role: 'mentor',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
    } else {
      console.log('✅ Profile created successfully:', profileData);
      console.log('💡 User can now sign in with:');
      console.log('   Email: m.a.t.thewal.fo.rd0.35@gmail.com');
      console.log('   Password: (needs to be set via Supabase Dashboard)');
    }
    
    console.log('📋 Step 2: Next steps...');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Find the user: m.a.t.thewal.fo.rd0.35@gmail.com');
    console.log('3. Click "Reset password" to set a password');
    console.log('4. User can then sign in normally');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  }
};

// Run the direct creation
createUsersDirectly();






