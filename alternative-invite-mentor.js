// Alternative approach: Create mentor invitation without exposing password
// This creates a user account but doesn't show the password in the UI

const handleSendInviteAlternative = async () => {
  setIsSendingInvite(true);
  
  try {
    // Validate form
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      alert('Please fill in all required fields (Name, Email)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    console.log('📧 Creating mentor account...');
    console.log('📝 Mentor details:', inviteForm);

    // Create a user account first, then create the profile
    const { authService } = await import('@/lib/auth');
    
    // Generate a secure temporary password
    const tempPassword = `Mentor${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
    
    console.log('👤 Creating user account for mentor...');
    
    // Create the user account with Supabase Auth
    const { user: newUser, error: authError } = await authService.signUp(
      inviteForm.email.trim(),
      tempPassword,
      inviteForm.name.trim(),
      'mentor'
    );
    
    if (authError) {
      console.error('❌ Error creating user account:', authError);
      alert(`Failed to create mentor account: ${authError.message || 'Unknown error'}`);
      return;
    }
    
    if (!newUser) {
      console.error('❌ No user returned from signup');
      alert('Failed to create mentor account');
      return;
    }
    
    console.log('✅ User account created successfully:', newUser.id);
    
    // Update the profile with specialty and status information
    if (inviteForm.specialty.trim()) {
      console.log('📝 Updating profile with specialty information...');
      
      const { error: updateError } = await DataService.updateProfile(newUser.id, {
        specialty: inviteForm.specialty.trim(),
        status: 'pending'
      });
      
      if (updateError) {
        console.warn('⚠️ Could not update profile with specialty:', updateError);
      }
    }

    console.log('✅ Mentor account created successfully');
    
    // Show success message
    alert(`Mentor account created successfully!\n\nName: ${inviteForm.name}\nEmail: ${inviteForm.email}\n\nA temporary password has been generated. Please contact the mentor directly to provide login credentials.`);
    
    // Close modal and reset form
    setInviteModalOpen(false);
    setInviteForm({ name: '', email: '', specialty: '', message: '' });
    
    // Refresh mentors list
    const mentorsData = await DataService.getProfiles('mentor');
    setMentors(mentorsData);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    alert('An unexpected error occurred while creating the mentor account');
  } finally {
    setIsSendingInvite(false);
  }
};
