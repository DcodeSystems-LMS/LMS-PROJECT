// Simple cleanup script for browser console
// Copy and paste this into your browser console

(async () => {
  try {
    console.log('🧹 Cleaning up duplicate profiles...');
    
    // Check for existing profiles with the problematic email
    const { data: profiles, error } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('email', 'pinjalajeysankarsai@gmail.com');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📋 Found ${profiles.length} profiles with this email:`, profiles);
    
    if (profiles.length > 0) {
      console.log('🗑️ Deleting duplicate profiles...');
      
      for (const profile of profiles) {
        const { error: deleteError } = await window.supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting ${profile.id}:`, deleteError);
        } else {
          console.log(`✅ Deleted profile ${profile.id}`);
        }
      }
    }
    
    // Show current mentors
    const { data: mentors } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');
    
    console.log(`📋 Current mentors: ${mentors.length}`);
    mentors.forEach((m, i) => console.log(`${i+1}. ${m.name} (${m.email})`));
    
    console.log('✅ Cleanup complete! Try inviting the mentor again.');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
