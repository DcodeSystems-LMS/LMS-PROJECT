import React, { useState } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';
import DataService from '@/services/dataService';

interface QuestionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  onQuestionCreated: (question: any) => void;
}

const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  isOpen,
  onClose,
  assessmentId,
  onQuestionCreated
}) => {
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'file-upload' | 'fill-in-blanks'>('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [wordLimit, setWordLimit] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [codeTemplate, setCodeTemplate] = useState('');
  const [fileTypes, setFileTypes] = useState<string[]>([]);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [blankPositions, setBlankPositions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: 'ri-checkbox-line', description: 'Single correct answer from multiple options' },
    { value: 'multiple-select', label: 'Multiple Select', icon: 'ri-checkbox-multiple-line', description: 'Multiple correct answers from options' },
    { value: 'true-false', label: 'True/False', icon: 'ri-toggle-line', description: 'Binary choice between true or false' },
    { value: 'short-answer', label: 'Short Answer', icon: 'ri-pencil-line', description: 'Brief text response (1-2 sentences)' },
    { value: 'essay', label: 'Essay', icon: 'ri-file-text-line', description: 'Detailed written response' },
    { value: 'coding-challenge', label: 'Coding Challenge', icon: 'ri-code-line', description: 'Programming problem with code submission' },
    { value: 'file-upload', label: 'File Upload', icon: 'ri-upload-line', description: 'Submit files (PDF, Word, PPT, etc.)' },
    { value: 'fill-in-blanks', label: 'Fill in the Blanks', icon: 'ri-edit-line', description: 'Complete missing parts in text' }
  ];

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


  const handleAddBlank = () => {
    setBlankPositions([...blankPositions, { before: '', after: '' }]);
  };

  const handleRemoveBlank = (index: number) => {
    setBlankPositions(blankPositions.filter((_, i) => i !== index));
  };

  const handleBlankChange = (index: number, field: 'before' | 'after', value: string) => {
    const newBlanks = [...blankPositions];
    newBlanks[index][field] = value;
    setBlankPositions(newBlanks);
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    // Validate correct answer based on question type
    if (questionType === 'multiple-choice' && !correctAnswer.trim()) {
      alert('Please select a correct answer');
      return;
    }

    if (questionType === 'multiple-select' && correctAnswers.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    if ((questionType === 'true-false' || questionType === 'short-answer' || questionType === 'essay') && !correctAnswer.trim()) {
      alert('Please enter a correct answer');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert correct answers to indices for multiple choice and multiple select
      let processedCorrectAnswer = correctAnswer;
      let processedCorrectAnswers = correctAnswers;
      
      if (questionType === 'multiple-choice') {
        // Find the index of the correct answer in the options
        const correctIndex = options.findIndex(option => option === correctAnswer);
        processedCorrectAnswer = correctIndex.toString();
      } else if (questionType === 'multiple-select') {
        // Convert correct answers to indices
        processedCorrectAnswers = correctAnswers.map(answer => {
          const index = options.findIndex(option => option === answer);
          return index.toString();
        });
      }
      
      const questionData = {
        assessment_id: assessmentId,
        question_text: questionText,
        question_type: questionType,
        options: questionType === 'multiple-choice' || questionType === 'multiple-select' ? options.filter(o => o.trim()) : [],
        correct_answer: processedCorrectAnswer,
        correct_answers: processedCorrectAnswers.filter(a => a.trim()),
        explanation,
        points,
        difficulty_level: difficulty,
        tags,
        word_limit: wordLimit,
        time_limit: timeLimit,
        code_language: codeLanguage,
        code_template: codeTemplate,
        file_types: fileTypes,
        max_file_size: maxFileSize * 1024 * 1024, // Convert MB to bytes
        allowed_extensions: allowedExtensions,
        blank_positions: blankPositions
      };

      console.log('🔍 Creating question with data:', {
        question_text: questionText,
        question_type: questionType,
        options: questionData.options,
        correct_answer: correctAnswer,
        correct_answers: correctAnswers
      });

      const { data, error } = await DataService.createQuestion(questionData);

      if (error) {
        console.error('Error creating question:', error);
        alert('Failed to create question. Please try again.');
        return;
      }

      console.log('Question created successfully:', data);
      onQuestionCreated(data);
      
      // Reset form
      setQuestionText('');
      setOptions(['']);
      setCorrectAnswer('');
      setCorrectAnswers([]);
      setExplanation('');
      setPoints(1);
      setTags([]);
      setWordLimit(null);
      setTimeLimit(null);
      setCodeLanguage('');
      setCodeTemplate('');
      setFileTypes([]);
      setMaxFileSize(10);
      setAllowedExtensions([]);
      setBlankPositions([]);
      
      onClose();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Question" size="lg">
      <div className="space-y-6">
        {/* Question Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Question Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {questionTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setQuestionType(type.value as any)}
                className={`p-3 rounded-lg border-2 transition-colors text-left ${
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
            rows={3}
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
                  {options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <i className="ri-add-line mr-2"></i>
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Correct Answer(s) */}
        {questionType === 'multiple-choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select correct answer</option>
              {options.filter(o => o.trim()).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {correctAnswer && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                <i className="ri-check-line mr-1"></i>
                Selected: "{correctAnswer}"
              </div>
            )}
          </div>
        )}

        {questionType === 'multiple-select' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answers * (Select multiple)
            </label>
            <div className="space-y-2">
              {options.filter(o => o.trim()).map((option, index) => (
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
              {correctAnswers.length > 0 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <i className="ri-check-line mr-1"></i>
                  Selected: {correctAnswers.length} answer(s)
                </div>
              )}
            </div>
          </div>
        )}

        {(questionType === 'true-false' || questionType === 'short-answer' || questionType === 'essay') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter correct answer"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Essay-specific fields */}
        {questionType === 'essay' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Word Limit
            </label>
            <input
              type="number"
              value={wordLimit || ''}
              onChange={(e) => setWordLimit(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Optional word limit"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Coding Challenge-specific fields */}
        {questionType === 'coding-challenge' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <input
                type="text"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                placeholder="e.g., JavaScript, Python, Java"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Template
              </label>
              <textarea
                value={codeTemplate}
                onChange={(e) => setCodeTemplate(e.target.value)}
                placeholder="Optional code template for students"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={timeLimit || ''}
                onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Optional time limit"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* File Upload-specific fields */}
        {questionType === 'file-upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <input
                type="text"
                value={allowedExtensions.join(', ')}
                onChange={(e) => setAllowedExtensions(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="e.g., pdf, doc, docx, ppt, pptx"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Fill in the Blanks-specific fields */}
        {questionType === 'fill-in-blanks' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blank Positions
            </label>
            <div className="space-y-2">
              {blankPositions.map((blank, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={blank.before}
                    onChange={(e) => handleBlankChange(index, 'before', e.target.value)}
                    placeholder="Text before blank"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">___</span>
                  <input
                    type="text"
                    value={blank.after}
                    onChange={(e) => handleBlankChange(index, 'after', e.target.value)}
                    placeholder="Text after blank"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBlank(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddBlank}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <i className="ri-add-line mr-2"></i>
                Add Blank Position
              </button>
            </div>
          </div>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation for the correct answer"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionCreator;
