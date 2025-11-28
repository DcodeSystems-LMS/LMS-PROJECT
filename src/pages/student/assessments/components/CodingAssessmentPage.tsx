import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Button from '@/components/base/Button';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import { supabase } from '@/lib/supabase';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { useJudge0Runner } from '@/hooks/useJudge0Runner';
import { getLanguageId, getMonacoLanguage, getDefaultCode } from '@/utils/languageMap';
import AssessmentCelebration from '@/components/celebration/AssessmentCelebration';

interface Question {
  id: string;
  question: string;
  type: 'coding-challenge' | 'coding';
  points: number;
  timeLimit?: number;
  codeLanguage?: string;
  codeTemplate?: string;
  testCases?: any[];
}

interface CodingAssessmentPageProps {
  assessmentId: string;
  assessmentTitle: string;
  duration: string;
  onComplete: (score: number, answers: Record<string, string>) => void;
  onClose: () => void;
}

const CodingAssessmentPage: React.FC<CodingAssessmentPageProps> = ({
  assessmentId,
  assessmentTitle,
  duration,
  onComplete,
  onClose
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Code execution state
  const [codeExecutionResults, setCodeExecutionResults] = useState<Record<string, {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    status: string | null;
    error: string | null;
  }>>({});
  const [stdinInputs, setStdinInputs] = useState<Record<string, string>>({});
  const { run: runCode, isRunning: isCodeRunning, result: codeResult, error: codeError, statusLabel: codeStatusLabel, reset: resetCodeRunner } = useJudge0Runner();

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const questionsData = await DataService.getAssessmentQuestions(assessmentId);

        if (questionsData && questionsData.length > 0) {
          const transformedQuestions = questionsData.map((q: any) => {
            let questionType = q.question_type || q.type;
            
            // Normalize to coding-challenge
            if (questionType === 'coding_challenge' || questionType === 'coding') {
              questionType = 'coding-challenge';
            }

            return {
              id: q.id,
              question: q.question_text || q.question,
              type: questionType as 'coding-challenge',
              points: q.points || 1,
              timeLimit: q.time_limit,
              codeLanguage: q.code_language || q.codeLanguage || 'Python',
              codeTemplate: q.code_template || q.codeTemplate,
              testCases: q.test_cases || q.testCases
            };
          });

          setQuestions(transformedQuestions);
        } else {
          setError('No questions found for this assessment');
        }
      } catch (err) {
        console.error('❌ Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [assessmentId]);

  // Initialize timer and attempt tracking
  useEffect(() => {
    if (questions.length > 0) {
      // Parse duration
      const durationMatch = duration.match(/(\d+)/);
      const minutes = durationMatch ? parseInt(durationMatch[1]) : 30;
      setTimeRemaining(minutes * 60);
      
      // Start assessment attempt
      startAssessmentAttempt();

      // Initialize code answers with templates
      questions.forEach((q) => {
        if (!answers[q.id]) {
          const language = normalizeLanguageName(q.codeLanguage || 'Python');
          const initialCode = q.codeTemplate || getDefaultCode(language);
          if (initialCode) {
            setAnswers(prev => ({
              ...prev,
              [q.id]: initialCode
            }));
          }
        }
      });
    }
  }, [questions.length]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining > 0 && !isSubmitting) {
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
  }, [timeRemaining, isSubmitting]);

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
      
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: result
      }));
    }
  }, [codeResult, codeStatusLabel, codeError]);

  const startAssessmentAttempt = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('start_assessment_attempt', {
        p_student_id: user.id,
        p_assessment_id: assessmentId
      });

      if (error) {
        console.error('❌ RPC function failed:', error);
        // Try to find existing attempt
        const { data: existingAttempt } = await supabase
          .from('assessment_attempts')
          .select('id')
          .eq('student_id', user.id)
          .eq('assessment_id', assessmentId)
          .eq('status', 'in-progress')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (existingAttempt) {
          setAttemptId(existingAttempt.id);
        } else {
          // Fallback: create attempt with explicit UUID
          const attemptUUID = crypto.randomUUID();
          const { data: insertData } = await supabase
            .from('assessment_attempts')
            .insert({
              id: attemptUUID,
              student_id: user.id,
              assessment_id: assessmentId,
              attempt_number: 1,
              status: 'in-progress',
              started_at: new Date().toISOString()
            })
            .select('id')
            .single();
          
          if (insertData) {
            setAttemptId(insertData.id);
          }
        }
      } else {
        setAttemptId(data);
      }
    } catch (err) {
      console.error('❌ Error starting assessment attempt:', err);
    }
  };

  const normalizeLanguageName = (lang: string | undefined): string => {
    if (!lang) return 'Python';
    const normalized = lang.trim().toLowerCase();
    const languageMap: Record<string, string> = {
      'python': 'Python', 'py': 'Python', 'python3': 'Python',
      'javascript': 'JavaScript', 'js': 'JavaScript', 'nodejs': 'JavaScript',
      'java': 'Java',
      'c++': 'C++', 'cpp': 'C++', 'cplusplus': 'C++',
      'c': 'C',
      'go': 'Go', 'golang': 'Go',
      'ruby': 'Ruby', 'rb': 'Ruby',
      'php': 'PHP',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'typescript': 'TypeScript', 'ts': 'TypeScript',
      'c#': 'C#', 'csharp': 'C#', 'cs': 'C#',
    };
    return languageMap[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, code: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: code
    }));
  };

  const handleRunCode = async () => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    const code = answers[questionId] || '';

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

    const rawLanguageName = currentQuestion.codeLanguage || 'Python';
    const languageName = normalizeLanguageName(rawLanguageName);
    const languageId = getLanguageId(languageName);

    if (!languageId) {
      setCodeExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          stdout: null,
          stderr: null,
          compile_output: null,
          status: null,
          error: `Language "${rawLanguageName}" is not supported.`
        }
      }));
      return;
    }

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

    const stdin = stdinInputs[questionId] || '';

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
          error: err instanceof Error ? err.message : 'Execution failed.'
        }
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetCodeRunner();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetCodeRunner();
    }
  };

  const calculateScore = () => {
    // For coding challenges, we'll use a simple scoring method
    // In production, you'd want to run test cases against the code
    let totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    // For now, return a placeholder score
    // You can implement test case execution here
    return { score: 0, totalPoints };
  };

  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      submitAssessment();
    }, 1000);
  };

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmSubmit(false);
    setIsSubmitting(true);
    await submitAssessment();
  };

  const submitAssessment = async () => {
    try {
      const { score, totalPoints } = calculateScore();
      
      // Save attempt
      if (attemptId) {
        const timeSpent = Math.floor((timeRemaining > 0 ? (parseInt(duration.match(/(\d+)/)?.[1] || '30') * 60 - timeRemaining) : parseInt(duration.match(/(\d+)/)?.[1] || '30') * 60) / 60);
        
        await supabase.rpc('complete_assessment_attempt', {
          p_attempt_id: attemptId,
          p_score: score,
          p_answers: answers,
          p_time_spent: timeSpent
        }).catch(err => {
          console.error('Error completing attempt:', err);
          // Try direct update
          supabase
            .from('assessment_attempts')
            .update({
              completed_at: new Date().toISOString(),
              score: score,
              answers: answers,
              time_spent: timeSpent,
              status: 'completed'
            })
            .eq('id', attemptId);
        });
      }

      setFinalScore(score);
      setShowCelebration(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setIsSubmitting(false);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setIsSubmitting(false);
    onComplete(finalScore, answers);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <SimpleDCODESpinner size="md" />
          <p className="mt-4 text-white">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <i className="ri-error-warning-line text-4xl text-red-600 mb-4"></i>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Assessment</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const questionId = currentQuestion.id;
  const rawCodeLanguage = currentQuestion.codeLanguage || 'Python';
  const codeLanguage = normalizeLanguageName(rawCodeLanguage);
  const monacoLanguage = getMonacoLanguage(codeLanguage);
  const codeValue = answers[questionId] || currentQuestion.codeTemplate || getDefaultCode(codeLanguage);
  const executionResult = codeExecutionResults[questionId];

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 text-white overflow-hidden z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Exit Assessment"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <div>
              <h1 className="text-lg font-bold">{assessmentTitle}</h1>
              <p className="text-sm text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className={`text-2xl font-mono ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-gray-400">Time remaining</div>
            </div>
            {currentQuestionIndex === questions.length - 1 && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Assessment
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Question */}
          <div className="w-1/2 border-r border-gray-700 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold flex-1">{currentQuestion.question}</h2>
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full ml-4">
                  {currentQuestion.points} pts
                </span>
              </div>

              {currentQuestion.codeTemplate && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="text-xs text-gray-400 mb-2">Starter Code:</div>
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {currentQuestion.codeTemplate}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor & Results */}
          <div className="w-1/2 flex flex-col">
            {/* Editor Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{codeLanguage} Code Editor</span>
                {currentQuestion.timeLimit && (
                  <span className="text-xs text-gray-400">
                    Time limit: {currentQuestion.timeLimit} minutes
                  </span>
                )}
              </div>
              <Button
                onClick={handleRunCode}
                disabled={isCodeRunning}
                variant="outline"
                size="sm"
                className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
              >
                {isCodeRunning ? (
                  <>
                    <SimpleDCODESpinner size="xs" className="scale-75" />
                    <span className="ml-2">Running...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-play-line"></i>
                    <span className="ml-2">Run Code</span>
                  </>
                )}
              </Button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={monacoLanguage}
                value={codeValue}
                onChange={(value) => handleAnswerChange(questionId, value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Stdin Input */}
            <div className="bg-gray-800 border-t border-gray-700">
              <div className="px-4 py-2 border-b border-gray-700">
                <label className="text-sm font-medium flex items-center">
                  <i className="ri-terminal-box-line mr-2"></i>
                  Standard Input (stdin)
                </label>
              </div>
              <textarea
                value={stdinInputs[questionId] || ''}
                onChange={(e) => setStdinInputs(prev => ({
                  ...prev,
                  [questionId]: e.target.value
                }))}
                placeholder="Enter input for your program..."
                className="w-full h-24 px-4 py-3 bg-gray-900 border-0 focus:outline-none text-white font-mono resize-none"
                disabled={isCodeRunning}
              />
            </div>

            {/* Execution Results */}
            {executionResult && (
              <div className="bg-gray-800 border-t border-gray-700 overflow-y-auto" style={{ maxHeight: '200px' }}>
                <div className="p-4 space-y-3">
                  {executionResult.status && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      executionResult.status === 'Accepted' 
                        ? 'bg-green-900/50 text-green-400 border border-green-700'
                        : executionResult.status.includes('Error')
                        ? 'bg-red-900/50 text-red-400 border border-red-700'
                        : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                    }`}>
                      Status: {executionResult.status}
                    </div>
                  )}
                  
                  {executionResult.error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-400 mb-1">Error</div>
                      <div className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                        {executionResult.error}
                      </div>
                    </div>
                  )}
                  
                  {executionResult.compile_output && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-400 mb-1">Compilation Error</div>
                      <div className="text-sm text-red-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {executionResult.compile_output}
                      </div>
                    </div>
                  )}
                  
                  {executionResult.stderr && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-400 mb-1">Runtime Error</div>
                      <div className="text-sm text-red-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {executionResult.stderr}
                      </div>
                    </div>
                  )}
                  
                  {executionResult.stdout !== null && executionResult.stdout !== undefined && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-300 mb-2">Output</div>
                      <div className="text-sm text-green-400 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {executionResult.stdout || <span className="text-gray-500 italic">(No output)</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Submit Assessment?</h3>
            <p className="text-gray-300 mb-6">
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmSubmit(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={confirmSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}

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

export default CodingAssessmentPage;

