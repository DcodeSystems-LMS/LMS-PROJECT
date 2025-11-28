import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';
import { supabase } from '@/lib/supabase';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import AssessmentCelebration from '@/components/celebration/AssessmentCelebration';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import Editor from '@monaco-editor/react';
import { useJudge0Runner } from '@/hooks/useJudge0Runner';
import { getLanguageId, getMonacoLanguage, getDefaultCode } from '@/utils/languageMap';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'coding' | 'file-upload' | 'fill-in-blanks' | 'fill-blanks';
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
  
  // Code execution state for coding questions
  const [codeExecutionResults, setCodeExecutionResults] = useState<Record<string, {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    status: string | null;
    error: string | null;
  }>>({});
  
  // Stdin input state for coding questions (stored per question)
  const [stdinInputs, setStdinInputs] = useState<Record<string, string>>({});
  
  // Judge0 runner hook - we'll use it per question
  const { run: runCode, isRunning: isCodeRunning, result: codeResult, error: codeError, statusLabel: codeStatusLabel, reset: resetCodeRunner } = useJudge0Runner();

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
            let questionType = q.question_type || q.type;
            
            // Normalize question types (handle both hyphen and underscore formats)
            if (questionType === 'true_false') questionType = 'true-false';
            if (questionType === 'coding_challenge' || questionType === 'coding') questionType = 'coding-challenge';
            if (questionType === 'multiple_choice') questionType = 'multiple-choice';
            if (questionType === 'multiple_select') questionType = 'multiple-select';
            if (questionType === 'short_answer') questionType = 'short-answer';
            if (questionType === 'file_upload') questionType = 'file-upload';
            if (questionType === 'fill_in_blanks' || questionType === 'fill-blanks') questionType = 'fill-in-blanks';
            
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
            if (questionType === 'true-false') {
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
            
            const transformedQuestion = {
              id: q.id,
              question: q.question_text || q.question,
              type: questionType as any,
              options: options,
              correctAnswer: q.correct_answer || q.correctAnswer,
              correctAnswers: correctAnswers,
              explanation: q.explanation,
              points: q.points || 1,
              wordLimit: q.word_limit,
              timeLimit: q.time_limit,
              codeLanguage: q.code_language || q.codeLanguage,
              codeTemplate: q.code_template || q.codeTemplate,
              testCases: q.test_cases || q.testCases,
              fileTypes: q.file_types || q.fileTypes,
              maxFileSize: q.max_file_size || q.maxFileSize,
              allowedExtensions: q.allowed_extensions || q.allowedExtensions,
              blankPositions: q.blank_positions || q.blankPositions,
              richTextContent: q.rich_text_content || q.richTextContent,
              mediaFiles: q.media_files || q.mediaFiles
            };
            
            // Debug logging for coding challenges
            if (questionType === 'coding-challenge' || questionType === 'coding_challenge' || questionType === 'coding') {
              console.log('🔍 Coding challenge question detected:', {
                id: transformedQuestion.id,
                originalType: q.question_type || q.type,
                normalizedType: transformedQuestion.type,
                codeLanguage: transformedQuestion.codeLanguage,
                hasCodeTemplate: !!transformedQuestion.codeTemplate,
                codeTemplatePreview: transformedQuestion.codeTemplate?.substring(0, 100)
              });
            }
            
            return transformedQuestion;
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
      setCodeExecutionResults({});
      setStdinInputs({});
      resetCodeRunner();
      
      // Start assessment attempt tracking
      startAssessmentAttempt();
    }
  }, [isOpen, assessment]);
  
  // Reset code runner when question changes
  useEffect(() => {
    resetCodeRunner();
  }, [currentQuestionIndex, resetCodeRunner]);
  
  // Initialize code answer with template when viewing a coding question for the first time
  useEffect(() => {
    if (currentQuestion && (currentQuestion.type === 'coding-challenge' || currentQuestion.type === 'coding_challenge' || currentQuestion.type === 'coding')) {
      const questionId = currentQuestion.id;
      // Only initialize if answer doesn't exist yet
      if (!answers[questionId]) {
        const rawCodeLanguage = currentQuestion.codeLanguage || 'Python';
        const codeLanguage = normalizeLanguageName(rawCodeLanguage);
        const initialCode = currentQuestion.codeTemplate || getDefaultCode(codeLanguage);
        if (initialCode) {
          setAnswers(prev => ({
            ...prev,
            [questionId]: initialCode
          }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

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
        
        // First, check for existing in-progress attempt
        const { data: existingInProgress } = await supabase
          .from('assessment_attempts')
          .select('id')
          .eq('student_id', user.id)
          .eq('assessment_id', assessment.id)
          .eq('status', 'in-progress')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingInProgress) {
          setAttemptId(existingInProgress.id);
          console.log('✅ Found existing in-progress attempt:', existingInProgress.id);
          return;
        }
        
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
            .maybeSingle();
          
          if (existingAttempt) {
            setAttemptId(existingAttempt.id);
            console.log('✅ Using existing attempt:', existingAttempt.id);
            return;
          }
        }
        
        // Check if it's a null constraint violation (error code 23502)
        if (error.code === '23502' || (error.message && error.message.includes('null value in column "id"'))) {
          console.warn('⚠️ Null ID constraint violation detected, trying fallback with explicit UUID');
        }
        
        // Get current attempt count for attempt_number
        const { count: attemptCount } = await supabase
          .from('assessment_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('assessment_id', assessment.id);
        
        // Try direct insert as fallback with generated UUID
        const attemptUUID = crypto.randomUUID();
        const { data: insertData, error: insertError } = await supabase
          .from('assessment_attempts')
          .insert({
            id: attemptUUID,
            student_id: user.id,
            assessment_id: assessment.id,
            attempt_number: (attemptCount || 0) + 1,
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
              .maybeSingle();
            
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
        
        if (insertData) {
          setAttemptId(insertData.id);
          console.log('✅ Assessment attempt started via direct insert:', insertData.id);
        } else {
          console.error('❌ Direct insert returned no data');
          const tempAttemptId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setAttemptId(tempAttemptId);
          console.log('⚠️ Using temporary attempt ID:', tempAttemptId);
        }
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
  
  // Handle code execution for coding questions
  const handleRunCode = async () => {
    if (!currentQuestion || (currentQuestion.type !== 'coding-challenge' && currentQuestion.type !== 'coding_challenge' && currentQuestion.type !== 'coding')) {
      console.warn('⚠️ handleRunCode called but question type is:', currentQuestion?.type);
      return;
    }
    
    const questionId = currentQuestion.id;
    const code = (answers[questionId] as string) || '';
    
    if (!code.trim()) {
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          stdout: null,
          stderr: null,
          compile_output: null,
          status: null,
          error: 'Please enter some code to run.'
        }
      }));
      return;
    }
    
    // Get language ID from question's codeLanguage (normalize to match languageMap keys)
    const rawLanguageName = currentQuestion.codeLanguage || 'Python';
    const languageName = normalizeLanguageName(rawLanguageName);
    const languageId = getLanguageId(languageName);
    
    console.log('🔍 Language mapping:', {
      raw: rawLanguageName,
      normalized: languageName,
      languageId: languageId
    });
    
    if (!languageId) {
      const supportedLanguages = [
        'Python', 'JavaScript', 'Java', 'C++', 'C', 'Go', 'Ruby', 'PHP',
        'Rust', 'Swift', 'Kotlin', 'TypeScript', 'C#', 'Scala', 'Perl', 'Haskell'
      ].join(', ');
      
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          stdout: null,
          stderr: null,
          compile_output: null,
          status: null,
          error: `Language "${rawLanguageName}" (normalized: "${languageName}") is not supported.\n\nSupported languages: ${supportedLanguages}\n\nCommon aliases:\n- Python: python, py, python3\n- JavaScript: javascript, js, nodejs\n- C++: c++, cpp, cplusplus\n- C#: c#, csharp, cs\n- Go: go, golang\n- TypeScript: typescript, ts\n- And more...`
        }
      }));
      return;
    }
    
    // Clear previous results
    setCodeExecutionResults(prev => ({
      ...prev,
      [questionId]: {
        stdout: null,
        stderr: null,
        compile_output: null,
        status: 'Running...',
        error: null
      }
    }));
    
    // Get stdin input for this question
    const stdin = stdinInputs[questionId] || '';
    
    // Detect if code needs input but none is provided
    const needsInput = /readline\.question|input\(|scanf\(|cin\s*>>|Scanner|readLine\(/i.test(code);
    
    if (needsInput && !stdin.trim()) {
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          stdout: null,
          stderr: null,
          compile_output: null,
          status: 'Waiting for Input',
          error: 'This code requires input. Please enter the input in the "Standard Input (stdin)" field below the code editor, then click "Run Code" again.\n\nFor example, if your code asks for a name, type the name in the stdin field.'
        }
      }));
      return;
    }
    
    console.log('🔍 Running code with stdin:', {
      questionId,
      hasStdin: !!stdin,
      stdinLength: stdin.length,
      stdinPreview: stdin.substring(0, 50),
      needsInput,
      codeLength: code.length
    });
    
    // Run the code with stdin
    try {
      await runCode(languageId, code, stdin);
    } catch (err) {
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          stdout: null,
          stderr: null,
          compile_output: null,
          status: null,
          error: err instanceof Error ? err.message : 'Execution failed. Please try again.'
        }
      }));
    }
  };

  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      calculateAndSubmit();
    }, 1000);
  };

  // Collect all answers including fill-in-the-blanks
  const collectAllAnswers = (): Record<string, string | string[]> => {
    const allAnswers: Record<string, string | string[]> = { ...answers };
    
    // Collect fill-in-the-blanks answers
    questions.forEach(question => {
      if (question.type === 'fill-in-blanks' || question.type === 'fill-blanks') {
        const blankAnswers: string[] = [];
        let index = 0;
        
        // Collect all blank answers for this question
        while (answers[`${question.id}_${index}`] !== undefined) {
          const blankAnswer = answers[`${question.id}_${index}`];
          if (blankAnswer && typeof blankAnswer === 'string' && blankAnswer.trim()) {
            blankAnswers.push(blankAnswer.trim());
          }
          index++;
        }
        
        // Store as array or single string
        if (blankAnswers.length > 0) {
          allAnswers[question.id] = blankAnswers;
        }
      }
    });
    
    return allAnswers;
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    // Use real questions from the assessment
    const currentQuestions = questions;

    currentQuestions.forEach(question => {
      totalPoints += question.points;
      
      // Handle fill-in-the-blanks separately
      if (question.type === 'fill-in-blanks' || question.type === 'fill-blanks') {
        // Collect all blank answers for this question
        const blankAnswers: string[] = [];
        let index = 0;
        
        while (answers[`${question.id}_${index}`] !== undefined) {
          const blankAnswer = answers[`${question.id}_${index}`];
          if (blankAnswer && typeof blankAnswer === 'string' && blankAnswer.trim()) {
            blankAnswers.push(blankAnswer.trim());
          }
          index++;
        }
        
        if (blankAnswers.length === 0) {
          console.log('⚠️ No answers provided for fill-in-the-blanks question:', question.id);
          return;
        }
        
        // Get correct answers (can be array or comma-separated string)
        let correctAnswers: string[] = [];
        if (Array.isArray(question.correctAnswers)) {
          correctAnswers = question.correctAnswers.map(a => String(a).trim().toLowerCase());
        } else if (question.correctAnswer) {
          // Try to parse as JSON array, or split by comma
          try {
            const parsed = JSON.parse(question.correctAnswer);
            correctAnswers = Array.isArray(parsed) 
              ? parsed.map(a => String(a).trim().toLowerCase())
              : String(question.correctAnswer).split(',').map(a => a.trim().toLowerCase());
          } catch {
            correctAnswers = String(question.correctAnswer).split(',').map(a => a.trim().toLowerCase());
          }
        }
        
        // Normalize user answers
        const normalizedUserAnswers = blankAnswers.map(a => a.toLowerCase());
        
        // Check if all answers match (order may matter or not, depending on implementation)
        // For now, check if all correct answers are present
        const allCorrect = correctAnswers.length > 0 && 
          correctAnswers.every(correct => normalizedUserAnswers.includes(correct)) &&
          normalizedUserAnswers.length === correctAnswers.length;
        
        if (allCorrect) {
          earnedPoints += question.points;
          console.log('✅ Fill-in-the-blanks correct:', {
            questionId: question.id,
            userAnswers: normalizedUserAnswers,
            correctAnswers: correctAnswers
          });
        } else {
          console.log('❌ Fill-in-the-blanks incorrect:', {
            questionId: question.id,
            userAnswers: normalizedUserAnswers,
            correctAnswers: correctAnswers
          });
        }
        
        return;
      }
      
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
      
      // Collect all answers including fill-in-the-blanks
      const allAnswers = collectAllAnswers();
      
      console.log('💾 All answers collected:', {
        totalAnswers: Object.keys(allAnswers).length,
        answerKeys: Object.keys(allAnswers),
        fillInBlanksAnswers: Object.keys(allAnswers).filter(key => key.includes('_')),
        answers: allAnswers
      });
      
      // Complete assessment attempt in database
      if (attemptId) {
        const timeSpent = Math.floor((assessment.duration ? parseInt(assessment.duration.match(/(\d+)/)?.[1] || '30') * 60 : 1800 - timeRemaining) / 60);
        
        console.log('💾 Saving attempt to database:', {
          attemptId,
          score,
          totalAnswers: Object.keys(allAnswers).length,
          answers: allAnswers,
          timeSpent
        });
        
        const { error } = await supabase.rpc('complete_assessment_attempt', {
          p_attempt_id: attemptId,
          p_score: score,
          p_answers: allAnswers,
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
              answers: allAnswers,
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
            answers: allAnswers,
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
  
  // Normalize language name to match languageMap keys
  // Handles all supported languages with their variations and aliases
  const normalizeLanguageName = (lang: string | undefined): string => {
    if (!lang) return 'Python';
    
    const normalized = lang.trim();
    const lower = normalized.toLowerCase();
    
    // Language mapping with all variations and aliases
    const languageMap: Record<string, string> = {
      // Python variations
      'python': 'Python',
      'py': 'Python',
      'python3': 'Python',
      'python2': 'Python',
      
      // JavaScript variations
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'nodejs': 'JavaScript',
      'node.js': 'JavaScript',
      'node': 'JavaScript',
      
      // Java variations
      'java': 'Java',
      
      // C++ variations
      'c++': 'C++',
      'cpp': 'C++',
      'cplusplus': 'C++',
      'c plus plus': 'C++',
      
      // C variations
      'c': 'C',
      
      // Go variations
      'go': 'Go',
      'golang': 'Go',
      
      // Ruby variations
      'ruby': 'Ruby',
      'rb': 'Ruby',
      
      // PHP variations
      'php': 'PHP',
      
      // Rust variations
      'rust': 'Rust',
      'rs': 'Rust',
      
      // Swift variations
      'swift': 'Swift',
      
      // Kotlin variations
      'kotlin': 'Kotlin',
      'kt': 'Kotlin',
      
      // TypeScript variations
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      
      // C# variations
      'c#': 'C#',
      'csharp': 'C#',
      'cs': 'C#',
      
      // Scala variations
      'scala': 'Scala',
      
      // Perl variations
      'perl': 'Perl',
      'pl': 'Perl',
      
      // Haskell variations
      'haskell': 'Haskell',
      'hs': 'Haskell',
    };
    
    // Check if we have a direct mapping
    if (languageMap[lower]) {
      return languageMap[lower];
    }
    
    // For exact matches (case-insensitive), try to find the correct case
    const supportedLanguages = [
      'Python', 'JavaScript', 'Java', 'C++', 'C', 'Go', 'Ruby', 'PHP',
      'Rust', 'Swift', 'Kotlin', 'TypeScript', 'C#', 'Scala', 'Perl', 'Haskell'
    ];
    
    const exactMatch = supportedLanguages.find(
      l => l.toLowerCase() === lower
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Fallback: capitalize first letter for unknown languages
    // This handles cases like "python" -> "Python", "java" -> "Java", etc.
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  };

  // Use real questions from the assessment
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Handle code execution results
  useEffect(() => {
    if (codeResult && currentQuestion) {
      const questionId = currentQuestion.id;
      const result = {
        stdout: codeResult.stdout,
        stderr: codeResult.stderr,
        compile_output: codeResult.compile_output,
        status: codeStatusLabel || codeResult.status.description,
        error: codeError
      };
      
      console.log('📊 Code execution result:', {
        questionId,
        status: result.status,
        hasStdout: !!result.stdout,
        hasStderr: !!result.stderr,
        hasCompileOutput: !!result.compile_output,
        stdout: result.stdout?.substring(0, 100),
        stderr: result.stderr?.substring(0, 100)
      });
      
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: result
      }));
    }
  }, [codeResult, codeStatusLabel, codeError, currentQuestion]);
  
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
              <SimpleDCODESpinner size="sm" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Submitting Assessment</h3>
            <p className="text-gray-600">Please wait while we process your answers...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <SimpleDCODESpinner size="sm" />
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
                {/* Debug: Show question type if not recognized */}
                {!['multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'essay', 'coding-challenge', 'coding_challenge', 'coding', 'file-upload', 'fill-in-blanks', 'fill-blanks'].includes(currentQuestion.type) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium text-yellow-800 mb-1">⚠️ Unrecognized Question Type</div>
                    <div className="text-sm text-yellow-700">
                      Question type: <code className="bg-yellow-100 px-2 py-1 rounded">{currentQuestion.type}</code>
                    </div>
                    <div className="text-xs text-yellow-600 mt-2">
                      This question type may not be fully supported. Please contact your instructor.
                    </div>
                  </div>
                )}
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
                {(currentQuestion.type === 'coding-challenge' || currentQuestion.type === 'coding_challenge' || currentQuestion.type === 'coding') && (() => {
                  const questionId = currentQuestion.id;
                  const rawCodeLanguage = currentQuestion.codeLanguage || 'Python';
                  const codeLanguage = normalizeLanguageName(rawCodeLanguage);
                  const monacoLanguage = getMonacoLanguage(codeLanguage);
                  const codeValue = (answers[questionId] as string) || currentQuestion.codeTemplate || getDefaultCode(codeLanguage);
                  const executionResult = codeExecutionResults[questionId];
                  
                  // Debug logging
                  console.log('🔍 Rendering coding challenge:', {
                    questionId,
                    type: currentQuestion.type,
                    rawCodeLanguage,
                    codeLanguage,
                    monacoLanguage,
                    hasCodeTemplate: !!currentQuestion.codeTemplate,
                    codeValueLength: codeValue?.length,
                    hasExecutionResult: !!executionResult
                  });
                  
                  return (
                    <div className="space-y-4">
                      {currentQuestion.codeTemplate && (
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <div className="text-xs text-gray-400 mb-2">Starter Code:</div>
                          <pre className="whitespace-pre-wrap">{currentQuestion.codeTemplate}</pre>
                        </div>
                      )}
                      
                      {/* Code Editor */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-300">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">
                              {codeLanguage} Code Editor
                            </span>
                            {currentQuestion.timeLimit && (
                              <span className="text-xs text-gray-500">
                                Time limit: {currentQuestion.timeLimit} minutes
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={handleRunCode}
                            disabled={isCodeRunning}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            {isCodeRunning ? (
                              <>
                                <SimpleDCODESpinner size="xs" className="scale-75" />
                                <span>Running...</span>
                              </>
                            ) : (
                              <>
                                <i className="ri-play-line"></i>
                                <span>Run Code</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="h-96">
                          <Editor
                            height="100%"
                            language={monacoLanguage}
                            value={codeValue}
                            onChange={(value) => handleAnswerChange(questionId, value || '')}
                            theme="vs-light"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              tabSize: 2,
                              wordWrap: 'on',
                              formatOnPaste: true,
                              formatOnType: true,
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Stdin Input Area */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                          <label className="text-sm font-medium text-gray-700 flex items-center">
                            <i className="ri-terminal-box-line mr-2"></i>
                            Standard Input (stdin)
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter input for your program (one value per line). Leave empty if your program doesn't need input.
                          </p>
                        </div>
                        <textarea
                          value={stdinInputs[questionId] || ''}
                          onChange={(e) => setStdinInputs(prev => ({
                            ...prev,
                            [questionId]: e.target.value
                          }))}
                          placeholder="Enter input for your program (e.g., for readline.question('Enter your name: '), type the name here)..."
                          className="w-full h-24 px-4 py-3 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
                          disabled={isCodeRunning}
                        />
                      </div>
                      
                      {/* Execution Results */}
                      {executionResult && (
                        <div className="space-y-3">
                          {/* Status Badge */}
                          {executionResult.status && (
                            <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                              executionResult.status === 'Accepted' 
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : executionResult.status === 'Compilation Error' || executionResult.status === 'Runtime Error' || executionResult.status?.includes('Error')
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            }`}>
                              <i className={`ri-${
                                executionResult.status === 'Accepted' 
                                  ? 'check-line text-green-600'
                                  : 'error-warning-line text-red-600'
                              }`}></i>
                              <span>Status: {executionResult.status}</span>
                            </div>
                          )}
                          
                          {/* Error Message */}
                          {executionResult.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="text-sm font-medium text-red-800 mb-1 flex items-center">
                                <i className="ri-error-warning-line mr-2"></i>
                                Error
                              </div>
                              <div className="text-sm text-red-700 font-mono whitespace-pre-wrap break-words">
                                {executionResult.error}
                              </div>
                              {/* Show helpful message for timeout errors */}
                              {(executionResult.error.includes('Time limit exceeded') || executionResult.error.includes('timeout')) && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                  <div className="text-xs text-red-600">
                                    <i className="ri-information-line mr-1"></i>
                                    <strong>Tip:</strong> If your code uses <code className="bg-red-100 px-1 rounded">readline.question()</code>, <code className="bg-red-100 px-1 rounded">input()</code>, or <code className="bg-red-100 px-1 rounded">scanf()</code>, make sure to provide the input in the "Standard Input (stdin)" field above.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Compilation Error */}
                          {executionResult.compile_output && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="text-sm font-medium text-red-800 mb-1 flex items-center">
                                <i className="ri-file-code-line mr-2"></i>
                                Compilation Error
                              </div>
                              <div className="text-sm text-red-700 font-mono whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                                {executionResult.compile_output}
                              </div>
                            </div>
                          )}
                          
                          {/* Runtime Error (stderr) */}
                          {executionResult.stderr && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="text-sm font-medium text-red-800 mb-1 flex items-center">
                                <i className="ri-bug-line mr-2"></i>
                                Runtime Error
                              </div>
                              <div className="text-sm text-red-700 font-mono whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                                {executionResult.stderr}
                              </div>
                            </div>
                          )}
                          
                          {/* Output (stdout) - Always show if exists, even if empty */}
                          {(executionResult.stdout !== null && executionResult.stdout !== undefined) && (
                            <div className="bg-gray-900 text-green-400 border border-gray-700 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <i className="ri-terminal-box-line mr-2"></i>
                                Output
                              </div>
                              <div className="text-sm font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                                {executionResult.stdout || <span className="text-gray-500 italic">(No output)</span>}
                              </div>
                            </div>
                          )}
                          
                          {/* Show message if no output and no errors */}
                          {!executionResult.stdout && !executionResult.stderr && !executionResult.compile_output && !executionResult.error && executionResult.status && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="text-sm text-blue-700">
                                <i className="ri-information-line mr-2"></i>
                                Code executed successfully. No output was produced.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                {(currentQuestion.type === 'fill-in-blanks' || currentQuestion.type === 'fill-blanks') && (() => {
                  // Parse blank positions from question text if not provided
                  const questionText = currentQuestion.question || '';
                  let blankPositions = currentQuestion.blankPositions;
                  
                  // If blankPositions not provided, parse from question text
                  if (!blankPositions || blankPositions.length === 0) {
                    // Split by underscores (2 or more) to find blanks
                    const parts = questionText.split(/_{2,}/);
                    
                    if (parts.length > 1) {
                      // Create blank positions from split parts
                      blankPositions = [];
                      for (let i = 0; i < parts.length; i++) {
                        if (i < parts.length - 1) {
                          blankPositions.push({
                            before: parts[i],
                            after: i === parts.length - 2 ? parts[parts.length - 1] : ''
                          });
                        }
                      }
                      // Set after text for the last blank
                      if (blankPositions.length > 0) {
                        blankPositions[blankPositions.length - 1].after = parts[parts.length - 1];
                      }
                    } else {
                      // No blanks found in text, create a single blank
                      blankPositions = [{ before: questionText, after: '' }];
                    }
                  }
                  
                  return (
                    <div className="space-y-3">
                      <div className="text-gray-700 leading-relaxed text-base">
                        {blankPositions && blankPositions.length > 0 ? (
                          blankPositions.map((blank: any, index: number) => (
                            <span key={index} className="inline">
                              {String(blank.before || '')}
                              <input
                                type="text"
                                value={answers[`${currentQuestion.id}_${index}`] || ''}
                                onChange={(e) => handleAnswerChange(`${currentQuestion.id}_${index}`, e.target.value)}
                                className="inline-block mx-2 px-3 py-2 border-b-2 border-blue-500 bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] text-center font-medium"
                                placeholder="___"
                              />
                              {index === blankPositions.length - 1 && String(blank.after || '')}
                            </span>
                          ))
                        ) : (
                          // Fallback display
                          <div className="space-y-2">
                            <p className="mb-4">{questionText}</p>
                            <div className="text-sm text-gray-600 italic mb-3">
                              Please enter your answers:
                            </div>
                            {questionText.split(/_{2,}/).filter((_: string, index: number, arr: string[]) => 
                              index < arr.length - 1
                            ).map((_: any, index: number) => (
                              <div key={index} className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Blank {index + 1}:
                                </label>
                                <input
                                  type="text"
                                  value={answers[`${currentQuestion.id}_${index}`] || ''}
                                  onChange={(e) => handleAnswerChange(`${currentQuestion.id}_${index}`, e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={`Enter answer for blank ${index + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
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