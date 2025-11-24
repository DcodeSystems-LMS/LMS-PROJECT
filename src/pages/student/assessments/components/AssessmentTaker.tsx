import React, { useState, useEffect } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';
import { supabase } from '@/lib/supabase';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import AssessmentCelebration from '@/components/celebration/AssessmentCelebration';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'file-upload' | 'fill-in-blanks';
  options?: string[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
  points: number;
  wordLimit?: number;
  timeLimit?: number;
  codeLanguage?: string;
  codeTemplate?: string;
  testCases?: any[];
  fileTypes?: string[];
  maxFileSize?: number;
  allowedExtensions?: string[];
  blankPositions?: any[];
  richTextContent?: string;
  mediaFiles?: any[];
}

interface AssessmentTakerProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: string;
    title: string;
    duration: string;
    questions: number;
    type: string;
  } | null;
  onComplete: (score: number, answers: Record<string, string>) => void;
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  isOpen,
  onClose,
  assessment,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Fetch real questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!assessment?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching questions for assessment:', assessment.id);
        
        // Use DataService to fetch questions
        const questionsData = await DataService.getAssessmentQuestions(assessment.id);
        
        if (questionsData && questionsData.length > 0) {
          console.log('✅ Questions fetched successfully:', questionsData.length);
          console.log('📊 Question structure:', questionsData);
          console.log('📊 First question:', questionsData[0]);
          
          // Transform questions to match the expected interface
          const transformedQuestions = questionsData.map((q: any) => {
            const questionType = q.question_type || q.type;
            let options = [];
            
            // Handle options - ensure it's always an array
            if (q.options) {
              if (typeof q.options === 'string') {
                try {
                  options = JSON.parse(q.options);
                } catch (e) {
                  console.warn('Failed to parse options JSON:', q.options);
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
            
            // Handle correct_answers - ensure it's always an array
            let correctAnswers = [];
            if (q.correct_answers) {
              if (typeof q.correct_answers === 'string') {
                try {
                  correctAnswers = JSON.parse(q.correct_answers);
                } catch (e) {
                  console.warn('Failed to parse correct_answers JSON:', q.correct_answers);
                  correctAnswers = [];
                }
              } else if (Array.isArray(q.correct_answers)) {
                correctAnswers = q.correct_answers;
              }
            }
            
            return {
              id: q.id,
              question: q.question_text || q.question,
              type: questionType,
              options: options,
              correctAnswer: q.correct_answer || q.correctAnswer,
              correctAnswers: correctAnswers,
              explanation: q.explanation,
              points: q.points || 1,
              wordLimit: q.word_limit,
              timeLimit: q.time_limit,
              codeLanguage: q.code_language,
              codeTemplate: q.code_template,
              testCases: q.test_cases,
              fileTypes: q.file_types,
              maxFileSize: q.max_file_size,
              allowedExtensions: q.allowed_extensions,
              blankPositions: q.blank_positions,
              richTextContent: q.rich_text_content,
              mediaFiles: q.media_files
            };
          });
          
          console.log('📊 Transformed questions:', transformedQuestions);
          
          // Debug all questions to check options
          transformedQuestions.forEach((q, index) => {
            console.log(`🔍 Question ${index + 1} debug:`, {
              id: q.id,
              question: q.question,
              type: q.type,
              options: q.options,
              hasOptions: !!q.options,
              isArray: Array.isArray(q.options),
              optionsLength: q.options?.length,
              optionsType: typeof q.options
            });
          });
          
          setQuestions(transformedQuestions);
        } else {
          console.warn('⚠️ No questions found for this assessment');
          setError('No questions found for this assessment');
        }
      } catch (err) {
        console.error('❌ Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && assessment?.id) {
      fetchQuestions();
    }
  }, [isOpen, assessment?.id]);

  // Questions will be loaded from the assessment data

  useEffect(() => {
    if (isOpen && assessment) {
      // Parse duration (e.g., "45 mins" -> 45 * 60 seconds)
      const durationMatch = assessment.duration.match(/(\d+)/);
      const minutes = durationMatch ? parseInt(durationMatch[1]) : 30;
      setTimeRemaining(minutes * 60);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
      
      // Start assessment attempt tracking
      startAssessmentAttempt();
    }
  }, [isOpen, assessment]);

  const startAssessmentAttempt = async () => {
    if (!assessment?.id) {
      console.warn('⚠️ No assessment ID available for attempt tracking');
      return;
    }
    
    try {
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        console.warn('⚠️ No user found for attempt tracking');
        return;
      }
      
      console.log('🎯 Starting assessment attempt for:', assessment.id, 'student:', user.id);
      
      // Try RPC function first
      const { data, error } = await supabase.rpc('start_assessment_attempt', {
        p_student_id: user.id,
        p_assessment_id: assessment.id
      });
      
      if (error) {
        console.error('❌ RPC function failed:', error);
        
        // Check if it's a "maximum attempts exceeded" error
        if (error.message && error.message.includes('Maximum attempts exceeded')) {
          console.warn('⚠️ Maximum attempts exceeded, using existing attempt');
          // Try to find existing attempt
          const { data: existingAttempt } = await supabase
            .from('assessment_attempts')
            .select('id')
            .eq('student_id', user.id)
            .eq('assessment_id', assessment.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (existingAttempt) {
            setAttemptId(existingAttempt.id);
            console.log('✅ Using existing attempt:', existingAttempt.id);
            return;
          }
        }
        
        // Try direct insert as fallback
        const { data: insertData, error: insertError } = await supabase
          .from('assessment_attempts')
          .insert({
            student_id: user.id,
            assessment_id: assessment.id,
            attempt_number: 1,
            status: 'in-progress',
            started_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error('❌ Direct insert also failed:', insertError);
          
          // If it's a duplicate key error, try to find existing attempt
          if (insertError.code === '23505') {
            console.log('🔄 Duplicate key error, looking for existing attempt...');
            const { data: existingAttempt } = await supabase
              .from('assessment_attempts')
              .select('id')
              .eq('student_id', user.id)
              .eq('assessment_id', assessment.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (existingAttempt) {
              setAttemptId(existingAttempt.id);
              console.log('✅ Using existing attempt:', existingAttempt.id);
              return;
            }
          }
          
          // Create a temporary attempt ID for this session
          const tempAttemptId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setAttemptId(tempAttemptId);
          console.log('⚠️ Using temporary attempt ID:', tempAttemptId);
          return;
        }
        
        setAttemptId(insertData.id);
        console.log('✅ Assessment attempt started via direct insert:', insertData.id);
      } else {
        setAttemptId(data);
        console.log('✅ Assessment attempt started via RPC:', data);
      }
    } catch (err) {
      console.error('❌ Error starting assessment attempt:', err);
      // Create a temporary attempt ID for this session
      const tempAttemptId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setAttemptId(tempAttemptId);
      console.log('⚠️ Using temporary attempt ID due to error:', tempAttemptId);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && timeRemaining > 0 && !isSubmitting) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, isOpen, isSubmitting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    // Don't store empty arrays or empty strings
    if (Array.isArray(answer) && answer.length === 0) {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
    } else if (typeof answer === 'string' && answer.trim() === '') {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      calculateAndSubmit();
    }, 1000);
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    // Use real questions from the assessment
    const currentQuestions = questions;

    currentQuestions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      // Skip if no answer provided or empty object
      if (!userAnswer || userAnswer === '{}' || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        console.log('⚠️ No answer provided for question:', question.id);
        return;
      }
      
      console.log('🔍 Checking question:', {
        id: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswer,
        userAnswerType: typeof userAnswer,
        userAnswerIsArray: Array.isArray(userAnswer),
        correctAnswer: question.correctAnswer,
        correctAnswers: question.correctAnswers,
        options: question.options
      });
      
      // Handle different question types
      if (question.type === 'multiple-select') {
        // For multiple-select, compare arrays
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
        
        // Get correct answer indices and convert to option text
        let correctAnswers = [];
        let correctIndices = [];
        
        // Try to get correct answers from different possible sources
        if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
          correctIndices = question.correctAnswers;
          correctAnswers = correctIndices.map(index => question.options?.[parseInt(index)]).filter(Boolean);
        } else if (question.correctAnswer) {
          // If correctAnswer is a comma-separated string of indices
          const indices = question.correctAnswer.split(',').map(i => i.trim()).filter(i => i !== '');
          correctIndices = indices;
          correctAnswers = indices.map(index => question.options?.[parseInt(index)]).filter(Boolean);
        }
        
        console.log('🔍 Multiple-select debug:', {
          questionId: question.id,
          userAnswers,
          correctAnswers,
          correctIndices,
          questionCorrectAnswer: question.correctAnswer,
          questionCorrectAnswers: question.correctAnswers,
          options: question.options
        });
        
        // Check if all correct answers are selected and no incorrect ones
        const allCorrectSelected = correctAnswers.length > 0 && correctAnswers.every(correct => userAnswers.includes(correct));
        const noIncorrectSelected = userAnswers.every(user => correctAnswers.includes(user));
        const isCorrect = allCorrectSelected && noIncorrectSelected;
        
        if (isCorrect) {
          earnedPoints += question.points;
          console.log('✅ Multiple-select correct:', { userAnswers, correctAnswers, correctIndices });
        } else {
          console.log('❌ Multiple-select incorrect:', { userAnswers, correctAnswers, correctIndices });
        }
      } else if (question.type === 'short-answer') {
        // Normalize both answers for comparison
        const normalizedUserAnswer = String(userAnswer || '').trim().toLowerCase();
        const normalizedCorrectAnswer = String(question.correctAnswer || '').trim().toLowerCase();
        // For short answers, check if user answer contains the correct answer or vice versa
        // Also check for partial matches with key words
        const userWords = normalizedUserAnswer.split(/\s+/);
        const correctWords = normalizedCorrectAnswer.split(/\s+/);
        
        // Check if user answer contains the correct answer or vice versa
        const containsMatch = normalizedUserAnswer.includes(normalizedCorrectAnswer) || 
                             normalizedCorrectAnswer.includes(normalizedUserAnswer);
        
        // Check for partial word matches (at least 50% of words match)
        const matchingWords = userWords.filter(word => correctWords.includes(word));
        const wordMatchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;
        
        const isCorrect = containsMatch || wordMatchRatio >= 0.5;
        if (isCorrect) {
          earnedPoints += question.points;
          console.log('✅ Short answer correct:', { 
            userAnswer: normalizedUserAnswer, 
            correctAnswer: normalizedCorrectAnswer,
            containsMatch,
            wordMatchRatio,
            matchingWords: matchingWords.length,
            totalWords: correctWords.length
          });
        } else {
          console.log('❌ Short answer incorrect:', { 
            userAnswer: normalizedUserAnswer, 
            correctAnswer: normalizedCorrectAnswer,
            containsMatch,
            wordMatchRatio,
            matchingWords: matchingWords.length,
            totalWords: correctWords.length
          });
        }
      } else {
        // For multiple choice and true-false, handle index-based correct answers
        const userAnswerText = String(userAnswer || '').trim().toLowerCase();
        
        // Check if correctAnswer is an index (number as string) or text
        const correctAnswerIndex = parseInt(question.correctAnswer || '');
        const correctAnswerText = !isNaN(correctAnswerIndex) && question.options?.[correctAnswerIndex] 
          ? question.options[correctAnswerIndex].toLowerCase()
          : String(question.correctAnswer || '').trim().toLowerCase();
        
        const isCorrect = userAnswerText === correctAnswerText;
        if (isCorrect) {
          earnedPoints += question.points;
          console.log('✅ Answer correct:', { 
            userAnswer: userAnswerText, 
            correctAnswer: correctAnswerText,
            correctAnswerIndex: correctAnswerIndex,
            isIndexBased: !isNaN(correctAnswerIndex)
          });
        } else {
          console.log('❌ Answer incorrect:', { 
            userAnswer: userAnswerText, 
            correctAnswer: correctAnswerText,
            correctAnswerIndex: correctAnswerIndex,
            isIndexBased: !isNaN(correctAnswerIndex)
          });
        }
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    return { score, totalPoints, earnedPoints };
  };

  const calculateAndSubmit = () => {
    const { score, totalPoints } = calculateScore();
    onComplete(score, answers);
    onClose();
  };

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmSubmit(false);
    setIsSubmitting(true);
    
    try {
      // Calculate score first
      const { score, totalPoints } = calculateScore();
      console.log('📊 Calculated score:', score, 'out of', totalPoints);
      
      // Complete assessment attempt in database
      if (attemptId) {
        const timeSpent = Math.floor((assessment.duration ? parseInt(assessment.duration.match(/(\d+)/)?.[1] || '30') * 60 : 1800 - timeRemaining) / 60);
        
        console.log('💾 Saving attempt to database:', {
          attemptId,
          score,
          answers,
          timeSpent
        });
        
        const { error } = await supabase.rpc('complete_assessment_attempt', {
          p_attempt_id: attemptId,
          p_score: score,
          p_answers: answers,
          p_time_spent: timeSpent
        });
        
        if (error) {
          console.error('❌ Error completing assessment attempt:', error);
          // Try direct table update as fallback
          const { error: directError } = await supabase
            .from('assessment_attempts')
            .update({
              completed_at: new Date().toISOString(),
              score: score,
              answers: answers,
              time_spent: timeSpent,
              status: 'completed'
            })
            .eq('id', attemptId);
          
          if (directError) {
            console.error('❌ Direct update also failed:', directError);
            console.log('⚠️ Assessment attempt could not be saved to database, but score was calculated');
          } else {
            console.log('✅ Assessment attempt completed via direct update');
          }
        } else {
          console.log('✅ Assessment attempt completed successfully');
        }
      } else {
        console.warn('⚠️ No attempt ID found, cannot save to database');
      }
      
      // Also save to assessment_results table for compatibility
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const { data: resultData, error: resultError } = await DataService.saveAssessmentResult({
            student_id: user.id,
            assessment_id: assessment.id,
            attempt_id: attemptId,
            score: score,
            total_points: totalPoints,
            answers: answers,
            feedback: `Completed in ${Math.floor((assessment.duration ? parseInt(assessment.duration.match(/(\d+)/)?.[1] || '30') * 60 : 1800 - timeRemaining) / 60)} minutes`
          });
          
          if (resultError) {
            console.error('❌ Could not save to assessment_results:', resultError);
          } else {
            console.log('✅ Assessment result saved to assessment_results table:', resultData);
          }
        }
      } catch (resultError) {
        console.error('❌ Could not save to assessment_results:', resultError);
      }
      
      // Show celebration screen
      setFinalScore(score);
      setShowCelebration(true);
    } catch (err) {
      console.error('❌ Error submitting assessment:', err);
      setIsSubmitting(false);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setIsSubmitting(false);
    // Complete the submission after celebration
    calculateAndSubmit();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  // Use real questions from the assessment
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Debug logging
  console.log('🔍 Current question index:', currentQuestionIndex);
  console.log('🔍 Total questions:', questions.length);
  console.log('🔍 Current question:', currentQuestion);
  console.log('🔍 All questions:', questions);

  if (!assessment) return null;
  
  // Safety check for current question
  if (!currentQuestion) {
    console.error('❌ Current question is undefined!', {
      currentQuestionIndex,
      questionsLength: questions.length,
      questions
    });
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Assessment Error">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <i className="ri-error-warning-line text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Question Loading Error</h3>
          <p className="text-gray-600 mb-4">
            There was an issue loading question {currentQuestionIndex + 1} of {questions.length}.
          </p>
          <Button onClick={onClose}>Close Assessment</Button>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${assessment.title} - ${assessment.type}`}
        size="xl"
      >
        {isSubmitting ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <SimpleDCODESpinner size="lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Submitting Assessment</h3>
            <p className="text-gray-600">Please wait while we process your answers...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <SimpleDCODESpinner size="lg" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Assessment</h3>
            <p className="text-gray-600">Please wait while we load the questions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Assessment</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-question-line text-2xl text-yellow-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
            <p className="text-gray-600 mb-4">This assessment doesn't have any questions yet.</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Answered: {getAnsweredCount()}/{questions.length}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-600">Time remaining</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex-1">
                  {String(currentQuestion.question || '')}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full ml-4">
                  {String(currentQuestion.points || 0)} pts
                </span>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-900">{String(option || '')}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (() => {
                  console.log('🔍 Rendering true/false options:', {
                    type: currentQuestion.type,
                    options: currentQuestion.options,
                    hasOptions: !!currentQuestion.options,
                    optionsLength: currentQuestion.options?.length
                  });
                  return (
                    <div className="flex space-x-4">
                      {(currentQuestion.options || ['True', 'False']).map((option) => (
                      <label key={option} className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors flex-1 justify-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 font-medium text-gray-900">{String(option || '')}</span>
                      </label>
                    ))}
                    </div>
                  );
                })()}

                {currentQuestion.type === 'short-answer' && (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                )}

                {/* Multiple Select Questions */}
                {currentQuestion.type === 'multiple-select' && currentQuestion.options && Array.isArray(currentQuestion.options) && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <label key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id]?.includes(option) || false}
                          onChange={(e) => {
                            const currentAnswers = Array.isArray(answers[currentQuestion.id]) 
                              ? answers[currentQuestion.id] as string[]
                              : [];
                            if (e.target.checked) {
                              handleAnswerChange(currentQuestion.id, [...currentAnswers, option]);
                            } else {
                              handleAnswerChange(currentQuestion.id, currentAnswers.filter(a => a !== option));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-gray-900">{String(option || '')}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Essay Questions */}
                {currentQuestion.type === 'essay' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Write your detailed response here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={8}
                    />
                    {currentQuestion.wordLimit && (
                      <div className="text-sm text-gray-500">
                        Word limit: {currentQuestion.wordLimit} words
                      </div>
                    )}
                  </div>
                )}

                {/* Coding Challenge Questions */}
                {currentQuestion.type === 'coding-challenge' && (
                  <div className="space-y-4">
                    {currentQuestion.codeTemplate && (
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <pre>{currentQuestion.codeTemplate}</pre>
                      </div>
                    )}
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={`Write your ${currentQuestion.codeLanguage || 'code'} solution here...`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                      rows={10}
                    />
                    {currentQuestion.timeLimit && (
                      <div className="text-sm text-gray-500">
                        Time limit: {currentQuestion.timeLimit} minutes
                      </div>
                    )}
                  </div>
                )}

                {/* File Upload Questions */}
                {currentQuestion.type === 'file-upload' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAnswerChange(currentQuestion.id, file.name);
                          }
                        }}
                        accept={currentQuestion.allowedExtensions?.join(',')}
                        className="hidden"
                        id={`file-upload-${currentQuestion.id}`}
                      />
                      <label
                        htmlFor={`file-upload-${currentQuestion.id}`}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <i className="ri-upload-line text-4xl text-gray-400 mb-2"></i>
                        <span className="text-gray-600">Click to upload file</span>
                        {currentQuestion.allowedExtensions && (
                          <span className="text-sm text-gray-500 mt-1">
                            Allowed: {currentQuestion.allowedExtensions.join(', ')}
                          </span>
                        )}
                        {currentQuestion.maxFileSize && (
                          <span className="text-sm text-gray-500">
                            Max size: {(currentQuestion.maxFileSize / 1024 / 1024).toFixed(1)}MB
                          </span>
                        )}
                      </label>
                    </div>
                    {answers[currentQuestion.id] && (
                      <div className="text-sm text-green-600">
                        Selected: {answers[currentQuestion.id]}
                      </div>
                    )}
                  </div>
                )}

                {/* Fill in the Blanks Questions */}
                {currentQuestion.type === 'fill-in-blanks' && (
                  <div className="space-y-3">
                    <div className="text-gray-700 leading-relaxed">
                      {currentQuestion.blankPositions?.map((blank: any, index: number) => (
                        <span key={index}>
                          {String(blank.before || '')}
                          <input
                            type="text"
                            value={answers[`${currentQuestion.id}_${index}`] || ''}
                            onChange={(e) => handleAnswerChange(`${currentQuestion.id}_${index}`, e.target.value)}
                            className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-500 bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="___"
                          />
                          {String(blank.after || '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[questions[index]?.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit}>
                  <i className="ri-check-line mr-2"></i>
                  Submit Assessment
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="Submit Assessment"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="ri-alert-line text-yellow-600 mr-2 mt-0.5"></i>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Are you sure you want to submit?</p>
                <p>You have answered {getAnsweredCount()} out of {questions.length} questions.</p>
                <p className="mt-1">Once submitted, you cannot change your answers.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit}>
              <i className="ri-check-line mr-2"></i>
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Celebration Screen */}
      <AssessmentCelebration
        isOpen={showCelebration}
        score={finalScore}
        totalQuestions={questions.length}
        onComplete={handleCelebrationComplete}
      />
    </>
  );
};

export default AssessmentTaker;