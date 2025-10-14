import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import SuspenseWrapper from '@/components/base/SuspenseWrapper';

// Lazy load components
const Home = lazy(() => import('@/pages/home/page'));
const Product = lazy(() => import('@/pages/product/page'));
const Contact = lazy(() => import('@/pages/contact/page'));
const Courses = lazy(() => import('@/pages/courses/page'));
const Mentors = lazy(() => import('@/pages/mentors/page'));
const Leaderboard = lazy(() => import('@/pages/leaderboard/page'));
const SignIn = lazy(() => import('@/pages/auth/signin/page'));
const SignUp = lazy(() => import('@/pages/auth/signup/page'));
const ResetPassword = lazy(() => import('@/pages/auth/reset-password/page'));
const CreateAdmin = lazy(() => import('@/pages/auth/create-admin/page'));
const Verify = lazy(() => import('@/pages/verify/page'));
const Privacy = lazy(() => import('@/pages/privacy/page'));
const Terms = lazy(() => import('@/pages/terms/page'));
const Cookies = lazy(() => import('@/pages/cookies/page'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const TestAuth = lazy(() => import('@/pages/test-auth/page'));
const Playground = lazy(() => import('@/pages/playground/page'));

// Student Dashboard
const StudentLayout = lazy(() => import('@/pages/student/layout'));
const StudentDashboard = lazy(() => import('@/pages/student/dashboard/page'));
const StudentMyCourses = lazy(() => import('@/pages/student/my-courses/page'));
const StudentCourse = lazy(() => import('@/pages/student/course/page'));
const StudentContinue = lazy(() => import('@/pages/student/continue/page'));
const StudentAssessments = lazy(() => import('@/pages/student/assessments/page'));
const StudentDiscussions = lazy(() => import('@/pages/student/discussions/page'));
const StudentAchievements = lazy(() => import('@/pages/student/achievements/page'));
const StudentJobPlacements = lazy(() => import('@/pages/student/placements/page'));
const StudentProfile = lazy(() => import('@/pages/student/profile/page'));
const StudentSchedule = lazy(() => import('@/pages/student/schedule/page'));
const StudentResumeBuilder = lazy(() => import('@/pages/student/resume-builder/page'));
const StudentSettings = lazy(() => import('@/pages/student/settings/page'));
const StudentNotifications = lazy(() => import('@/pages/student/notifications/page'));
const StudentWishlist = lazy(() => import('@/pages/student/wishlist/page'));

// Mentor Dashboard
const MentorLayout = lazy(() => import('@/pages/mentor/layout'));
const MentorDashboard = lazy(() => import('@/pages/mentor/dashboard/page'));
const MentorStudents = lazy(() => import('@/pages/mentor/students/page'));
const MentorCourses = lazy(() => import('@/pages/mentor/courses/page'));
const MentorAllCourses = lazy(() => import('@/pages/mentor/all-courses/page'));
const MentorDiscussions = lazy(() => import('@/pages/mentor/discussions/page'));
const MentorSessions = lazy(() => import('@/pages/mentor/sessions/page'));
const MentorUploadCourse = lazy(() => import('@/pages/mentor/upload-course/page'));
const MentorMaterials = lazy(() => import('@/pages/mentor/materials/page'));
const MentorAssessments = lazy(() => import('@/pages/mentor/assessments/page'));
const MentorFeedback = lazy(() => import('@/pages/mentor/feedback/page'));
const MentorPayments = lazy(() => import('@/pages/mentor/payments/page'));
const MentorSettings = lazy(() => import('@/pages/mentor/settings/page'));
const MentorProfile = lazy(() => import('@/pages/mentor/profile/page'));

// Admin Dashboard
const AdminLayout = lazy(() => import('@/pages/admin/layout'));
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard/page'));
const AdminStudents = lazy(() => import('@/pages/admin/students/page'));
const AdminMentors = lazy(() => import('@/pages/admin/mentors/page'));
const AdminCourses = lazy(() => import('@/pages/admin/courses/page'));
const AdminAssessments = lazy(() => import('@/pages/admin/assessments/page'));
const AdminPlacements = lazy(() => import('@/pages/admin/placements/page'));
const AdminPayments = lazy(() => import('@/pages/admin/payments/page'));
const AdminAnalytics = lazy(() => import('@/pages/admin/analytics/page'));
const AdminIntegrations = lazy(() => import('@/pages/admin/integrations/page'));
const AdminSettings = lazy(() => import('@/pages/admin/settings/page'));
const AdminProfile = lazy(() => import('@/pages/admin/profile/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SuspenseWrapper><Home /></SuspenseWrapper>
  },
  {
    path: '/product',
    element: <SuspenseWrapper><Product /></SuspenseWrapper>
  },
  {
    path: '/contact',
    element: <SuspenseWrapper><Contact /></SuspenseWrapper>
  },
  {
    path: '/courses',
    element: <SuspenseWrapper><Courses /></SuspenseWrapper>
  },
  {
    path: '/mentors',
    element: <SuspenseWrapper><Mentors /></SuspenseWrapper>
  },
  {
    path: '/leaderboard',
    element: <SuspenseWrapper><Leaderboard /></SuspenseWrapper>
  },
  {
    path: '/auth/signin',
    element: <SuspenseWrapper><SignIn /></SuspenseWrapper>
  },
  {
    path: '/auth/signup',
    element: <SuspenseWrapper><SignUp /></SuspenseWrapper>
  },
  {
    path: '/auth/reset-password',
    element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>
  },
  {
    path: '/auth/create-admin',
    element: <SuspenseWrapper><CreateAdmin /></SuspenseWrapper>
  },
  {
    path: '/verify',
    element: <SuspenseWrapper><Verify /></SuspenseWrapper>
  },
  {
    path: '/privacy',
    element: <SuspenseWrapper><Privacy /></SuspenseWrapper>
  },
  {
    path: '/terms',
    element: <SuspenseWrapper><Terms /></SuspenseWrapper>
  },
  {
    path: '/cookies',
    element: <SuspenseWrapper><Cookies /></SuspenseWrapper>
  },
  {
    path: '/test-auth',
    element: <SuspenseWrapper><TestAuth /></SuspenseWrapper>
  },
  {
    path: '/playground',
    element: <SuspenseWrapper><Playground /></SuspenseWrapper>
  },
  {
    path: '/wishlist',
    element: <SuspenseWrapper><StudentWishlist /></SuspenseWrapper>
  },
  // Student Routes
  {
    path: '/student',
    element: <SuspenseWrapper><StudentLayout /></SuspenseWrapper>,
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><StudentDashboard /></SuspenseWrapper>
      },
      {
        path: 'my-courses',
        element: <SuspenseWrapper><StudentMyCourses /></SuspenseWrapper>
      },
      {
        path: 'course/:courseId',
        element: <SuspenseWrapper><StudentCourse /></SuspenseWrapper>
      },
      {
        path: 'continue',
        element: <SuspenseWrapper><StudentContinue /></SuspenseWrapper>
      },
      {
        path: 'assessments',
        element: <SuspenseWrapper><StudentAssessments /></SuspenseWrapper>
      },
      {
        path: 'discussions',
        element: <SuspenseWrapper><StudentDiscussions /></SuspenseWrapper>
      },
      {
        path: 'achievements',
        element: <SuspenseWrapper><StudentAchievements /></SuspenseWrapper>
      },
      {
        path: 'placements',
        element: <SuspenseWrapper><StudentJobPlacements /></SuspenseWrapper>
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><StudentProfile /></SuspenseWrapper>
      },
      {
        path: 'schedule',
        element: <SuspenseWrapper><StudentSchedule /></SuspenseWrapper>
      },
      {
        path: 'resume-builder',
        element: <SuspenseWrapper><StudentResumeBuilder /></SuspenseWrapper>
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><StudentSettings /></SuspenseWrapper>
      },
      {
        path: 'notifications',
        element: <SuspenseWrapper><StudentNotifications /></SuspenseWrapper>
      },
      {
        path: 'wishlist',
        element: <SuspenseWrapper><StudentWishlist /></SuspenseWrapper>
      }
    ]
  },
  // Mentor Routes
  {
    path: '/mentor',
    element: <SuspenseWrapper><MentorLayout /></SuspenseWrapper>,
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><MentorDashboard /></SuspenseWrapper>
      },
      {
        path: 'students',
        element: <SuspenseWrapper><MentorStudents /></SuspenseWrapper>
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><MentorCourses /></SuspenseWrapper>
      },
      {
        path: 'all-courses',
        element: <SuspenseWrapper><MentorAllCourses /></SuspenseWrapper>
      },
      {
        path: 'discussions',
        element: <SuspenseWrapper><MentorDiscussions /></SuspenseWrapper>
      },
      {
        path: 'sessions',
        element: <SuspenseWrapper><MentorSessions /></SuspenseWrapper>
      },
      {
        path: 'upload-course',
        element: <SuspenseWrapper><MentorUploadCourse /></SuspenseWrapper>
      },
      {
        path: 'materials',
        element: <SuspenseWrapper><MentorMaterials /></SuspenseWrapper>
      },
      {
        path: 'assessments',
        element: <SuspenseWrapper><MentorAssessments /></SuspenseWrapper>
      },
      {
        path: 'feedback',
        element: <SuspenseWrapper><MentorFeedback /></SuspenseWrapper>
      },
      {
        path: 'payments',
        element: <SuspenseWrapper><MentorPayments /></SuspenseWrapper>
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><MentorSettings /></SuspenseWrapper>
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><MentorProfile /></SuspenseWrapper>
      }
    ]
  },
  // Admin Routes
  {
    path: '/admin',
    element: <SuspenseWrapper><AdminLayout /></SuspenseWrapper>,
    children: [
      {
        path: 'dashboard',
        element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
      },
      {
        path: 'students',
        element: <SuspenseWrapper><AdminStudents /></SuspenseWrapper>
      },
      {
        path: 'mentors',
        element: <SuspenseWrapper><AdminMentors /></SuspenseWrapper>
      },
      {
        path: 'courses',
        element: <SuspenseWrapper><AdminCourses /></SuspenseWrapper>
      },
      {
        path: 'assessments',
        element: <SuspenseWrapper><AdminAssessments /></SuspenseWrapper>
      },
      {
        path: 'placements',
        element: <SuspenseWrapper><AdminPlacements /></SuspenseWrapper>
      },
      {
        path: 'payments',
        element: <SuspenseWrapper><AdminPayments /></SuspenseWrapper>
      },
      {
        path: 'analytics',
        element: <SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>
      },
      {
        path: 'integrations',
        element: <SuspenseWrapper><AdminIntegrations /></SuspenseWrapper>
      },
      {
        path: 'settings',
        element: <SuspenseWrapper><AdminSettings /></SuspenseWrapper>
      },
      {
        path: 'profile',
        element: <SuspenseWrapper><AdminProfile /></SuspenseWrapper>
      }
    ]
  },
  {
    path: '*',
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>
  }
];

export default routes;
