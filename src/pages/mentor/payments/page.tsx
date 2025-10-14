
import React, { useState } from 'react';

const MentorPayments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('earnings');

  const tabs = [
    { id: 'earnings', label: 'Earnings', icon: 'ri-money-dollar-circle-line' },
    { id: 'history', label: 'Payment History', icon: 'ri-history-line' },
    { id: 'settings', label: 'Payment Settings', icon: 'ri-settings-line' },
  ];

  const recentPayments = [
    {
      id: 1,
      date: 'Dec 20, 2024',
      amount: 850.00,
      status: 'completed',
      type: 'Monthly Payment',
      method: 'Bank Transfer'
    },
    {
      id: 2,
      date: 'Nov 20, 2024',
      amount: 920.00,
      status: 'completed',
      type: 'Monthly Payment',
      method: 'Bank Transfer'
    },
    {
      id: 3,
      date: 'Oct 20, 2024',
      amount: 780.00,
      status: 'completed',
      type: 'Monthly Payment',
      method: 'Bank Transfer'
    }
  ];

  const earningsData = [
    { month: 'Jan 2024', earnings: 750, sessions: 28 },
    { month: 'Feb 2024', earnings: 820, sessions: 32 },
    { month: 'Mar 2024', earnings: 690, sessions: 25 },
    { month: 'Apr 2024', earnings: 880, sessions: 35 },
    { month: 'May 2024', earnings: 750, sessions: 28 },
    { month: 'Jun 2024', earnings: 920, sessions: 38 }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>
        <p className="text-gray-600 mt-2">Track your earnings and manage payment settings</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mr-4">
              <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">$3,250</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-4">
              <i className="ri-calendar-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sessions This Month</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-4">
              <i className="ri-line-chart-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hourly Rate</p>
              <p className="text-2xl font-bold text-gray-900">$65</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg mr-4">
              <i className="ri-wallet-line text-2xl text-orange-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">$420</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'earnings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {earningsData.map((data, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{data.month.split(' ')[0]}</div>
                        <div className="text-lg font-semibold text-gray-900">${data.earnings}</div>
                        <div className="text-xs text-gray-500">{data.sessions} sessions</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Upcoming Payments</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">Monthly Payment</div>
                          <div className="text-sm text-gray-600">Due: Dec 25, 2024</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">$3,250</div>
                          <div className="text-xs text-orange-600">Processing</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="font-medium text-gray-900">24</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <span className="font-medium text-gray-900">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium text-gray-900">96%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-green-600"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{payment.type}</h3>
                          <p className="text-sm text-gray-600">{payment.date} • {payment.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">${payment.amount.toFixed(2)}</div>
                        <div className={`text-xs font-medium ${
                          payment.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Payment Method</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="ri-bank-line text-blue-600"></i>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Bank Account</div>
                          <div className="text-sm text-gray-600">****1234 • Chase Bank</div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer whitespace-nowrap">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Payment Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
                      <div className="relative">
                        <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
                          Monthly
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Day</label>
                      <div className="relative">
                        <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
                          20th of each month
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Tax Information</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (SSN/EIN)</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="***-**-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Classification</label>
                        <div className="relative">
                          <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
                            Individual
                            <i className="ri-arrow-down-s-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                    Cancel
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorPayments;
