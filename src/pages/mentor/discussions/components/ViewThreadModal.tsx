
import React, { useState } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';

interface Reply {
  id: number;
  authorName: string;
  authorType: 'mentor' | 'student';
  content: string;
  timestamp: string;
  avatar: string;
}

interface Discussion {
  id: number;
  studentName: string;
  studentAvatar: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  category: string;
  submittedAt: string;
  status: 'pending' | 'answered' | 'resolved' | 'closed';
  replies: Reply[];
  priority: 'high' | 'medium' | 'low';
}

interface ViewThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: Discussion | null;
  onAddReply: (discussionId: number, content: string) => void;
}

const ViewThreadModal: React.FC<ViewThreadModalProps> = ({ 
  isOpen, 
  onClose, 
  discussion, 
  onAddReply 
}) => {
  const [replyText, setReplyText] = useState('');

  if (!discussion) return null;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const categories = {
      'technical': 'bg-blue-100 text-blue-800',
      'concept': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800',
      'assignment': 'bg-orange-100 text-orange-800'
    };
    return categories[category as keyof typeof categories] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { color: 'bg-red-100 text-red-800', text: 'High Priority' },
      'medium': { color: 'bg-orange-100 text-orange-800', text: 'Medium' },
      'low': { color: 'bg-blue-100 text-blue-800', text: 'Low' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onAddReply(discussion.id, replyText.trim());
      setReplyText('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discussion Thread"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Discussion Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {discussion.studentAvatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{discussion.studentName}</h3>
                <p className="text-sm text-gray-600">{formatDateTime(discussion.submittedAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(discussion.category)}`}>
                {discussion.category}
              </span>
              {getPriorityBadge(discussion.priority)}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Course:</span> {discussion.courseTitle}</p>
              <p><span className="font-medium">Lesson:</span> {discussion.lessonTitle}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
            <p className="text-gray-700 leading-relaxed">{discussion.question}</p>
          </div>
        </div>

        {/* Replies Thread */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <i className="ri-message-line mr-2"></i>
            Replies ({discussion.replies.length})
          </h4>
          
          {discussion.replies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="ri-message-line text-3xl mb-2"></i>
              <p>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussion.replies.map((reply, index) => (
                <div key={reply.id} className="flex space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                    reply.authorType === 'mentor' 
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500' 
                      : 'bg-gray-400'
                  }`}>
                    {reply.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm text-gray-900">{reply.authorName}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          reply.authorType === 'mentor' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {reply.authorType === 'mentor' ? 'Mentor' : 'Student'}
                        </span>
                        <span className="text-xs text-gray-500">{getTimeAgo(reply.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Reply Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Add Your Reply</h4>
          <div className="space-y-3">
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {replyText.length}/500 characters
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || replyText.length > 500}
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewThreadModal;
