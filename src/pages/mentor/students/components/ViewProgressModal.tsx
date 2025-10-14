import React from 'react';
import Modal from '../../../../components/base/Modal';

interface ViewProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    name: string;
    course: string;
    progress: number;
    totalSessions: number;
    joinDate: string;
    lastSession: string;
  };
}

const ViewProgressModal: React.FC<ViewProgressModalProps> = ({ isOpen, onClose, student }) => {
  const progressData = [
    { module: 'HTML & CSS Fundamentals', completed: true, score: 95, completedDate: '2024-11-20' },
    { module: 'JavaScript Basics', completed: true, score: 88, completedDate: '2024-12-01' },
    { module: 'React Introduction', completed: true, score: 92, completedDate: '2024-12-10' },
    { module: 'State Management', completed: false, score: 0, completedDate: null },
    { module: 'API Integration', completed: false, score: 0, completedDate: null },
    { module: 'Final Project', completed: false, score: 0, completedDate: null }
  ];

  const sessionHistory = [
    { date: '2024-12-22', topic: 'React Components', duration: '60 min', rating: 5 },
    { date: '2024-12-15', topic: 'JavaScript Arrays', duration: '45 min', rating: 4 },
    { date: '2024-12-08', topic: 'CSS Flexbox', duration: '60 min', rating: 5 },
    { date: '2024-12-01', topic: 'HTML Semantics', duration: '30 min', rating: 4 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    return 'bg-red-500';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${student.name}'s Progress`}>
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-gray-900">{student.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full ${getProgressColor(student.progress)}`}
              style={{ width: `${student.progress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{student.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{progressData.filter(p => p.completed).length}</div>
              <div className="text-sm text-gray-600">Modules Completed</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">91</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>

        {/* Module Progress */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Module Progress</h3>
          <div className="space-y-3">
            {progressData.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    module.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {module.completed ? (
                      <i className="ri-check-line text-green-600"></i>
                    ) : (
                      <i className="ri-time-line text-gray-400"></i>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{module.module}</div>
                    {module.completedDate && (
                      <div className="text-sm text-gray-600">Completed on {module.completedDate}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {module.completed ? (
                    <div className={`text-lg font-bold ${getScoreColor(module.score)}`}>
                      {module.score}%
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Not started</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sessionHistory.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{session.topic}</div>
                  <div className="text-sm text-gray-600">{session.date} • {session.duration}</div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i}
                      className={`ri-star-${i < session.rating ? 'fill' : 'line'} text-yellow-400`}
                    ></i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
            Export Report
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewProgressModal;