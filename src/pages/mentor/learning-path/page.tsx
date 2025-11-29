import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Learning Path Interfaces
interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blanks' | 'coding';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

interface Test {
  id: string;
  name: string;
  questions: Question[];
  passPercentage: number;
  totalMarks: number;
}

interface Module {
  id: string;
  title: string;
  contentType: 'PDF' | 'Video' | 'Text' | 'Quiz' | 'Assignment';
  content?: string;
  file?: File | null;
  fileUrl?: string;
  duration: number; // in minutes
  order: number;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  test: Test | null;
  order: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // total duration in hours
  units: Unit[];
  finalTest: Test | null;
  created_at: string;
  updated_at: string;
  totalUnits: number;
  totalModules: number;
  totalTests: number;
}

const MentorLearningPath: React.FC = () => {
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [lottieAnimationData, setLottieAnimationData] = useState<any>(null);
  const [viewingPath, setViewingPath] = useState<LearningPath | null>(null);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedIndividualModules, setExpandedIndividualModules] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [expandedFinalTest, setExpandedFinalTest] = useState<boolean>(false);
  const [expandedFinalTestQuestions, setExpandedFinalTestQuestions] = useState<Set<string>>(new Set());
  const [expandedCourseIntro, setExpandedCourseIntro] = useState<boolean>(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  
  // Form States
  const [courseIntro, setCourseIntro] = useState({
    title: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailUrl: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    duration: ''
  });
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [finalTest, setFinalTest] = useState<Test | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  // Load Lottie animation
  useEffect(() => {
    fetch('/Learningpath.json')
      .then(response => response.json())
      .then(data => setLottieAnimationData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/auth/signin');
        return;
      }
      setCurrentUser(user);
      
      // Fetch learning paths created by this mentor
      await fetchLearningPaths(user.id);
      
    } catch (error) {
      console.error('❌ Error initializing learning path page:', error);
      setError('Failed to initialize page. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPaths = async (mentorId: string) => {
    try {
      // For now, we'll use mock data. Replace with actual API call later
      const mockPaths: LearningPath[] = [
        {
          id: '1',
          title: 'Full Stack Web Development',
          description: 'Complete web development course from basics to advanced',
          level: 'Intermediate',
          duration: 120,
          units: [],
          finalTest: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          totalUnits: 5,
          totalModules: 25,
          totalTests: 6
        },
        {
          id: '2',
          title: 'Python Programming Mastery',
          description: 'Learn Python from scratch to advanced level',
          level: 'Beginner',
          duration: 80,
          units: [],
          finalTest: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          totalUnits: 4,
          totalModules: 20,
          totalTests: 5
        }
      ];
      
      setLearningPaths(mockPaths);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    }
  };

  // Unit Management
  const addUnit = () => {
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      title: '',
      description: '',
      modules: [],
      test: null,
      order: units.length + 1
    };
    setUnits([...units, newUnit]);
    // Auto-expand when unit is added
    const newExpanded = new Set(expandedUnits);
    newExpanded.add(newUnit.id);
    setExpandedUnits(newExpanded);
  };

  const removeUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId).map((u, idx) => ({ ...u, order: idx + 1 })));
  };

  const updateUnit = (unitId: string, field: keyof Unit, value: any) => {
    setUnits(units.map(unit => 
      unit.id === unitId ? { ...unit, [field]: value } : unit
    ));
  };

  // Module Management
  const addModule = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: '',
      contentType: 'Text',
      duration: 0,
      order: unit.modules.length + 1
    };
    
    updateUnit(unitId, 'modules', [...unit.modules, newModule]);
  };

  const removeModule = (unitId: string, moduleId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const updatedModules = unit.modules
      .filter(m => m.id !== moduleId)
      .map((m, idx) => ({ ...m, order: idx + 1 }));
    
    updateUnit(unitId, 'modules', updatedModules);
  };

  const moveModule = (unitId: string, moduleId: string, direction: 'up' | 'down') => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    const moduleIndex = unit.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const newIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    
    // Check bounds
    if (newIndex < 0 || newIndex >= unit.modules.length) return;

    const updatedModules = [...unit.modules];
    [updatedModules[moduleIndex], updatedModules[newIndex]] = [updatedModules[newIndex], updatedModules[moduleIndex]];
    
    // Update order numbers
    updatedModules.forEach((m, idx) => {
      m.order = idx + 1;
    });

    updateUnit(unitId, 'modules', updatedModules);
  };

  const updateModule = (unitId: string, moduleId: string, field: keyof Module, value: any) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const updatedModules = unit.modules.map(module =>
      module.id === moduleId ? { ...module, [field]: value } : module
    );
    
    updateUnit(unitId, 'modules', updatedModules);
  };

  // Test Management
  const addUnitTest = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    
    const newTest: Test = {
      id: `test-${Date.now()}`,
      name: `${unit.title} Test`,
      questions: [],
      passPercentage: 70,
      totalMarks: 100
    };
    
    updateUnit(unitId, 'test', newTest);
  };

  const removeUnitTest = (unitId: string) => {
    updateUnit(unitId, 'test', null);
  };

  const addFinalTest = () => {
    const newTest: Test = {
      id: `final-test-${Date.now()}`,
      name: 'Final Course Test',
      questions: [],
      passPercentage: 70,
      totalMarks: 100
    };
    setFinalTest(newTest);
  };

  const removeFinalTest = () => {
    setFinalTest(null);
  };

  // Question Management
  const addQuestion = (testId: string, isFinalTest: boolean = false) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      explanation: ''
    };

    if (isFinalTest && finalTest) {
      setFinalTest({
        ...finalTest,
        questions: [...finalTest.questions, newQuestion]
      });
      } else {
      const unit = units.find(u => u.test?.id === testId);
      if (unit && unit.test) {
        updateUnit(unit.id, 'test', {
          ...unit.test,
          questions: [...unit.test.questions, newQuestion]
        });
      }
    }
  };

  const removeQuestion = (testId: string, questionId: string, isFinalTest: boolean = false) => {
    if (isFinalTest && finalTest) {
      setFinalTest({
        ...finalTest,
        questions: finalTest.questions.filter(q => q.id !== questionId)
      });
      } else {
      const unit = units.find(u => u.test?.id === testId);
      if (unit && unit.test) {
        updateUnit(unit.id, 'test', {
          ...unit.test,
          questions: unit.test.questions.filter(q => q.id !== questionId)
        });
      }
    }
  };

  const updateQuestion = (testId: string, questionId: string, field: keyof Question, value: any, isFinalTest: boolean = false) => {
    if (isFinalTest && finalTest) {
      setFinalTest({
        ...finalTest,
        questions: finalTest.questions.map(q =>
          q.id === questionId ? { ...q, [field]: value } : q
        )
      });
    } else {
      const unit = units.find(u => u.test?.id === testId);
      if (unit && unit.test) {
        updateUnit(unit.id, 'test', {
          ...unit.test,
          questions: unit.test.questions.map(q =>
            q.id === questionId ? { ...q, [field]: value } : q
          )
        });
      }
    }
  };

  // Calculate Summary
  const calculateSummary = () => {
    const totalUnits = units.length;
    const totalModules = units.reduce((sum, unit) => sum + unit.modules.length, 0);
    const totalTests = units.filter(u => u.test).length + (finalTest ? 1 : 0);
    const totalDuration = units.reduce((sum, unit) => 
      sum + unit.modules.reduce((mSum, module) => mSum + module.duration, 0), 0
    );
    
    return {
      totalUnits,
      totalModules,
      totalTests,
      estimatedDuration: Math.round(totalDuration / 60) // Convert minutes to hours
    };
  };

  // Handle File Upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseIntro({
        ...courseIntro,
        thumbnail: e.target.files[0],
        thumbnailUrl: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleModuleFileChange = (unitId: string, moduleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateModule(unitId, moduleId, 'file', e.target.files[0]);
    }
  };

  // Submit Learning Path (Create or Update)
  const handleSubmit = async () => {
    try {
      if (!courseIntro.title || !courseIntro.description) {
        setError('Please fill in course title and description');
        return;
      }

      if (units.length === 0) {
        setError('Please add at least one unit');
        return;
      }

      setUploadLoading(true);
      setError('');

      // Upload thumbnail if exists
      let thumbnailUrl = editingPath?.thumbnail || courseIntro.thumbnailUrl || '';
      if (courseIntro.thumbnail) {
        const fileExt = courseIntro.thumbnail.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `learning-paths/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-thumbnails')
          .upload(filePath, courseIntro.thumbnail);
        
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('course-thumbnails')
          .getPublicUrl(filePath);
        
        thumbnailUrl = data.publicUrl;
      }

      // Calculate summary
      const summary = calculateSummary();

      const isEditing = !!editingPath;
      
      // Create or update learning path object
      const learningPathData: Partial<LearningPath> = {
        title: courseIntro.title,
        description: courseIntro.description,
        thumbnail: thumbnailUrl,
        level: courseIntro.level,
        duration: parseInt(courseIntro.duration) || summary.estimatedDuration,
        units: units,
        finalTest: finalTest,
        totalUnits: summary.totalUnits,
        totalModules: summary.totalModules,
        totalTests: summary.totalTests,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        // Update existing learning path
        const updatedPath: LearningPath = {
          ...editingPath,
          ...learningPathData,
          id: editingPath.id,
          created_at: editingPath.created_at
        };
        
        // TODO: Update in database when API is ready
        // const { error } = await supabase
        //   .from('learning_paths')
        //   .update(learningPathData)
        //   .eq('id', editingPath.id);
        // if (error) throw error;

        // Update in state
        setLearningPaths(learningPaths.map(p => 
          p.id === editingPath.id ? updatedPath : p
        ));
        
        alert('Learning Path updated successfully!');
      } else {
        // Create new learning path
        const newPath: LearningPath = {
          ...learningPathData as Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>,
          id: `path-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // TODO: Save to database when API is ready
        // const { data, error } = await supabase
        //   .from('learning_paths')
        //   .insert(newPath)
        //   .select()
        //   .single();
        // if (error) throw error;

        // Add to state
        setLearningPaths([...learningPaths, newPath]);
        
        alert('Learning Path created successfully!');
      }

      // Reset form
      setCourseIntro({
        title: '',
        description: '',
        thumbnail: null,
        thumbnailUrl: '',
        level: 'Beginner',
        duration: ''
      });
      setUnits([]);
      setFinalTest(null);
      setEditingPath(null);
      setShowUploadModal(false);

      // Refresh list
      if (currentUser) {
        await fetchLearningPaths(currentUser.id);
      }
    } catch (error: any) {
      console.error(`Error ${editingPath ? 'updating' : 'creating'} learning path:`, error);
      setError(error.message || `Failed to ${editingPath ? 'update' : 'create'} learning path`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Edit Learning Path
  const handleEdit = (path: LearningPath) => {
    setEditingPath(path);
    // Load path data into form
    setCourseIntro({
      title: path.title,
      description: path.description,
      thumbnail: null,
      thumbnailUrl: path.thumbnail || '',
      level: path.level,
      duration: path.duration.toString()
    });
    setUnits(path.units || []);
    setFinalTest(path.finalTest || null);
    setShowUploadModal(true);
    setOpenMenuId(null);
  };

  // Delete Learning Path
  const handleDelete = async (pathId: string) => {
    if (!window.confirm('Are you sure you want to delete this learning path? This action cannot be undone.')) {
      return;
    }

    try {
      setUploadLoading(true);
      
      // TODO: Delete from database when API is ready
      // const { error } = await supabase
      //   .from('learning_paths')
      //   .delete()
      //   .eq('id', pathId);
      // if (error) throw error;

      // Remove from state
      setLearningPaths(learningPaths.filter(p => p.id !== pathId));
      
      // Close menu if open
      setOpenMenuId(null);
      
      alert('Learning Path deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting learning path:', error);
      setError(error.message || 'Failed to delete learning path');
      alert(`Failed to delete learning path: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const summary = calculateSummary();

  // Helper function to get color and initial for card
  const getCardColor = (index: number) => {
    const colors = [
      { bg: 'bg-yellow-500', text: 'text-yellow-600', initial: 'L' },
      { bg: 'bg-pink-500', text: 'text-pink-600', initial: 'P' },
      { bg: 'bg-green-500', text: 'text-green-600', initial: 'G' },
      { bg: 'bg-blue-500', text: 'text-blue-600', initial: 'B' },
      { bg: 'bg-purple-500', text: 'text-purple-600', initial: 'P' },
      { bg: 'bg-orange-500', text: 'text-orange-600', initial: 'O' },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SimpleDCODESpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading Learning Paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
        }
      `}</style>
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
        {!showUploadModal && (
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <i className="ri-upload-cloud-line"></i>
            Upload New Learning Path +
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Upload Form - Show in main content area instead of modal */}
      {showUploadModal ? (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
                    <button
                onClick={() => {
                  setShowUploadModal(false);
                  setError('');
                  setEditingPath(null);
                  // Reset form
                  setCourseIntro({
                    title: '',
                    description: '',
                    thumbnail: null,
                    thumbnailUrl: '',
                    level: 'Beginner',
                    duration: ''
                  });
                  setUnits([]);
                  setFinalTest(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Learning Paths"
              >
                <i className="ri-arrow-left-line text-xl text-gray-600"></i>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPath ? 'Edit Learning Path' : 'Upload New Learning Path'}
              </h2>
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
          {/* Course Introduction Section */}
          <div className="mb-8">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <i className="ri-information-line text-white text-lg"></i>
                </div>
                Course Introduction
              </h2>
              <p className="text-sm text-gray-500 ml-13">Fill in the basic information about your learning path</p>
            </div>
            <div className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              {/* Course Introduction Header - Always Visible */}
              <div className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setExpandedCourseIntro(!expandedCourseIntro)}
              >
                <div className="flex items-center gap-3">
                  {/* Plus Icon */}
                  <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                    <i className={`ri-${expandedCourseIntro ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Course Introduction
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Down/Up Arrow */}
                  <i className={`ri-arrow-${expandedCourseIntro ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                </div>
              </div>

              {/* Course Introduction Content - Expandable */}
              {expandedCourseIntro && (
                <div className="px-3 pb-4 pt-2 border-t border-gray-200">
                  <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={courseIntro.title}
                    onChange={(e) => setCourseIntro({ ...courseIntro, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    placeholder="e.g., Full Stack Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    Course Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={courseIntro.description}
                    onChange={(e) => setCourseIntro({ ...courseIntro, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                    rows={4}
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Thumbnail Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-gray-50"
                      >
                        {courseIntro.thumbnailUrl ? (
                          <img
                            src={courseIntro.thumbnailUrl}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <>
                            <i className="ri-image-add-line text-3xl text-gray-400 mb-2"></i>
                            <span className="text-sm text-gray-600">Click to upload thumbnail</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      Difficulty Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={courseIntro.level}
                      onChange={(e) => setCourseIntro({ ...courseIntro, level: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer"
                    >
                      <option value="Beginner">🟢 Beginner</option>
                      <option value="Intermediate">🟡 Intermediate</option>
                      <option value="Advanced">🔴 Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duration (hours)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={courseIntro.duration}
                      onChange={(e) => setCourseIntro({ ...courseIntro, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      placeholder="e.g., 120"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">hours</span>
                  </div>
                </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Units Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <i className="ri-book-open-line text-white text-lg"></i>
                  </div>
                  Course Units
                </h2>
                <p className="text-sm text-gray-500 ml-13">Organize your course content into units and modules</p>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={addUnit}
                className="shadow-md hover:shadow-lg transition-all"
              >
                <i className="ri-add-line mr-2"></i>
                Add Unit
              </Button>
            </div>
            
            <div className="space-y-2">
              {units.map((unit, unitIdx) => (
                <div key={unit.id} className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  {/* Unit Header - Always Visible */}
                  <div className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedUnits);
                      if (newExpanded.has(unit.id)) {
                        newExpanded.delete(unit.id);
                      } else {
                        newExpanded.add(unit.id);
                      }
                      setExpandedUnits(newExpanded);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Plus Icon */}
                      <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                        <i className={`ri-${expandedUnits.has(unit.id) ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        Unit {unit.order}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Down/Up Arrow */}
                      <i className={`ri-arrow-${expandedUnits.has(unit.id) ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUnit(unit.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete unit"
                      >
                        <i className="ri-delete-bin-line text-base"></i>
                      </button>
                    </div>
                  </div>

                  {/* Unit Content - Expandable */}
                  {expandedUnits.has(unit.id) && (
                    <div className="px-3 pb-4 pt-2 border-t border-gray-200">

                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                        Unit Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => updateUnit(unit.id, 'title', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                        placeholder="e.g., Introduction to Web Development"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Unit Description
                      </label>
                      <textarea
                        value={unit.description}
                        onChange={(e) => updateUnit(unit.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none"
                        rows={2}
                        placeholder="Brief description of what this unit covers..."
                      />
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <i className="ri-file-list-line text-blue-600"></i>
                        Modules ({unit.modules.length})
                      </h4>
                      <div className="flex items-center gap-2">
                        {/* Expand/Collapse Button */}
                        {unit.modules.length > 0 && (
                        <button
                            onClick={() => {
                              const newExpanded = new Set(expandedModules);
                              const moduleKey = `${unit.id}-modules`;
                              if (newExpanded.has(moduleKey)) {
                                // Collapse all individual modules when collapsing the section
                                const newIndividualExpanded = new Set(expandedIndividualModules);
                                unit.modules.forEach(m => {
                                  newIndividualExpanded.delete(`${unit.id}-${m.id}`);
                                });
                                setExpandedIndividualModules(newIndividualExpanded);
                                newExpanded.delete(moduleKey);
                              } else {
                                newExpanded.add(moduleKey);
                              }
                              setExpandedModules(newExpanded);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={expandedModules.has(`${unit.id}-modules`) ? "Collapse all modules" : "Expand all modules"}
                          >
                            <i className={`ri-arrow-${expandedModules.has(`${unit.id}-modules`) ? 'up' : 'down'}-line text-lg`}></i>
                    </button>
                        )}
                        {/* Add Module Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addModule(unit.id);
                            // Auto-expand when module is added
                            const newExpanded = new Set(expandedModules);
                            newExpanded.add(`${unit.id}-modules`);
                            setExpandedModules(newExpanded);
                          }}
                          className="border-2 hover:bg-blue-50"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Add Module
                        </Button>
                      </div>
                    </div>

                    {expandedModules.has(`${unit.id}-modules`) && (
                      <div className="space-y-2">
                      {unit.modules.map((module, moduleIdx) => (
                        <div key={module.id} className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                          {/* Module Header - Always Visible */}
                          <div className="flex items-center justify-between p-3 cursor-pointer"
                            onClick={() => {
                              const newExpanded = new Set(expandedIndividualModules);
                              const moduleKey = `${unit.id}-${module.id}`;
                              if (newExpanded.has(moduleKey)) {
                                newExpanded.delete(moduleKey);
                              } else {
                                newExpanded.add(moduleKey);
                              }
                              setExpandedIndividualModules(newExpanded);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {/* Plus Icon */}
                              <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                <i className={`ri-${expandedIndividualModules.has(`${unit.id}-${module.id}`) ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                Module {module.order}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Down/Up Arrow */}
                              <i className={`ri-arrow-${expandedIndividualModules.has(`${unit.id}-${module.id}`) ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                              {/* Delete Button */}
                          <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeModule(unit.id, module.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete module"
                              >
                                <i className="ri-delete-bin-line text-base"></i>
                    </button>
                            </div>
                          </div>

                          {/* Module Content - Expandable */}
                          {expandedIndividualModules.has(`${unit.id}-${module.id}`) && (
                            <div className="px-3 pb-4 pt-2 border-t border-gray-200 space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                                Module Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(unit.id, module.id, 'title', e.target.value)}
                                className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                placeholder="Enter module title"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                                  Content Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={module.contentType}
                                  onChange={(e) => updateModule(unit.id, module.id, 'contentType', e.target.value)}
                                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer"
                                >
                                  <option value="PDF">📄 PDF</option>
                                  <option value="Video">🎥 Video</option>
                                  <option value="Text">📝 Text</option>
                                  <option value="Quiz">❓ Quiz</option>
                                  <option value="Assignment">📋 Assignment</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                                  Duration (minutes)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={module.duration}
                                    onChange={(e) => updateModule(unit.id, module.id, 'duration', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">min</span>
                                </div>
                              </div>
                            </div>

                            {(module.contentType === 'PDF' || module.contentType === 'Video' || module.contentType === 'Assignment') && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Upload File
                                </label>
                                <input
                                  type="file"
                                  onChange={(e) => handleModuleFileChange(unit.id, module.id, e)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  accept={module.contentType === 'Video' ? 'video/*' : module.contentType === 'PDF' ? 'application/pdf' : '*'}
                                />
                              </div>
                            )}

                            {module.contentType === 'Text' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Content
                                </label>
                                <textarea
                                  value={module.content || ''}
                                  onChange={(e) => updateModule(unit.id, module.id, 'content', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={3}
                                  placeholder="Enter text content"
                                />
                              </div>
                            )}
                            </div>
                          )}
                        </div>
                      ))}
                      </div>
                    )}
                  </div>

                  {/* Unit Test */}
                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    {unit.test ? (
                      <div className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        {/* Unit Test Header - Always Visible */}
                        <div className="flex items-center justify-between p-3 cursor-pointer"
                          onClick={() => {
                            const newExpanded = new Set(expandedTests);
                            if (newExpanded.has(unit.id)) {
                              newExpanded.delete(unit.id);
                            } else {
                              newExpanded.add(unit.id);
                            }
                            setExpandedTests(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {/* Plus Icon */}
                            <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                              <i className={`ri-${expandedTests.has(unit.id) ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              Unit {unit.order} Test
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Down/Up Arrow */}
                            <i className={`ri-arrow-${expandedTests.has(unit.id) ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                            {/* Delete Button */}
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUnitTest(unit.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove test"
                            >
                              <i className="ri-delete-bin-line text-base"></i>
                          </button>
                            </div>
                        </div>

                        {/* Unit Test Content - Expandable */}
                        {expandedTests.has(unit.id) && (
                          <div className="px-3 pb-4 pt-2 border-t border-gray-200">
                            <div className="space-y-3 mb-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Test Name
                                  </label>
                                  <input
                                    type="text"
                                    value={unit.test.name}
                                    onChange={(e) => updateUnit(unit.id, 'test', { ...unit.test!, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Pass Percentage (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={unit.test.passPercentage}
                                    onChange={(e) => updateUnit(unit.id, 'test', { ...unit.test!, passPercentage: parseInt(e.target.value) || 70 })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                    max="100"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Questions: {unit.test.questions.length}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    addQuestion(unit.test!.id, false);
                                    // Auto-expand when question is added
                                    const newExpanded = new Set(expandedTests);
                                    newExpanded.add(unit.id);
                                    setExpandedTests(newExpanded);
                                  }}
                                  className="border-2 hover:bg-blue-50"
                                >
                                  <i className="ri-add-line mr-2"></i>
                                  Add Question
                                </Button>
                              </div>

                              {/* Questions */}
                              <div className="space-y-2 mt-3">
                                {unit.test.questions.map((question) => (
                                  <div key={question.id} className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                    {/* Question Header - Always Visible */}
                                    <div className="flex items-center justify-between p-3 cursor-pointer"
                                      onClick={() => {
                                        const newExpanded = new Set(expandedQuestions);
                                        const questionKey = `${unit.test!.id}-${question.id}`;
                                        if (newExpanded.has(questionKey)) {
                                          newExpanded.delete(questionKey);
                                        } else {
                                          newExpanded.add(questionKey);
                                        }
                                        setExpandedQuestions(newExpanded);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        {/* Plus Icon */}
                                        <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                          <i className={`ri-${expandedQuestions.has(`${unit.test!.id}-${question.id}`) ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                                        </div>
                                        <select
                                          value={question.type}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            updateQuestion(unit.test!.id, question.id, 'type', e.target.value, false);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                          <option value="multiple-choice">MCQ</option>
                                          <option value="true-false">True/False</option>
                                          <option value="fill-blanks">Fill Blanks</option>
                                          <option value="coding">Code Question</option>
                                        </select>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {/* Down/Up Arrow */}
                                        <i className={`ri-arrow-${expandedQuestions.has(`${unit.test!.id}-${question.id}`) ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                                        {/* Delete Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeQuestion(unit.test!.id, question.id, false);
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Delete question"
                                        >
                                          <i className="ri-close-line text-base"></i>
                          </button>
                                      </div>
                                    </div>
                                    
                                    {/* Question Content - Expandable */}
                                    {expandedQuestions.has(`${unit.test!.id}-${question.id}`) && (
                                      <div className="px-3 pb-4 pt-2 border-t border-gray-200 space-y-2">
                                        <input
                                          type="text"
                                          value={question.question}
                                          onChange={(e) => updateQuestion(unit.test!.id, question.id, 'question', e.target.value, false)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="Enter question"
                                        />

                                          {question.type === 'multiple-choice' && (
                                            <div className="space-y-2">
                                              {question.options?.map((option, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                  <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                      const newOptions = [...(question.options || [])];
                                                      newOptions[optIdx] = e.target.value;
                                                      updateQuestion(unit.test!.id, question.id, 'options', newOptions, false);
                                                    }}
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                  />
                                                  <input
                                                    type="radio"
                                                    name={`correct-${question.id}`}
                                                    checked={question.correctAnswer === String.fromCharCode(65 + optIdx)}
                                                    onChange={() => updateQuestion(unit.test!.id, question.id, 'correctAnswer', String.fromCharCode(65 + optIdx), false)}
                                                  />
                                                </div>
                        ))}
                      </div>
                    )}

                                          {question.type === 'true-false' && (
                                            <div className="flex gap-4">
                                              <label className="flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`tf-${question.id}`}
                                                  checked={question.correctAnswer === 'True'}
                                                  onChange={() => updateQuestion(unit.test!.id, question.id, 'correctAnswer', 'True', false)}
                                                />
                                                True
                                              </label>
                                              <label className="flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`tf-${question.id}`}
                                                  checked={question.correctAnswer === 'False'}
                                                  onChange={() => updateQuestion(unit.test!.id, question.id, 'correctAnswer', 'False', false)}
                                                />
                                                False
                                              </label>
                  </div>
                                          )}

                                          {question.type === 'fill-blanks' && (
                                            <div className="space-y-2">
                                              <textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(unit.test!.id, question.id, 'question', e.target.value, false)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Enter text with blanks (use ___ for blanks)"
                                              />
                                              <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                  Correct Answers (comma-separated for each blank)
                                                </label>
                                                <input
                                                  type="text"
                                                  value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : (question.correctAnswer || '')}
                                                  onChange={(e) => {
                                                    const answers = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                    updateQuestion(unit.test!.id, question.id, 'correctAnswer', answers, false);
                                                  }}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  placeholder="Answer1, Answer2, Answer3"
                                                />
            </div>
          </div>
                                          )}

                                          {question.type === 'coding' && (
                                            <div className="space-y-2">
                                              <textarea
                                                value={question.question}
                                                onChange={(e) => updateQuestion(unit.test!.id, question.id, 'question', e.target.value, false)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                                rows={4}
                                                placeholder="Enter coding problem description"
                                              />
                                              <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                  Expected Output / Solution
                                                </label>
                                                <textarea
                                                  value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                                  onChange={(e) => updateQuestion(unit.test!.id, question.id, 'correctAnswer', e.target.value, false)}
                                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                                  rows={3}
                                                  placeholder="Enter expected solution or output"
                                                />
        </div>
                                            </div>
                                          )}

                                          <div className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              value={question.points}
                                              onChange={(e) => updateQuestion(unit.test!.id, question.id, 'points', parseInt(e.target.value) || 10, false)}
                                              className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              placeholder="Points"
                                            />
                                            <span className="text-xs text-gray-600">points</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                          )}
                        </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addUnitTest(unit.id);
                          // Auto-expand when test is added
                          const newExpanded = new Set(expandedTests);
                          newExpanded.add(unit.id);
                          setExpandedTests(newExpanded);
                        }}
                        className="border-2 hover:bg-green-50"
                      >
                        <i className="ri-file-list-line mr-2"></i>
                        Add Unit Test
                      </Button>
                    )}
                  </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

          {/* Final Summary Test */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <i className="ri-file-list-3-line text-white text-lg"></i>
                  </div>
                  Final Course Test
                </h2>
                <p className="text-sm text-gray-500 ml-13">Create a comprehensive test to assess student knowledge</p>
              </div>
              {!finalTest && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    addFinalTest();
                    setExpandedFinalTest(true);
                  }}
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Final Test
                </Button>
                  )}
                </div>

            {finalTest && (
              <div className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                {/* Final Test Header - Always Visible */}
                <div className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => setExpandedFinalTest(!expandedFinalTest)}
                >
                  <div className="flex items-center gap-3">
                    {/* Plus Icon */}
                    <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                      <i className={`ri-${expandedFinalTest ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      Final Course Test
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Down/Up Arrow */}
                    <i className={`ri-arrow-${expandedFinalTest ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                    {/* Delete Button */}
                <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFinalTest();
                        setExpandedFinalTest(false);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove test"
                    >
                      <i className="ri-delete-bin-line text-base"></i>
                </button>
                  </div>
              </div>

                {/* Final Test Content - Expandable */}
                {expandedFinalTest && (
                  <div className="px-3 pb-4 pt-2 border-t border-gray-200">
                    <div className="space-y-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Test Name
                          </label>
                          <input
                            type="text"
                            value={finalTest.name}
                            onChange={(e) => setFinalTest({ ...finalTest, name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pass Percentage (%)
                          </label>
                          <input
                            type="number"
                            value={finalTest.passPercentage}
                            onChange={(e) => setFinalTest({ ...finalTest, passPercentage: parseInt(e.target.value) || 70 })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Questions: {finalTest.questions.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addQuestion(finalTest.id, true);
                            const newExpanded = new Set(expandedFinalTestQuestions);
                            newExpanded.add(finalTest.questions.length.toString());
                            setExpandedFinalTestQuestions(newExpanded);
                          }}
                          className="border-2 hover:bg-blue-50"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Add Question
                        </Button>
                        </div>

                      {/* Questions */}
                      <div className="space-y-2 mt-3">
                        {finalTest.questions.map((question) => (
                          <div key={question.id} className="border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            {/* Question Header - Always Visible */}
                            <div className="flex items-center justify-between p-3 cursor-pointer"
                              onClick={() => {
                                const newExpanded = new Set(expandedFinalTestQuestions);
                                const questionKey = `${finalTest.id}-${question.id}`;
                                if (newExpanded.has(questionKey)) {
                                  newExpanded.delete(questionKey);
                                } else {
                                  newExpanded.add(questionKey);
                                }
                                setExpandedFinalTestQuestions(newExpanded);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {/* Plus Icon */}
                                <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                                  <i className={`ri-${expandedFinalTestQuestions.has(`${finalTest.id}-${question.id}`) ? 'subtract' : 'add'}-line text-gray-600 text-sm`}></i>
                      </div>
                                <select
                                  value={question.type}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateQuestion(finalTest.id, question.id, 'type', e.target.value, true);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                  <option value="multiple-choice">MCQ</option>
                                  <option value="true-false">True/False</option>
                                  <option value="fill-blanks">Fill Blanks</option>
                                  <option value="coding">Code Question</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Down/Up Arrow */}
                                <i className={`ri-arrow-${expandedFinalTestQuestions.has(`${finalTest.id}-${question.id}`) ? 'up' : 'down'}-s-line text-gray-500 text-lg`}></i>
                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeQuestion(finalTest.id, question.id, true);
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete question"
                                >
                                  <i className="ri-close-line text-base"></i>
                    </button>
                              </div>
                            </div>
                            
                            {/* Question Content - Expandable */}
                            {expandedFinalTestQuestions.has(`${finalTest.id}-${question.id}`) && (
                              <div className="px-3 pb-4 pt-2 border-t border-gray-200 space-y-2">
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => updateQuestion(finalTest.id, question.id, 'question', e.target.value, true)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter question"
                                />

                                {question.type === 'multiple-choice' && (
                                  <div className="space-y-2">
                                    {question.options?.map((option, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...(question.options || [])];
                                            newOptions[optIdx] = e.target.value;
                                            updateQuestion(finalTest.id, question.id, 'options', newOptions, true);
                                          }}
                                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                        />
                                        <input
                                          type="radio"
                                          name={`final-correct-${question.id}`}
                                          checked={question.correctAnswer === String.fromCharCode(65 + optIdx)}
                                          onChange={() => updateQuestion(finalTest.id, question.id, 'correctAnswer', String.fromCharCode(65 + optIdx), true)}
                                        />
                                      </div>
                  ))}
                </div>
                                )}

                                {question.type === 'true-false' && (
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`final-tf-${question.id}`}
                                        checked={question.correctAnswer === 'True'}
                                        onChange={() => updateQuestion(finalTest.id, question.id, 'correctAnswer', 'True', true)}
                                      />
                                      True
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`final-tf-${question.id}`}
                                        checked={question.correctAnswer === 'False'}
                                        onChange={() => updateQuestion(finalTest.id, question.id, 'correctAnswer', 'False', true)}
                                      />
                                      False
                                    </label>
                                  </div>
                                )}

                                {question.type === 'fill-blanks' && (
                                  <div className="space-y-2">
                                    <textarea
                                      value={question.question}
                                      onChange={(e) => updateQuestion(finalTest.id, question.id, 'question', e.target.value, true)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      rows={3}
                                      placeholder="Enter text with blanks (use ___ for blanks)"
                                    />
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Correct Answers (comma-separated for each blank)
                                      </label>
                                      <input
                                        type="text"
                                        value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : (question.correctAnswer || '')}
                                        onChange={(e) => {
                                          const answers = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                          updateQuestion(finalTest.id, question.id, 'correctAnswer', answers, true);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Answer1, Answer2, Answer3"
                                      />
                    </div>
                  </div>
                )}

                                {question.type === 'coding' && (
                                  <div className="space-y-2">
                                    <textarea
                                      value={question.question}
                                      onChange={(e) => updateQuestion(finalTest.id, question.id, 'question', e.target.value, true)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                      rows={4}
                                      placeholder="Enter coding problem description"
                                    />
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Expected Output / Solution
                                      </label>
                                      <textarea
                                        value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                        onChange={(e) => updateQuestion(finalTest.id, question.id, 'correctAnswer', e.target.value, true)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                        rows={3}
                                        placeholder="Enter expected solution or output"
                                      />
              </div>
            </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuestion(finalTest.id, question.id, 'points', parseInt(e.target.value) || 10, true)}
                                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Points"
                                  />
                                  <span className="text-xs text-gray-600">points</span>
                                </div>
                  </div>
                )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="mb-8">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <i className="ri-bar-chart-line text-white text-lg"></i>
                </div>
                Course Summary
              </h2>
              <p className="text-sm text-gray-500 ml-13">Overview of your learning path structure</p>
            </div>
            <Card className="p-6 border-2 border-gray-100 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{summary.totalUnits}</div>
                  <div className="text-sm font-semibold text-gray-700">Total Units</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-green-600 mb-1">{summary.totalModules}</div>
                  <div className="text-sm font-semibold text-gray-700">Total Modules</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{summary.totalTests}</div>
                  <div className="text-sm font-semibold text-gray-700">Total Tests</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{summary.estimatedDuration}</div>
                  <div className="text-sm font-semibold text-gray-700">Est. Duration (hrs)</div>
                </div>
              </div>
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <i className="ri-information-line text-blue-600"></i>
                  <span>Difficulty Level: <span className="text-blue-600 font-bold">{courseIntro.level}</span></span>
                </div>
              </div>
            </Card>
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-gray-200 bg-gray-50 -mx-1 px-6 py-4 rounded-b-lg">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setError('');
              }}
              className="px-6 py-2.5 border-2 font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={uploadLoading}
              className="px-8 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <i className={editingPath ? "ri-save-line mr-2" : "ri-upload-cloud-line mr-2"}></i>
              {editingPath ? 'Update Learning Path' : 'Upload Learning Path'}
            </Button>
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* Banner - Only show when not in upload mode */}
          <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg">
            <div className="flex flex-col lg:flex-row items-center justify-between p-4 lg:p-5">
              {/* Left Section - Text and Statistics */}
              <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  Learn Effectively With Us!
                </h2>
                <p className="text-base lg:text-lg text-white/90 mb-4">
                  Get 30% off every course on January.
                </p>
                
                {/* Statistics Badges */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Students Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-graduation-cap-line text-xl text-white"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">Students</p>
                      <p className="text-white/90 text-xs">75,000+</p>
                    </div>
                  </div>
                  
                  {/* Expert Mentors Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-user-star-line text-xl text-white"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">Expert Mentors</p>
                      <p className="text-white/90 text-xs">200+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Lottie Animation */}
              <div className="flex-shrink-0 relative w-full lg:w-auto flex justify-center lg:justify-end lg:pr-10 lg:mr-8">
                {lottieAnimationData ? (
                  <div className="w-full max-w-xs lg:w-64 lg:h-64 h-48 flex items-center justify-center animate-slide-in-left">
                    <Lottie 
                      animationData={lottieAnimationData} 
                      loop={true}
                      autoplay={true}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-xs lg:w-64 lg:h-64 h-48 bg-white/10 rounded-lg flex items-center justify-center">
                    <div className="text-white/50 text-sm">Loading animation...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Paths Grid */}
          {learningPaths.length === 0 ? (
            <Card className="p-12 text-center">
              <i className="ri-route-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Learning Paths Yet</h3>
              <p className="text-gray-500 mb-4">Create your first learning path to get started</p>
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                Create Learning Path
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {learningPaths.map((path, index) => {
                const cardColor = getCardColor(index);
                
                return (
                  <Card key={path.id} className="p-6 hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      {/* Lottie Animation */}
                      <div className="w-16 h-16 flex items-center justify-center">
                        {lottieAnimationData ? (
                          <Lottie 
                            animationData={lottieAnimationData} 
                            loop={true}
                            autoplay={true}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* Vertical Ellipsis Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === path.id ? null : path.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More options"
                        >
                          <i className="ri-more-2-line text-xl"></i>
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === path.id && (
                          <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(path);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                            >
                              <i className="ri-edit-line"></i>
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                handleDelete(path.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                            >
                              <i className="ri-delete-bin-line"></i>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Learning Path Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {path.title}
                    </h3>

                    {/* Stats */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {path.totalUnits} Units
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {path.totalModules} Modules
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setViewingPath(path);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
                      style={{
                        backgroundColor: cardColor.bg === 'bg-yellow-500' ? '#FCD34D' :
                                        cardColor.bg === 'bg-pink-500' ? '#EC4899' :
                                        cardColor.bg === 'bg-green-500' ? '#10B981' :
                                        cardColor.bg === 'bg-blue-500' ? '#3B82F6' :
                                        cardColor.bg === 'bg-purple-500' ? '#8B5CF6' :
                                        '#F97316',
                      }}
                    >
                      View Learning Path
                    </button>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(path.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        path.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        path.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {path.level}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </React.Fragment>
      )}

      {/* View Learning Path Modal */}
      <Modal
        isOpen={!!viewingPath}
        onClose={() => {
          setViewingPath(null);
        }}
        title="Learning Path Details"
        size="full"
        maxWidth="90vw"
      >
        {viewingPath && (
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header Section */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative">
                {viewingPath.thumbnail ? (
                  <img
                    src={viewingPath.thumbnail}
                    alt={viewingPath.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-route-line text-6xl text-gray-400"></i>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    viewingPath.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                    viewingPath.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {viewingPath.level}
                  </span>
        </div>
      </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{viewingPath.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{viewingPath.description}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{viewingPath.totalUnits}</div>
                  <div className="text-sm text-gray-600">Total Units</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{viewingPath.totalModules}</div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{viewingPath.totalTests}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{viewingPath.duration}</div>
                  <div className="text-sm text-gray-600">Duration (hours)</div>
                </div>
              </div>
            </div>

            {/* Units Section */}
            {viewingPath.units && viewingPath.units.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Units</h2>
                <div className="space-y-4">
                  {viewingPath.units.map((unit, unitIndex) => (
                    <Card key={unit.id} className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Unit {unit.order}: {unit.title}
                        </h3>
                        <p className="text-gray-600">{unit.description}</p>
                      </div>

                      {/* Modules */}
                      {unit.modules && unit.modules.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-medium text-gray-700 mb-3">Modules ({unit.modules.length})</h4>
                          <div className="space-y-2">
                            {unit.modules.map((module) => (
                              <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <i className={`text-blue-600 ${
                                      module.contentType === 'Video' ? 'ri-video-line' :
                                      module.contentType === 'PDF' ? 'ri-file-pdf-line' :
                                      module.contentType === 'Quiz' ? 'ri-questionnaire-line' :
                                      module.contentType === 'Assignment' ? 'ri-task-line' :
                                      'ri-file-text-line'
                                    }`}></i>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{module.title}</p>
                                    <p className="text-sm text-gray-500">{module.contentType} • {module.duration} min</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unit Test */}
                      {unit.test && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium text-gray-700">Unit Test</h4>
                            <span className="text-sm text-gray-500">{unit.test.questions.length} Questions</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Pass Percentage: {unit.test.passPercentage}% • Total Marks: {unit.test.totalMarks}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <Card className="p-8 text-center">
                  <i className="ri-book-open-line text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No units added yet</p>
                </Card>
              </div>
            )}

            {/* Final Test */}
            {viewingPath.finalTest && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Final Course Test</h2>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{viewingPath.finalTest.name}</h3>
                    <span className="text-sm text-gray-500">{viewingPath.finalTest.questions.length} Questions</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pass Percentage: {viewingPath.finalTest.passPercentage}% • Total Marks: {viewingPath.finalTest.totalMarks}
                  </p>
                  
                  {viewingPath.finalTest.questions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Questions Preview:</h4>
                      <div className="space-y-2">
                        {viewingPath.finalTest.questions.slice(0, 3).map((question, idx) => (
                          <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {idx + 1}. {question.question || 'Question text not available'}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                              {question.type} • {question.points} points
                            </span>
                          </div>
                        ))}
                        {viewingPath.finalTest.questions.length > 3 && (
                          <p className="text-sm text-gray-500 text-center mt-2">
                            + {viewingPath.finalTest.questions.length - 3} more questions
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(viewingPath.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(viewingPath.updated_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setViewingPath(null);
                  // TODO: Implement edit functionality
                  setShowUploadModal(true);
                }}
              >
                <i className="ri-edit-line mr-2"></i>
                Edit Learning Path
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Navigate to student view or share functionality
                  console.log('Share or view as student:', viewingPath.id);
                }}
              >
                <i className="ri-share-line mr-2"></i>
                Share Learning Path
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MentorLearningPath;
