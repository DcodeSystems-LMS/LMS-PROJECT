import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/base/Card';
import DataService from '@/services/dataService';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'mentor' | 'bookmark' | 'job' | 'internship' | 'discussion';
  description: string;
  url: string;
  metadata?: {
    instructor?: string;
    company?: string;
    courseTitle?: string;
    priority?: string;
    status?: string;
  };
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await DataService.searchContent(searchTerm);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getTypeIcon = (type: string) => {
    const icons = {
      'course': 'ri-book-line',
      'mentor': 'ri-user-line',
      'bookmark': 'ri-bookmark-line',
      'job': 'ri-briefcase-line',
      'internship': 'ri-graduation-cap-line',
      'discussion': 'ri-question-line'
    };
    return icons[type as keyof typeof icons] || 'ri-search-line';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'course': 'text-blue-600 bg-blue-100',
      'mentor': 'text-purple-600 bg-purple-100',
      'bookmark': 'text-orange-600 bg-orange-100',
      'job': 'text-green-600 bg-green-100',
      'internship': 'text-indigo-600 bg-indigo-100',
      'discussion': 'text-yellow-600 bg-yellow-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const handleResultClick = () => {
    setSearchTerm('');
    setResults([]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-4 pt-16 pb-20">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative w-full max-w-2xl">
          <Card className="overflow-hidden">
            {/* Search Input */}
            <div className="relative p-6 border-b border-gray-200">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search courses, mentors, bookmarks, jobs..."
                  className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to close
              </p>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching && (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              )}

              {!isSearching && searchTerm && results.length === 0 && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-search-line text-xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">No results found</p>
                  <p className="text-sm text-gray-500">Try searching for courses, mentors, or jobs</p>
                </div>
              )}

              {!searchTerm && (
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Access</h3>
                  <div className="space-y-2">
                    <Link
                      to="/courses"
                      onClick={handleResultClick}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="ri-book-line text-blue-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">Browse Courses</p>
                        <p className="text-sm text-gray-500">Explore available courses</p>
                      </div>
                    </Link>
                    <Link
                      to="/mentors"
                      onClick={handleResultClick}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="ri-user-line text-purple-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-purple-600">Find Mentors</p>
                        <p className="text-sm text-gray-500">Connect with expert mentors</p>
                      </div>
                    </Link>
                    <Link
                      to="/student/placements"
                      onClick={handleResultClick}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="ri-briefcase-line text-green-600"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-green-600">Job Opportunities</p>
                        <p className="text-sm text-gray-500">Discover job placements</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      to={result.url}
                      onClick={handleResultClick}
                      className="flex items-start p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getTypeColor(result.type)}`}>
                        <i className={`${getTypeIcon(result.type)}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {result.title}
                          </p>
                          <span className="text-xs text-gray-500 capitalize ml-2">
                            {result.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                          {result.description}
                        </p>
                        {result.metadata && (
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            {result.metadata.instructor && (
                              <span>
                                <i className="ri-user-line mr-1"></i>
                                {result.metadata.instructor}
                              </span>
                            )}
                            {result.metadata.company && (
                              <span>
                                <i className="ri-building-line mr-1"></i>
                                {result.metadata.company}
                              </span>
                            )}
                            {result.metadata.courseTitle && (
                              <span>
                                <i className="ri-book-line mr-1"></i>
                                {result.metadata.courseTitle}
                              </span>
                            )}
                            {result.metadata.priority && (
                              <span className={`px-2 py-0.5 rounded-full ${
                                result.metadata.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {result.metadata.priority} priority
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <i className="ri-arrow-right-line text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"></i>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;