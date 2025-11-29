import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Lottie from 'lottie-react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';

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
  created_at: string;
}

const StudentLearningPath: React.FC = () => {
  const navigate = useNavigate();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [lottieAnimationData, setLottieAnimationData] = useState<any>(null);

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  // Load Lottie animation
  useEffect(() => {
    fetch('/Learningpath.json')
      .then(response => response.json())
      .then(data => setLottieAnimationData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      
      // Fetch all learning paths from Supabase (students can view all)
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching learning paths:', error);
        throw error;
      }

      setLearningPaths(data || []);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (pathId: string) => {
    navigate(`/student/learning-path/${pathId}`);
  };

  const getCardColor = (index: number) => {
    const colors = [
      { bg: 'bg-yellow-500', hex: '#FCD34D' },
      { bg: 'bg-pink-500', hex: '#EC4899' },
      { bg: 'bg-green-500', hex: '#10B981' },
      { bg: 'bg-blue-500', hex: '#3B82F6' },
      { bg: 'bg-purple-500', hex: '#8B5CF6' },
      { bg: 'bg-orange-500', hex: '#F97316' }
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Learning Paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
        }
      `}</style>
      
      {/* Promotional Banner - Matching Mentor Page Style */}
      <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between p-4 lg:p-5">
          {/* Left Section - Text and Statistics */}
          <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
              Learn Effectively With Us!
            </h2>
            <p className="text-base lg:text-lg text-white/90 mb-4">
              Get 30% off every course on January.
            </p>
            
            {/* Statistics Badges */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Students Badge */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <i className="ri-graduation-cap-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-base">Students</p>
                  <p className="text-white/90 text-xs">75,000+</p>
                </div>
              </div>
              
              {/* Expert Mentors Badge */}
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <i className="ri-user-star-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-white font-semibold text-base">Expert Mentors</p>
                  <p className="text-white/90 text-xs">200+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Lottie Animation */}
          <div className="flex-shrink-0 relative w-full lg:w-auto flex justify-center lg:justify-end lg:pr-10 lg:mr-8">
            {lottieAnimationData ? (
              <div className="w-full max-w-xs lg:w-64 lg:h-64 h-48 flex items-center justify-center animate-slide-in-left">
                <Lottie 
                  animationData={lottieAnimationData} 
                  loop={true}
                  autoplay={true}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full max-w-xs lg:w-64 lg:h-64 h-48 bg-white/10 rounded-lg flex items-center justify-center">
                <div className="text-white/50 text-sm">Loading animation...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Paths Grid */}
      {learningPaths.length === 0 ? (
        <Card className="p-12 text-center">
          <i className="ri-route-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Learning Paths Available</h3>
          <p className="text-gray-500">Check back later for new learning paths.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {learningPaths.map((path, index) => {
                const cardColor = getCardColor(index);
                
                return (
                  <Card
                    key={path.id}
                    className="p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100"
                    onClick={() => handleCardClick(path.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      {/* Lottie Animation */}
                      <div className="w-16 h-16 flex items-center justify-center">
                        {lottieAnimationData ? (
                          <Lottie 
                            animationData={lottieAnimationData} 
                            loop={true}
                            autoplay={true}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                            <i className="ri-route-line text-2xl text-gray-400"></i>
                          </div>
                        )}
                      </div>
                    </div>
            
                    {/* Learning Path Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {path.title}
                    </h3>

                    {/* Stats */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {path.total_units || 0} Units
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {path.total_modules || 0} Modules
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleCardClick(path.id);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
                      style={{
                        backgroundColor: cardColor.hex
                      }}
                    >
                      View Learning Path
                    </button>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(path.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        path.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        path.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {path.level}
                      </span>
                    </div>
                  </Card>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default StudentLearningPath;
