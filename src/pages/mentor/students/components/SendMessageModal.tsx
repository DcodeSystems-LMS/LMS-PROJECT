import React, { useState } from 'react';
import Modal from '../../../../components/base/Modal';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    name: string;
    email: string;
    course: string;
  };
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, student }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    sendCopy: true
  });

  const messageTemplates = [
    {
      name: 'Progress Check-in',
      subject: 'Weekly Progress Check-in',
      message: `Hi ${student.name},\n\nI hope you're doing well with your ${student.course} studies. I wanted to check in on your progress and see if you have any questions or need additional support.\n\nPlease let me know if there's anything specific you'd like to work on in our next session.\n\nBest regards,`
    },
    {
      name: 'Session Reminder',
      subject: 'Upcoming Session Reminder',
      message: `Hi ${student.name},\n\nThis is a friendly reminder about our upcoming session. Please make sure you have:\n\n• Your course materials ready\n• Any questions you'd like to discuss\n• A stable internet connection\n\nLooking forward to our session!\n\nBest regards,`
    },
    {
      name: 'Encouragement',
      subject: 'Keep up the great work!',
      message: `Hi ${student.name},\n\nI wanted to reach out and let you know that I'm really impressed with your progress in ${student.course}. Your dedication and hard work are paying off!\n\nKeep up the excellent work, and remember that I'm here to support you every step of the way.\n\nBest regards,`
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message sending logic here
    console.log('Sending message:', formData);
    onClose();
    // Show success message
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [e.target.name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const useTemplate = (template: typeof messageTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Message to ${student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {messageTemplates.map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => useTemplate(template)}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm">
            <div><strong>To:</strong> {student.name} ({student.email})</div>
            <div><strong>Course:</strong> {student.course}</div>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter message subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={8}
            placeholder="Type your message here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sendCopy"
            name="sendCopy"
            checked={formData.sendCopy}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="sendCopy" className="text-sm text-gray-700">
            Send a copy to myself
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Send Message
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SendMessageModal;