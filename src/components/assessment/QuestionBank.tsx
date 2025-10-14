import React, { useState, useEffect } from 'react';
import { Question } from './QuestionEditor';

interface QuestionBankProps {
  onSelectQuestions: (questions: Question[]) => void;
  selectedQuestions: Question[];
  mentorId: string;
}

interface QuestionBankItem extends Question {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  usage_count?: number;
  created_at: string;
}

const QuestionBank: React.FC<QuestionBankProps> = ({
  onSelectQuestions,
  selectedQuestions,
  mentorId
}) => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    loadQuestions();
  }, [mentorId]);

  const loadQuestions = async () => {
    setLoading(true);
    // TODO: Replace with actual API call
    const mockQuestions: QuestionBankItem[] = [
      {
        id: 'q1',
        type: 'multiple-choice',
        question_text: 'What is the primary purpose of React hooks?',
        options: ['State management', 'Component styling', 'API calls', 'All of the above'],
        correct_answer: '0',
        explanation: 'React hooks are primarily used for state management in functional components.',
        points: 2,
        order_index: 1,
        category: 'React',
        difficulty: 'medium',
        tags: ['react', 'hooks', 'state'],
        usage_count: 5,
        created_at: '2024-01-15'
      },
      {
        id: 'q2',
        type: 'true-false',
        question_text: 'JavaScript is a statically typed language.',
        correct_answer: 'false',
        explanation: 'JavaScript is a dynamically typed language.',
        points: 1,
        order_index: 2,
        category: 'JavaScript',
        difficulty: 'easy',
        tags: ['javascript', 'types'],
        usage_count: 12,
        created_at: '2024-01-10'
      },
      {
        id: 'q3',
        type: 'coding',
        question_text: 'Write a function to reverse a string in JavaScript.',
        correct_answer: 'function reverseString(str) { return str.split("").reverse().join(""); }',
        explanation: 'The function splits the string into an array, reverses it, and joins it back.',
        points: 5,
        order_index: 3,
        category: 'JavaScript',
        difficulty: 'medium',
        tags: ['javascript', 'algorithms', 'strings'],
        usage_count: 8,
        created_at: '2024-01-12'
      }
    ];
    
    setQuestions(mockQuestions);
    setFilteredQuestions(mockQuestions);
    setLoading(false);
  };

  useEffect(() => {
    filterQuestions();
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedType, questions]);

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    if (selectedType) {
      filtered = filtered.filter(q => q.type === selectedType);
    }

    setFilteredQuestions(filtered);
  };

  const toggleQuestionSelection = (question: QuestionBankItem) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id);
    
    if (isSelected) {
      onSelectQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      onSelectQuestions([...selectedQuestions, question]);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'multiple-choice': 'ri-checkbox-circle-line',
      'multiple-select': 'ri-checkbox-multiple-line',
      'true-false': 'ri-toggle-line',
      'short-answer': 'ri-edit-line',
      'essay': 'ri-file-text-line',
      'coding': 'ri-code-line',
      'file-upload': 'ri-upload-line',
      'fill-blanks': 'ri-edit-2-line'
    };
    return icons[type] || 'ri-question-line';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'easy': 'text-green-600 bg-green-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'hard': 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))];
  const types = [...new Set(questions.map(q => q.type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading question bank...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
        <div className="text-sm text-gray-600">
          {selectedQuestions.length} selected
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No questions found matching your criteria.
          </div>
        ) : (
          filteredQuestions.map(question => {
            const isSelected = selectedQuestions.some(q => q.id === question.id);
            
            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleQuestionSelection(question)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className={`text-lg ${getTypeIcon(question.type)}`}></i>
                      <span className="text-sm font-medium text-gray-600">
                        {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {question.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {question.points} pts
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-2">{question.question_text}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {question.category && (
                        <span className="flex items-center">
                          <i className="ri-folder-line mr-1"></i>
                          {question.category}
                        </span>
                      )}
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        Used {question.usage_count || 0} times
                      </span>
                      <span className="flex items-center">
                        <i className="ri-calendar-line mr-1"></i>
                        {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {question.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuestionSelection(question)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
