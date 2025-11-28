import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import DataService from '@/services/dataService';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsData, enrollmentsData, coursesData] = await Promise.all([
          DataService.getAnalytics(),
          DataService.getEnrollments(),
          DataService.getCourses()
        ]);
        
        setAnalytics(analyticsData);
        
        // Generate recent activity from recent enrollments and courses
        const activities = [];
        
        // Add recent enrollments
        const recentEnrollments = enrollmentsData
          .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
          .slice(0, 3);
        
        for (const enrollment of recentEnrollments) {
          activities.push({
            type: 'enrollment',
            message: `${enrollment.student?.name || 'Student'} enrolled in ${enrollment.course?.title || 'course'}`,
            timestamp: enrollment.enrolled_at,
            icon: 'ri-user-add-line',
            color: 'green'
          });
        }
        
        // Add recent courses
        const recentCourses = coursesData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2);
        
        for (const course of recentCourses) {
          activities.push({
            type: 'course',
            message: `${course.instructor?.name || 'Instructor'} uploaded new course: ${course.title}`,
            timestamp: course.created_at,
            icon: 'ri-book-line',
            color: 'blue'
          });
        }
        
        setRecentActivity(activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="heading-secondary text-gray-900">Admin Dashboard</h1>
        <p className="text-body text-gray-600">Monitor and manage your educational platform</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-section">
        <div className="dashboard-grid">
          <Card variant="stats" className="animate-fade-in-up">
            <div className="flex items-center">
              <div className="p-4 bg-blue-100 rounded-xl">
                <i className="ri-user-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics?.activeUsers || 0}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  Active users
                </p>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-100">
            <div className="flex items-center">
              <div className="p-4 bg-green-100 rounded-xl">
                <i className="ri-group-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Active Mentors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics?.totalUsers - analytics?.activeUsers || 0}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  Platform mentors
                </p>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-200">
            <div className="flex items-center">
              <div className="p-4 bg-purple-100 rounded-xl">
                <i className="ri-book-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics?.totalCourses || 0}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  Available courses
                </p>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-300">
            <div className="flex items-center">
              <div className="p-4 bg-orange-100 rounded-xl">
                <i className="ri-money-dollar-circle-line text-2xl text-orange-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : analytics?.totalEnrollments || 0}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  Student enrollments
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <Card variant="dashboard" className="animate-fade-in-up">
          <h2 className="heading-tertiary text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/admin/students" className="interactive-element p-6 bg-blue-50 rounded-lg border border-blue-200 text-center hover:bg-blue-100 cursor-pointer">
              <i className="ri-user-add-line text-3xl text-blue-600 mb-3"></i>
              <h3 className="font-medium text-gray-900">Manage Students</h3>
              <p className="text-sm text-gray-600">View and manage student accounts</p>
            </Link>
            
            <Link to="/admin/mentors" className="interactive-element p-6 bg-green-50 rounded-lg border border-green-200 text-center hover:bg-green-100 cursor-pointer">
              <i className="ri-group-line text-3xl text-green-600 mb-3"></i>
              <h3 className="font-medium text-gray-900">Mentor Approval</h3>
              <p className="text-sm text-gray-600">Review mentor applications</p>
            </Link>
            
            <Link to="/admin/courses" className="interactive-element p-6 bg-purple-50 rounded-lg border border-purple-200 text-center hover:bg-purple-100 cursor-pointer">
              <i className="ri-book-line text-3xl text-purple-600 mb-3"></i>
              <h3 className="font-medium text-gray-900">Course Management</h3>
              <p className="text-sm text-gray-600">Oversee course content</p>
            </Link>
            
            <Link to="/admin/analytics" className="interactive-element p-6 bg-orange-50 rounded-lg border border-orange-200 text-center hover:bg-orange-100 cursor-pointer">
              <i className="ri-bar-chart-line text-3xl text-orange-600 mb-3"></i>
              <h3 className="font-medium text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-600">Platform performance insights</p>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card variant="dashboard" className="animate-fade-in-up">
          <h2 className="heading-tertiary text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <SimpleDCODESpinner size="sm" className="mx-auto mb-4" />
                <p className="text-gray-500 mt-2">Loading activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`p-2 bg-${activity.color}-100 rounded-full`}>
                    <i className={`${activity.icon} text-${activity.color}-600`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-inbox-line text-2xl text-gray-400"></i>
                <p className="text-gray-500 mt-2">No recent activity</p>
              </div>
            )}
          </div>
        </Card>

        {/* System Status */}
        <Card variant="dashboard" className="animate-fade-in-up animate-delay-100">
          <h2 className="heading-tertiary text-gray-900 mb-6">System Status</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Server Status</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Database</span>
              </div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">API Response</span>
              </div>
              <span className="text-sm text-yellow-600">Slow (245ms)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
