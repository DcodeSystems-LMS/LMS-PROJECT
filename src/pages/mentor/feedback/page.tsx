
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Feedback</h1>
        <p className="text-gray-600 mt-2">Provide feedback and track student progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-orange-100 rounded-full">
            <i className="ri-time-line text-2xl text-orange-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Pending Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-green-100 rounded-full">
            <i className="ri-check-line text-2xl text-green-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">28</div>
          <div className="text-sm text-gray-600">Completed This Week</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-blue-100 rounded-full">
            <i className="ri-star-line text-2xl text-blue-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">4.6</div>
          <div className="text-sm text-gray-600">Avg Student Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-purple-100 rounded-full">
            <i className="ri-chat-3-line text-2xl text-purple-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Total Feedback Given</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Students</h2>
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{student.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{student.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{student.course}</p>
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
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {student.pendingFeedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Area */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Feedback for {students.find(s => s.id === selectedStudent)?.name}
                </h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
                  New Feedback
                </button>
              </div>

              {/* Pending Reviews */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Pending Reviews</h3>
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div key={item} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">React Component Assignment</h4>
                          <p className="text-sm text-gray-600">Submitted on Dec 22, 2024</p>
                        </div>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Pending Review
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="85"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Provide detailed feedback on the student's work..."
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
                          Submit Feedback
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap cursor-pointer">
                          View Submission
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback History */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Feedback History</h3>
                <div className="space-y-3">
                  {feedbackHistory
                    .filter(f => f.student === students.find(s => s.id === selectedStudent)?.name)
                    .map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{feedback.assignment}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-green-600">{feedback.score}%</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{feedback.date}</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{feedback.feedback}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
              <p className="text-gray-600">Choose a student from the list to view and provide feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorFeedback;
