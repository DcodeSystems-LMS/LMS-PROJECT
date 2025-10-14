// Quick diagnostic script for mentor profile creation
// Run this in the browser console to check the current state

const diagnoseMentorProfileIssue = async () => {
  try {
    console.log('🔍 Diagnosing mentor profile creation issue...');
    
    // Check 1: Supabase connection
    if (!window.supabase) {
      console.error('❌ Supabase client not available');
      return;
    }
    console.log('✅ Supabase client available');
    
    // Check 2: Current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ No authenticated user');
      return;
    }
    console.log('✅ Current user:', user.email, '(ID:', user.id + ')');
    
    // Check 3: User profile
    const { data: userProfile, error: profileError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️ User profile error:', profileError);
    } else {
      console.log('✅ User profile found:', userProfile.role);
    }
    
    // Check 4: Test profile creation
    console.log('🧪 Testing profile creation...');
    
    // Generate a valid UUID for testing
    const testId = crypto.randomUUID();
    const testProfileData = {
      id: testId,
      email: `test.${Date.now()}@example.com`,
      name: 'Test User',
      role: 'mentor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: createdProfile, error: createError } = await window.supabase
      .from('profiles')
      .insert(testProfileData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Profile creation failed:', createError);
      console.log('💡 This explains why mentor profiles aren\'t being saved');
      
      // Check RLS status
      console.log('🔍 Checking RLS policies...');
      
      // Try to get table info
      const { data: tableInfo, error: tableError } = await window.supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (tableError) {
        console.error('❌ Cannot access profiles table:', tableError);
      } else {
        console.log('✅ Can access profiles table');
      }
      
    } else {
      console.log('✅ Profile creation successful:', createdProfile);
      
      // Clean up test data
      await window.supabase
        .from('profiles')
        .delete()
        .eq('id', testProfileData.id);
      
      console.log('✅ Test profile cleaned up');
    }
    
    // Check 5: List existing mentors
    console.log('📋 Checking existing mentors...');
    
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');
    
    if (mentorsError) {
      console.error('❌ Cannot fetch mentors:', mentorsError);
    } else {
      console.log(`✅ Found ${mentors.length} mentors`);
      mentors.forEach((mentor, index) => {
        console.log(`${index + 1}. ${mentor.name} (${mentor.email})`);
      });
    }
    
    console.log('🎉 Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
};

// Run the diagnosis
diagnoseMentorProfileIssue();
