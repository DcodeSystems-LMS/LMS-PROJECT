
import React, { useState } from 'react';
import SidebarSettingsDropdown from '@/components/feature/SidebarSettingsDropdown';

const MentorSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '10:00', end: '14:00' },
    sunday: { enabled: false, start: '10:00', end: '14:00' },
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
    { id: 'features', label: 'Features', icon: 'ri-magic-line' },
    { id: 'availability', label: 'Availability', icon: 'ri-calendar-line' },
    { id: 'courses', label: 'Teaching Areas', icon: 'ri-book-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
    { id: 'appearance', label: 'Appearance', icon: 'ri-palette-line' },
    { id: 'account', label: 'Account', icon: 'ri-settings-line' },
  ];

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const handleAvailabilityChange = (day: string, field: string, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your mentor profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${section.icon} mr-3`}></i>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeSection === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Mentor Profile</h2>
              
              {/* Profile Picture */}
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-user-fill text-2xl text-blue-600"></i>
                </div>
                <div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm mr-3 whitespace-nowrap cursor-pointer">
                    Upload Photo
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="Sarah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="Johnson"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="Dr."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="sarah.johnson@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="8"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    defaultValue="Experienced software engineer and educator with 8+ years in the industry. Passionate about teaching modern web development technologies and helping students achieve their career goals."
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Features</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Side Navigation Bar</h3>
                  <p className="text-gray-600 mb-6">Configure how the sidebar navigation behaves in your dashboard.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Sidebar Toggle Mode</h4>
                        <p className="text-sm text-gray-600">Choose how the sidebar opens and closes</p>
                      </div>
                      <SidebarSettingsDropdown />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'availability' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability Settings</h2>
              
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={availability[day.key as keyof typeof availability].enabled}
                          onChange={(e) => handleAvailabilityChange(day.key, 'enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <label className="font-medium text-gray-900">{day.label}</label>
                      </div>
                    </div>
                    
                    {availability[day.key as keyof typeof availability].enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-7">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={availability[day.key as keyof typeof availability].start}
                            onChange={(e) => handleAvailabilityChange(day.key, 'start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={availability[day.key as keyof typeof availability].end}
                            onChange={(e) => handleAvailabilityChange(day.key, 'end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <i className="ri-information-line text-blue-600 mt-1 mr-2"></i>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Availability Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Students can book sessions during your available hours</li>
                      <li>You can adjust availability anytime</li>
                      <li>Buffer time between sessions is automatically added</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Teaching Areas</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Expertise Areas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'MongoDB',
                      'PostgreSQL', 'AWS', 'Docker', 'Git', 'HTML/CSS', 'GraphQL'
                    ].map((skill) => (
                      <label key={skill} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={['React', 'JavaScript', 'TypeScript', 'Node.js'].includes(skill)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-900">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Course Levels</h3>
                  <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                      <label key={level} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={['Beginner', 'Intermediate', 'Advanced'].includes(level)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <span className="text-sm text-gray-900">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Session Types</h3>
                  <div className="space-y-2">
                    {[
                      { type: '1-on-1 Mentoring', desc: 'Individual sessions with students' },
                      { type: 'Group Sessions', desc: 'Small group workshops and discussions' },
                      { type: 'Code Reviews', desc: 'Review and provide feedback on student projects' },
                      { type: 'Career Guidance', desc: 'Help students with career planning and job search' }
                    ].map((session) => (
                      <label key={session.type} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{session.type}</div>
                          <div className="text-xs text-gray-600">{session.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Theme Settings</h3>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <i className="ri-information-line text-blue-600 mt-1 mr-3"></i>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">Light Mode Only</p>
                        <p className="mb-2">
                          The mentor panel is designed to work optimally in light mode for better readability and professional appearance.
                        </p>
                        <p>
                          Dark mode is disabled for mentors to ensure consistent user experience and better visibility of course materials.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Current Theme</div>
                        <div className="text-sm text-gray-600">Light Mode (Fixed)</div>
                      </div>
                      <div className="flex items-center">
                        <i className="ri-sun-line text-2xl text-yellow-500 mr-2"></i>
                        <span className="text-sm font-medium text-gray-700">Light</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Interface Preferences</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        disabled={true}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">High Contrast Mode</div>
                        <div className="text-xs text-gray-600">Enhanced readability for better focus</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        disabled={true}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Professional Layout</div>
                        <div className="text-xs text-gray-600">Clean, distraction-free interface</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Account Status</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-check-circle-line text-green-600 mr-2"></i>
                      <span className="text-sm text-green-800">Your mentor account is verified and active</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Deactivate Account</div>
                        <div className="text-sm text-gray-600">Temporarily disable your mentor account</div>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
              Cancel
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSettings;
