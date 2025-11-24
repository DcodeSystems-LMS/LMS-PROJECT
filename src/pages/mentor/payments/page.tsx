
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
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments & Earnings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Track your earnings and manage payment settings</p>
      </div>

      {/* Earnings Overview - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 rounded-lg mr-2 sm:mr-4">
              <i className="ri-money-dollar-circle-line text-lg sm:text-2xl text-green-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">This Month</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">$3,250</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-2 sm:mr-4">
              <i className="ri-calendar-line text-lg sm:text-2xl text-blue-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Sessions</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">42</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-2 sm:mr-4">
              <i className="ri-line-chart-line text-lg sm:text-2xl text-purple-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Hourly Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">$65</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center bg-orange-100 rounded-lg mr-2 sm:mr-4">
              <i className="ri-wallet-line text-lg sm:text-2xl text-orange-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">$420</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 px-3 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap flex items-center flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-1 sm:mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {activeTab === 'earnings' && (
            <div>
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Earnings Overview</h2>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {earningsData.map((data, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">{data.month.split(' ')[0]}</div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-900">${data.earnings}</div>
                        <div className="text-xs text-gray-500">{data.sessions} sessions</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Upcoming Payments</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base">Monthly Payment</div>
                          <div className="text-xs sm:text-sm text-gray-600">Due: Dec 25, 2024</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-base sm:text-lg font-semibold text-gray-900">$3,250</div>
                          <div className="text-xs text-orange-600">Processing</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Performance Metrics</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600">Total Students</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">24</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600">Average Rating</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">96%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment History</h2>
              <div className="space-y-3 sm:space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-money-dollar-circle-line text-green-600 text-sm sm:text-base"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{payment.type}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{payment.date} • {payment.method}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-semibold text-gray-900">${payment.amount.toFixed(2)}</div>
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
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Payment Settings</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Payment Method</h3>
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-bank-line text-blue-600 text-sm sm:text-base"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base">Bank Account</div>
                          <div className="text-xs sm:text-sm text-gray-600 truncate">****1234 • Chase Bank</div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap self-start sm:self-auto">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Payment Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Payment Frequency</label>
                      <div className="relative">
                        <button className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm cursor-pointer">
                          Monthly
                          <i className="ri-arrow-down-s-line text-xs sm:text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Payment Day</label>
                      <div className="relative">
                        <button className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm cursor-pointer">
                          <span className="truncate">20th of each month</span>
                          <i className="ri-arrow-down-s-line text-xs sm:text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Tax Information</h3>
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tax ID (SSN/EIN)</label>
                        <input
                          type="text"
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                          placeholder="***-**-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tax Classification</label>
                        <div className="relative">
                          <button className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm cursor-pointer">
                            Individual
                            <i className="ri-arrow-down-s-line text-xs sm:text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer text-xs sm:text-sm w-full sm:w-auto">
                    Cancel
                  </button>
                  <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer text-xs sm:text-sm w-full sm:w-auto">
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
