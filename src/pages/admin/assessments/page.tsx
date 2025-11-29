
import React, { useState, useMemo, useEffect } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import DataService from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/base/Modal';
import type { ExtendedAssessment } from '@/services/dataService';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';

interface Assessment {
  id: string; // Changed from number to string (UUID)
  title: string;
  description?: string;
  course: string;
  type: 'quiz' | 'project' | 'assignment';
  questions: number;
  duration: string;
  attempts: number;
  avgScore: number;
  status: 'active' | 'draft' | 'paused' | 'archived';
  created: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const AdminAssessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [viewingAssessment, setViewingAssessment] = useState<Assessment | null>(null);
  const [analyticsAssessment, setAnalyticsAssessment] = useState<Assessment | null>(null);
  
  // Debug modal state changes
  useEffect(() => {
    console.log('🔧 isEditModalOpen changed to:', isEditModalOpen);
    console.log('🔧 editingAssessment:', editingAssessment);
  }, [isEditModalOpen, editingAssessment]);
  
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    type: 'quiz' as 'quiz' | 'project' | 'assignment',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    time_limit_minutes: '',
    passing_score: '',
    questions: [] as any[],
    status: 'draft' as 'active' | 'draft' | 'paused' | 'archived'
  });

  // Real-time subscription
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔄 Fetching assessments...');
        console.log('🔄 Current assessments count:', assessments.length);
        
        const [assessmentsData, coursesData, resultsData] = await Promise.all([
          DataService.getAssessments(),
          DataService.getCourses(),
          DataService.getAssessmentResults()
        ]);

        console.log('📚 Raw assessments from database:', assessmentsData);
        console.log('📚 Assessments count from database:', assessmentsData.length);
        console.log('🎓 Courses fetched:', coursesData);
        console.log('📊 Results fetched:', resultsData);
        
        // Debug individual assessment data
        assessmentsData.forEach((assessment, index) => {
          console.log(`📋 Assessment ${index + 1}:`, {
            id: assessment.id,
            title: assessment.title,
            course_id: assessment.course_id,
            type: assessment.type,
            difficulty: assessment.difficulty,
            time_limit_minutes: assessment.time_limit_minutes,
            passing_score: assessment.passing_score,
            status: assessment.status,
            questions: assessment.questions,
            course: assessment.course,
            instructor: assessment.instructor
          });
        });

        const transformedAssessments: Assessment[] = assessmentsData.map(assessment => {
          // Get course title from joined data or fallback to coursesData
          let courseTitle = 'No Course Assigned';
          
          if (assessment.course && assessment.course.title) {
            // Use course title from joined data
            courseTitle = assessment.course.title;
          } else {
            // Fallback to searching in coursesData
            const course = coursesData.find(c => c.id === assessment.course_id);
            if (course && course.title) {
              courseTitle = course.title;
            }
          }
          
          const assessmentResults = resultsData.filter(r => r.assessment_id === assessment.id);
          const avgScore = assessmentResults.length > 0 
            ? Math.round(assessmentResults.reduce((sum, r) => sum + r.score, 0) / assessmentResults.length)
            : 0;

          console.log(`🔄 Transforming assessment "${assessment.title}":`, {
            course_id: assessment.course_id,
            course_from_join: assessment.course,
            course_from_search: coursesData.find(c => c.id === assessment.course_id),
            final_course_title: courseTitle
          });

          return {
            id: assessment.id, // Keep as string UUID
            title: assessment.title,
            course: courseTitle,
            type: assessment.type || 'quiz', // Use actual type from database
            questions: Array.isArray(assessment.questions) ? assessment.questions.length : 0,
            duration: assessment.time_limit_minutes ? `${assessment.time_limit_minutes} min` : 'No limit',
            attempts: assessmentResults.length,
            avgScore,
            status: assessment.status || 'draft',
            created: new Date(assessment.created_at).toLocaleDateString(),
            difficulty: assessment.difficulty || 'beginner'
          };
        });

        console.log('✨ Transformed assessments:', transformedAssessments);
        setAssessments(transformedAssessments);
        setCourses(coursesData);
        
      } catch (error) {
        console.error('❌ Error fetching assessments:', error);
        setError('Failed to load assessments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();

    // Set up real-time subscription
    const assessmentsSubscription = supabase
      .channel('assessments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assessments' },
        (payload) => {
          console.log('🔄 Assessments table changed:', payload);
          console.log('🔄 Event type:', payload.eventType);
          console.log('🔄 Changed record:', payload.new);
          console.log('🔄 Old record:', payload.old);
          
          // Handle different event types intelligently
          if (payload.eventType === 'DELETE') {
            console.log('🗑️ DELETE event detected, updating local state only');
            setAssessments(prevAssessments => {
              const updated = prevAssessments.filter(a => a.id !== payload.old.id);
              console.log('🗑️ Local state updated after DELETE, new count:', updated.length);
              return updated;
            });
          } else if (payload.eventType === 'INSERT') {
            console.log('➕ INSERT event detected, adding to local state');
            // Transform the new assessment data
            const newAssessment = payload.new;
            const course = courses.find(c => c.id === newAssessment.course_id);
            const transformedAssessment = {
              id: newAssessment.id,
              title: newAssessment.title,
              course: course?.title || 'General Assessment',
              type: newAssessment.type || 'quiz',
              questions: Array.isArray(newAssessment.questions) ? newAssessment.questions.length : 0,
              duration: newAssessment.time_limit_minutes ? `${newAssessment.time_limit_minutes} min` : 'No limit',
              attempts: 0, // New assessment has no attempts yet
              avgScore: 0,
              status: newAssessment.status || 'draft',
              created: new Date(newAssessment.created_at).toLocaleDateString(),
              difficulty: newAssessment.difficulty || 'beginner'
            };
            
            setAssessments(prevAssessments => {
              const updated = [...prevAssessments, transformedAssessment];
              console.log('➕ Local state updated after INSERT, new count:', updated.length);
              return updated;
            });
          } else {
            console.log('🔄 UPDATE event detected, refreshing all data');
            fetchAssessments();
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assessment_results' },
        (payload) => {
          console.log('🔄 Assessment results changed:', payload);
          fetchAssessments();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
      });

    return () => {
      assessmentsSubscription.unsubscribe();
    };
  }, []);

  // Filter and sort assessments
  const filteredAssessments = useMemo(() => {
    let filtered = assessments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(assessment => assessment.type === selectedType);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(assessment => assessment.difficulty === selectedDifficulty);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === selectedStatus);
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(assessment => assessment.course === selectedCourse);
    }

    // Sort assessments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'oldest':
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case 'attempts':
          return b.attempts - a.attempts;
        case 'score':
          return b.avgScore - a.avgScore;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assessments, searchTerm, selectedType, selectedDifficulty, selectedStatus, selectedCourse, sortBy]);

  // Get unique values for filters
  const uniqueCourses = [...new Set(assessments.map(a => a.course))];

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSelectedCourse('all');
    setSortBy('newest');
  };

  // CRUD Operations
  const handleCreateAssessment = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefreshAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Manually refreshing assessments...');
      const [assessmentsData, coursesData, resultsData] = await Promise.all([
        DataService.getAssessments(),
        DataService.getCourses(),
        DataService.getAssessmentResults()
      ]);

      console.log('📚 Assessments refreshed:', assessmentsData);
      console.log('🎓 Courses refreshed:', coursesData);
      console.log('📊 Results refreshed:', resultsData);
      
      // Check if the updated assessment is in the data
      const updatedAssessment = assessmentsData.find(a => a.id === editingAssessment?.id);
      if (updatedAssessment) {
        console.log('🔍 Found updated assessment in fresh data:', updatedAssessment);
      }

      // Transform assessments data
      const transformedAssessments: Assessment[] = assessmentsData.map(assessment => ({
        id: assessment.id,
        title: assessment.title,
        course: assessment.course?.title || 'Unknown Course',
        type: assessment.type || 'quiz',
        questions: assessment.questions?.length || 0,
        duration: assessment.time_limit_minutes ? `${assessment.time_limit_minutes} min` : 'No limit',
        attempts: resultsData.filter(r => r.assessment_id === assessment.id).length,
        avgScore: resultsData.filter(r => r.assessment_id === assessment.id).reduce((sum, r) => sum + r.score, 0) / Math.max(resultsData.filter(r => r.assessment_id === assessment.id).length, 1),
        status: assessment.status || 'draft',
        created: new Date(assessment.created_at).toLocaleDateString(),
        difficulty: assessment.difficulty || 'beginner'
      }));

      setAssessments(transformedAssessments);
      setCourses(coursesData);
      
      console.log('✅ Assessments refreshed successfully:', transformedAssessments);
      
    } catch (error) {
      console.error('❌ Error refreshing assessments:', error);
      setError(`Failed to refresh assessments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    console.log('🔧 Editing assessment:', assessment.title, 'ID:', assessment.id, 'Type:', typeof assessment.id);
    
    try {
      setEditingAssessment(assessment);
      
      // Parse duration safely
      let timeLimitMinutes = '';
      if (assessment.duration && typeof assessment.duration === 'string') {
        if (assessment.duration.includes('min')) {
          timeLimitMinutes = assessment.duration.replace(' min', '').replace(' min', '');
        } else if (assessment.duration === 'No limit') {
          timeLimitMinutes = '';
        }
      }
      
      setAssessmentFormData({
        title: assessment.title,
        description: assessment.description || '',
        course_id: courses.find(c => c.title === assessment.course)?.id || '',
        type: assessment.type,
        difficulty: assessment.difficulty,
        time_limit_minutes: timeLimitMinutes,
        passing_score: assessment.avgScore ? assessment.avgScore.toString().replace('%', '') : '0',
        questions: [],
        status: assessment.status
      });
      
      console.log('🔧 Setting edit modal open');
      setIsEditModalOpen(true);
      console.log('🔧 Edit modal should now be open');
    } catch (error) {
      console.error('🔧 Error in handleEditAssessment:', error);
      setError('Failed to open edit modal. Please try again.');
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setAssessmentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitAssessment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!assessmentFormData.title || !assessmentFormData.course_id) {
        setError('Please fill in all required fields.');
        return;
      }

      // Get current user ID (you might need to implement this based on your auth system)
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) {
        setError('You must be logged in to create assessments.');
        return;
      }

      const assessmentData = {
        title: assessmentFormData.title,
        description: assessmentFormData.description,
        course_id: assessmentFormData.course_id,
        instructor_id: currentUser.data.user.id, // Use current user as instructor
        type: assessmentFormData.type,
        difficulty: assessmentFormData.difficulty,
        time_limit_minutes: assessmentFormData.time_limit_minutes ? parseInt(assessmentFormData.time_limit_minutes) : null,
        passing_score: assessmentFormData.passing_score ? parseInt(assessmentFormData.passing_score) : 60,
        questions: assessmentFormData.questions,
        status: assessmentFormData.status
      };

      console.log('Creating assessment with data:', assessmentData);
      console.log('Assessment data validation:', {
        hasTitle: !!assessmentData.title,
        hasCourseId: !!assessmentData.course_id,
        hasInstructorId: !!assessmentData.instructor_id,
        type: assessmentData.type,
        difficulty: assessmentData.difficulty,
        status: assessmentData.status
      });
      
      const result = await DataService.createAssessment(assessmentData);
      console.log('Assessment created successfully:', result);
      
      setSuccess('Assessment created successfully!');
      
      // Update local state immediately for instant UI feedback
      console.log('✨ Adding new assessment to local state immediately...');
      
      // Transform the result to match frontend format
      const course = courses.find(c => c.id === result.course_id);
      const transformedResult = {
        id: result.id,
        title: result.title,
        course: course?.title || 'No Course Assigned',
        type: result.type || 'quiz',
        questions: Array.isArray(result.questions) ? result.questions.length : 0,
        duration: result.time_limit_minutes ? `${result.time_limit_minutes} min` : 'No limit',
        attempts: 0, // New assessment has no attempts yet
        avgScore: 0, // New assessment has no scores yet
        status: result.status || 'draft',
        created: new Date(result.created_at).toLocaleDateString(),
        difficulty: result.difficulty || 'beginner'
      };
      
      console.log('✨ Transformed result for local state:', transformedResult);
      
      setAssessments(prevAssessments => {
        const updated = [...prevAssessments, transformedResult];
        console.log('✨ Local state updated, new count:', updated.length);
        return updated;
      });
      
      // Reset form and close modal
      setAssessmentFormData({
        title: '',
        description: '',
        course_id: '',
        type: 'quiz',
        difficulty: 'beginner',
        time_limit_minutes: '',
        passing_score: '',
        questions: [],
        status: 'draft'
      });
      setIsCreateModalOpen(false);
      
      // Real-time subscription will also handle the UI update as backup
      console.log('✨ Real-time subscription will handle UI update as backup');
      
    } catch (error) {
      console.error('Error creating assessment:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }
      
      setError(`Failed to create assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditAssessment = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!editingAssessment) return;

      console.log('🔧 editingAssessment ID:', editingAssessment.id, 'Type:', typeof editingAssessment.id);

      // Get current user ID
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) {
        setError('You must be logged in to update assessments.');
        return;
      }

      const assessmentData = {
        title: assessmentFormData.title,
        description: assessmentFormData.description,
        course_id: assessmentFormData.course_id,
        instructor_id: currentUser.data.user.id, // Use current user as instructor
        type: assessmentFormData.type,
        difficulty: assessmentFormData.difficulty,
        time_limit_minutes: assessmentFormData.time_limit_minutes ? parseInt(assessmentFormData.time_limit_minutes) : null,
        passing_score: assessmentFormData.passing_score ? parseInt(assessmentFormData.passing_score) : 60,
        questions: assessmentFormData.questions,
        status: assessmentFormData.status
      };

      console.log('Updating assessment with ID:', editingAssessment.id);
      console.log('Assessment data:', assessmentData);
      
      // Check if ID is valid (UUID format)
      if (!editingAssessment.id || editingAssessment.id === 'NaN' || editingAssessment.id.trim() === '') {
        console.error('❌ Invalid assessment ID:', editingAssessment.id);
        setError('Invalid assessment ID. Please refresh the page and try again.');
        return;
      }
      
      // Validate UUID format (basic check)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(editingAssessment.id)) {
        console.error('❌ Invalid UUID format:', editingAssessment.id);
        setError('Invalid assessment ID format. Please refresh the page and try again.');
        return;
      }
      
      console.log('✅ Assessment ID validation passed:', editingAssessment.id);
      
      console.log('🔄 About to call DataService.updateAssessment...');
      await DataService.updateAssessment(editingAssessment.id, assessmentData);
      console.log('✅ DataService.updateAssessment completed successfully');
      
      console.log('✅ Assessment updated in database successfully!');
      console.log('🔄 Setting success message...');
      setSuccess('Assessment updated successfully!');
      console.log('✅ Success message set!');
      
      // Close the edit modal first
      setIsEditModalOpen(false);
      
      // Store the assessment ID before clearing it
      const updatedAssessmentId = editingAssessment.id;
      setEditingAssessment(null);
      
      // Update local state immediately for instant UI feedback
      console.log('🔄 Updating local state immediately...');
      const course = courses.find(c => c.id === assessmentData.course_id);
      setAssessments(prevAssessments => 
        prevAssessments.map(assessment => {
          if (assessment.id === updatedAssessmentId) {
            const transformedAssessmentData = {
              title: assessmentData.title,
              description: assessmentData.description,
              course: course?.title || assessment.course,
              type: assessmentData.type,
              questions: Array.isArray(assessmentData.questions) ? assessmentData.questions.length : assessment.questions,
              duration: assessmentData.time_limit_minutes ? `${assessmentData.time_limit_minutes} min` : assessment.duration,
              attempts: assessment.attempts, // Keep existing attempts
              avgScore: assessment.avgScore, // Keep existing avgScore
              status: assessmentData.status,
              created: assessment.created, // Keep existing created date
              difficulty: assessmentData.difficulty
            };
            return { ...assessment, ...transformedAssessmentData };
          }
          return assessment;
        })
      );
      
      // Refresh assessments data in background (no page reload)
      console.log('🔄 Refreshing assessments data in background...');
      handleRefreshAssessments().catch(error => {
        console.error('Background refresh failed:', error);
        // If background refresh fails, we still have the local state update
      });
      
      // Reset form and close modal
      setAssessmentFormData({
        title: '',
        description: '',
        course_id: '',
        type: 'quiz',
        difficulty: 'beginner',
        time_limit_minutes: '',
        passing_score: '',
        questions: [],
        status: 'draft'
      });
      setIsEditModalOpen(false);
      setEditingAssessment(null);
      
    } catch (error) {
      console.error('❌ Error updating assessment:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stack: error.stack
        });
      }
      
      setError(`Failed to update assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    console.log('🗑️ Delete assessment called with ID:', assessmentId);
    console.log('🗑️ Current assessments before delete:', assessments.length);
    
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Authentication check:', { user: user?.id, error: authError });
    
    if (!user) {
      setError('You must be logged in to delete assessments. Please sign in first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      try {
        setLoading(true);
        console.log('🗑️ Calling DataService.deleteAssessment...');
        await DataService.deleteAssessment(assessmentId);
        console.log('🗑️ Assessment deleted from database successfully');
        setSuccess('Assessment deleted successfully!');
        
        // Update local state immediately for instant UI feedback
        console.log('🗑️ Updating local state immediately...');
        setAssessments(prevAssessments => {
          const updated = prevAssessments.filter(a => a.id !== assessmentId);
          console.log('🗑️ Local state updated, new count:', updated.length);
          return updated;
        });
        
        // The real-time subscription will also handle the UI update as backup
        console.log('🗑️ Real-time subscription will handle UI update as backup');
      } catch (error) {
        console.error('🗑️ Error deleting assessment:', error);
        setError('Failed to delete assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-purple-600 bg-purple-100';
      case 'assignment': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = [
    { label: 'Total Assessments', value: assessments.length.toString(), icon: 'ri-file-list-line', color: 'blue' },
    { label: 'Active', value: assessments.filter(a => a.status === 'active').length.toString(), icon: 'ri-checkbox-circle-line', color: 'green' },
    { label: 'Draft', value: assessments.filter(a => a.status === 'draft').length.toString(), icon: 'ri-draft-line', color: 'yellow' },
    { label: 'Avg Score', value: Math.round(assessments.reduce((sum, a) => sum + a.avgScore, 0) / assessments.length).toString() + '%', icon: 'ri-bar-chart-line', color: 'purple' }
  ];

  if (loading && assessments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <SimpleDCODESpinner size="md" className="mb-4" />
            <p className="text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success/Error Notifications */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="ri-check-circle-line mr-2"></i>
            {success}
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
          <p className="text-gray-600 mt-2">Create and manage quizzes, projects, and assignments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              console.log('🔄 Manual refresh button clicked');
              console.log('🔄 Current state before refresh:');
              console.log('🔄 - assessments count:', assessments.length);
              console.log('🔄 - loading:', loading);
              await handleRefreshAssessments();
              console.log('🔄 Manual refresh completed');
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-2"></i>
            Force Refresh
          </button>
          <button 
            onClick={() => {
              console.log('🧪 Testing success message...');
              setSuccess('Test success message!');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
          >
            <i className="ri-test-tube-line mr-2"></i>
            Test Success
          </button>
          <Button onClick={handleCreateAssessment}>
            <i className="ri-add-line mr-2"></i>
            Create Assessment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
              <i className={`${stat.icon} text-2xl text-${stat.color}-600`}></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Advanced Filters and Search */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search assessments by title or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="attempts">Sort: Most Attempts</option>
                <option value="score">Sort: Highest Score</option>
                <option value="title">Sort: Title A-Z</option>
                <option value="duration">Sort: Duration</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
                <i className="ri-refresh-line mr-2"></i>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </span>
        {(searchTerm || selectedType !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || selectedCourse !== 'all') && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <i className="ri-close-line mr-2"></i>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Assessments Table */}
      <Card>
        <div className="overflow-x-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getDifficultyColor(assessment.difficulty)}`}>
                          {assessment.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{assessment.created}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{assessment.course}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(assessment.type)}`}>
                      {assessment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{assessment.questions}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{assessment.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{assessment.attempts}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getScoreColor(assessment.avgScore)}`}>
                      {assessment.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          console.log('🔵 View button clicked for assessment:', assessment.title, assessment.id);
                          console.log('🔵 Assessment data:', assessment);
                          setViewingAssessment(assessment);
                        }}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer" 
                        title="View Details"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button 
                        onClick={() => {
                          console.log('🟢 Edit button clicked for assessment:', assessment.title, assessment.id);
                          console.log('🟢 Calling handleEditAssessment with:', assessment);
                          try {
                            handleEditAssessment(assessment);
                            console.log('🟢 handleEditAssessment completed successfully');
                          } catch (error) {
                            console.error('🟢 Error in handleEditAssessment:', error);
                          }
                        }}
                        className="text-green-600 hover:text-green-700 cursor-pointer" 
                        title="Edit Assessment"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        onClick={() => {
                          console.log('🟣 Analytics button clicked for assessment:', assessment.title, assessment.id);
                          setAnalyticsAssessment(assessment);
                        }}
                        className="text-purple-600 hover:text-purple-700 cursor-pointer" 
                        title="View Analytics"
                      >
                        <i className="ri-bar-chart-line"></i>
                      </button>
                      <button 
                        onClick={async () => {
                          console.log('🟠 Duplicate button clicked for assessment:', assessment.title, assessment.id);
                          try {
                            setLoading(true);
                            const duplicatedAssessment = await DataService.duplicateAssessment(assessment.id);
                            setSuccess(`Assessment "${assessment.title}" duplicated successfully!`);
                            
                            // Update local state immediately for instant UI feedback
                            console.log('🟠 Adding duplicated assessment to local state immediately...');
                            
                            // Transform the duplicated assessment to match frontend format
                            const course = courses.find(c => c.id === duplicatedAssessment.course_id);
                            const transformedDuplicated = {
                              id: duplicatedAssessment.id,
                              title: duplicatedAssessment.title,
                              course: course?.title || 'No Course Assigned',
                              type: duplicatedAssessment.type || 'quiz',
                              questions: Array.isArray(duplicatedAssessment.questions) ? duplicatedAssessment.questions.length : 0,
                              duration: duplicatedAssessment.time_limit_minutes ? `${duplicatedAssessment.time_limit_minutes} min` : 'No limit',
                              attempts: 0, // Duplicated assessment has no attempts yet
                              avgScore: 0, // Duplicated assessment has no scores yet
                              status: duplicatedAssessment.status || 'draft',
                              created: new Date(duplicatedAssessment.created_at).toLocaleDateString(),
                              difficulty: duplicatedAssessment.difficulty || 'beginner'
                            };
                            
                            console.log('🟠 Transformed duplicated assessment for local state:', transformedDuplicated);
                            
                            setAssessments(prevAssessments => {
                              const updated = [...prevAssessments, transformedDuplicated];
                              console.log('🟠 Local state updated, new count:', updated.length);
                              return updated;
                            });
                            
                            // Real-time subscription will also handle the UI update as backup
                            console.log('🟠 Real-time subscription will handle UI update as backup');
                          } catch (error) {
                            console.error('Error duplicating assessment:', error);
                            setError('Failed to duplicate assessment. Please try again.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-orange-600 hover:text-orange-700 cursor-pointer" 
                        title="Duplicate Assessment"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                      <button 
                        onClick={() => {
                          console.log('🔴 Delete button clicked for assessment:', assessment.title, assessment.id);
                          handleDeleteAssessment(assessment.id);
                        }}
                        className="text-red-600 hover:text-red-700 cursor-pointer" 
                        title="Delete Assessment"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <Button onClick={clearAllFilters}>
            <i className="ri-refresh-line mr-2"></i>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Types</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quizzes</span>
              <span className="text-sm font-medium text-gray-900">{assessments.filter(a => a.type === 'quiz').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Projects</span>
              <span className="text-sm font-medium text-gray-900">{assessments.filter(a => a.type === 'project').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assignments</span>
              <span className="text-sm font-medium text-gray-900">{assessments.filter(a => a.type === 'assignment').length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Beginner</span>
              <span className="text-sm font-medium text-green-600">{assessments.filter(a => a.difficulty === 'beginner').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Intermediate</span>
              <span className="text-sm font-medium text-yellow-600">{assessments.filter(a => a.difficulty === 'intermediate').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Advanced</span>
              <span className="text-sm font-medium text-red-600">{assessments.filter(a => a.difficulty === 'advanced').length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-gray-900">Assessment created</div>
              <div className="text-gray-500">2 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">New submissions</div>
              <div className="text-gray-500">4 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">Assessment reviewed</div>
              <div className="text-gray-500">6 hours ago</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Create Assessment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assessment"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={assessmentFormData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Enter assessment title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={assessmentFormData.course_id}
                onChange={(e) => handleFormChange('course_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={assessmentFormData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={assessmentFormData.difficulty}
                onChange={(e) => handleFormChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={assessmentFormData.time_limit_minutes}
                onChange={(e) => handleFormChange('time_limit_minutes', e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={assessmentFormData.passing_score}
                onChange={(e) => handleFormChange('passing_score', e.target.value)}
                placeholder="e.g., 70"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={assessmentFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe the assessment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={assessmentFormData.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAssessment}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-save-line mr-2"></i>
              Create Assessment
            </button>
          </div>
        </div>
      </Modal>

      {/* View Assessment Modal */}
      {viewingAssessment && (
        <Modal
          isOpen={!!viewingAssessment}
          onClose={() => setViewingAssessment(null)}
          title="Assessment Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <p className="text-gray-900 font-medium">{viewingAssessment.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <p className="text-gray-900">{viewingAssessment.course}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewingAssessment.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                  viewingAssessment.type === 'project' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {viewingAssessment.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewingAssessment.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  viewingAssessment.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {viewingAssessment.difficulty}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <p className="text-gray-900">{viewingAssessment.duration}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  viewingAssessment.status === 'active' ? 'bg-green-100 text-green-800' :
                  viewingAssessment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  viewingAssessment.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewingAssessment.status}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-900">{viewingAssessment.description || 'No description provided'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Questions</div>
                <div className="text-2xl font-bold text-gray-900">{viewingAssessment.questions}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Attempts</div>
                <div className="text-2xl font-bold text-gray-900">{viewingAssessment.attempts}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Avg Score</div>
                <div className="text-2xl font-bold text-gray-900">{viewingAssessment.avgScore}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Analytics Modal */}
      {analyticsAssessment && (
        <Modal
          isOpen={!!analyticsAssessment}
          onClose={() => setAnalyticsAssessment(null)}
          title={`Analytics - ${analyticsAssessment.title}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-600">Total Attempts</div>
                <div className="text-2xl font-bold text-blue-900">{analyticsAssessment.attempts}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">Average Score</div>
                <div className="text-2xl font-bold text-green-900">{analyticsAssessment.avgScore}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-600">Completion Rate</div>
                <div className="text-2xl font-bold text-purple-900">85%</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-600">Questions</div>
                <div className="text-2xl font-bold text-orange-900">{analyticsAssessment.questions}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Students Completed</span>
                  <span className="font-medium">12/15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Time</span>
                  <span className="font-medium">24 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pass Rate</span>
                  <span className="font-medium text-green-600">80%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Student completed assessment</span>
                  <span className="text-gray-400">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Assessment updated</span>
                  <span className="text-gray-400">1 day ago</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">New student enrolled</span>
                  <span className="text-gray-400">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Assessment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAssessment(null);
        }}
        title={`Edit Assessment: ${editingAssessment?.title || ''}`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={assessmentFormData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Enter assessment title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={assessmentFormData.course_id}
                onChange={(e) => handleFormChange('course_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={assessmentFormData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={assessmentFormData.difficulty}
                onChange={(e) => handleFormChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={assessmentFormData.time_limit_minutes}
                onChange={(e) => handleFormChange('time_limit_minutes', e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={assessmentFormData.passing_score}
                onChange={(e) => handleFormChange('passing_score', e.target.value)}
                placeholder="e.g., 70"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={assessmentFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe the assessment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={assessmentFormData.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingAssessment(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitEditAssessment}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-save-line mr-2"></i>
              Update Assessment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAssessments;
