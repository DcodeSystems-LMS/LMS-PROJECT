import React, { useState, useEffect } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import AssessmentTaker from './components/AssessmentTaker';
import CodingAssessmentPage from './components/CodingAssessmentPage';
import AssessmentResults from './components/AssessmentResults';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { checkAssessmentQuestionTypes } from './utils/assessmentHelpers';

interface Assessment {
  id: string;
  title: string;
  course: string;
  courseId: string;
  type: 'Quiz' | 'Test' | 'Practice';
  duration: string;
  questions: number;
  dueDate?: string;
  status: 'upcoming' | 'completed' | 'in-progress';
  score?: string;
  maxScore?: string;
  feedback?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  attempts: number;
  maxAttempts: number;
}

interface Course {
  id: string;
  title: string;
  assessmentCount: number;
}

const StudentAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [filter, setFilter] = useState('all');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showAssessmentTaker, setShowAssessmentTaker] = useState(false);
  const [showCodingAssessmentPage, setShowCodingAssessmentPage] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResultsAssessment, setSelectedResultsAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // Get current user
        const user = await authService.getCurrentUser();
        if (!user) {
          console.error('User not authenticated');
          setLoading(false);
          return;
        }

        console.log('🔍 Fetching assessments for student:', user.id);
        
        // Get assessments for enrolled courses
        const assessmentsData = await DataService.getStudentAssessments(user.id);
        const resultsData = await DataService.getAssessmentResults();
        
        // Get student's enrolled courses
        const enrollments = await DataService.getEnrollments(user.id);
        const studentCourses: Course[] = [
          { id: 'all', title: 'All Courses', assessmentCount: 0 },
          ...enrollments.map(enrollment => ({
            id: enrollment.course_id,
            title: enrollment.course?.title || 'Unknown Course',
            assessmentCount: assessmentsData.filter(a => a.course_id === enrollment.course_id).length
          }))
        ];
        setCourses(studentCourses);
        
        console.log('📚 Student assessments data:', assessmentsData);
        console.log('📊 Student results data:', resultsData);
        console.log('🎓 Student courses:', studentCourses);
        
        // Transform assessments to match the expected format with real-time data
        const transformedAssessments: Assessment[] = await Promise.all(assessmentsData.map(async (assessment) => {
          const result = resultsData.find(r => r.assessment_id === assessment.id);
          
          // Get detailed assessment information
          const assessmentDetails = await DataService.getAssessmentDetails(assessment.id, user.id);
          
          if (!assessmentDetails) {
            console.warn(`⚠️ Could not fetch details for assessment ${assessment.id}`);
            // Fallback to basic data
            return {
              id: assessment.id,
              title: assessment.title,
              course: assessment.course?.title || 'General Assessment',
              courseId: assessment.course_id || '1',
              type: 'Quiz',
              duration: '30 mins',
              questions: 0,
              status: result ? 'completed' : 'upcoming',
              difficulty: 'Easy',
              topics: ['General Topics'],
              attempts: 0,
              maxAttempts: 3,
              score: result?.score.toString(),
              maxScore: '100',
              feedback: 'Good work!'
            };
          }
          
          console.log(`📊 Assessment ${assessment.title} details:`, {
            questions: assessmentDetails.questionCount,
            attempts: assessmentDetails.attempts,
            maxAttempts: assessmentDetails.maxAttempts,
            topics: assessmentDetails.topics,
            feedback: assessmentDetails.feedback
          });
          
          return {
            id: assessment.id,
            title: assessment.title,
            course: assessment.course?.title || 'General Assessment',
            courseId: assessment.course_id || '1',
            type: assessmentDetails.type || 'Quiz',
            duration: assessmentDetails.duration,
            questions: assessmentDetails.questionCount,
            status: result ? 'completed' : 'upcoming',
            difficulty: assessmentDetails.difficulty,
            topics: assessmentDetails.topics,
            attempts: assessmentDetails.attempts,
            maxAttempts: assessmentDetails.maxAttempts,
            dueDate: undefined, // Would need additional fields in schema
            score: result?.score.toString(),
            maxScore: '100',
            feedback: assessmentDetails.feedback
          };
        }));
        
        console.log('✅ Transformed assessments:', transformedAssessments);
        setAssessments(transformedAssessments);
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);




  const filteredAssessments = assessments.filter((assessment) => {
    const courseMatch = selectedCourse === 'all' || assessment.courseId === selectedCourse;
    const statusMatch = filter === 'all' || assessment.status === filter;
    return courseMatch && statusMatch;
  });

  const stats = [
    { 
      label: 'Total Assessments', 
      value: assessments.length.toString(), 
      icon: 'ri-file-list-line', 
      color: 'blue' 
    },
    { 
      label: 'Completed', 
      value: assessments.filter(a => a.status === 'completed').length.toString(), 
      icon: 'ri-check-line', 
      color: 'green' 
    },
    { 
      label: 'In Progress', 
      value: assessments.filter(a => a.status === 'in-progress').length.toString(), 
      icon: 'ri-play-line', 
      color: 'orange' 
    },
    { 
      label: 'Average Score', 
      value: '89%', 
      icon: 'ri-star-line', 
      color: 'purple' 
    }
  ];

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShowAssessmentModal(true);
  };

  const handleConfirmStart = async () => {
    setShowAssessmentModal(false);
    
    if (!selectedAssessment) return;
    
    // Check if all questions are coding challenges
    const { isAllCoding } = await checkAssessmentQuestionTypes(selectedAssessment.id);
    
    if (isAllCoding) {
      // Use full-page coding assessment
      setShowCodingAssessmentPage(true);
    } else {
      // Use modal-based assessment taker
      setShowAssessmentTaker(true);
    }
  };

  const handleAssessmentComplete = (score: number, answers: Record<string, string>) => {
    // Update the assessment with the new score and mark as completed
    setAssessments(prev => prev.map(assessment => 
      assessment.id === selectedAssessment?.id 
        ? { 
            ...assessment, 
            status: 'completed' as const,
            score: score.toString(),
            maxScore: '100',
            attempts: assessment.attempts + 1,
            feedback: score >= 90 ? 'Excellent work! You have a strong understanding of the concepts.' :
                     score >= 70 ? 'Good job! Review the areas you missed for better understanding.' :
                     'Keep practicing! Focus on the fundamental concepts and try again.'
          }
        : assessment
    ));
    
    setShowAssessmentTaker(false);
    setShowCodingAssessmentPage(false);
    setSelectedAssessment(null);
  };

  const handleViewResults = (assessment: Assessment) => {
    setSelectedResultsAssessment(assessment);
    setShowResultsModal(true);
  };

  const handleRetakeAssessment = async () => {
    setShowResultsModal(false);
    if (selectedResultsAssessment) {
      const assessmentToRetake = {
        ...selectedResultsAssessment,
        status: 'upcoming' as const
      };
      setSelectedAssessment(assessmentToRetake);
      
      // Check if all questions are coding challenges
      const { isAllCoding } = await checkAssessmentQuestionTypes(assessmentToRetake.id);
      
      if (isAllCoding) {
        setShowCodingAssessmentPage(true);
      } else {
        setShowAssessmentTaker(true);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Quiz': 'bg-blue-100 text-blue-800',
      'Test': 'bg-purple-100 text-purple-800',
      'Practice': 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header - Mobile Optimized */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Assessments</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Practice tests, quizzes, and track your progress</p>
      </div>

      {/* Compact Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Your Assessment Progress</h2>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <i className="ri-stack-fill text-white text-sm"></i>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">{assessments.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-200">
                <i className="ri-trophy-fill text-white text-sm"></i>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">{assessments.filter(a => a.status === 'completed').length}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-200">
                <i className="ri-rocket-2-fill text-white text-sm"></i>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">{assessments.filter(a => a.status === 'in-progress').length}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-fuchsia-200">
                <i className="ri-fire-fill text-white text-sm"></i>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900">
                  {assessments.filter(a => a.status === 'completed' && a.score).length > 0 
                    ? Math.round(assessments.filter(a => a.status === 'completed' && a.score).reduce((sum, a) => sum + parseInt(a.score || '0'), 0) / assessments.filter(a => a.status === 'completed' && a.score).length)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Filter - Dropdown */}
      {courses.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label htmlFor="course-select" className="text-sm sm:text-base font-medium text-gray-700">
            Select Course:
          </label>
          <div className="relative flex-1 sm:max-w-xs">
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}{course.id !== 'all' ? ` (${course.assessmentCount} assessments)` : ''}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="ri-arrow-down-s-line text-gray-500"></i>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs - Mobile Optimized */}
      <div className="flex overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'in-progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assessments Grid - Small Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredAssessments.map((assessment) => (
          <div 
            key={assessment.id} 
            className={`bg-white rounded-xl border hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden ${
              assessment.status === 'completed' 
                ? 'border-t-4 border-t-emerald-500' 
                : assessment.status === 'in-progress'
                ? 'border-t-4 border-t-amber-500'
                : 'border-t-4 border-t-indigo-500'
            }`}
          >
            {/* Card Header */}
            <div className="p-3 pb-2">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate" title={assessment.title}>
                    {assessment.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 truncate">{assessment.course}</p>
                </div>
                {/* Score Badge for Completed */}
                {assessment.status === 'completed' && assessment.score && (
                  <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    parseInt(assessment.score) >= 80 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : parseInt(assessment.score) >= 60 
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <i className="ri-trophy-fill text-[10px]"></i>
                    {assessment.score}%
                  </div>
                )}
              </div>
              
              {/* Tags Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${getTypeColor(assessment.type)}`}>
                  {assessment.type}
                </span>
                <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${getDifficultyColor(assessment.difficulty)}`}>
                  {assessment.difficulty}
                </span>
                <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${
                  assessment.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : assessment.status === 'in-progress'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {assessment.status === 'completed' ? '✓ Done' : assessment.status === 'in-progress' ? '⏳ In Progress' : '📋 Pending'}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-[10px] text-gray-600">
                <div className="flex items-center gap-0.5" title="Duration">
                  <i className="ri-time-line text-gray-400"></i>
                  <span>{assessment.duration}</span>
                </div>
                <div className="flex items-center gap-0.5" title="Questions">
                  <i className="ri-file-list-3-line text-gray-400"></i>
                  <span>{assessment.questions}Q</span>
                </div>
                <div className="flex items-center gap-0.5" title="Attempts">
                  <i className="ri-refresh-line text-gray-400"></i>
                  <span>{assessment.attempts}/{assessment.maxAttempts}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-2 pt-0 bg-gray-50">
              {assessment.status === 'upcoming' && (
                <button 
                  onClick={() => handleStartAssessment(assessment)} 
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <i className="ri-play-fill"></i>
                  Start Assessment
                </button>
              )}
              {assessment.status === 'in-progress' && (
                <button 
                  onClick={() => handleStartAssessment(assessment)}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <i className="ri-arrow-right-line"></i>
                  Continue
                </button>
              )}
              {assessment.status === 'completed' && (
                <button 
                  onClick={() => handleViewResults(assessment)}
                  className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  <i className="ri-bar-chart-box-line"></i>
                  View Results
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAssessments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600 mb-4">
            {assessments.length === 0 
              ? 'You are not enrolled in any courses with assessments yet. Contact your mentor to get enrolled in courses.'
              : selectedCourse === 'all' 
                ? 'No assessments match the current filter'
                : 'No assessments available for the selected course'
            }
          </p>
          {assessments.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Need help?</p>
                  <p>Contact your mentor to enroll you in courses with assessments.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assessment Start Confirmation Modal */}
      <Modal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false);
          setSelectedAssessment(null);
        }}
        title="Start Assessment"
      >
        {selectedAssessment && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedAssessment.title}</h3>
              <p className="text-gray-600 mb-3">{selectedAssessment.course}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-600">{selectedAssessment.duration}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Questions:</span>
                  <span className="ml-2 text-gray-600">{selectedAssessment.questions}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Difficulty:</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(selectedAssessment.difficulty)}`}>
                    {selectedAssessment.difficulty}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Attempts left:</span>
                  <span className="ml-2 text-gray-600">{selectedAssessment.maxAttempts - selectedAssessment.attempts}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="ri-alert-line text-yellow-600 mr-2 mt-0.5"></i>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You have {selectedAssessment.duration} to complete this assessment</li>
                    <li>Make sure you have a stable internet connection</li>
                    <li>Once started, the timer cannot be paused</li>
                    <li>You can save and continue later for practice assessments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssessmentModal(false);
                  setSelectedAssessment(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmStart}>
                <i className="ri-play-line mr-2"></i>
                Start Assessment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assessment Taker (Modal - for mixed question types) */}
      <AssessmentTaker
        isOpen={showAssessmentTaker}
        onClose={() => {
          setShowAssessmentTaker(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onComplete={handleAssessmentComplete}
      />

      {/* Coding Assessment Page (Full Page - for coding-only assessments) */}
      {showCodingAssessmentPage && selectedAssessment && (
        <CodingAssessmentPage
          assessmentId={selectedAssessment.id}
          assessmentTitle={selectedAssessment.title}
          duration={selectedAssessment.duration}
          onComplete={handleAssessmentComplete}
          onClose={() => {
            setShowCodingAssessmentPage(false);
            setSelectedAssessment(null);
          }}
        />
      )}

      {/* Assessment Results */}
      <AssessmentResults
        isOpen={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          setSelectedResultsAssessment(null);
        }}
        assessment={selectedResultsAssessment}
        onRetake={handleRetakeAssessment}
      />
    </div>
  );
};

export default StudentAssessments;
