// Enhanced QuestionCreator Component
// Supports all question types with proper storage

import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';

interface EnhancedQuestionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  onQuestionCreated: (question: any) => void;
}

const EnhancedQuestionCreator: React.FC<EnhancedQuestionCreatorProps> = ({
  isOpen,
  onClose,
  assessmentId,
  onQuestionCreated
}) => {
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'file-upload' | 'fill-in-blanks' | 'practical' | 'code-review' | 'case-study'>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [modelAnswer, setModelAnswer] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState<any[]>([]);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [wordLimit, setWordLimit] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeTemplate, setCodeTemplate] = useState('');
  const [testCases, setTestCases] = useState<any[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [blankPositions, setBlankPositions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionTypes = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice', 
      icon: 'ri-checkbox-line', 
      description: 'Single correct answer from multiple options',
      autoGradable: true
    },
    { 
      value: 'multiple-select', 
      label: 'Multiple Select', 
      icon: 'ri-checkbox-multiple-line', 
      description: 'Multiple correct answers from options',
      autoGradable: true
    },
    { 
      value: 'true-false', 
      label: 'True/False', 
      icon: 'ri-toggle-line', 
      description: 'Binary choice between true or false',
      autoGradable: true
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer', 
      icon: 'ri-pencil-line', 
      description: 'Brief text response (1-2 sentences)',
      autoGradable: true
    },
    { 
      value: 'essay', 
      label: 'Essay', 
      icon: 'ri-file-text-line', 
      description: 'Detailed written response requiring manual grading',
      autoGradable: false
    },
    { 
      value: 'coding-challenge', 
      label: 'Coding Challenge', 
      icon: 'ri-code-line', 
      description: 'Programming problem with code submission',
      autoGradable: false
    },
    { 
      value: 'file-upload', 
      label: 'File Upload', 
      icon: 'ri-upload-line', 
      description: 'Submit files (PDF, Word, PPT, etc.)',
      autoGradable: false
    },
    { 
      value: 'fill-in-blanks', 
      label: 'Fill in the Blanks', 
      icon: 'ri-edit-line', 
      description: 'Complete missing parts in text',
      autoGradable: true
    },
    { 
      value: 'practical', 
      label: 'Practical', 
      icon: 'ri-tools-line', 
      description: 'Hands-on practical exercise',
      autoGradable: false
    },
    { 
      value: 'code-review', 
      label: 'Code Review', 
      icon: 'ri-eye-line', 
      description: 'Review and analyze provided code',
      autoGradable: false
    },
    { 
      value: 'case-study', 
      label: 'Case Study', 
      icon: 'ri-book-open-line', 
      description: 'Analyze real-world scenarios',
      autoGradable: false
    }
  ];

  const handleTypeChange = (type: string) => {
    setQuestionType(type as any);
    // Reset form based on question type
    if (type === 'multiple-choice' || type === 'multiple-select') {
      setOptions(['', '']);
      setCorrectAnswer('');
      setCorrectAnswers([]);
    } else if (type === 'true-false') {
      setOptions(['True', 'False']);
      setCorrectAnswer('True');
    } else if (type === 'short-answer') {
      setOptions([]);
      setCorrectAnswer('');
    } else if (type === 'essay') {
      setOptions([]);
      setModelAnswer('');
      setEvaluationCriteria([]);
    } else if (type === 'coding-challenge') {
      setOptions([]);
      setCodeTemplate('');
      setTestCases([]);
    } else if (type === 'file-upload') {
      setOptions([]);
      setFileTypes(['pdf', 'doc', 'docx']);
      setAllowedExtensions(['.pdf', '.doc', '.docx']);
    } else if (type === 'fill-in-blanks') {
      setOptions([]);
      setBlankPositions([{ before: '', after: '' }]);
      setCorrectAnswers([]);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddCorrectAnswer = () => {
    setCorrectAnswers([...correctAnswers, '']);
  };

  const handleRemoveCorrectAnswer = (index: number) => {
    setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    const newAnswers = [...correctAnswers];
    newAnswers[index] = value;
    setCorrectAnswers(newAnswers);
  };

  const handleAddEvaluationCriteria = () => {
    setEvaluationCriteria([...evaluationCriteria, { criterion: '', points: 1, description: '' }]);
  };

  const handleRemoveEvaluationCriteria = (index: number) => {
    setEvaluationCriteria(evaluationCriteria.filter((_, i) => i !== index));
  };

  const handleEvaluationCriteriaChange = (index: number, field: string, value: any) => {
    const newCriteria = [...evaluationCriteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setEvaluationCriteria(newCriteria);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', points: 1 }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  const handleAddBlank = () => {
    setBlankPositions([...blankPositions, { before: '', after: '' }]);
  };

  const handleRemoveBlank = (index: number) => {
    setBlankPositions(blankPositions.filter((_, i) => i !== index));
  };

  const handleBlankChange = (index: number, field: string, value: string) => {
    const newBlanks = [...blankPositions];
    newBlanks[index] = { ...newBlanks[index], [field]: value };
    setBlankPositions(newBlanks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    if ((questionType === 'multiple-choice' || questionType === 'multiple-select') && 
        options.filter(opt => opt.trim()).length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    if (questionType === 'multiple-choice' && !correctAnswer) {
      alert('Please select a correct answer');
      return;
    }

    if (questionType === 'multiple-select' && correctAnswers.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    if ((questionType === 'true-false' || questionType === 'short-answer') && !correctAnswer.trim()) {
      alert('Please enter a correct answer');
      return;
    }

    if ((questionType === 'essay' || questionType === 'practical' || questionType === 'code-review' || questionType === 'case-study') && !modelAnswer.trim()) {
      alert('Please provide a model answer or evaluation criteria');
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData = {
        assessment_id: assessmentId,
        question_text: questionText,
        question_type: questionType,
        options: questionType === 'multiple-choice' || questionType === 'multiple-select' ? options : null,
        correct_answer: questionType === 'multiple-choice' || questionType === 'true-false' || questionType === 'short-answer' ? correctAnswer : null,
        correct_answers: questionType === 'multiple-select' || questionType === 'fill-in-blanks' ? correctAnswers : null,
        model_answer: questionType === 'essay' || questionType === 'practical' || questionType === 'code-review' || questionType === 'case-study' ? modelAnswer : null,
        evaluation_criteria: questionType === 'essay' || questionType === 'practical' || questionType === 'code-review' || questionType === 'case-study' ? evaluationCriteria : null,
        explanation: explanation,
        points: points,
        difficulty_level: difficulty,
        tags: tags,
        word_limit: wordLimit,
        time_limit: timeLimit,
        code_language: questionType === 'coding-challenge' ? codeLanguage : null,
        code_template: questionType === 'coding-challenge' ? codeTemplate : null,
        test_cases: questionType === 'coding-challenge' ? testCases : null,
        file_types: questionType === 'file-upload' ? fileTypes : null,
        max_file_size: questionType === 'file-upload' ? maxFileSize : null,
        allowed_extensions: questionType === 'file-upload' ? allowedExtensions : null,
        blank_positions: questionType === 'fill-in-blanks' ? blankPositions : null
      };

      console.log('🔍 Creating question with data:', questionData);

      const { data, error } = await DataService.createQuestion(questionData);

      if (error) {
        console.error('❌ Error creating question:', error);
        alert('Failed to create question: ' + error.message);
        return;
      }

      console.log('✅ Question created successfully:', data);
      onQuestionCreated(data);
      onClose();
      
      // Reset form
      setQuestionText('');
      setOptions(['', '']);
      setCorrectAnswer('');
      setCorrectAnswers([]);
      setModelAnswer('');
      setEvaluationCriteria([]);
      setExplanation('');
      setPoints(1);
      setTags([]);
      setWordLimit(null);
      setTimeLimit(null);
      setCodeLanguage('javascript');
      setCodeTemplate('');
      setTestCases([]);
      setFileTypes([]);
      setMaxFileSize(10);
      setAllowedExtensions([]);
      setBlankPositions([]);

    } catch (error) {
      console.error('❌ Error creating question:', error);
      alert('Failed to create question: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedQuestionType = questionTypes.find(qt => qt.value === questionType);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Question</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Question Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  questionType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`${type.icon} text-lg`}></i>
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                    <div className={`text-xs ${type.autoGradable ? 'text-green-600' : 'text-orange-600'}`}>
                      {type.autoGradable ? 'Auto-graded' : 'Manual grading'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            required
          />
        </div>

        {/* Options for Multiple Choice/Select */}
        {(questionType === 'multiple-choice' || questionType === 'multiple-select') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                    disabled={options.length <= 2}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <i className="ri-add-line mr-1"></i>
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Correct Answer Selection */}
        {questionType === 'multiple-choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select correct answer</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multiple Correct Answers */}
        {questionType === 'multiple-select' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answers *
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={correctAnswers.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCorrectAnswers([...correctAnswers, option]);
                      } else {
                        setCorrectAnswers(correctAnswers.filter(a => a !== option));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* True/False Correct Answer */}
        {questionType === 'true-false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="True"
                  checked={correctAnswer === 'True'}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">True</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="False"
                  checked={correctAnswer === 'False'}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">False</span>
              </label>
            </div>
          </div>
        )}

        {/* Short Answer Correct Answer */}
        {questionType === 'short-answer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter the correct answer"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        )}

        {/* Model Answer for Subjective Questions */}
        {(questionType === 'essay' || questionType === 'practical' || questionType === 'code-review' || questionType === 'case-study') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Answer / Evaluation Criteria *
            </label>
            <textarea
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Provide a model answer or detailed evaluation criteria..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              required
            />
          </div>
        )}

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Provide an explanation for the correct answer..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedQuestionCreator;
