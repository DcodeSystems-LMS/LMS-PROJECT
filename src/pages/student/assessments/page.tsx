import React, { useState, useEffect } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import AssessmentTaker from './components/AssessmentTaker';
import AssessmentResults from './components/AssessmentResults';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';

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

  const handleConfirmStart = () => {
    setShowAssessmentModal(false);
    setShowAssessmentTaker(true);
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
    setSelectedAssessment(null);
  };

  const handleViewResults = (assessment: Assessment) => {
    setSelectedResultsAssessment(assessment);
    setShowResultsModal(true);
  };

  const handleRetakeAssessment = () => {
    setShowResultsModal(false);
    if (selectedResultsAssessment) {
      const assessmentToRetake = {
        ...selectedResultsAssessment,
        status: 'upcoming' as const
      };
      setSelectedAssessment(assessmentToRetake);
      setShowAssessmentTaker(true);
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

      {/* Clean Stats Section - Modern Design */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Your Assessment Progress</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-blue-200 transition-shadow">
                <i className="ri-file-list-line text-white text-lg sm:text-xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Assessments</div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-green-200 transition-shadow">
                <i className="ri-checkbox-circle-line text-white text-lg sm:text-xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-orange-200 transition-shadow">
                <i className="ri-play-circle-line text-white text-lg sm:text-xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-purple-200 transition-shadow">
                <i className="ri-star-line text-white text-lg sm:text-xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">89%</div>
              <div className="text-xs sm:text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Filter - Mobile Optimized */}
      {courses.length > 1 && (
        <Card className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Course</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                  selectedCourse === course.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">{course.title}</h4>
                {course.id !== 'all' && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{course.assessmentCount} assessments</p>
                )}
              </button>
            ))}
          </div>
        </Card>
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

      {/* Assessments List - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{assessment.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 truncate">{assessment.course}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(assessment.type)}`}>
                      {assessment.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(assessment.difficulty)}`}>
                      {assessment.difficulty}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="ri-time-line mr-2 text-gray-400"></i>
                    {assessment.duration}
                  </div>
                  <div className="flex items-center">
                    <i className="ri-question-mark mr-2 text-gray-400"></i>
                    {assessment.questions} questions
                  </div>
                  <div className="flex items-center">
                    <i className="ri-refresh-line mr-2 text-gray-400"></i>
                    {assessment.attempts}/{assessment.maxAttempts} attempts
                  </div>
                  {assessment.dueDate && (
                    <div className="flex items-center">
                      <i className="ri-calendar-line mr-2 text-gray-400"></i>
                      <span className="truncate">Due: {assessment.dueDate}</span>
                    </div>
                  )}
                </div>

                {assessment.topics.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Topics covered:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {assessment.topics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {String(topic || '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.status === 'completed' && assessment.score && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3 sm:mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-green-800">Score: </span>
                        <span className="text-base sm:text-lg font-bold text-green-600">{assessment.score}%</span>
                      </div>
                      <i className="ri-trophy-line text-xl sm:text-2xl text-green-600"></i>
                    </div>
                  </div>
                )}

                {assessment.feedback && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 sm:mb-4">
                    <div className="flex items-start">
                      <i className="ri-chat-3-line text-blue-600 mr-2 mt-0.5 text-sm sm:text-base"></i>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Instructor Feedback</div>
                        <div className="text-xs sm:text-sm text-blue-800">{assessment.feedback}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                {assessment.status === 'upcoming' && (
                  <Button onClick={() => handleStartAssessment(assessment)} className="w-full sm:w-auto">
                    <i className="ri-play-line mr-2"></i>
                    Start {assessment.type}
                  </Button>
                )}
                {assessment.status === 'in-progress' && (
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                    onClick={() => handleStartAssessment(assessment)}
                  >
                    <i className="ri-play-line mr-2"></i>
                    Continue
                  </Button>
                )}
                {assessment.status === 'completed' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleViewResults(assessment)}
                    className="w-full sm:w-auto"
                  >
                    <i className="ri-eye-line mr-2"></i>
                    View Results
                  </Button>
                )}
                
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-center ${
                  assessment.status === 'upcoming' ? 'bg-gray-100 text-gray-800' :
                  assessment.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {assessment.status === 'upcoming' ? 'Ready' :
                   assessment.status === 'in-progress' ? 'In Progress' : 'Completed'}
                </span>
              </div>
            </div>
          </Card>
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

      {/* Assessment Taker */}
      <AssessmentTaker
        isOpen={showAssessmentTaker}
        onClose={() => {
          setShowAssessmentTaker(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onComplete={handleAssessmentComplete}
      />

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
