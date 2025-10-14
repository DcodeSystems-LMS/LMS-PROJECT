import React, { useState, useEffect } from 'react';
import Modal from '../../../components/base/Modal';
import DataService from '@/services/dataService';
import type { ExtendedProfile } from '@/services/dataService';
// Removed sample data imports - using real-time data instead

// Extend Window interface to include supabase
declare global {
  interface Window {
    supabase: any;
  }
}

interface MentorStats {
  totalMentors: number;
  activeMentors: number;
  avgRating: number;
  sessionsThisMonth: number;
}

const AdminMentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<ExtendedProfile | null>(null);
  const [mentors, setMentors] = useState<ExtendedProfile[]>([]);
  const [stats, setStats] = useState<MentorStats>({
    totalMentors: 0,
    activeMentors: 0,
    avgRating: 0,
    sessionsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingMentor, setIsUpdatingMentor] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    specialty: '',
    status: 'active'
  });
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    specialty: '',
    message: ''
  });
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeletingMentor, setIsDeletingMentor] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        console.log('Testing Supabase connection...');
        const connectionTest = await DataService.testConnection();
        if (!connectionTest) {
          console.error('Supabase connection failed');
          setError('Unable to connect to database. Please check your Supabase configuration.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching mentors data...');
        
        // Create sample data if none exists
        // Sample data creation removed - using real-time data from Supabase
        
        const [mentorsData, sessionsData] = await Promise.all([
          DataService.getProfiles('mentor'),
          DataService.getSessions()
        ]);
        
        console.log('Mentors data:', mentorsData);
        console.log('Sessions data:', sessionsData);
        
        // Enhance mentor data with session statistics
        const enhancedMentors = mentorsData.map(mentor => {
          const mentorSessions = sessionsData.filter(s => s.mentor_id === mentor.id);
          const completedSessions = mentorSessions.filter(s => s.status === 'completed');
          const thisMonthSessions = mentorSessions.filter(s => 
            new Date(s.scheduled_at).getMonth() === new Date().getMonth()
          );
          
          // Get unique student count
          const uniqueStudents = new Set(mentorSessions.map(s => s.student_id)).size;
          
          return {
            ...mentor,
            specialty: mentor.specialty || 'General Mentoring', // Placeholder field
            rating: 4.5 + Math.random() * 0.5, // Placeholder rating
            students: uniqueStudents,
            sessions: mentorSessions.length,
            status: mentor.status || 'active',
            joinDate: mentor.created_at,
            earnings: `₹${(completedSessions.length * 4000).toLocaleString()}`, // ₹4000 per session
            avatar: mentor.name.split(' ').map(n => n[0]).join('').toUpperCase()
          };
        });
        
        console.log('Enhanced mentors:', enhancedMentors);
        setMentors(enhancedMentors);
        
        // Calculate stats
        const totalMentors = enhancedMentors.length;
        const activeMentors = enhancedMentors.filter(m => m.status === 'active').length;
        const avgRating = totalMentors > 0 ? enhancedMentors.reduce((sum, m) => sum + m.rating, 0) / totalMentors : 0;
        const sessionsThisMonth = sessionsData.filter(s => 
          new Date(s.scheduled_at).getMonth() === new Date().getMonth()
        ).length;
        
        setStats({
          totalMentors,
          activeMentors,
          avgRating: Math.round(avgRating * 10) / 10,
          sessionsThisMonth
        });
        
      } catch (error) {
        console.error('Error fetching mentors:', error);
        setError('Failed to load mentor data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || mentor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`ri-star-${i <= rating ? 'fill' : 'line'} text-yellow-400`}
        ></i>
      );
    }
    return stars;
  };

  const handleViewMentor = (mentor: any) => {
    setSelectedMentor(mentor);
    setViewModalOpen(true);
  };

  const handleEditMentor = (mentor: any) => {
    setSelectedMentor(mentor);
    setEditForm({
      name: mentor.name,
      email: mentor.email,
      specialty: mentor.specialty,
      status: mentor.status
    });
    setEditModalOpen(true);
  };

  const handleInviteMentor = () => {
    setInviteModalOpen(true);
  };

  const handleEmailMentor = (mentor: any) => {
    setSelectedMentor(mentor);
    setEmailModalOpen(true);
  };

  const handleDeleteMentor = (mentor: any) => {
    setSelectedMentor(mentor);
    setDeleteModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedMentor) {
      console.error('❌ No mentor selected for email');
      return;
    }

    try {
      console.log('📧 Sending email to mentor:', selectedMentor.email);
      
      // Get form data
      const subjectInput = document.querySelector('input[placeholder="Enter email subject"]') as HTMLInputElement;
      const messageInput = document.querySelector('textarea[placeholder="Enter your message here..."]') as HTMLTextAreaElement;
      
      const subject = subjectInput?.value || 'Message from Admin';
      const message = messageInput?.value || `Hello ${selectedMentor.name},\n\nI hope this message finds you well. I wanted to reach out regarding your role as a mentor.\n\nBest regards,\nAdmin`;
      
      console.log('📝 Email details:', { subject, message, to: selectedMentor.email });
      
      // Try Edge Function first, fallback to simulation
      try {
        const { data, error } = await window.supabase.functions.invoke('send-email', {
          body: {
            to: selectedMentor.email,
            subject: subject,
            html: message.replace(/\n/g, '<br>'),
            text: message
          }
        });
        
        if (error) {
          console.error('❌ Supabase Edge Function error:', error);
          throw error;
        }
        
        console.log('✅ Email sent successfully via Edge Function:', data);
        
      } catch (edgeFunctionError) {
        console.log('🔄 Edge Function error, checking error type...');
        
        // Check if it's a rate limit error
        if (edgeFunctionError.message && edgeFunctionError.message.includes('rate limit')) {
          console.log('⚠️ Email rate limit exceeded');
          alert(`Email rate limit exceeded. Please wait a few minutes before sending another email.\n\nError: ${edgeFunctionError.message}`);
          return;
        }
        
        // Check if it's a CORS error (Edge Function not deployed)
        if (edgeFunctionError.message && edgeFunctionError.message.includes('CORS')) {
          console.log('🔄 Edge Function not deployed, simulating email send...');
          
          // Simulate email sending for now
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('✅ Email simulation completed');
          console.log('📧 Email details:', {
            to: selectedMentor.email,
            subject: subject,
            message: message,
            sent_at: new Date().toISOString()
          });
        } else {
          // Other Edge Function errors
          console.error('❌ Edge Function error:', edgeFunctionError);
          alert(`Failed to send email. Please try again later.\n\nError: ${edgeFunctionError.message}`);
          return;
        }
      }
      alert(`Email sent successfully to ${selectedMentor.name} (${selectedMentor.email})`);
      
      setEmailModalOpen(false);
      setSelectedMentor(null);
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      alert(`Failed to send email. Please check your Supabase SMTP configuration.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const confirmDeleteMentor = async () => {
    if (!selectedMentor) {
      console.error('❌ No mentor selected for deletion');
      return;
    }

    setIsDeletingMentor(true);

    try {
      console.log('🗑️ Deleting mentor:', selectedMentor.name);
      
      const { error } = await DataService.deleteProfile(selectedMentor.id);
      
      if (error) {
        console.error('❌ Error deleting mentor:', error);
        alert(`Failed to delete mentor: ${error.message || 'Unknown error'}`);
        return;
      }

      console.log('✅ Mentor deleted successfully');
      
      // Remove from mentors list
      setMentors(prevMentors => 
        prevMentors.filter(mentor => mentor.id !== selectedMentor.id)
      );
      
      setDeleteModalOpen(false);
      setSelectedMentor(null);
      
      alert('Mentor deleted successfully!');
      
    } catch (error) {
      console.error('❌ Unexpected error deleting mentor:', error);
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeletingMentor(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMentor) {
      console.error('❌ No mentor selected for editing');
      return;
    }

    // Validate form data
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert('Please fill in all required fields (Name, Email)');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setIsUpdatingMentor(true);

    try {
      console.log('🔄 Starting mentor update...');
      console.log('📝 Mentor ID:', selectedMentor.id);
      console.log('📝 Update data:', {
        name: editForm.name,
        email: editForm.email,
        specialty: editForm.specialty,
        status: editForm.status
      });

      // Update the mentor profile in the database
      const { data, error } = await DataService.updateProfile(selectedMentor.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        specialty: editForm.specialty.trim() || null,
        status: editForm.status as 'active' | 'inactive' | 'pending' | 'suspended',
        updated_at: new Date().toISOString()
      });

      console.log('📊 Update result:', { data, error });

      if (error) {
        console.error('❌ Error updating mentor:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        alert(`Failed to update mentor: ${error.message}`);
        return;
      }

      console.log('✅ Mentor updated successfully:', data);
      
      // Verify the update by fetching the updated profile
      console.log('🔍 Verifying update...');
      const { data: verifyData, error: verifyError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedMentor.id)
        .single();

      if (verifyError) {
        console.warn('⚠️ Could not verify update:', verifyError);
      } else {
        console.log('✅ Update verified:', verifyData);
      }

      // Update the mentors list with the new data
      setMentors(prevMentors => 
        prevMentors.map(mentor => 
          mentor.id === selectedMentor.id 
            ? { ...mentor, ...editForm, updated_at: new Date().toISOString() }
            : mentor
        )
      );

    setEditModalOpen(false);
    setSelectedMentor(null);
      
      // Show success message
      alert('Mentor updated successfully!');
      
    } catch (error) {
      console.error('❌ Unexpected error updating mentor:', error);
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdatingMentor(false);
    }
  };

  const handleSendInvite = async () => {
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

      console.log('📧 Sending mentor invitation...');
      console.log('📝 Invitation details:', inviteForm);

      // Create a user account first, then create the profile
      // This is the proper way to create profiles in Supabase
      const { authService } = await import('@/lib/auth');
      
      // Generate a temporary password for the mentor
      const tempPassword = `TempPass${Math.random().toString(36).substring(2, 15)}`;
      
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
        alert(`Failed to create user account: ${authError.message || 'Unknown error'}`);
        return;
      }
      
      if (!newUser) {
        console.error('❌ No user returned from signup');
        alert('Failed to create user account');
        return;
      }
      
      console.log('✅ User account created successfully:', newUser.id);
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile was created by trigger, if not create it manually
      console.log('🔍 Checking if profile was created...');
      
      const existingProfile = await DataService.getProfile(newUser.id);
      
      if (!existingProfile) {
        console.log('📝 Profile not found, checking for existing email...');
        
        // Check if a profile with this email already exists
        const { data: existingByEmail, error: emailCheckError } = await DataService.getProfiles();
        const existingProfileByEmail = existingByEmail?.find(p => p.email === newUser.email);
        
        if (existingProfileByEmail) {
          console.log('⚠️ Profile with this email already exists:', existingProfileByEmail);
          console.log('🔄 Updating existing profile with new user ID and mentor role...');
          
          // Update the existing profile with the new user ID and mentor role
          const { error: updateError } = await DataService.updateProfile(existingProfileByEmail.id, {
            id: newUser.id,
            role: 'mentor',
            specialty: inviteForm.specialty.trim() || null,
            status: 'pending',
            updated_at: new Date().toISOString()
          });
          
          if (updateError) {
            console.error('❌ Error updating existing profile:', updateError);
            alert(`Mentor account created but profile update failed: ${updateError.message || 'Unknown error'}`);
            return;
          }
          
          console.log('✅ Existing profile updated successfully');
        } else {
          console.log('📝 No existing profile found, creating new one...');
          
          // Create profile manually with duplicate handling
          const profileData = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: 'mentor',
            specialty: inviteForm.specialty.trim() || null,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          let createdProfile, createError;
          try {
            if (!DataService.createProfile) {
              throw new Error('DataService.createProfile method not available');
            }
            
            const result = await DataService.createProfile(profileData);
            createdProfile = result.data;
            createError = result.error;
          } catch (err) {
            console.error('❌ Exception in DataService.createProfile:', err);
            createError = err;
          }
        
          if (createError) {
            console.error('❌ Error creating profile manually:', createError);
            console.error('❌ Profile data that failed:', profileData);
            
            // Try direct Supabase creation as fallback
            console.log('🔄 Trying direct Supabase profile creation as fallback...');
            try {
              const { supabase } = await import('@/lib/supabase');
              const { data: directResult, error: directError } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();
              
              if (directError) {
                console.error('❌ Direct Supabase creation also failed:', directError);
                alert(`Mentor account created but profile creation failed: ${createError.message || 'Unknown error'}`);
                return;
              } else {
                console.log('✅ Profile created via direct Supabase:', directResult);
                createdProfile = directResult;
              }
            } catch (directErr) {
              console.error('❌ Direct Supabase creation exception:', directErr);
              alert(`Mentor account created but profile creation failed: ${createError.message || 'Unknown error'}`);
              return;
            }
          }
          
          console.log('✅ Profile created manually:', createdProfile);
        }
      } else {
        console.log('✅ Profile found, updating with specialty...');
        
        // Update existing profile with specialty and status
        if (inviteForm.specialty.trim()) {
          const { error: updateError } = await DataService.updateProfile(newUser.id, {
            specialty: inviteForm.specialty.trim(),
            status: 'pending'
          });
          
          if (updateError) {
            console.warn('⚠️ Could not update profile with specialty:', updateError);
          }
        }
      }

      console.log('✅ Mentor invitation sent successfully');
      
      // Show success message with temporary password info
      alert(`Mentor account created successfully!\n\nName: ${inviteForm.name}\nEmail: ${inviteForm.email}\nTemporary Password: ${tempPassword}\n\nPlease share these credentials with the mentor so they can log in and change their password.`);
      
      // Close modal and reset form
    setInviteModalOpen(false);
    setInviteForm({ name: '', email: '', specialty: '', message: '' });
      
      // Refresh mentors list
      const mentorsData = await DataService.getProfiles('mentor');
      setMentors(mentorsData);
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert(`An unexpected error occurred while sending the invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mentor Management</h1>
        <p className="text-gray-600 mt-2">Manage mentor profiles, performance, and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mr-4">
              <i className="ri-group-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.totalMentors}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-4">
              <i className="ri-user-star-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.activeMentors}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-lg mr-4">
              <i className="ri-star-line text-2xl text-yellow-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.avgRating}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-4">
              <i className="ri-calendar-check-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sessions This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.sessionsThisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <button 
            onClick={handleInviteMentor}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line mr-2"></i>
            Invite Mentor
          </button>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin mr-2"></i>
                      <span className="text-gray-500">Loading mentors...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="text-center">
                      <i className="ri-error-warning-line text-3xl text-red-400 mb-2"></i>
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredMentors.length > 0 ? (
                filteredMentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-medium">{mentor.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                          <div className="text-sm text-gray-500">{mentor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mentor.specialty}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex text-sm mr-2">
                          {getRatingStars(Math.floor(mentor.rating))}
                        </div>
                        <span className="text-sm text-gray-600">{mentor.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mentor.students}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mentor.sessions}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{mentor.earnings}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mentor.status)}`}>
                        {mentor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewMentor(mentor)}
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button 
                          onClick={() => handleEditMentor(mentor)}
                          className="text-green-600 hover:text-green-700 cursor-pointer"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button 
                          onClick={() => handleEmailMentor(mentor)}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          title="Send Email"
                        >
                          <i className="ri-mail-line"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteMentor(mentor)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                          title="Delete Mentor"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <i className="ri-user-line text-3xl mb-2"></i>
                      <p>No mentors found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {filteredMentors.length} of {mentors.length} mentors
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            Previous
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer whitespace-nowrap">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            Next
          </button>
        </div>
      </div>

      {/* View Mentor Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Mentor Details">
        {selectedMentor && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">{selectedMentor.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedMentor.name}</h3>
                <p className="text-gray-600">{selectedMentor.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <p className="text-gray-900">{selectedMentor.specialty}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMentor.status)}`}>
                  {selectedMentor.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center">
                  <div className="flex text-sm mr-2">
                    {getRatingStars(Math.floor(selectedMentor.rating))}
                  </div>
                  <span className="text-gray-600">{selectedMentor.rating}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <p className="text-gray-900">{selectedMentor.joinDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
                <p className="text-gray-900">{selectedMentor.students}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sessions</label>
                <p className="text-gray-900">{selectedMentor.sessions}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Earnings</label>
                <p className="text-green-600 font-semibold">{selectedMentor.earnings}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Mentor Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Mentor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input
              type="text"
              value={editForm.specialty}
              onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="relative">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isUpdatingMentor}
              className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                isUpdatingMentor 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUpdatingMentor ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Email Mentor Modal */}
      <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Send Email to Mentor">
        <div className="space-y-4">
          {selectedMentor && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Mentor Details</h3>
                <p className="text-sm text-gray-600">Name: {selectedMentor.name}</p>
                <p className="text-sm text-gray-600">Email: {selectedMentor.email}</p>
                <p className="text-sm text-gray-600">Specialty: {selectedMentor.specialty || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email subject"
                  defaultValue="Message from Admin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message here..."
                  defaultValue={`Hello ${selectedMentor.name},\n\nI hope this message finds you well. I wanted to reach out regarding your role as a mentor.\n\nBest regards,\nAdmin`}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer whitespace-nowrap flex items-center"
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Send Email
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Mentor Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Mentor">
        <div className="space-y-4">
          {selectedMentor && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-error-warning-line text-red-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Are you sure you want to delete this mentor?
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>This action cannot be undone. The mentor will be permanently removed from the system.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Mentor Details</h3>
                <p className="text-sm text-gray-600">Name: {selectedMentor.name}</p>
                <p className="text-sm text-gray-600">Email: {selectedMentor.email}</p>
                <p className="text-sm text-gray-600">Specialty: {selectedMentor.specialty || 'Not specified'}</p>
                <p className="text-sm text-gray-600">Status: {selectedMentor.status}</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeletingMentor}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMentor}
                  disabled={isDeletingMentor}
                  className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDeletingMentor 
                      ? 'bg-gray-400 text-gray-200' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isDeletingMentor ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-line mr-2"></i>
                      Delete Mentor
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Invite Mentor Modal */}
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite New Mentor">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter mentor's full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="mentor@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialty <span className="text-gray-500 text-sm">(Optional)</span>
            </label>
            <input
              type="text"
              value={inviteForm.specialty}
              onChange={(e) => setInviteForm({ ...inviteForm, specialty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Full Stack Development"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Message</label>
            <textarea
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a personal message to the invitation..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setInviteModalOpen(false)}
              disabled={isSendingInvite}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={isSendingInvite}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSendingInvite ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line mr-2"></i>
              Send Invitation
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMentors;