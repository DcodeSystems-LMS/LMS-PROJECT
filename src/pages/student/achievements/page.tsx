import React, { useState } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';

const StudentAchievements: React.FC = () => {
  const [activeTab, setActiveTab] = useState('badges');

  const badges = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'ri-footprint-line',
      earned: true,
      earnedDate: '2024-01-05',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Quick Learner',
      description: 'Complete 5 lessons in one day',
      icon: 'ri-flashlight-line',
      earned: true,
      earnedDate: '2024-01-08',
      color: 'yellow'
    },
    {
      id: 3,
      name: 'Consistent',
      description: 'Study for 7 consecutive days',
      icon: 'ri-calendar-check-line',
      earned: true,
      earnedDate: '2024-01-12',
      color: 'green'
    },
    {
      id: 4,
      name: 'Problem Solver',
      description: 'Complete 10 coding challenges',
      icon: 'ri-puzzle-line',
      earned: false,
      progress: 6,
      total: 10,
      color: 'purple'
    },
    {
      id: 5,
      name: 'Team Player',
      description: 'Participate in 5 group discussions',
      icon: 'ri-team-line',
      earned: false,
      progress: 2,
      total: 5,
      color: 'orange'
    },
    {
      id: 6,
      name: 'Perfectionist',
      description: 'Score 100% on 3 assessments',
      icon: 'ri-star-line',
      earned: false,
      progress: 1,
      total: 3,
      color: 'pink'
    }
  ];

  const certificates = [
    {
      id: 1,
      name: 'HTML & CSS Fundamentals',
      issueDate: '2024-01-10',
      course: 'Full Stack Web Development',
      grade: 'A',
      credentialId: 'DCODE-HTML-001',
      image: 'https://readdy.ai/api/search-image?query=professional%20certificate%20template%20with%20elegant%20border%20design%2C%20HTML%20CSS%20programming%20achievement%20award%2C%20modern%20educational%20credentials%20with%20blue%20and%20gold%20accents&width=400&height=300&seq=7&orientation=landscape'
    },
    {
      id: 2,
      name: 'JavaScript Basics',
      issueDate: '2024-01-14',
      course: 'Full Stack Web Development',
      grade: 'B+',
      credentialId: 'DCODE-JS-002',
      image: 'https://readdy.ai/api/search-image?query=JavaScript%20programming%20certificate%20with%20clean%20professional%20layout%2C%20coding%20achievement%20recognition%2C%20modern%20educational%20design%20with%20yellow%20and%20black%20theme&width=400&height=300&seq=8&orientation=landscape'
    }
  ];

  const levels = [
    { level: 1, name: 'Beginner', minXP: 0, maxXP: 500, color: 'gray' },
    { level: 2, name: 'Novice', minXP: 500, maxXP: 1500, color: 'blue' },
    { level: 3, name: 'Intermediate', minXP: 1500, maxXP: 3000, color: 'green' },
    { level: 4, name: 'Advanced', minXP: 3000, maxXP: 5000, color: 'purple' },
    { level: 5, name: 'Expert', minXP: 5000, maxXP: 10000, color: 'gold' }
  ];

  const currentXP = 2450;
  const currentLevel = levels.find(l => currentXP >= l.minXP && currentXP < l.maxXP) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel ? ((currentXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-600 mt-1">Track your progress and celebrate your accomplishments</p>
      </div>

      {/* Level Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Level {currentLevel.level}: {currentLevel.name}</h2>
            <p className="text-gray-600">Keep learning to reach the next level!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{currentXP.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
        </div>
        
        {nextLevel && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Level {nextLevel.level}</span>
              <span className="text-sm text-gray-500">{nextLevel.minXP - currentXP} XP needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'badges', label: 'Badges', icon: 'ri-medal-line' },
          { key: 'certificates', label: 'Certificates', icon: 'ri-award-line' },
          { key: 'levels', label: 'Levels', icon: 'ri-trophy-line' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <Card key={badge.id} className={`text-center ${badge.earned ? 'ring-2 ring-green-200' : 'opacity-75'}`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                badge.earned ? `bg-${badge.color}-100` : 'bg-gray-100'
              }`}>
                <i className={`${badge.icon} text-3xl ${
                  badge.earned ? `text-${badge.color}-600` : 'text-gray-400'
                }`}></i>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
              
              {badge.earned ? (
                <div>
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <i className="ri-check-line mr-1"></i>
                    <span className="text-sm font-medium">Earned</span>
                  </div>
                  <div className="text-xs text-gray-500">on {badge.earnedDate}</div>
                </div>
              ) : (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`bg-${badge.color}-600 h-2 rounded-full`}
                      style={{ width: `${(badge.progress! / badge.total!) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {badge.progress} / {badge.total}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <img 
                src={cert.image} 
                alt={cert.name}
                className="w-full h-48 object-cover object-top mb-4 rounded"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.name}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Course:</span>
                    <span>{cert.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grade:</span>
                    <span className="font-medium text-green-600">{cert.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issue Date:</span>
                    <span>{cert.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credential ID:</span>
                    <span className="font-mono text-xs">{cert.credentialId}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <i className="ri-download-line mr-2"></i>
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <i className="ri-share-line mr-2"></i>
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Levels Tab */}
      {activeTab === 'levels' && (
        <div className="space-y-4">
          {levels.map((level) => {
            const isCurrentLevel = level.level === currentLevel.level;
            const isCompleted = currentXP >= level.maxXP;
            const isNext = level.level === currentLevel.level + 1;
            
            return (
              <Card key={level.level} className={`${
                isCurrentLevel ? 'ring-2 ring-blue-200 bg-blue-50' : 
                isCompleted ? 'bg-green-50' : ''
              }`}>
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-6 ${
                    isCompleted ? 'bg-green-100' :
                    isCurrentLevel ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        isCompleted ? 'text-green-600' :
                        isCurrentLevel ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {level.level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Level {level.level}: {level.name}
                      </h3>
                      {isCurrentLevel && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          Current
                        </span>
                      )}
                      {isCompleted && !isCurrentLevel && (
                        <i className="ri-check-line text-green-600 text-xl"></i>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {level.minXP.toLocaleString()} - {level.maxXP.toLocaleString()} XP
                    </div>
                    
                    {isCurrentLevel && nextLevel && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progressToNext}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Achievement Statistics */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievement Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {badges.filter(b => b.earned).length}
            </div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{certificates.length}</div>
            <div className="text-sm text-gray-600">Certificates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{currentLevel.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{currentXP.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentAchievements;