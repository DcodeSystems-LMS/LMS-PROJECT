import React, { useState, useEffect } from 'react';
import DataService from '@/services/dataService';

const AdminAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [profiles, courses, enrollments, sessions] = await Promise.all([
          DataService.getProfiles(),
          DataService.getCourses(),
          DataService.getEnrollments(),
          DataService.getSessions()
        ]);

        const students = profiles.filter(p => p.role === 'student');
        const mentors = profiles.filter(p => p.role === 'mentor');
        const activeStudents = students.filter(s => s.status === 'active');
        const completedEnrollments = enrollments.filter(e => e.completed_at);
        
        // Calculate revenue (placeholder calculation)
        const totalRevenue = enrollments.length * 12000; // ₹12,000 per enrollment
        
        const analytics = {
          overview: {
            totalUsers: profiles.length,
            activeUsers: activeStudents.length,
            courseCompletions: completedEnrollments.length,
            revenue: totalRevenue,
            growth: {
              users: 12.5, // Placeholder
              revenue: 18.3, // Placeholder
              completions: 15.7, // Placeholder
              engagement: 8.9 // Placeholder
            }
          },
          userEngagement: [
            { metric: 'Daily Active Users', value: Math.floor(activeStudents.length * 0.6), change: 8.5, trend: 'up' },
            { metric: 'Average Session Duration', value: '24 min', change: 12.3, trend: 'up' },
            { metric: 'Course Completion Rate', value: `${Math.round((completedEnrollments.length / enrollments.length) * 100)}%`, change: -2.1, trend: 'down' },
            { metric: 'Student Satisfaction', value: '4.7/5', change: 5.2, trend: 'up' },
          ],
          topCourses: courses.slice(0, 5).map(course => {
            const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
            const completed = courseEnrollments.filter(e => e.completed_at);
            return {
              name: course.title,
              students: courseEnrollments.length,
              completion: Math.round((completed.length / courseEnrollments.length) * 100) || 0,
              revenue: courseEnrollments.length * course.price,
              rating: 4.5 + Math.random() * 0.5
            };
          }),
          mentorPerformance: mentors.slice(0, 4).map(mentor => {
            const mentorSessions = sessions.filter(s => s.mentor_id === mentor.id);
            const completedSessions = mentorSessions.filter(s => s.status === 'completed');
            const uniqueStudents = new Set(mentorSessions.map(s => s.student_id)).size;
            return {
              name: mentor.name,
              rating: 4.5 + Math.random() * 0.5,
              sessions: mentorSessions.length,
              students: uniqueStudents,
              earnings: completedSessions.length * 4000
            };
          }),
          revenueBreakdown: [
            { category: 'Course Sales', amount: Math.round(totalRevenue * 0.76), percentage: 76.3 },
            { category: 'Mentorship', amount: Math.round(totalRevenue * 0.16), percentage: 15.9 },
            { category: 'Certifications', amount: Math.round(totalRevenue * 0.05), percentage: 5.2 },
            { category: 'Premium Support', amount: Math.round(totalRevenue * 0.03), percentage: 2.5 },
          ]
        };

        setAnalyticsData(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 'ri-arrow-up-line text-green-500' : 'ri-arrow-down-line text-red-500';
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into platform performance</p>
          </div>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-4"></i>
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-600">+{analyticsData.overview.growth.users}%</span>
              </div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
              <i className="ri-user-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analyticsData.overview.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-600">+{analyticsData.overview.growth.revenue}%</span>
              </div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
              <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Course Completions</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.courseCompletions.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-600">+{analyticsData.overview.growth.completions}%</span>
              </div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
              <i className="ri-graduation-cap-line text-2xl text-purple-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                <span className="text-sm text-green-600">+{analyticsData.overview.growth.engagement}%</span>
              </div>
            </div>
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg">
              <i className="ri-pulse-line text-2xl text-orange-600"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Engagement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h2>
          <div className="space-y-4">
            {analyticsData.userEngagement.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.metric}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{item.value}</div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center ${getTrendColor(item.trend)}`}>
                    <i className={`${getTrendIcon(item.trend)} mr-1`}></i>
                    <span className="text-sm font-medium">{Math.abs(item.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            {analyticsData.revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Performing Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Courses</h2>
          <div className="space-y-4">
            {analyticsData.topCourses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900">{course.name}</div>
                    <div className="text-sm text-gray-500">{course.students} students enrolled</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      ${course.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-star-fill text-yellow-400 mr-1"></i>
                      {course.rating}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${course.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{course.completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Mentor Performance</h2>
          <div className="space-y-4">
            {analyticsData.mentorPerformance.map((mentor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-medium text-sm">{mentor.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{mentor.name}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-star-fill text-yellow-400 mr-1"></i>
                        {mentor.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      ₹{mentor.earnings.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sessions:</span>
                    <span className="ml-2 font-medium text-gray-900">{mentor.sessions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Students:</span>
                    <span className="ml-2 font-medium text-gray-900">{mentor.students}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mx-auto mb-3">
              <i className="ri-search-line text-2xl text-blue-600"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">45%</div>
            <div className="text-sm text-gray-600">Organic Search</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mx-auto mb-3">
              <i className="ri-share-line text-2xl text-green-600"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">28%</div>
            <div className="text-sm text-gray-600">Social Media</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mx-auto mb-3">
              <i className="ri-links-line text-2xl text-purple-600"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">18%</div>
            <div className="text-sm text-gray-600">Referrals</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg mx-auto mb-3">
              <i className="ri-mail-line text-2xl text-orange-600"></i>
            </div>
            <div className="text-2xl font-bold text-gray-900">9%</div>
            <div className="text-sm text-gray-600">Email Marketing</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-file-excel-line text-2xl text-green-600 mb-2"></i>
            <span className="text-sm font-medium text-gray-900">Export to Excel</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-file-pdf-line text-2xl text-red-600 mb-2"></i>
            <span className="text-sm font-medium text-gray-900">Export to PDF</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-bar-chart-box-line text-2xl text-blue-600 mb-2"></i>
            <span className="text-sm font-medium text-gray-900">Custom Report</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-calendar-schedule-line text-2xl text-purple-600 mb-2"></i>
            <span className="text-sm font-medium text-gray-900">Schedule Report</span>
          </button>
        </div>
      </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="ri-bar-chart-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No analytics data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;