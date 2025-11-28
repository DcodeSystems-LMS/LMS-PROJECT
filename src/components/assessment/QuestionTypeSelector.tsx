import React, { useEffect } from 'react';

export interface QuestionType {
  id: string;
  name: string;
  description: string;
  icon: string;
  supportsOptions: boolean;
  supportsFileUpload: boolean;
  supportsCode: boolean;
}

interface QuestionTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  disabled?: boolean;
  codingOnly?: boolean; // Restrict to coding questions only
}

const questionTypes: QuestionType[] = [
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Single correct answer from multiple options',
    icon: 'ri-checkbox-circle-line',
    supportsOptions: true,
    supportsFileUpload: false,
    supportsCode: false
  },
  {
    id: 'multiple-select',
    name: 'Multiple Select',
    description: 'Multiple correct answers from options',
    icon: 'ri-checkbox-multiple-line',
    supportsOptions: true,
    supportsFileUpload: false,
    supportsCode: false
  },
  {
    id: 'true-false',
    name: 'True/False',
    description: 'Binary choice between true or false',
    icon: 'ri-toggle-line',
    supportsOptions: false,
    supportsFileUpload: false,
    supportsCode: false
  },
  {
    id: 'short-answer',
    name: 'Short Answer',
    description: 'Brief text response (1-2 sentences)',
    icon: 'ri-edit-line',
    supportsOptions: false,
    supportsFileUpload: false,
    supportsCode: false
  },
  {
    id: 'essay',
    name: 'Essay',
    description: 'Detailed written response',
    icon: 'ri-file-text-line',
    supportsOptions: false,
    supportsFileUpload: false,
    supportsCode: false
  },
  {
    id: 'coding',
    name: 'Coding Challenge',
    description: 'Programming problem with code submission',
    icon: 'ri-code-line',
    supportsOptions: false,
    supportsFileUpload: false,
    supportsCode: true
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    description: 'Submit files (PDF, Word, PPT, etc.)',
    icon: 'ri-upload-line',
    supportsOptions: false,
    supportsFileUpload: true,
    supportsCode: false
  },
  {
    id: 'fill-blanks',
    name: 'Fill in the Blanks',
    description: 'Complete missing parts in text',
    icon: 'ri-edit-2-line',
    supportsOptions: false,
    supportsFileUpload: false,
    supportsCode: false
  }
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
  codingOnly = false
}) => {
  // Filter question types if codingOnly is enabled
  const availableTypes = codingOnly 
    ? questionTypes.filter(type => type.id === 'coding' || type.id === 'coding-challenge')
    : questionTypes;
  
  // Ensure selected type is valid when codingOnly is enabled
  useEffect(() => {
    if (codingOnly && selectedType !== 'coding' && selectedType !== 'coding-challenge') {
      onTypeChange('coding');
    }
  }, [codingOnly, selectedType, onTypeChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Question Type *
        {codingOnly && (
          <span className="ml-2 text-xs text-blue-600 font-normal">
            (Coding challenges only)
          </span>
        )}
      </label>
      {codingOnly && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <i className="ri-information-line mr-1"></i>
          Coding-only mode is enabled. Only coding challenge questions can be created.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onTypeChange(type.id)}
            disabled={disabled}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <i className={`text-lg ${
                  selectedType === type.id ? 'text-blue-600' : 'text-gray-600'
                } ${type.icon}`}></i>
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  selectedType === type.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {type.name}
                </h4>
                <p className={`text-sm ${
                  selectedType === type.id ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {type.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionTypeSelector;
