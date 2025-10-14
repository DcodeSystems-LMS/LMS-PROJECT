import React, { useState } from 'react';
import QuestionTypeSelector, { QuestionType } from './QuestionTypeSelector';

export interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  points: number;
  order_index: number;
  file_types?: string[];
  code_language?: string;
  test_cases?: any[];
}

interface QuestionEditorProps {
  question?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Question>(question || {
    id: '',
    type: 'multiple-choice',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    points: 1,
    order_index: 0,
    file_types: [],
    code_language: 'javascript',
    test_cases: []
  });

  const [newOption, setNewOption] = useState('');

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type,
      options: type === 'multiple-choice' || type === 'multiple-select' 
        ? ['', '', '', ''] 
        : undefined,
      correct_answer: type === 'true-false' ? 'true' : '',
      file_types: type === 'file-upload' ? ['pdf', 'doc', 'docx', 'ppt', 'pptx'] : undefined
    }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question_text.trim()) {
      alert('Please enter a question');
      return;
    }

    if ((formData.type === 'multiple-choice' || formData.type === 'multiple-select') && 
        (!formData.options || formData.options.filter(opt => opt.trim()).length < 2)) {
      alert('Please provide at least 2 options');
      return;
    }

    if (!formData.correct_answer) {
      alert('Please specify the correct answer');
      return;
    }

    onSave({
      ...formData,
      id: formData.id || `q_${Date.now()}`
    });
  };

  const renderOptionsSection = () => {
    if (!formData.options) return null;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Options *
        </label>
        {formData.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type={formData.type === 'multiple-select' ? 'checkbox' : 'radio'}
              name={formData.type === 'multiple-select' ? `correct_answer_${index}` : 'correct_answer'}
              value={index}
              checked={formData.type === 'multiple-select' 
                ? (formData.correct_answer || '').split(',').includes(index.toString())
                : formData.correct_answer === index.toString()
              }
              onChange={(e) => {
                if (formData.type === 'multiple-select') {
                  const currentAnswers = (formData.correct_answer || '').split(',').filter(a => a !== '');
                  if (e.target.checked) {
                    const newAnswers = [...currentAnswers, index.toString()];
                    setFormData(prev => ({ ...prev, correct_answer: newAnswers.join(',') }));
                  } else {
                    const newAnswers = currentAnswers.filter(a => a !== index.toString());
                    setFormData(prev => ({ ...prev, correct_answer: newAnswers.join(',') }));
                  }
                } else {
                  setFormData(prev => ({
                    ...prev,
                    correct_answer: e.target.checked ? index.toString() : prev.correct_answer
                  }));
                }
              }}
              className="text-blue-600 focus:ring-blue-500"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        ))}
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addOption}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        {formData.type === 'multiple-select' && formData.correct_answer && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            <i className="ri-check-line mr-1"></i>
            Selected: {(formData.correct_answer || '').split(',').filter(a => a !== '').length} answer(s)
          </div>
        )}
      </div>
    );
  };

  const renderTrueFalseSection = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Correct Answer *
      </label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="correct_answer"
            value="true"
            checked={formData.correct_answer === 'true'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              correct_answer: e.target.value
            }))}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2">True</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="correct_answer"
            value="false"
            checked={formData.correct_answer === 'false'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              correct_answer: e.target.value
            }))}
            className="text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2">False</span>
        </label>
      </div>
    </div>
  );

  const renderFileUploadSection = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Allowed File Types
      </label>
      <div className="flex flex-wrap gap-2">
        {['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png'].map(type => (
          <label key={type} className="flex items-center">
            <input
              type="checkbox"
              checked={formData.file_types?.includes(type) || false}
              onChange={(e) => {
                const types = formData.file_types || [];
                if (e.target.checked) {
                  setFormData(prev => ({
                    ...prev,
                    file_types: [...types, type]
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    file_types: types.filter(t => t !== type)
                  }));
                }
              }}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">{type.toUpperCase()}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderCodingSection = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Programming Language
        </label>
        <select
          value={formData.code_language}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            code_language: e.target.value
          }))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Output / Sample Answer
        </label>
        <textarea
          value={formData.correct_answer}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            correct_answer: e.target.value
          }))}
          placeholder="Describe the expected output or provide a sample solution..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            question_text: e.target.value
          }))}
          placeholder="Enter your question here..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <QuestionTypeSelector
        selectedType={formData.type}
        onTypeChange={handleTypeChange}
      />

      {formData.type === 'multiple-choice' || formData.type === 'multiple-select' ? renderOptionsSection() : null}
      {formData.type === 'true-false' ? renderTrueFalseSection() : null}
      {formData.type === 'file-upload' ? renderFileUploadSection() : null}
      {formData.type === 'coding' ? renderCodingSection() : null}

      {(formData.type === 'short-answer' || formData.type === 'essay' || formData.type === 'fill-blanks') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sample Answer / Key Points
          </label>
          <textarea
            value={formData.correct_answer}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              correct_answer: e.target.value
            }))}
            placeholder="Provide a sample answer or key points for grading..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              points: parseInt(e.target.value) || 1
            }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            explanation: e.target.value
          }))}
          placeholder="Provide explanation for the correct answer..."
          rows={2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionEditor;
