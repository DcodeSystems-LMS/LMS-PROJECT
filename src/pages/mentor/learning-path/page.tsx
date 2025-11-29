import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataService from '@/services/dataService';

interface Topic {
  id: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
  completed?: boolean;
}

interface Unit {
  id: string;
  title: string;
  description?: string;
  order: number;
  topics: Topic[];
  completed?: boolean;
}

const MentorLearningPath: React.FC = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      // Fetch courses or learning path data
      const courses = await DataService.getCourses();
      
      // Mock units structure - replace with actual API call
      const mockUnits: Unit[] = [
        {
          id: '1',
          title: 'Unit 1: Introduction to Python 3',
          description: 'Get started with Python programming',
          order: 1,
          topics: [
            { id: '1.1', title: '1.1: Introduction to Python 3', order: 1, content: 'Python is a high-level programming language...' },
            { id: '1.2', title: '1.2: Accessing the Repl.it IDE', order: 2, content: 'Learn how to access and use the Repl.it IDE...' },
            { id: '1.3', title: '1.3: Python 3 Data Types: int and float', order: 3, content: 'Understanding integers and floating-point numbers...' },
            { id: '1.4', title: '1.4: Variable Assignment', order: 4, content: 'Learn how to assign values to variables...' },
            { id: '1.5', title: '1.5: Basic Python Output Using the print Function', order: 5, content: 'Display output using the print function...' },
            { id: '1.6', title: '1.6: More Python 3 Data Types: str', order: 6, content: 'Working with string data types...' },
          ]
        },
        {
          id: '2',
          title: 'Unit 2: Operators',
          description: 'Learn about Python operators',
          order: 2,
          topics: [
            { id: '2.1', title: '2.1: Arithmetic Operators', order: 1, content: 'Basic arithmetic operations...' },
            { id: '2.2', title: '2.2: Comparison Operators', order: 2, content: 'Compare values using operators...' },
            { id: '2.3', title: '2.3: Logical Operators', order: 3, content: 'Working with logical operations...' },
          ]
        },
        {
          id: '3',
          title: 'Unit 3: Input and Flow Control',
          description: 'Control program flow',
          order: 3,
          topics: [
            { id: '3.1', title: '3.1: User Input', order: 1, content: 'Get input from users...' },
            { id: '3.2', title: '3.2: Conditional Statements', order: 2, content: 'Using if, elif, else...' },
            { id: '3.3', title: '3.3: Loops', order: 3, content: 'For and while loops...' },
          ]
        },
      ];

      setUnits(mockUnits);
      if (mockUnits.length > 0) {
        setSelectedUnit(mockUnits[0]);
        // Expand the first unit by default
        setExpandedUnits(new Set([mockUnits[0].id]));
        if (mockUnits[0].topics.length > 0) {
          setSelectedTopic(mockUnits[0].topics[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnitExpansion = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    // Always expand the unit when clicking on it
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      newSet.add(unit.id);
      return newSet;
    });
    if (unit.topics.length > 0) {
      setSelectedTopic(unit.topics[0]);
    } else {
      setSelectedTopic(null);
    }
  };

  const handleTopicSelect = (topic: Topic, unit: Unit) => {
    setSelectedTopic(topic);
    setSelectedUnit(unit);
    // Collapse sidebar when topic is selected to focus on content
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTestClick = (unit: Unit) => {
    // Navigate to assessments filtered by unit
    navigate(`/mentor/assessments?unit=${unit.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Learning Path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Units List - Positioned at content area start (after main sidebar) */}
        <div
          className={`fixed lg:absolute inset-y-0 left-0 z-20 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '4rem', bottom: 0 }}
        >
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 pl-3 pr-2 py-1.5 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Course Units</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-0.5 hover:bg-gray-200 rounded"
                  aria-label="Close sidebar"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>
            
            {/* Units List - Scrollable */}
            <div className="flex-1 overflow-y-auto pl-3 pr-2 pb-6">
              <div className="space-y-1">
                {units.map((unit) => {
                const isExpanded = expandedUnits.has(unit.id);
                const isSelected = selectedUnit?.id === unit.id;
                
                return (
                  <div
                    key={unit.id}
                    className={`rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Unit Header */}
                    <div className="flex items-center justify-between px-2 py-2.5">
                      <button
                        onClick={() => handleUnitSelect(unit)}
                        className="flex-1 text-left hover:bg-gray-50 rounded-lg transition-all"
                      >
                        <span className="font-medium text-gray-900 text-sm">{unit.title}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleUnitExpansion(unit.id, e);
                          // Also select unit when expanding
                          if (!expandedUnits.has(unit.id)) {
                            setTimeout(() => handleUnitSelect(unit), 0);
                          }
                        }}
                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0 z-10"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        type="button"
                      >
                        <i className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line text-gray-400 transition-transform text-lg`}></i>
                      </button>
                    </div>
                    
                    {/* Topics Dropdown - Visible when expanded */}
                    {isExpanded && unit.topics && unit.topics.length > 0 && (
                      <div className="pl-2 pr-2 pb-3 space-y-1">
                        {unit.topics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicSelect(topic, unit)}
                            className={`w-full text-left px-2 py-2 rounded transition-all text-sm ${
                              selectedTopic?.id === topic.id && isSelected
                                ? 'bg-blue-100 text-blue-900 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center">
                              <span>{topic.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '4rem' }}
          ></div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 overflow-hidden bg-white transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
        }`}>
          {selectedUnit ? (
            <div className="h-full flex flex-col">
              {/* Unit Header with Hamburger and Test Button */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                  {/* Hamburger button - always visible */}
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                  >
                    <i className={`ri-${sidebarOpen ? 'menu-fold' : 'menu-unfold'}-line text-xl text-gray-700`}></i>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedUnit.title}</h1>
                    {selectedUnit.description && (
                      <p className="text-gray-600 mt-1">{selectedUnit.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleTestClick(selectedUnit)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <i className="ri-file-list-line"></i>
                  Test
                </button>
              </div>

              {/* Content Area - Full Width */}
              <div className="flex-1 overflow-y-auto bg-white">
                {selectedTopic ? (
                  <div className="h-full p-8">
                    <div className={`mx-auto ${sidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedTopic.title}</h2>
                      <div className="prose prose-lg max-w-none text-gray-700">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {selectedTopic.content || (
                            <p>This topic content will be displayed here. You can add rich text, code examples, and interactive elements.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <i className="ri-file-text-line text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600">Select a topic from the sidebar to view content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="ri-book-open-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">Select a unit to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorLearningPath;
