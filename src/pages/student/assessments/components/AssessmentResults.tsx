import React, { useState, useEffect } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';
import DataService from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'file-upload' | 'fill-in-blanks';
  options?: string[];
  correctAnswer: string;
  correctAnswers?: string[];
  explanation?: string;
  points: number;
  userAnswer?: string | string[];
  isCorrect?: boolean;
}

interface AssessmentResult {
  id: string;
  title: string;
  course: string;
  type: string;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  duration: string;
  completedAt: string;
  timeSpent: string;
  questions: Question[];
  feedback?: string;
  recommendations?: string[];
}

interface AssessmentResultsProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: string;
    title: string;
    course: string;
    type: string;
    score?: string;
  } | null;
  onRetake?: () => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  isOpen,
  onClose,
  assessment,
  onRetake
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'feedback'>('overview');
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real assessment results from database
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (!assessment?.id || !isOpen) return;

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching assessment results for:', assessment.id);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch assessment details with real-time data
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select(`
            *,
            course:courses(*),
            instructor:profiles!instructor_id(*)
          `)
          .eq('id', assessment.id)
          .single();

        if (assessmentError) {
          throw new Error(`Failed to fetch assessment: ${assessmentError.message}`);
        }

        // Fetch the latest assessment attempt for this user
        const { data: attemptData, error: attemptError } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('assessment_id', assessment.id)
          .eq('student_id', user.id)
          .order('started_at', { ascending: false })
          .limit(1)
          .single();

        if (attemptError && attemptError.code !== 'PGRST116') {
          console.log('⚠️ No attempt data found, using fallback');
        }

        // Fetch assessment results for this user
        const { data: resultData, error: resultError } = await supabase
          .from('assessment_results')
          .select('*')
          .eq('assessment_id', assessment.id)
          .eq('student_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (resultError && resultError.code !== 'PGRST116') {
          console.log('⚠️ No result data found, using fallback');
        }

        // Fetch questions for this assessment
        const questionsData = await DataService.getAssessmentQuestions(assessment.id);
        
        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found for this assessment');
        }

        // Parse user answers from attempt or result data
        let userAnswers = {};
        if (attemptData?.answers) {
          userAnswers = typeof attemptData.answers === 'string' ? JSON.parse(attemptData.answers) : attemptData.answers;
        } else if (resultData?.answers) {
          userAnswers = typeof resultData.answers === 'string' ? JSON.parse(resultData.answers) : resultData.answers;
        }
        
        console.log('🔍 Parsed user answers:', userAnswers);
        
        // Transform questions with user answers and correctness
        const questionsWithAnswers = questionsData.map((q: any) => {
          const userAnswer = userAnswers[q.id];
          const questionType = q.question_type || q.type;
          let options = [];
          
          // Handle options parsing
          if (q.options) {
            if (typeof q.options === 'string') {
              try {
                options = JSON.parse(q.options);
              } catch (e) {
                options = [];
              }
            } else if (Array.isArray(q.options)) {
              options = q.options;
            }
          }

          // Handle different question types
          if (questionType === 'true-false' || questionType === 'true_false') {
            options = ['True', 'False'];
          }

          // Determine if answer is correct
          let isCorrect = false;
          if (userAnswer) {
            console.log('🔍 Comparing answers:', {
              questionId: q.id,
              questionText: q.question_text,
              userAnswer: userAnswer,
              correctAnswer: q.correct_answer,
              questionType: questionType,
              userAnswerType: typeof userAnswer,
              correctAnswerType: typeof q.correct_answer
            });
            
            // Handle different question types
            if (questionType === 'multiple-select' || questionType === 'multiple_select') {
              // For multiple-select, handle array comparison
              const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
              
              // Get correct answer indices and convert to option text
              let correctAnswers = [];
              let correctIndices = [];
              
              // Try to get correct answers from different possible sources
              if (q.correct_answers && Array.isArray(q.correct_answers) && q.correct_answers.length > 0) {
                correctIndices = q.correct_answers;
                correctAnswers = correctIndices.map(index => options[parseInt(index)]).filter(Boolean);
              } else if (q.correct_answer) {
                // If correctAnswer is a comma-separated string of indices
                const indices = q.correct_answer.split(',').map(i => i.trim()).filter(i => i !== '');
                correctIndices = indices;
                correctAnswers = indices.map(index => options[parseInt(index)]).filter(Boolean);
              }
              
              // Check if all correct answers are selected and no incorrect ones
              const allCorrectSelected = correctAnswers.length > 0 && correctAnswers.every(correct => userAnswers.includes(correct));
              const noIncorrectSelected = userAnswers.every(user => correctAnswers.includes(user));
              isCorrect = allCorrectSelected && noIncorrectSelected;
              
              console.log('🔍 Multiple-select comparison:', {
                userAnswers,
                correctAnswers,
                correctIndices,
                allCorrectSelected,
                noIncorrectSelected,
                isCorrect
              });
            } else if (questionType === 'short-answer' || questionType === 'short_answer') {
              // For short answers, check if user answer contains the correct answer or vice versa
              const normalizedUserAnswer = String(userAnswer).trim().toLowerCase();
              const normalizedCorrectAnswer = String(q.correct_answer || '').trim().toLowerCase();
              
              const containsMatch = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                                   normalizedCorrectAnswer.includes(normalizedUserAnswer);
              
              // Check for partial word matches (at least 50% of words match)
              const userWords = normalizedUserAnswer.split(/\s+/);
              const correctWords = normalizedCorrectAnswer.split(/\s+/);
              const matchingWords = userWords.filter(word => correctWords.includes(word));
              const wordMatchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;
              
              isCorrect = containsMatch || wordMatchRatio >= 0.5;
            } else {
              // For multiple choice and true-false, handle index-based correct answers
              const userAnswerText = String(userAnswer || '').trim().toLowerCase();
              
              // Check if correctAnswer is an index (number as string) or text
              const correctAnswerIndex = parseInt(q.correct_answer || '');
              const correctAnswerText = !isNaN(correctAnswerIndex) && options?.[correctAnswerIndex] 
                ? options[correctAnswerIndex].toLowerCase()
                : String(q.correct_answer || '').trim().toLowerCase();
              
              isCorrect = userAnswerText === correctAnswerText;
              
              console.log('🔍 Single answer comparison:', {
                userAnswerText,
                correctAnswerText,
                correctAnswerIndex,
                isIndexBased: !isNaN(correctAnswerIndex),
                isCorrect
              });
            }
          } else {
            console.log('❌ No user answer provided for question:', q.id);
          }

          return {
            id: q.id,
            question: q.question_text || q.question,
            type: questionType,
            options: options,
            correctAnswer: q.correct_answer,
            userAnswer: userAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            isCorrect: isCorrect
          };
        });

        // Calculate score and statistics
        const totalPoints = questionsWithAnswers.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = questionsWithAnswers.reduce((sum, q) => sum + (q.isCorrect ? q.points : 0), 0);
        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        // Calculate time spent from attempt data
        let timeSpent = 'Unknown';
        if (attemptData?.time_spent) {
          const minutes = Math.floor(attemptData.time_spent / 60);
          const seconds = attemptData.time_spent % 60;
          timeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else if (attemptData?.started_at && attemptData?.completed_at) {
          const startTime = new Date(attemptData.started_at);
          const endTime = new Date(attemptData.completed_at);
          const diffMs = endTime.getTime() - startTime.getTime();
          const diffMinutes = Math.floor(diffMs / 60000);
          const diffSeconds = Math.floor((diffMs % 60000) / 1000);
          timeSpent = `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`;
        }

        // Create results object with real-time data
        const assessmentResult: AssessmentResult = {
          id: assessment.id,
          title: assessmentData.title,
          course: assessmentData.course?.title || 'General Assessment',
          type: assessmentData.type || 'Quiz',
          score: resultData?.score || score,
          totalPoints: totalPoints,
          earnedPoints: earnedPoints,
          duration: assessmentData.time_limit_minutes ? `${assessmentData.time_limit_minutes} mins` : 'No limit',
          completedAt: resultData?.completed_at || attemptData?.completed_at || new Date().toISOString(),
          timeSpent: timeSpent,
          questions: questionsWithAnswers,
          feedback: resultData?.feedback || (score >= 90 ? 'Excellent work! You have a strong understanding of the concepts.' :
                   score >= 70 ? 'Good job! Review the areas you missed for better understanding.' :
                   'Keep practicing! Focus on the fundamental concepts and try again.'),
          recommendations: score < 70 ? [
            'Review the fundamental concepts',
            'Practice with similar questions',
            'Focus on areas where you made mistakes'
          ] : []
        };

        console.log('✅ Assessment results fetched successfully:', assessmentResult);
        setResults(assessmentResult);

      } catch (err) {
        console.error('❌ Error fetching assessment results:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assessment results');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [assessment?.id, isOpen]);

  // Mock detailed results (fallback)
  const mockResults: AssessmentResult = {
    id: assessment?.id || '1',
    title: assessment?.title || 'React Hooks and State Management',
    course: assessment?.course || 'Advanced React Development',
    type: assessment?.type || 'Practice',
    score: parseInt(assessment?.score || '87'),
    totalPoints: 17,
    earnedPoints: 15,
    duration: '45 mins',
    completedAt: '2024-01-20 14:30',
    timeSpent: '38 mins',
    questions: [
      {
        id: '1',
        question: 'What is the primary purpose of React Hooks?',
        type: 'multiple-choice',
        options: [
          'To replace class components entirely',
          'To allow state and lifecycle features in function components',
          'To improve performance of React applications',
          'To handle routing in React applications'
        ],
        correctAnswer: 'To allow state and lifecycle features in function components',
        userAnswer: 'To allow state and lifecycle features in function components',
        explanation: 'React Hooks were introduced to allow function components to use state and other React features that were previously only available in class components.',
        points: 4,
        isCorrect: true
      },
      {
        id: '2',
        question: 'Which hook is used for side effects in React?',
        type: 'multiple-choice',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 'useEffect',
        userAnswer: 'useEffect',
        explanation: 'useEffect is used to perform side effects in function components, such as data fetching, subscriptions, or manually changing the DOM.',
        points: 3,
        isCorrect: true
      },
      {
        id: '3',
        question: 'React components must return a single root element.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        userAnswer: 'True',
        explanation: 'With React Fragments or array returns, components can return multiple elements without a single root element.',
        points: 2,
        isCorrect: false
      },
      {
        id: '4',
        question: 'What does the dependency array in useEffect control?',
        type: 'short-answer',
        correctAnswer: 'when the effect runs',
        userAnswer: 'when the effect executes',
        explanation: 'The dependency array controls when the useEffect hook runs. If empty, it runs once after mount. If it contains values, it runs when those values change.',
        points: 5,
        isCorrect: true
      },
      {
        id: '5',
        question: 'Which of the following is NOT a valid way to create a React component?',
        type: 'multiple-choice',
        options: [
          'Function declaration',
          'Arrow function',
          'Class component',
          'Object literal'
        ],
        correctAnswer: 'Object literal',
        userAnswer: 'Class component',
        explanation: 'React components must be either functions or classes. Object literals cannot be used to create React components.',
        points: 3,
        isCorrect: false
      }
    ],
    feedback: 'Great understanding of React Hooks! Focus more on performance optimization patterns and component architecture.',
    recommendations: [
      'Review React Fragments and multiple element returns',
      'Practice with more complex useEffect scenarios',
      'Study component creation patterns and best practices'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Use real results if available, otherwise use mock data as fallback
  const displayResults = results || mockResults;
  const correctAnswers = displayResults.questions.filter(q => q.isCorrect).length;
  const incorrectAnswers = displayResults.questions.length - correctAnswers;

  if (!assessment) return null;

  // Show loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Assessment Results" size="xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <SimpleDCODESpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading assessment results...</p>
          </div>
        </div>
      </Modal>
    );
  }

  // Show error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Assessment Results" size="xl">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <i className="ri-error-warning-line text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Results</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onClose} variant="outline">
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Assessments
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assessment Results"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center pb-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{displayResults.title}</h2>
          <p className="text-gray-600 mb-4">{displayResults.course}</p>
          
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(displayResults.score)} mb-4`}>
            <span className={`text-3xl font-bold ${getScoreColor(displayResults.score)}`}>
              {displayResults.score}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-900">{displayResults.earnedPoints}/{displayResults.totalPoints}</div>
              <div className="text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{correctAnswers}/{displayResults.questions.length}</div>
              <div className="text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{displayResults.timeSpent}</div>
              <div className="text-gray-600">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{displayResults.completedAt.split(' ')[0]}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
            { key: 'questions', label: 'Questions', icon: 'ri-question-line' },
            { key: 'feedback', label: 'Feedback', icon: 'ri-chat-3-line' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Chart */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Correct Answers</span>
                      <span className="text-sm font-medium text-green-600">{correctAnswers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(correctAnswers / displayResults.questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Incorrect Answers</span>
                      <span className="text-sm font-medium text-red-600">{incorrectAnswers}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(incorrectAnswers / displayResults.questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Types Breakdown - Only show types that were actually included */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Type Performance</h3>
                <div className="space-y-4">
                  {(() => {
                    // Get unique question types that were actually included in the assessment
                    const includedTypes = [...new Set(displayResults.questions.map(q => q.type))];
                    
                    // Define question type labels and icons
                    const typeLabels = {
                      'multiple-choice': { label: 'Multiple Choice', icon: 'ri-checkbox-line', color: 'bg-blue-500' },
                      'multiple-select': { label: 'Multiple Select', icon: 'ri-checkbox-multiple-line', color: 'bg-purple-500' },
                      'true-false': { label: 'True/False', icon: 'ri-toggle-line', color: 'bg-green-500' },
                      'short-answer': { label: 'Short Answer', icon: 'ri-pencil-line', color: 'bg-orange-500' },
                      'essay': { label: 'Essay', icon: 'ri-file-text-line', color: 'bg-indigo-500' },
                      'coding-challenge': { label: 'Coding Challenge', icon: 'ri-code-line', color: 'bg-red-500' },
                      'file-upload': { label: 'File Upload', icon: 'ri-upload-line', color: 'bg-teal-500' },
                      'fill-in-blanks': { label: 'Fill in the Blanks', icon: 'ri-edit-line', color: 'bg-pink-500' }
                    };
                    
                    return includedTypes.map((type) => {
                      const typeQuestions = displayResults.questions.filter(q => q.type === type);
                      const typeCorrect = typeQuestions.filter(q => q.isCorrect).length;
                      const percentage = typeQuestions.length > 0 ? Math.round((typeCorrect / typeQuestions.length) * 100) : 0;
                      const typeInfo = typeLabels[type as keyof typeof typeLabels] || { 
                        label: type.replace('-', ' ').replace('_', ' '), 
                        icon: 'ri-question-line', 
                        color: 'bg-gray-500' 
                      };
                      
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 ${typeInfo.color} rounded-full mr-3`}></div>
                            <i className={`${typeInfo.icon} text-gray-600 mr-2`}></i>
                            <span className="text-sm font-medium text-gray-900">
                              {typeInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{typeCorrect}/{typeQuestions.length}</span>
                            <span className={`text-sm font-medium ${percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Time Analysis */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{displayResults.timeSpent}</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{displayResults.duration}</div>
                    <div className="text-sm text-gray-600">Time Allowed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(() => {
                        // Calculate time saved if both time spent and duration are available
                        if (displayResults.timeSpent !== 'Unknown' && displayResults.duration !== 'No limit') {
                          const timeSpentMinutes = displayResults.timeSpent.includes(':') 
                            ? parseInt(displayResults.timeSpent.split(':')[0]) 
                            : parseInt(displayResults.timeSpent);
                          const timeAllowedMinutes = parseInt(displayResults.duration);
                          const timeSaved = Math.max(0, timeAllowedMinutes - timeSpentMinutes);
                          return `${timeSaved} mins`;
                        }
                        return 'Unknown';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Time Saved</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {displayResults.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex-1">
                      {index + 1}. {question.question}
                    </h4>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-xs text-gray-600">{question.points} pts</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Multiple Choice Questions */}
                    {(question.type === 'multiple-choice' || question.type === 'multiple_choice') && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          // Parse correct answer - could be index or text
                          let correctAnswerText = '';
                          if (question.correctAnswer) {
                            const correctIndex = parseInt(question.correctAnswer);
                            if (!isNaN(correctIndex)) {
                              // If it's an index, get the corresponding text
                              correctAnswerText = question.options[correctIndex] || '';
                            } else {
                              // If it's already text, use it directly
                              correctAnswerText = question.correctAnswer;
                            }
                          }
                          
                          const isCorrectAnswer = option === correctAnswerText;
                          const isUserAnswer = option === question.userAnswer;
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border text-sm ${
                                isCorrectAnswer
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : isUserAnswer && !question.isCorrect
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                {isCorrectAnswer && (
                                  <i className="ri-check-line text-green-600 mr-2"></i>
                                )}
                                {isUserAnswer && !question.isCorrect && (
                                  <i className="ri-close-line text-red-600 mr-2"></i>
                                )}
                                <span>{option}</span>
                                {isUserAnswer && (
                                  <span className="ml-auto text-xs font-medium">Your Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False Questions */}
                    {(question.type === 'true-false' || question.type === 'true_false') && (
                      <div className="flex space-x-4">
                        {['True', 'False'].map((option, index) => {
                          // Parse correct answer - handle multiple formats
                          let correctAnswerText = '';
                          if (question.correctAnswer) {
                            const correctIndex = parseInt(question.correctAnswer);
                            if (!isNaN(correctIndex)) {
                              // If it's an index (0 or 1), get the corresponding text
                              correctAnswerText = ['True', 'False'][correctIndex] || '';
                            } else {
                              // If it's already text, normalize it
                              const normalizedAnswer = question.correctAnswer.toLowerCase().trim();
                              if (normalizedAnswer === 'true' || normalizedAnswer === 'false') {
                                correctAnswerText = normalizedAnswer.charAt(0).toUpperCase() + normalizedAnswer.slice(1);
                              } else if (normalizedAnswer === '0' || normalizedAnswer === '1') {
                                // Handle string "0" or "1"
                                correctAnswerText = normalizedAnswer === '0' ? 'True' : 'False';
                              } else {
                                correctAnswerText = question.correctAnswer;
                              }
                            }
                          }
                          
                          const isCorrectAnswer = option === correctAnswerText;
                          const isUserAnswer = option === question.userAnswer;
                          
                          console.log('🔍 True/False Debug:', {
                            option,
                            correctAnswerText,
                            questionCorrectAnswer: question.correctAnswer,
                            isCorrectAnswer,
                            isUserAnswer,
                            userAnswer: question.userAnswer
                          });
                          
                          return (
                            <div
                              key={option}
                              className={`p-2 rounded border text-sm flex-1 text-center ${
                                isCorrectAnswer
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : isUserAnswer && !question.isCorrect
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              {isCorrectAnswer && (
                                <i className="ri-check-line text-green-600 mr-1"></i>
                              )}
                              {isUserAnswer && !question.isCorrect && (
                                <i className="ri-close-line text-red-600 mr-1"></i>
                              )}
                              {option}
                              {isUserAnswer && (
                                <span className="ml-2 text-xs font-medium">Your Answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer Questions */}
                    {(question.type === 'short-answer' || question.type === 'short_answer') && (
                      <div className="space-y-2">
                        <div className="p-3 bg-green-100 border border-green-300 rounded">
                          <div className="text-xs font-medium text-green-800 mb-1">Correct Answer:</div>
                          <div className="text-sm text-green-700">{question.correctAnswer}</div>
                        </div>
                        <div className={`p-3 rounded border ${
                          question.isCorrect 
                            ? 'bg-green-100 border-green-300' 
                            : 'bg-red-100 border-red-300'
                        }`}>
                          <div className={`text-xs font-medium mb-1 ${
                            question.isCorrect ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Your Answer:
                          </div>
                          <div className={`text-sm ${
                            question.isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {question.userAnswer || 'No answer provided'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multiple Select Questions */}
                    {(question.type === 'multiple-select' || question.type === 'multiple_select') && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          // Parse correct answers - could be indices or text
                          let correctAnswers = [];
                          if (question.correctAnswer) {
                            if (typeof question.correctAnswer === 'string') {
                              // If it's a comma-separated string of indices
                              const indices = question.correctAnswer.split(',').map(i => i.trim());
                              correctAnswers = indices.map(index => question.options[parseInt(index)]).filter(Boolean);
                            } else if (Array.isArray(question.correctAnswer)) {
                              correctAnswers = question.correctAnswer;
                            }
                          }
                          
                          const isCorrectAnswer = correctAnswers.includes(option);
                          const isUserAnswer = question.userAnswer && 
                            (Array.isArray(question.userAnswer) ? question.userAnswer.includes(option) : 
                             question.userAnswer.includes(optIndex.toString()));
                          
                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border text-sm ${
                                isCorrectAnswer
                                  ? 'bg-green-100 border-green-300 text-green-800'
                                  : isUserAnswer && !question.isCorrect
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                {isCorrectAnswer && (
                                  <i className="ri-check-line text-green-600 mr-2"></i>
                                )}
                                {isUserAnswer && !question.isCorrect && (
                                  <i className="ri-close-line text-red-600 mr-2"></i>
                                )}
                                <span>{option}</span>
                                {isUserAnswer && (
                                  <span className="ml-auto text-xs font-medium">Your Answer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Essay Questions */}
                    {(question.type === 'essay') && (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-xs font-medium text-blue-800 mb-2">Model Answer:</div>
                          <div className="text-sm text-blue-700">{question.correctAnswer || 'No model answer provided'}</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-medium text-gray-800 mb-2">Your Response:</div>
                          <div className="text-sm text-gray-700">
                            {question.userAnswer || 'No response provided'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 italic">
                          <i className="ri-information-line mr-1"></i>
                          This question requires manual grading by the instructor.
                        </div>
                      </div>
                    )}

                    {/* Coding Challenge Questions */}
                    {(question.type === 'coding-challenge') && (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs font-medium text-green-800 mb-2">Expected Solution:</div>
                          <pre className="text-sm text-green-700 bg-white p-2 rounded border overflow-x-auto">
                            <code>{question.correctAnswer || 'No solution provided'}</code>
                          </pre>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-medium text-gray-800 mb-2">Your Code:</div>
                          <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                            <code>{question.userAnswer || 'No code submitted'}</code>
                          </pre>
                        </div>
                        <div className="text-xs text-gray-600 italic">
                          <i className="ri-information-line mr-1"></i>
                          This question requires manual review by the instructor.
                        </div>
                      </div>
                    )}

                    {/* File Upload Questions */}
                    {(question.type === 'file-upload') && (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs font-medium text-green-800 mb-2">Expected File Types:</div>
                          <div className="text-sm text-green-700">{question.correctAnswer || 'No specific requirements'}</div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-medium text-gray-800 mb-2">Your Upload:</div>
                          <div className="text-sm text-gray-700">
                            {question.userAnswer ? (
                              <div className="flex items-center">
                                <i className="ri-file-line mr-2"></i>
                                <span>{question.userAnswer}</span>
                              </div>
                            ) : (
                              'No file uploaded'
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 italic">
                          <i className="ri-information-line mr-1"></i>
                          This question requires manual review by the instructor.
                        </div>
                      </div>
                    )}

                    {/* Fill in the Blanks Questions */}
                    {(question.type === 'fill-in-blanks') && (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-xs font-medium text-green-800 mb-2">Correct Answers:</div>
                          <div className="text-sm text-green-700">
                            {question.correctAnswer ? (
                              <div className="space-y-1">
                                {question.correctAnswer.split(',').map((answer, index) => (
                                  <div key={index} className="bg-white p-2 rounded border">
                                    Blank {index + 1}: <strong>{answer.trim()}</strong>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'No correct answers provided'
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs font-medium text-gray-800 mb-2">Your Answers:</div>
                          <div className="text-sm text-gray-700">
                            {question.userAnswer ? (
                              <div className="space-y-1">
                                {Array.isArray(question.userAnswer) ? (
                                  question.userAnswer.map((answer, index) => (
                                    <div key={index} className="bg-white p-2 rounded border">
                                      Blank {index + 1}: <strong>{answer}</strong>
                                    </div>
                                  ))
                                ) : (
                                  <div className="bg-white p-2 rounded border">
                                    <strong>{question.userAnswer}</strong>
                                  </div>
                                )}
                              </div>
                            ) : (
                              'No answers provided'
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-start">
                          <i className="ri-lightbulb-line text-blue-600 mr-2 mt-0.5"></i>
                          <div>
                            <div className="text-xs font-medium text-blue-800 mb-1">Explanation:</div>
                            <div className="text-sm text-blue-700">{question.explanation}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {displayResults.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <i className="ri-chat-3-line text-blue-600 mr-3 mt-1"></i>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructor Feedback</h3>
                      <p className="text-blue-800">{displayResults.feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {displayResults.recommendations && displayResults.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <i className="ri-lightbulb-line text-yellow-600 mr-3 mt-1"></i>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-3">Recommendations for Improvement</h3>
                      <ul className="space-y-2">
                        {displayResults.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start text-yellow-800">
                            <i className="ri-arrow-right-s-line text-yellow-600 mr-2 mt-0.5"></i>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <i className="ri-trophy-line text-green-600 mr-3 mt-1"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Strengths</h3>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>• Strong understanding of React Hooks fundamentals</li>
                      <li>• Good grasp of useEffect and side effects management</li>
                      <li>• Excellent performance on conceptual questions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <i className="ri-bookmark-line text-gray-600 mr-3 mt-1"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Resources</h3>
                    <div className="space-y-2">
                      <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                        <i className="ri-external-link-line mr-1"></i>
                        React Fragments Documentation
                      </a>
                      <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                        <i className="ri-external-link-line mr-1"></i>
                        Advanced useEffect Patterns
                      </a>
                      <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                        <i className="ri-external-link-line mr-1"></i>
                        Component Creation Best Practices
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Assessments
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <i className="ri-download-line mr-2"></i>
              Download Results
            </Button>
            {onRetake && (
              <Button onClick={onRetake}>
                <i className="ri-refresh-line mr-2"></i>
                Retake Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssessmentResults;