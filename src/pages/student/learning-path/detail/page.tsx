import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import AssessmentTaker from '@/pages/student/assessments/components/AssessmentTaker';
import DOMPurify from 'dompurify';

interface Module {
  id: string;
  title: string;
  content_type: 'PDF' | 'Video' | 'Text' | 'Quiz' | 'Assignment';
  content?: string;
  file_url?: string;
  duration: number;
  order_number: number;
}

interface Test {
  id: string;
  name: string;
  test_type: 'unit' | 'final';
  unit_id?: string;
  unit_title?: string;
  questions: Question[];
  pass_percentage: number;
  total_marks: number;
}

interface Question {
  id: string;
  question_type: 'multiple-choice' | 'true-false' | 'fill-blanks' | 'coding';
  question: string;
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
}

interface Unit {
  id: string;
  title: string;
  description?: string;
  order_number: number;
  modules: Module[];
  test?: Test | null;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  total_units: number;
  total_modules: number;
  total_tests: number;
  created_at?: string;
  units: Unit[];
  finalTest?: Test | null;
}

const StudentLearningPathDetail: React.FC = () => {
  const navigate = useNavigate();
  const { pathId } = useParams<{ pathId: string }>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedUnitTest, setSelectedUnitTest] = useState<{ unitId: string; test: Test } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [showCourseIntroduction, setShowCourseIntroduction] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showAssessmentTaker, setShowAssessmentTaker] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    if (pathId) {
      fetchLearningPathDetail(pathId);
    }
  }, [pathId]);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const fetchLearningPathDetail = async (id: string) => {
    try {
      setLoading(true);

      // Fetch learning path with units, modules, and tests
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_path_units (
            *,
            learning_path_modules (*),
            learning_path_tests (
              *,
              learning_path_questions (*)
            )
          ),
          learning_path_tests (
            *,
            learning_path_questions (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching learning path:', error);
        throw error;
      }

      if (data) {
        // Transform the data to match our interface
        const dbData = data as any;
        const transformedData: LearningPath = {
          id: dbData.id,
          title: dbData.title,
          description: dbData.description,
          thumbnail_url: dbData.thumbnail_url,
          level: dbData.level,
          duration: dbData.duration,
          total_units: dbData.total_units,
          total_modules: dbData.total_modules,
          total_tests: dbData.total_tests,
          created_at: dbData.created_at,
          units: (dbData.learning_path_units || [])
            .sort((a: any, b: any) => a.order_number - b.order_number)
            .map((unit: any) => ({
              id: unit.id,
              title: unit.title,
              description: unit.description || '',
              order_number: unit.order_number,
              modules: (unit.learning_path_modules || [])
                .sort((a: any, b: any) => a.order_number - b.order_number)
                .map((module: any) => ({
                  id: module.id,
                  title: module.title,
                  content_type: module.content_type,
                  content: module.content,
                  file_url: module.file_url,
                  duration: module.duration,
                  order_number: module.order_number,
                })),
              test: unit.learning_path_tests?.[0] ? {
                id: unit.learning_path_tests[0].id,
                name: unit.learning_path_tests[0].name,
                test_type: 'unit' as const,
                unit_id: unit.id,
                unit_title: unit.title,
                questions: (unit.learning_path_tests[0].learning_path_questions || [])
                  .sort((a: any, b: any) => a.order_number - b.order_number)
                  .map((q: any) => ({
                    id: q.id,
                    question_type: q.question_type,
                    question: q.question,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    points: q.points,
                    explanation: q.explanation,
                  })),
                pass_percentage: unit.learning_path_tests[0].pass_percentage,
                total_marks: unit.learning_path_tests[0].total_marks,
              } : null,
            })),
          finalTest: dbData.learning_path_tests?.find((t: any) => t.test_type === 'final') ? {
            id: dbData.learning_path_tests.find((t: any) => t.test_type === 'final').id,
            name: dbData.learning_path_tests.find((t: any) => t.test_type === 'final').name,
            test_type: 'final' as const,
            questions: (dbData.learning_path_tests.find((t: any) => t.test_type === 'final').learning_path_questions || [])
              .sort((a: any, b: any) => a.order_number - b.order_number)
              .map((q: any) => ({
                id: q.id,
                question_type: q.question_type,
                question: q.question,
                options: q.options,
                correct_answer: q.correct_answer,
                points: q.points,
                explanation: q.explanation,
              })),
            pass_percentage: dbData.learning_path_tests.find((t: any) => t.test_type === 'final').pass_percentage,
            total_marks: dbData.learning_path_tests.find((t: any) => t.test_type === 'final').total_marks,
          } : null
        };

        setLearningPath(transformedData);

        // Load user progress and resume from last module
        await loadProgress(id, transformedData);
      }
    } catch (error) {
      console.error('Error fetching learning path detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user progress from database
  const loadProgress = async (pathId: string, path: LearningPath) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        console.log('No user found, showing course introduction');
        setShowCourseIntroduction(true);
        setSelectedUnit(null);
        setSelectedModule(null);
        return;
      }

      setCurrentUserId(user.id);

      // Fetch completed modules for this learning path
      const { data: progressData, error } = await supabase
        .from('learning_path_progress')
        .select('module_id, is_completed, completed_at')
        .eq('student_id', user.id)
        .eq('learning_path_id', pathId)
        .eq('is_completed', true);

      if (error) {
        console.error('Error loading progress:', error);
        // Continue without progress data
        setShowCourseIntroduction(true);
        setSelectedUnit(null);
        setSelectedModule(null);
        return;
      }

      // Mark modules as completed
      if (progressData && progressData.length > 0) {
        const completedIds = new Set(progressData.map((p: any) => p.module_id));
        setCompletedModules(completedIds);

        // Find the last completed module and resume from the next one
        let lastCompletedModule: { unit: Unit; module: Module; index: number } | null = null;

        for (const unit of path.units) {
          for (let i = 0; i < unit.modules.length; i++) {
            const module = unit.modules[i];
            if (completedIds.has(module.id)) {
              lastCompletedModule = { unit, module, index: i };
            }
          }
        }

        // Resume from next module after last completed
        if (lastCompletedModule) {
          const { unit, index } = lastCompletedModule;
          const nextModuleIndex = index + 1;

          if (nextModuleIndex < unit.modules.length) {
            // Resume from next module in same unit
            const nextModule = unit.modules[nextModuleIndex];
            setSelectedUnit(unit);
            setSelectedModule(nextModule);
            setExpandedUnits(new Set([unit.id]));
            setShowCourseIntroduction(false);
            setSidebarOpen(false);
            return;
          } else {
            // Move to next unit's first module
            const currentUnitIndex = path.units.findIndex(u => u.id === unit.id);
            if (currentUnitIndex < path.units.length - 1) {
              const nextUnit = path.units[currentUnitIndex + 1];
              if (nextUnit.modules.length > 0) {
                setSelectedUnit(nextUnit);
                setSelectedModule(nextUnit.modules[0]);
                setExpandedUnits(new Set([nextUnit.id]));
                setShowCourseIntroduction(false);
                setSidebarOpen(false);
                return;
              }
            }
          }
        }
      }

      // No progress found or all modules completed - show introduction
      setShowCourseIntroduction(true);
      setSelectedUnit(null);
      setSelectedModule(null);
    } catch (error) {
      console.error('Error loading progress:', error);
      setShowCourseIntroduction(true);
      setSelectedUnit(null);
      setSelectedModule(null);
    }
  };

  // Save module progress to database
  const saveModuleProgress = async (moduleId: string, unitId: string) => {
    if (!currentUserId || !pathId) {
      console.error('Cannot save progress: Missing currentUserId or pathId', { currentUserId, pathId });
      throw new Error('User not authenticated or learning path not found');
    }

    try {
      setSavingProgress(true);
      console.log('💾 Saving module progress:', { moduleId, unitId, currentUserId, pathId });

      // Check if progress already exists
      const { data: existing, error: checkError } = await (supabase
        .from('learning_path_progress') as any)
        .select('id')
        .eq('student_id', currentUserId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
        console.error('Error checking existing progress:', checkError);
      }

      const now = new Date().toISOString();
      const progressData: any = {
        student_id: currentUserId,
        learning_path_id: pathId,
        module_id: moduleId,
        unit_id: unitId,
        is_completed: true,
        completed_at: now,
        updated_at: now,
      };

      let error;
      let result;
      if (existing && !checkError) {
        // Update existing record
        console.log('📝 Updating existing progress record');
        const { data: updateData, error: updateError } = await (supabase
          .from('learning_path_progress') as any)
          .update(progressData)
          .eq('student_id', currentUserId)
          .eq('module_id', moduleId)
          .select();
        error = updateError;
        result = updateData;
        if (!error) {
          console.log('✅ Progress updated successfully:', updateData);
        }
      } else {
        // Insert new record
        console.log('➕ Inserting new progress record');
        const { data: insertData, error: insertError } = await (supabase
          .from('learning_path_progress') as any)
          .insert(progressData)
          .select();
        error = insertError;
        result = insertData;
        if (!error) {
          console.log('✅ Progress saved successfully:', insertData);
        }
      }

      if (error) {
        console.error('❌ Error saving progress:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      // Update local state
      setCompletedModules(prev => new Set(prev).add(moduleId));
      console.log('✅ Module marked as completed in local state');
    } catch (error: any) {
      console.error('❌ Error saving module progress:', error);
      throw error;
    } finally {
      setSavingProgress(false);
    }
  };

  // Handle mark as complete
  const handleMarkAsComplete = async () => {
    if (!selectedModule || !selectedUnit) {
      console.error('Cannot mark as complete: Missing module or unit');
      return;
    }

    if (!currentUserId) {
      alert('Please sign in to save your progress.');
      return;
    }

    try {
      console.log('🔄 Mark as Complete button clicked');
      await saveModuleProgress(selectedModule.id, selectedUnit.id);
      console.log('✅ Module marked as complete successfully');
      // Auto-advance to next module
      handleNextModule();
    } catch (error: any) {
      console.error('❌ Error marking module as complete:', error);
      const errorMessage = error?.message || 'Failed to mark module as complete. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle next module navigation
  const handleNextModule = () => {
    if (!selectedModule || !selectedUnit || !learningPath) return;

    // Find next module in current unit
    const currentUnit = selectedUnit;
    const currentModuleIndex = currentUnit.modules.findIndex(m => m.id === selectedModule.id);
    const nextModuleIndex = currentModuleIndex + 1;

    if (nextModuleIndex < currentUnit.modules.length) {
      // Next module in same unit
      const nextModule = currentUnit.modules[nextModuleIndex];
      setSelectedModule(nextModule);
      setSelectedUnitTest(null);
      setExpandedUnits(new Set([currentUnit.id]));
      setSidebarOpen(false);
      return;
    }

    // This is the last module in the unit - check if unit has a test
    if (currentUnit.test) {
      // Navigate to unit test
      console.log('📝 Navigating to unit test');
      setSelectedUnitTest({ unitId: currentUnit.id, test: currentUnit.test });
      setSelectedModule(null);
      setExpandedUnits(new Set([currentUnit.id]));
      setSidebarOpen(false);
      return;
    }

    // No test in current unit - move to next unit
    const currentUnitIndex = learningPath.units.findIndex(u => u.id === currentUnit.id);
    if (currentUnitIndex < learningPath.units.length - 1) {
      const nextUnit = learningPath.units[currentUnitIndex + 1];
      if (nextUnit.modules.length > 0) {
        setSelectedUnit(nextUnit);
        setSelectedModule(nextUnit.modules[0]);
        setSelectedUnitTest(null);
        setExpandedUnits(new Set([nextUnit.id]));
        setSidebarOpen(false);
        return;
      }
    }

    // All modules completed - show completion message
    alert('Congratulations! You have completed all modules in this learning path.');
  };

  const toggleUnitExpansion = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const handleCourseIntroductionClick = () => {
    setShowCourseIntroduction(true);
    setSelectedUnit(null);
    setSelectedModule(null);
    setSelectedUnitTest(null);
    setSidebarOpen(false);
  };

  const handleUnitSelect = (unit: Unit) => {
    setShowCourseIntroduction(false);
    setSelectedUnit(unit);
    setSelectedUnitTest(null);
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      newSet.add(unit.id);
      return newSet;
    });
    if (unit.modules.length > 0) {
      setSelectedModule(unit.modules[0]);
    } else {
      setSelectedModule(null);
    }
  };

  const handleModuleSelect = (module: Module, unit: Unit) => {
    setShowCourseIntroduction(false);
    setSelectedModule(module);
    setSelectedUnit(unit);
    setSelectedUnitTest(null);
    setSidebarOpen(false);
  };

  const handleUnitTestSelect = (unit: Unit) => {
    if (!unit.test) return;
    setShowCourseIntroduction(false);
    setSelectedModule(null);
    setSelectedUnit(unit);
    setSelectedUnitTest({ unitId: unit.id, test: unit.test });
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTestClick = () => {
    // Show test selection modal
    setShowTestModal(true);
  };

  const getAvailableTests = (): Test[] => {
    const tests: Test[] = [];
    
    // Add unit tests
    if (learningPath?.units) {
      learningPath.units.forEach(unit => {
        if (unit.test) {
          tests.push(unit.test);
        }
      });
    }
    
    // Add final test
    if (learningPath?.finalTest) {
      tests.push(learningPath.finalTest);
    }
    
    return tests;
  };

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setShowTestModal(false);
    setShowAssessmentTaker(true);
  };

  const handleTestComplete = (score: number) => {
    setShowAssessmentTaker(false);
    setSelectedTest(null);
    // You can add logic here to save test results
    console.log('Test completed with score:', score);
  };

  const convertTestToAssessment = (test: Test) => {
    return {
      id: test.id,
      title: test.name,
      course: learningPath?.title || 'Learning Path',
      courseId: learningPath?.id || '',
      type: 'Test' as const,
      duration: '30 mins',
      questions: test.questions.length,
      status: 'upcoming' as const,
      difficulty: 'Medium' as const,
      topics: [test.test_type === 'final' ? 'Final Test' : `Unit Test`],
      attempts: 0,
      maxAttempts: 3,
      isLearningPathTest: true, // Flag to indicate this is a learning path test
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Learning Path...</p>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Not Found</h2>
          <p className="text-gray-600 mb-4">The learning path you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/student/learning-path')}>
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden" style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <div className="flex flex-col lg:flex-row h-full w-full relative">
        {/* Left Sidebar - Units List */}
        <div
          className={`fixed lg:absolute inset-y-0 left-0 z-20 w-[280px] sm:w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ 
            top: 0, 
            bottom: 0, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 0,
            flexShrink: 0
          }}
        >
          <div className="h-full flex flex-col overflow-hidden w-full">
            {/* Header */}
            <div className="flex-shrink-0 pl-3 pr-2 py-1.5 sm:py-2 border-b border-gray-200 w-full">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-900">Course Units</h2>
                  <p className="text-[10px] text-gray-500 truncate">{learningPath.title}</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 sm:p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
                  aria-label="Close sidebar"
                >
                  <i className="ri-close-line text-base sm:text-lg"></i>
                </button>
              </div>
            </div>

            {/* Units List - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden pl-2 sm:pl-3 pr-2 pb-6 w-full"
              style={{ 
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%'
              }}
            >
              <div className="space-y-1 w-full">
                {/* Course Introduction Card */}
                <div
                  className={`rounded-lg border transition-all w-full ${
                    showCourseIntroduction && !selectedUnit
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200'
                  }`}
                  style={{ width: '100%' }}
                >
                  <div className="flex items-center justify-between px-2 py-2 sm:py-2.5 w-full">
                    <button
                      onClick={handleCourseIntroductionClick}
                      className="flex-1 text-left hover:bg-gray-50 rounded-lg transition-all min-w-0"
                      style={{ width: '100%' }}
                    >
                      <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block w-full">
                        Course Introduction
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block w-full mt-0.5">
                        {learningPath.title}
                      </span>
                    </button>
                    <i className="ri-arrow-right-s-line text-gray-400 text-lg ml-2 flex-shrink-0"></i>
                  </div>
                </div>

                {/* Units */}
                {learningPath.units.map((unit) => {
                  const isExpanded = expandedUnits.has(unit.id);
                  const isSelected = selectedUnit?.id === unit.id;

                  return (
                    <div
                      key={unit.id}
                      className={`rounded-lg border transition-all w-full ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ width: '100%' }}
                    >
                      {/* Unit Header */}
                      <div className="flex items-center justify-between px-2 py-2 sm:py-2.5 w-full">
                        <button
                          onClick={() => handleUnitSelect(unit)}
                          className="flex-1 text-left hover:bg-gray-50 rounded-lg transition-all min-w-0"
                          style={{ width: '100%' }}
                        >
                          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block w-full">
                            {unit.title}
                          </span>
                        </button>
                        {unit.modules.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleUnitExpansion(unit.id, e);
                            }}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0 z-10"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            type="button"
                          >
                            <i
                              className={`ri-arrow-${
                                isExpanded ? 'down' : 'right'
                              }-s-line text-gray-400 transition-transform text-lg`}
                            ></i>
                          </button>
                        )}
                      </div>

                      {/* Modules Dropdown */}
                      {isExpanded && unit.modules && unit.modules.length > 0 && (
                        <div className="pl-2 pr-2 pb-3 space-y-1 w-full">
                          {unit.modules.map((module) => (
                            <button
                              key={module.id}
                              onClick={() => handleModuleSelect(module, unit)}
                              className={`w-full text-left px-2 py-1.5 sm:py-2 rounded transition-all text-xs sm:text-sm ${
                                selectedModule?.id === module.id && isSelected
                                  ? 'bg-blue-100 text-blue-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              style={{ width: '100%' }}
                            >
                              <div className="flex items-center justify-between w-full min-w-0">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {completedModules.has(module.id) && (
                                    <i className="ri-checkbox-circle-fill text-green-600 flex-shrink-0"></i>
                                  )}
                                  <span className="truncate flex-1 min-w-0">{module.title}</span>
                                </div>
                                <i
                                  className={`ml-2 flex-shrink-0 ${
                                    module.content_type === 'Video'
                                      ? 'ri-video-line'
                                      : module.content_type === 'PDF'
                                      ? 'ri-file-pdf-line'
                                      : module.content_type === 'Quiz'
                                      ? 'ri-questionnaire-line'
                                      : module.content_type === 'Assignment'
                                      ? 'ri-task-line'
                                      : 'ri-file-text-line'
                                  } text-xs`}
                                ></i>
                              </div>
                            </button>
                          ))}
                          
                          {/* Unit Test Item */}
                          {unit.test && (
                            <button
                              onClick={() => handleUnitTestSelect(unit)}
                              className={`w-full text-left px-2 py-1.5 sm:py-2 rounded transition-all text-xs sm:text-sm ${
                                selectedUnitTest?.unitId === unit.id && isSelected
                                  ? 'bg-blue-100 text-blue-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              style={{ width: '100%' }}
                            >
                              <div className="flex items-center justify-between w-full min-w-0">
                                <span className="truncate flex-1 min-w-0">Unit Test</span>
                                <i className="ri-questionnaire-line ml-2 flex-shrink-0 text-xs"></i>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setSidebarOpen(false)}
            style={{ top: 0 }}
          ></div>
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-hidden bg-white transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
          } w-full relative`}
          style={{ 
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {showCourseIntroduction ? (
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ height: '100%' }}>
              {/* Header - Sticky within scroll container */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <button
                      onClick={toggleSidebar}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                      <i
                        className={`ri-${
                          sidebarOpen ? 'menu-fold' : 'menu-unfold'
                        }-line text-lg sm:text-xl text-gray-700`}
                      ></i>
                    </button>
                    <div className="flex-1 min-w-0 overflow-hidden pr-2">
                      <h1 
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
                        style={{ 
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title="Course Introduction"
                      >
                        Course Introduction
                      </h1>
                      <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                        {learningPath.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Introduction Content */}
              <div className="bg-white px-6 py-4">
                <div className={`mx-auto ${sidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>
                  <div className="space-y-6">
                    {/* Thumbnail */}
                    {learningPath.thumbnail_url && (
                      <div className="w-full max-w-md h-48 bg-gray-200 rounded-lg mb-4 relative mx-auto">
                        <img
                          src={learningPath.thumbnail_url}
                          alt={learningPath.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Course Title */}
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {learningPath.title}
                      </h2>
                    </div>

                    {/* Course Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <div 
                        className="text-gray-700 leading-relaxed text-base prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(learningPath.description || 'No description available.') 
                        }}
                      />
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-bar-chart-line text-blue-600"></i>
                          <span className="text-sm font-medium text-gray-700">Difficulty Level</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-2 ${
                          learningPath.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          learningPath.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {learningPath.level}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-time-line text-blue-600"></i>
                          <span className="text-sm font-medium text-gray-700">Duration</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          {learningPath.duration} hours
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-book-open-line text-blue-600"></i>
                          <span className="text-sm font-medium text-gray-700">Total Units</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          {learningPath.total_units}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-file-list-3-line text-blue-600"></i>
                          <span className="text-sm font-medium text-gray-700">Total Modules</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          {learningPath.total_modules}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedUnit ? (
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ height: '100%' }}>
              {/* Header - Sticky within scroll container */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <button
                      onClick={toggleSidebar}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                      <i
                        className={`ri-${
                          sidebarOpen ? 'menu-fold' : 'menu-unfold'
                        }-line text-lg sm:text-xl text-gray-700`}
                      ></i>
                    </button>
                    <div className="flex-1 min-w-0 overflow-hidden pr-2">
                      <h1 
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
                        style={{ 
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={selectedUnitTest ? selectedUnitTest.test.name : selectedModule ? selectedModule.title : learningPath.title}
                      >
                        {selectedUnitTest ? selectedUnitTest.test.name : selectedModule ? selectedModule.title : learningPath.title}
                      </h1>
                      {selectedUnitTest ? (
                        <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                          Unit Test - {selectedUnit?.title}
                        </p>
                      ) : selectedModule ? (
                        <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                          {selectedUnit.description || learningPath.description}
                        </p>
                      ) : selectedUnit.description ? (
                        <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                          {selectedUnit.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedModule && (
                      <Button
                        onClick={handleMarkAsComplete}
                        disabled={savingProgress || completedModules.has(selectedModule.id)}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm flex-shrink-0 ${
                          completedModules.has(selectedModule.id)
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {completedModules.has(selectedModule.id) ? (
                          <>
                            <i className="ri-check-line text-sm sm:text-base"></i>
                            <span className="hidden sm:inline">Completed</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-check-line text-sm sm:text-base"></i>
                            <span className="hidden sm:inline">Mark as Complete</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Module Type Badge - Below title when module is selected */}
                {selectedModule && (
                  <div className="px-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedModule.content_type === 'Video'
                            ? 'bg-red-100 text-red-700'
                            : selectedModule.content_type === 'PDF'
                            ? 'bg-orange-100 text-orange-700'
                            : selectedModule.content_type === 'Quiz'
                            ? 'bg-purple-100 text-purple-700'
                            : selectedModule.content_type === 'Assignment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedModule.content_type}
                      </span>
                      {selectedModule.duration > 0 && (
                        <span className="text-xs sm:text-sm text-gray-500">
                          {selectedModule.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Area - Scrollable */}
              <div className="bg-white px-6 py-4">
                {selectedUnitTest ? (
                  <div>
                    <div className={`mx-auto ${sidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>
                      {/* Unit Description - Show if unit has description */}
                      {selectedUnit?.description && (
                        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Unit Description</h3>
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(selectedUnit.description) 
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Unit Test Content */}
                      <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedUnitTest.test.name}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <i className="ri-file-list-3-line"></i>
                              {selectedUnitTest.test.questions.length} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-star-line"></i>
                              {selectedUnitTest.test.total_marks} Marks
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-checkbox-circle-line"></i>
                              Pass: {selectedUnitTest.test.pass_percentage}%
                            </span>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedTest(selectedUnitTest.test);
                              setShowAssessmentTaker(true);
                            }}
                            className="w-full sm:w-auto"
                          >
                            <i className="ri-play-line mr-2"></i>
                            Start Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedModule ? (
                  <div>
                    <div className={`mx-auto ${sidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>
                      {/* Unit Description - Show if unit has description */}
                      {selectedUnit?.description && (
                        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Unit Description</h3>
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(selectedUnit.description) 
                            }}
                          />
                        </div>
                      )}

                      {/* Module Content */}
                      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700">
                        {selectedModule.content_type === 'Video' && selectedModule.file_url ? (
                          <div className="mb-6">
                            <video
                              controls
                              className="w-full rounded-lg"
                              src={selectedModule.file_url}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : selectedModule.content_type === 'PDF' && selectedModule.file_url ? (
                          <div className="mb-6">
                            <iframe
                              src={selectedModule.file_url}
                              className="w-full h-[600px] rounded-lg border"
                              title={selectedModule.title}
                            ></iframe>
                          </div>
                        ) : selectedModule.content ? (
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm sm:prose-base max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(selectedModule.content) 
                            }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">
                            Content will be displayed here. This module is currently being prepared.
                          </p>
                        )}
                      </div>

                      {/* Next Button - At the end of module content */}
                      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                        <Button
                          onClick={async () => {
                            // Mark as complete if not already completed
                            if (!completedModules.has(selectedModule.id)) {
                              try {
                                await saveModuleProgress(selectedModule.id, selectedUnit!.id);
                              } catch (error) {
                                console.error('Error saving progress:', error);
                              }
                            }
                            // Navigate to next module
                            handleNextModule();
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                          <span>Next</span>
                          <i className="ri-arrow-right-line"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full px-4">
                    <div className="text-center">
                      <i className="ri-file-text-line text-4xl sm:text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Select a module from the sidebar to view content
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <i className="ri-book-open-line text-4xl sm:text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 text-sm sm:text-base">
                  Select a unit to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Selection Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Available Tests"
        size="lg"
      >
        <div className="space-y-4">
          {getAvailableTests().length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-file-list-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No tests available for this learning path yet.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-4">
                Select a test to start. Make sure you've completed the relevant units before taking the test.
              </p>
              <div className="space-y-3">
                {getAvailableTests().map((test) => (
                  <div
                    key={test.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{test.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            test.test_type === 'final'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {test.test_type === 'final' ? 'Final Test' : `Unit ${learningPath?.units.find(u => u.test?.id === test.id)?.order_number || ''} Test`}
                          </span>
                        </div>
                        {test.unit_title && (
                          <p className="text-sm text-gray-600 mb-2">Unit: {test.unit_title}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <i className="ri-file-list-3-line"></i>
                            {test.questions.length} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-star-line"></i>
                            {test.total_marks} Marks
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-checkbox-circle-line"></i>
                            Pass: {test.pass_percentage}%
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartTest(test)}
                        className="ml-4"
                      >
                        <i className="ri-play-line mr-2"></i>
                        Start Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Test Taker - Using AssessmentTaker with converted format */}
      {selectedTest && (
        <AssessmentTaker
          isOpen={showAssessmentTaker}
          onClose={() => {
            setShowAssessmentTaker(false);
            setSelectedTest(null);
          }}
          assessment={convertTestToAssessment(selectedTest)}
          onComplete={handleTestComplete}
        />
      )}
    </div>
  );
};

export default StudentLearningPathDetail;

