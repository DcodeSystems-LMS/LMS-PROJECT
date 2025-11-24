
import React, { useState } from 'react';

const MentorFeedback: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const students = [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'JD',
      course: 'React Development',
      lastSubmission: 'Dec 22, 2024',
      pendingFeedback: 2,
      rating: 4.5
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'JS',
      course: 'JavaScript Advanced',
      lastSubmission: 'Dec 20, 2024',
      pendingFeedback: 1,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Alice Brown',
      avatar: 'AB',
      course: 'Full Stack Development',
      lastSubmission: 'Dec 18, 2024',
      pendingFeedback: 0,
      rating: 4.2
    }
  ];

  const feedbackHistory = [
    {
      id: 1,
      student: 'John Doe',
      assignment: 'React Component Project',
      date: 'Dec 20, 2024',
      score: 85,
      feedback: 'Great work on the component structure! The code is clean and well-organized. Consider adding more error handling for edge cases.',
      status: 'submitted'
    },
    {
      id: 2,
      student: 'Jane Smith',
      assignment: 'JavaScript Functions Quiz',
      date: 'Dec 18, 2024',
      score: 92,
      feedback: 'Excellent understanding of JavaScript concepts. Your solutions are efficient and demonstrate good problem-solving skills.',
      status: 'submitted'
    }
  ];

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Feedback</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Provide feedback and track student progress</p>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full">
            <i className="ri-time-line text-lg sm:text-2xl text-orange-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-green-100 rounded-full">
            <i className="ri-check-line text-lg sm:text-2xl text-green-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">28</div>
          <div className="text-xs sm:text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-blue-100 rounded-full">
            <i className="ri-star-line text-lg sm:text-2xl text-blue-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">4.6</div>
          <div className="text-xs sm:text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-purple-100 rounded-full">
            <i className="ri-chat-3-line text-lg sm:text-2xl text-purple-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">156</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Given</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Students List - Mobile Optimized */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Students</h2>
            <div className="space-y-2 sm:space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-xs sm:text-sm">{student.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{student.course}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`ri-star-${i < Math.floor(student.rating) ? 'fill' : 'line'} text-yellow-400 text-xs`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-500">({student.rating})</span>
                      </div>
                    </div>
                    {student.pendingFeedback > 0 && (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {student.pendingFeedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Area - Mobile Optimized */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Feedback for {students.find(s => s.id === selectedStudent)?.name}
                </h2>
                <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer w-full sm:w-auto">
                  New Feedback
                </button>
              </div>

              {/* Pending Reviews - Mobile Optimized */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Pending Reviews</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">React Component Assignment</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Submitted on Dec 22, 2024</p>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full self-start sm:self-auto">
                          Pending Review
                        </span>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                          placeholder="85"
                        />
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Feedback</label>
                        <textarea
                          rows={3}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                          placeholder="Provide detailed feedback..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer w-full sm:w-auto">
                          Submit Feedback
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap cursor-pointer w-full sm:w-auto">
                          View Submission
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback History - Mobile Optimized */}
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Feedback History</h3>
                <div className="space-y-3 sm:space-y-4">
                  {feedbackHistory
                    .filter(f => f.student === students.find(s => s.id === selectedStudent)?.name)
                    .map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{feedback.assignment}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-base sm:text-lg font-semibold text-green-600">{feedback.score}%</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">{feedback.date}</p>
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-700 italic">"{feedback.feedback}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="ri-chat-3-line text-xl sm:text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
              <p className="text-sm sm:text-base text-gray-600">Choose a student from the list to view and provide feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorFeedback;
