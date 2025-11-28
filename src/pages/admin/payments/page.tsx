import React, { useState } from 'react';

const AdminPayments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const payments = [
    { id: 1, student: 'John Doe', course: 'Full Stack Development', amount: '$1,299', method: 'Credit Card', status: 'completed', date: '2024-01-20', transactionId: 'TXN001234', type: 'course' },
    { id: 2, student: 'Sarah Johnson', course: 'React Fundamentals', amount: '$799', method: 'PayPal', status: 'completed', date: '2024-01-19', transactionId: 'TXN001235', type: 'course' },
    { id: 3, student: 'Mike Chen', course: 'JavaScript Advanced', amount: '$899', method: 'Bank Transfer', status: 'pending', date: '2024-01-21', transactionId: 'TXN001236', type: 'course' },
    { id: 4, student: 'Emily Davis', course: 'Mentorship Session', amount: '$150', method: 'Credit Card', status: 'completed', date: '2024-01-18', transactionId: 'TXN001237', type: 'mentorship' },
    { id: 5, student: 'Alex Wilson', course: 'Python for Data Science', amount: '$1,199', method: 'Credit Card', status: 'failed', date: '2024-01-22', transactionId: 'TXN001238', type: 'course' },
    { id: 6, student: 'Lisa Brown', course: 'Mobile Development', amount: '$1,099', method: 'PayPal', status: 'refunded', date: '2024-01-17', transactionId: 'TXN001239', type: 'course' },
  ];

  const mentorPayouts = [
    { id: 1, mentor: 'Dr. Sarah Wilson', amount: '$2,450', period: 'January 2024', status: 'paid', date: '2024-01-31', sessions: 28, students: 15 },
    { id: 2, mentor: 'Michael Rodriguez', amount: '$1,890', period: 'January 2024', status: 'paid', date: '2024-01-31', sessions: 22, students: 12 },
    { id: 3, mentor: 'Jennifer Lee', amount: '$1,675', period: 'January 2024', status: 'pending', date: '2024-01-31', sessions: 19, students: 10 },
    { id: 4, mentor: 'David Thompson', amount: '$2,120', period: 'January 2024', status: 'processing', date: '2024-01-31', sessions: 24, students: 14 },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesType = selectedType === 'all' || payment.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      case 'paid': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'text-blue-600 bg-blue-100';
      case 'mentorship': return 'text-purple-600 bg-purple-100';
      case 'subscription': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace('$', '').replace(',', '')), 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace('$', '').replace(',', '')), 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Monitor transactions, payouts, and financial analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
              <i className="ri-money-dollar-circle-line text-lg sm:text-2xl text-green-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-yellow-100 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
              <i className="ri-time-line text-lg sm:text-2xl text-yellow-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Pending Payments</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
              <i className="ri-exchange-dollar-line text-lg sm:text-2xl text-blue-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">This Month</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">$85,320</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
              <i className="ri-refund-line text-lg sm:text-2xl text-purple-600"></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Refunds</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">$2,450</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Student Payments */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4 mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Student Payments</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="relative flex-1 sm:flex-none sm:w-32">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                <div className="relative flex-1 sm:flex-none sm:w-32">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="course">Course</option>
                    <option value="mentorship">Mentorship</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-xs">{payment.student.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.student}</div>
                        <div className="text-xs text-gray-500">{payment.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 cursor-pointer p-1">
                        <i className="ri-eye-line text-sm"></i>
                      </button>
                      <button className="text-green-600 hover:text-green-700 cursor-pointer p-1">
                        <i className="ri-download-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Course:</span>
                      <span className="text-sm text-gray-900 truncate ml-2">{payment.course}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{payment.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Method:</span>
                      <span className="text-sm text-gray-600">{payment.method}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Type:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(payment.type)}`}>
                        {payment.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-medium text-xs">{payment.student.charAt(0)}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{payment.student}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{payment.course}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(payment.type)}`}>
                            {payment.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{payment.amount}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{payment.method}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{payment.date}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            <i className="ri-eye-line"></i>
                          </button>
                          <button className="text-green-600 hover:text-green-700 cursor-pointer">
                            <i className="ri-download-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mentor Payouts */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Mentor Payouts</h2>
            <div className="space-y-4">
              {mentorPayouts.map((payout) => (
                <div key={payout.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{payout.mentor}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{payout.period}</div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium text-green-600">{payout.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sessions:</span>
                      <span className="ml-2 font-medium text-gray-900">{payout.sessions}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs sm:text-sm text-gray-500">{payout.students} students</div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 cursor-pointer p-1">
                        <i className="ri-eye-line text-sm"></i>
                      </button>
                      <button className="text-green-600 hover:text-green-700 cursor-pointer p-1">
                        <i className="ri-check-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="ri-bank-card-line text-base sm:text-lg text-blue-600 mr-3"></i>
                  <span className="text-sm text-gray-900">Credit Card</span>
                </div>
                <span className="text-sm font-medium text-gray-900">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="ri-paypal-line text-base sm:text-lg text-blue-600 mr-3"></i>
                  <span className="text-sm text-gray-900">PayPal</span>
                </div>
                <span className="text-sm font-medium text-gray-900">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="ri-bank-line text-base sm:text-lg text-green-600 mr-3"></i>
                  <span className="text-sm text-gray-900">Bank Transfer</span>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">$425,780</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Revenue (YTD)</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">$68,340</div>
            <div className="text-xs sm:text-sm text-gray-600">Mentor Payouts</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">$357,440</div>
            <div className="text-xs sm:text-sm text-gray-600">Net Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">15.7%</div>
            <div className="text-xs sm:text-sm text-gray-600">Growth Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;