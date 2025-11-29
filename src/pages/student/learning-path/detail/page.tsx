import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Button from '@/components/base/Button';

interface Module {
  id: string;
  title: string;
  content_type: 'PDF' | 'Video' | 'Text' | 'Quiz' | 'Assignment';
  content?: string;
  file_url?: string;
  duration: number;
  order_number: number;
}

interface Unit {
  id: string;
  title: string;
  description?: string;
  order_number: number;
  modules: Module[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  total_units: number;
  total_modules: number;
  total_tests: number;
  created_at?: string;
  units: Unit[];
}

const StudentLearningPathDetail: React.FC = () => {
  const navigate = useNavigate();
  const { pathId } = useParams<{ pathId: string }>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (pathId) {
      fetchLearningPathDetail(pathId);
    }
  }, [pathId]);

  const fetchLearningPathDetail = async (id: string) => {
    try {
      setLoading(true);

      // Fetch learning path with units, modules
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          learning_path_units (
            *,
            learning_path_modules (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching learning path:', error);
        throw error;
      }

      if (data) {
        // Transform the data to match our interface
        const dbData = data as any;
        const transformedData: LearningPath = {
          id: dbData.id,
          title: dbData.title,
          description: dbData.description,
          thumbnail_url: dbData.thumbnail_url,
          level: dbData.level,
          duration: dbData.duration,
          total_units: dbData.total_units,
          total_modules: dbData.total_modules,
          total_tests: dbData.total_tests,
          created_at: dbData.created_at,
          units: (dbData.learning_path_units || [])
            .sort((a: any, b: any) => a.order_number - b.order_number)
            .map((unit: any) => ({
              id: unit.id,
              title: unit.title,
              description: unit.description || '',
              order_number: unit.order_number,
              modules: (unit.learning_path_modules || [])
                .sort((a: any, b: any) => a.order_number - b.order_number)
                .map((module: any) => ({
                  id: module.id,
                  title: module.title,
                  content_type: module.content_type,
                  content: module.content,
                  file_url: module.file_url,
                  duration: module.duration,
                  order_number: module.order_number,
                }))
            }))
        };

        setLearningPath(transformedData);

        // Select first unit and first module by default
        if (transformedData.units.length > 0) {
          const firstUnit = transformedData.units[0];
          setSelectedUnit(firstUnit);
          setExpandedUnits(new Set([firstUnit.id]));

          if (firstUnit.modules.length > 0) {
            setSelectedModule(firstUnit.modules[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching learning path detail:', error);
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
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      newSet.add(unit.id);
      return newSet;
    });
    if (unit.modules.length > 0) {
      setSelectedModule(unit.modules[0]);
    } else {
      setSelectedModule(null);
    }
  };

  const handleModuleSelect = (module: Module, unit: Unit) => {
    setSelectedModule(module);
    setSelectedUnit(unit);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTestClick = () => {
    if (pathId) {
      navigate(`/student/assessments?learning_path=${pathId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Learning Path...</p>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Not Found</h2>
          <p className="text-gray-600 mb-4">The learning path you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/student/learning-path')}>
            Back to Learning Paths
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden" style={{ display: 'flex', height: '100vh' }}>
      <div className="flex flex-col lg:flex-row h-full w-full relative">
        {/* Left Sidebar - Units List */}
        <div
          className={`fixed lg:absolute inset-y-0 left-0 z-20 w-[280px] sm:w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ 
            top: 0, 
            bottom: 0, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 0,
            flexShrink: 0
          }}
        >
          <div className="h-full flex flex-col overflow-hidden w-full">
            {/* Header */}
            <div className="flex-shrink-0 pl-3 pr-2 py-1.5 sm:py-2 border-b border-gray-200 w-full">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-900">Course Units</h2>
                  <p className="text-[10px] text-gray-500 truncate">{learningPath.title}</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 sm:p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
                  aria-label="Close sidebar"
                >
                  <i className="ri-close-line text-base sm:text-lg"></i>
                </button>
              </div>
            </div>

            {/* Units List - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden pl-2 sm:pl-3 pr-2 pb-6 w-full"
              style={{ 
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%'
              }}
            >
              <div className="space-y-1 w-full">
                {learningPath.units.map((unit) => {
                  const isExpanded = expandedUnits.has(unit.id);
                  const isSelected = selectedUnit?.id === unit.id;

                  return (
                    <div
                      key={unit.id}
                      className={`rounded-lg border transition-all w-full ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ width: '100%' }}
                    >
                      {/* Unit Header */}
                      <div className="flex items-center justify-between px-2 py-2 sm:py-2.5 w-full">
                        <button
                          onClick={() => handleUnitSelect(unit)}
                          className="flex-1 text-left hover:bg-gray-50 rounded-lg transition-all min-w-0"
                          style={{ width: '100%' }}
                        >
                          <span className="font-medium text-gray-900 text-xs sm:text-sm truncate block w-full">
                            {unit.title}
                          </span>
                        </button>
                        {unit.modules.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleUnitExpansion(unit.id, e);
                            }}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0 z-10"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            type="button"
                          >
                            <i
                              className={`ri-arrow-${
                                isExpanded ? 'down' : 'right'
                              }-s-line text-gray-400 transition-transform text-lg`}
                            ></i>
                          </button>
                        )}
                      </div>

                      {/* Modules Dropdown */}
                      {isExpanded && unit.modules && unit.modules.length > 0 && (
                        <div className="pl-2 pr-2 pb-3 space-y-1 w-full">
                          {unit.modules.map((module) => (
                            <button
                              key={module.id}
                              onClick={() => handleModuleSelect(module, unit)}
                              className={`w-full text-left px-2 py-1.5 sm:py-2 rounded transition-all text-xs sm:text-sm ${
                                selectedModule?.id === module.id && isSelected
                                  ? 'bg-blue-100 text-blue-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              style={{ width: '100%' }}
                            >
                              <div className="flex items-center justify-between w-full min-w-0">
                                <span className="truncate flex-1 min-w-0">{module.title}</span>
                                <i
                                  className={`ml-2 flex-shrink-0 ${
                                    module.content_type === 'Video'
                                      ? 'ri-video-line'
                                      : module.content_type === 'PDF'
                                      ? 'ri-file-pdf-line'
                                      : module.content_type === 'Quiz'
                                      ? 'ri-questionnaire-line'
                                      : module.content_type === 'Assignment'
                                      ? 'ri-task-line'
                                      : 'ri-file-text-line'
                                  } text-xs`}
                                ></i>
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setSidebarOpen(false)}
            style={{ top: 0 }}
          ></div>
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-hidden bg-white transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
          } w-full relative`}
          style={{ 
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0
          }}
        >
          {selectedUnit ? (
            <div className="h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden relative">
              {/* Header - Sticky within scroll container */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <button
                      onClick={toggleSidebar}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                      <i
                        className={`ri-${
                          sidebarOpen ? 'menu-fold' : 'menu-unfold'
                        }-line text-lg sm:text-xl text-gray-700`}
                      ></i>
                    </button>
                    <div className="flex-1 min-w-0 overflow-hidden pr-2">
                      <h1 
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
                        style={{ 
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={selectedModule ? selectedModule.title : learningPath.title}
                      >
                        {selectedModule ? selectedModule.title : learningPath.title}
                      </h1>
                      {selectedModule ? (
                        <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                          {selectedUnit.description || learningPath.description}
                        </p>
                      ) : selectedUnit.description ? (
                        <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate hidden sm:block">
                          {selectedUnit.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    onClick={handleTestClick}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm flex-shrink-0 ml-2"
                  >
                    <i className="ri-file-list-line text-sm sm:text-base"></i>
                    <span className="hidden sm:inline">Test</span>
                  </button>
                </div>
                
                {/* Module Type Badge - Below title when module is selected */}
                {selectedModule && (
                  <div className="px-3 sm:px-6 pb-3 sm:pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedModule.content_type === 'Video'
                            ? 'bg-red-100 text-red-700'
                            : selectedModule.content_type === 'PDF'
                            ? 'bg-orange-100 text-orange-700'
                            : selectedModule.content_type === 'Quiz'
                            ? 'bg-purple-100 text-purple-700'
                            : selectedModule.content_type === 'Assignment'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedModule.content_type}
                      </span>
                      {selectedModule.duration > 0 && (
                        <span className="text-xs sm:text-sm text-gray-500">
                          {selectedModule.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Area - Scrollable */}
              <div className="bg-white">
                {selectedModule ? (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className={`mx-auto ${sidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>

                      {/* Module Content */}
                      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700">
                        {selectedModule.content_type === 'Video' && selectedModule.file_url ? (
                          <div className="mb-6">
                            <video
                              controls
                              className="w-full rounded-lg"
                              src={selectedModule.file_url}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ) : selectedModule.content_type === 'PDF' && selectedModule.file_url ? (
                          <div className="mb-6">
                            <iframe
                              src={selectedModule.file_url}
                              className="w-full h-[600px] rounded-lg border"
                              title={selectedModule.title}
                            ></iframe>
                          </div>
                        ) : selectedModule.content ? (
                          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                            {selectedModule.content}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            Content will be displayed here. This module is currently being prepared.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full px-4">
                    <div className="text-center">
                      <i className="ri-file-text-line text-4xl sm:text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Select a module from the sidebar to view content
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <i className="ri-book-open-line text-4xl sm:text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600 text-sm sm:text-base">
                  Select a unit to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLearningPathDetail;

