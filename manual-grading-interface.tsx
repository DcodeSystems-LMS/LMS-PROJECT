// Manual Grading Interface for Instructors
// Handles grading of subjective questions

import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';

interface ManualGradingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: string;
}

interface GradingItem {
  id: string;
  attempt_id: string;
  question_id: string;
  student_id: string;
  question: any;
  student: any;
  response: any;
  attempt: any;
}

const ManualGradingInterface: React.FC<ManualGradingInterfaceProps> = ({
  isOpen,
  onClose,
  instructorId
}) => {
  const [gradingQueue, setGradingQueue] = useState<GradingItem[]>([]);
  const [currentItem, setCurrentItem] = useState<GradingItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGradingQueue();
    }
  }, [isOpen, instructorId]);

  const loadGradingQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await DataService.getGradingQueue(instructorId);
      if (error) {
        console.error('Error loading grading queue:', error);
        return;
      }
      setGradingQueue(data);
      if (data.length > 0) {
        setCurrentItem(data[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading grading queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (itemId: string, score: number) => {
    setScores(prev => ({ ...prev, [itemId]: score }));
  };

  const handleFeedbackChange = (itemId: string, feedback: string) => {
    setFeedbacks(prev => ({ ...prev, [itemId]: feedback }));
  };

  const handleNext = () => {
    if (currentIndex < gradingQueue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentItem(gradingQueue[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentItem(gradingQueue[prevIndex]);
    }
  };

  const handleSubmitGrade = async (item: GradingItem) => {
    setSubmitting(true);
    try {
      const score = scores[item.id] || 0;
      const feedback = feedbacks[item.id] || '';
      
      const { error } = await DataService.gradeSubjectiveQuestion(
        item.response.id,
        score,
        feedback,
        instructorId
      );
      
      if (error) {
        console.error('Error submitting grade:', error);
        alert('Failed to submit grade: ' + error.message);
        return;
      }
      
      // Remove from queue
      setGradingQueue(prev => prev.filter(g => g.id !== item.id));
      
      // Move to next item
      if (currentIndex >= gradingQueue.length - 1) {
        if (gradingQueue.length > 1) {
          setCurrentIndex(currentIndex - 1);
          setCurrentItem(gradingQueue[currentIndex - 1]);
        } else {
          setCurrentItem(null);
        }
      }
      
      console.log('Grade submitted successfully');
    } catch (error) {
      console.error('Error submitting grade:', error);
      alert('Failed to submit grade: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAllGrades = async () => {
    setSubmitting(true);
    try {
      const promises = gradingQueue.map(item => 
        DataService.gradeSubjectiveQuestion(
          item.response.id,
          scores[item.id] || 0,
          feedbacks[item.id] || '',
          instructorId
        )
      );
      
      await Promise.all(promises);
      
      setGradingQueue([]);
      setCurrentItem(null);
      setCurrentIndex(0);
      
      console.log('All grades submitted successfully');
    } catch (error) {
      console.error('Error submitting all grades:', error);
      alert('Failed to submit grades: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Manual Grading Queue</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {gradingQueue.length} items pending manual grading
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : gradingQueue.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-check-circle-line text-6xl text-green-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No items pending manual grading.</p>
            </div>
          ) : currentItem ? (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {currentItem.student?.full_name || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {currentItem.student?.email || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Attempt:</span> {currentItem.attempt?.id?.slice(0, 8)}...
                  </div>
                  <div>
                    <span className="font-medium">Started:</span> {new Date(currentItem.attempt?.started_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Question Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
                <div className="mb-3">
                  <span className="font-medium">Type:</span> {currentItem.question?.question_type}
                </div>
                <div className="mb-3">
                  <span className="font-medium">Points:</span> {currentItem.question?.points}
                </div>
                <div className="mb-3">
                  <span className="font-medium">Question:</span>
                  <div className="mt-2 p-3 bg-white rounded border">
                    {currentItem.question?.question_text}
                  </div>
                </div>
                {currentItem.question?.model_answer && (
                  <div className="mb-3">
                    <span className="font-medium">Model Answer:</span>
                    <div className="mt-2 p-3 bg-white rounded border">
                      {currentItem.question.model_answer}
                    </div>
                  </div>
                )}
                {currentItem.question?.evaluation_criteria && (
                  <div className="mb-3">
                    <span className="font-medium">Evaluation Criteria:</span>
                    <div className="mt-2 p-3 bg-white rounded border">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(currentItem.question.evaluation_criteria, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Response */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Student Response</h3>
                <div className="p-3 bg-white rounded border">
                  {currentItem.response?.answer_text && (
                    <div className="mb-3">
                      <span className="font-medium">Text Response:</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        {currentItem.response.answer_text}
                      </div>
                    </div>
                  )}
                  {currentItem.response?.code_submission && (
                    <div className="mb-3">
                      <span className="font-medium">Code Submission:</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <pre className="whitespace-pre-wrap">{currentItem.response.code_submission}</pre>
                      </div>
                    </div>
                  )}
                  {currentItem.response?.file_uploads && (
                    <div className="mb-3">
                      <span className="font-medium">File Uploads:</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(currentItem.response.file_uploads, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Grading Form */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Grading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (0 - {currentItem.question?.points})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={currentItem.question?.points}
                      value={scores[currentItem.id] || 0}
                      onChange={(e) => handleScoreChange(currentItem.id, parseFloat(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedbacks[currentItem.id] || ''}
                      onChange={(e) => handleFeedbackChange(currentItem.id, e.target.value)}
                      placeholder="Provide feedback to the student..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-left-line mr-2"></i>
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === gradingQueue.length - 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <i className="ri-arrow-right-line ml-2"></i>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSubmitGrade(currentItem)}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Grade'}
                  </button>
                  <button
                    onClick={handleSubmitAllGrades}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Submit All Grades
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ManualGradingInterface;
