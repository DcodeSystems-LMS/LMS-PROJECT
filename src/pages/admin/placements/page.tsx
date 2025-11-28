import React, { useState, useEffect } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';

const AdminPlacements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    subject: '',
    message: '',
    recipients: 'all', // 'all', 'students', 'mentors', 'specific'
    urgency: 'normal', // 'low', 'normal', 'high'
    includeAttachment: false
  });

  const placements = [
    { id: 1, student: 'John Doe', company: 'Google', position: 'Frontend Developer', salary: '$95,000', status: 'placed', date: '2024-01-15', course: 'Full Stack Development', mentor: 'Dr. Sarah Wilson', location: 'Remote' },
    { id: 2, student: 'Sarah Johnson', company: 'Microsoft', position: 'Software Engineer', salary: '$102,000', status: 'placed', date: '2024-01-12', course: 'React Fundamentals', mentor: 'Michael Rodriguez', location: 'Seattle, WA' },
    { id: 3, student: 'Mike Chen', company: 'Amazon', position: 'Backend Developer', salary: '$89,000', status: 'interviewing', date: '2024-01-20', course: 'Node.js Backend', mentor: 'David Thompson', location: 'Austin, TX' },
    { id: 4, student: 'Emily Davis', company: 'Meta', position: 'Full Stack Developer', salary: '$110,000', status: 'offer', date: '2024-01-18', course: 'JavaScript Advanced', mentor: 'Jennifer Lee', location: 'Remote' },
    { id: 5, student: 'Alex Wilson', company: 'Netflix', position: 'Data Engineer', salary: '$98,000', status: 'applied', date: '2024-01-22', course: 'Python for Data Science', mentor: 'Rachel Green', location: 'Los Angeles, CA' },
    { id: 6, student: 'Lisa Brown', company: 'Shopify', position: 'Mobile Developer', salary: '$85,000', status: 'interviewing', date: '2024-01-16', course: 'Mobile Development', mentor: 'James Anderson', location: 'Toronto, ON' },
  ];

  const companies = [
    { name: 'Google', logo: 'ri-google-fill', openings: 12, hires: 8, avgSalary: '$98,000' },
    { name: 'Microsoft', logo: 'ri-microsoft-fill', openings: 15, hires: 11, avgSalary: '$105,000' },
    { name: 'Amazon', logo: 'ri-amazon-fill', openings: 18, hires: 14, avgSalary: '$92,000' },
    { name: 'Meta', logo: 'ri-meta-fill', openings: 8, hires: 6, avgSalary: '$112,000' },
    { name: 'Apple', logo: 'ri-apple-fill', openings: 10, hires: 7, avgSalary: '$108,000' },
    { name: 'Netflix', logo: 'ri-netflix-fill', openings: 6, hires: 4, avgSalary: '$95,000' },
  ];

  const filteredPlacements = placements.filter(placement => {
    const matchesSearch = placement.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         placement.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         placement.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || placement.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-green-600 bg-green-100';
      case 'offer': return 'text-blue-600 bg-blue-100';
      case 'interviewing': return 'text-yellow-600 bg-yellow-100';
      case 'applied': return 'text-purple-600 bg-purple-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSendUpdates = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = () => {
    // Simulate sending updates
    console.log('Sending updates:', updateForm);
    setShowUpdateModal(false);
    setUpdateForm({
      subject: '',
      message: '',
      recipients: 'all',
      urgency: 'normal',
      includeAttachment: false
    });
    // Could show success notification here
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Placement Management</h1>
        <p className="text-gray-600 mt-2">Track student placements and company partnerships</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mr-4">
              <i className="ri-briefcase-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Placements</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-4">
              <i className="ri-calendar-check-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-4">
              <i className="ri-building-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Partner Companies</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg mr-4">
              <i className="ri-money-dollar-circle-line text-2xl text-orange-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">$94,500</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Placements */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Placements</h2>
              <div className="flex flex-col sm:flex-row gap-4 flex-1 md:max-w-md">
                <div className="relative flex-1">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search placements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="placed">Placed</option>
                    <option value="offer">Offer</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="applied">Applied</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPlacements.map((placement) => (
                <div key={placement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">{placement.student.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{placement.student}</div>
                        <div className="text-sm text-gray-500">{placement.course}</div>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(placement.status)}`}>
                      {placement.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium text-gray-900">{placement.company}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Position:</span>
                      <span className="ml-2 font-medium text-gray-900">{placement.position}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Salary:</span>
                      <span className="ml-2 font-medium text-green-600">{placement.salary}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium text-gray-900">{placement.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Mentor: {placement.mentor} • {placement.date}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="text-green-600 hover:text-green-700 cursor-pointer">
                        <i className="ri-edit-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Partner Companies</h2>
            <div className="space-y-4">
              {companies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg mr-3">
                      <i className={`${company.logo} text-lg text-gray-600`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-sm text-gray-500">{company.hires} hired</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{company.avgSalary}</div>
                    <div className="text-xs text-gray-500">{company.openings} openings</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Placement Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Placement Rate</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">87%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Time to Placement</span>
                <span className="text-sm font-medium text-gray-900">3.2 weeks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interview Success Rate</span>
                <span className="text-sm font-medium text-gray-900">72%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Salary Range</span>
                <span className="text-sm font-medium text-gray-900">$65K - $130K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowUpdateModal(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-mail-send-line text-2xl text-orange-600 mb-2"></i>
            <span className="text-sm font-medium text-gray-900">Send Updates</span>
          </button>
        </div>
      </div>

      {/* Send Updates Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Send Placement Updates"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Placement Update Notification</p>
                <p>Send important updates about placements, interviews, or job opportunities to students and mentors.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'all', label: 'All Users', icon: 'ri-group-line' },
                  { value: 'students', label: 'Students Only', icon: 'ri-graduation-cap-line' },
                  { value: 'mentors', label: 'Mentors Only', icon: 'ri-user-star-line' },
                  { value: 'specific', label: 'Specific Group', icon: 'ri-user-settings-line' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="recipients"
                      value={option.value}
                      checked={updateForm.recipients === option.value}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, recipients: e.target.value }))}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <i className={`${option.icon} text-gray-600 mx-2`}></i>
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
              <div className="flex space-x-3">
                {[
                  { value: 'low', label: 'Low', color: 'green' },
                  { value: 'normal', label: 'Normal', color: 'blue' },
                  { value: 'high', label: 'High', color: 'red' }
                ].map((urgency) => (
                  <label key={urgency.value} className="flex items-center">
                    <input
                      type="radio"
                      name="urgency"
                      value={urgency.value}
                      checked={updateForm.urgency === urgency.value}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, urgency: e.target.value }))}
                      className={`h-4 w-4 text-${urgency.color}-600 focus:ring-${urgency.color}-500 border-gray-300`}
                    />
                    <span className={`ml-2 text-sm font-medium text-${urgency.color}-700`}>{urgency.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={updateForm.subject}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter update subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={updateForm.message}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your placement update message..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                maxLength={500}
              />
              <div className="text-sm text-gray-500 mt-1">
                {updateForm.message.length}/500 characters
              </div>
            </div>

            {/* Attachment Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAttachment"
                checked={updateForm.includeAttachment}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, includeAttachment: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="includeAttachment" className="ml-2 text-sm text-gray-700">
                Include attachment (job descriptions, guidelines, etc.)
              </label>
            </div>

            {updateForm.includeAttachment && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
                <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX (max 10MB)</p>
              </div>
            )}
          </div>

          {/* Preview */}
          {updateForm.subject && updateForm.message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{updateForm.subject}</h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    updateForm.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    updateForm.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {updateForm.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{updateForm.message}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  Recipients: {updateForm.recipients === 'all' ? 'All users' : 
                            updateForm.recipients === 'students' ? 'Students only' :
                            updateForm.recipients === 'mentors' ? 'Mentors only' : 'Specific group'}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSubmit}
              disabled={!updateForm.subject || !updateForm.message}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <i className="ri-mail-send-line mr-2"></i>
              Send Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPlacements;