import React, { useState } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';

interface BookMentoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookMentoringModal: React.FC<BookMentoringModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    mentor: '',
    subject: '',
    date: '',
    timeSlot: '',
    sessionType: 'individual',
    topic: '',
    description: ''
  });

  const mentors = [
    { id: 'sarah-johnson', name: 'Dr. Sarah Johnson', expertise: 'Frontend Development, JavaScript' },
    { id: 'michael-chen', name: 'Prof. Michael Chen', expertise: 'Backend Development, Node.js' },
    { id: 'emily-davis', name: 'Dr. Emily Davis', expertise: 'Data Science, Python' },
    { id: 'david-wilson', name: 'Mr. David Wilson', expertise: 'Full Stack Development' },
    { id: 'lisa-brown', name: 'Ms. Lisa Brown', expertise: 'UI/UX Design, React' }
  ];

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  const subjects = [
    'JavaScript Fundamentals',
    'React Development',
    'Node.js Backend',
    'Database Design',
    'Python Programming',
    'Data Structures',
    'Career Guidance',
    'Project Review'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Mentoring session booked:', formData);
    onClose();
    // Reset form
    setFormData({
      mentor: '',
      subject: '',
      date: '',
      timeSlot: '',
      sessionType: 'individual',
      topic: '',
      description: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Mentoring Session">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="mentor" className="block text-sm font-medium text-gray-700 mb-1">
            Select Mentor
          </label>
          <select
            id="mentor"
            name="mentor"
            value={formData.mentor}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a mentor</option>
            {mentors.map(mentor => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name} - {mentor.expertise}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject Area
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={today}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <select
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="sessionType"
                value="individual"
                checked={formData.sessionType === 'individual'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">Individual Session (1-on-1)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sessionType"
                value="group"
                checked={formData.sessionType === 'group'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">Group Session (2-5 students)</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Topic/Question
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="e.g., React Hooks, API Integration, Career Advice"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            maxLength={500}
            placeholder="Describe what you'd like to discuss or any specific challenges you're facing..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <i className="ri-user-voice-line mr-2"></i>
            Book Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookMentoringModal;