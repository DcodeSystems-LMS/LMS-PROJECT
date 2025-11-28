import React, { useState } from 'react';
import Modal from '@/components/base/Modal';
import Button from '@/components/base/Button';

interface SetReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SetReminderModal: React.FC<SetReminderModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    reminderType: 'event',
    reminderTime: '15',
    repeatOption: 'none',
    priority: 'medium',
    description: ''
  });

  const reminderTypes = [
    { value: 'event', label: 'Event Reminder', icon: 'ri-calendar-event-line' },
    { value: 'study', label: 'Study Reminder', icon: 'ri-book-open-line' },
    { value: 'assignment', label: 'Assignment Due', icon: 'ri-file-list-line' },
    { value: 'exam', label: 'Exam Preparation', icon: 'ri-graduation-cap-line' },
    { value: 'custom', label: 'Custom Reminder', icon: 'ri-notification-line' }
  ];

  const reminderTimes = [
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' },
    { value: '1440', label: '1 day before' }
  ];

  const repeatOptions = [
    { value: 'none', label: 'No repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Reminder set:', formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      date: '',
      time: '',
      reminderType: 'event',
      reminderTime: '15',
      repeatOption: 'none',
      priority: 'medium',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Set Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter reminder title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {reminderTypes.map(type => (
              <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="reminderType"
                  value={type.value}
                  checked={formData.reminderType === type.value}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <i className={`${type.icon} mr-2 text-gray-600`}></i>
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
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
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
              Notify Me
            </label>
            <select
              id="reminderTime"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {reminderTimes.map(time => (
                <option key={time.value} value={time.value}>{time.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="repeatOption" className="block text-sm font-medium text-gray-700 mb-1">
              Repeat
            </label>
            <select
              id="repeatOption"
              name="repeatOption"
              value={formData.repeatOption}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {repeatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="low"
                checked={formData.priority === 'low'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-green-600">Low</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="medium"
                checked={formData.priority === 'medium'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-yellow-600">Medium</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="priority"
                value="high"
                checked={formData.priority === 'high'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-red-600">High</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            maxLength={500}
            placeholder="Add any additional details about this reminder..."
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
            <i className="ri-notification-line mr-2"></i>
            Set Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SetReminderModal;