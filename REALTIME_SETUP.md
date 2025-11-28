# 🔄 Real-Time Data Synchronization Setup

## ✅ **What You'll Get**

- **Live Updates**: Data changes instantly across all users
- **No Page Refresh**: Updates happen automatically
- **Multi-User Sync**: See changes from other users in real-time
- **Offline Support**: Supabase handles reconnection automatically

## 🚀 **Step 1: Enable Real-Time in Supabase**

### **1.1 Access Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project: `gtzbjzsjeftkgwvvgefp`
3. Go to **Database** → **Replication**

### **1.2 Enable Real-Time for Tables**
Enable real-time for these tables:
- ✅ `profiles` - User profiles and roles
- ✅ `courses` - Course information
- ✅ `enrollments` - Student enrollments
- ✅ `assessments` - Quizzes and tests
- ✅ `sessions` - Mentoring sessions
- ✅ `discussions` - Forum discussions
- ✅ `notifications` - User notifications

**How to enable:**
1. Find each table in the list
2. Toggle the **Real-time** switch to **ON**
3. Click **Save** for each table

## 🔧 **Step 2: Update Your Components**

### **2.1 Replace Mock Data with Real-Time Hooks**

**Before (Mock Data):**
```tsx
const [mentors, setMentors] = useState([]);
useEffect(() => {
  // Load static data
  setMentors(mockMentors);
}, []);
```

**After (Real-Time Data):**
```tsx
import { useRealtimeProfiles } from '@/hooks/useRealtimeData';

const { profiles, loading, error } = useRealtimeProfiles();
const mentors = profiles.filter(p => p.role === 'mentor');
```

### **2.2 Available Real-Time Hooks**

```tsx
// Get all profiles (students, mentors, admins)
const { profiles, loading, error } = useRealtimeProfiles();

// Get all courses
const { courses, loading, error } = useRealtimeCourses();

// Get all sessions
const { sessions, loading, error } = useRealtimeSessions();

// Get all discussions
const { discussions, loading, error } = useRealtimeDiscussions();

// Get notifications for a specific user
const { notifications, loading, error } = useRealtimeNotifications(userId);

// Get enrollments for a specific student
const { enrollments, loading, error } = useRealtimeStudentEnrollments(studentId);
```

## 📱 **Step 3: Real-Time Features**

### **3.1 Live User Count**
```tsx
const { profiles } = useRealtimeProfiles();
const activeUsers = profiles.length;
```

### **3.2 Live Notifications**
```tsx
const { notifications } = useRealtimeNotifications(userId);
const unreadCount = notifications.filter(n => !n.read).length;
```

### **3.3 Live Course Updates**
```tsx
const { courses } = useRealtimeCourses();
const newCourses = courses.filter(c => 
  new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
);
```

## 🔄 **Step 4: Data Operations**

### **4.1 Create New Data**
```tsx
// Create a new course
const createCourse = async (courseData) => {
  const { data, error } = await supabase
    .from('courses')
    .insert(courseData);
  
  // Real-time update will automatically trigger
  // All users will see the new course instantly
};
```

### **4.2 Update Data**
```tsx
// Update course progress
const updateProgress = async (enrollmentId, progress) => {
  const { error } = await supabase
    .from('enrollments')
    .update({ progress })
    .eq('id', enrollmentId);
  
  // Progress updates instantly for all users
};
```

### **4.3 Delete Data**
```tsx
// Delete a session
const deleteSession = async (sessionId) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);
  
  // Session disappears instantly for all users
};
```

## 🎯 **Step 5: Testing Real-Time**

### **5.1 Test Multi-User Updates**
1. Open your app in **two browser tabs**
2. Sign in as different users
3. Make changes in one tab
4. Watch updates appear instantly in the other tab

### **5.2 Test Live Features**
- **User Registration**: New users appear instantly
- **Course Enrollment**: Enrollments update in real-time
- **Session Booking**: Sessions appear immediately
- **Discussion Posts**: New posts show instantly
- **Notifications**: Notifications appear without refresh

## 🚨 **Important Notes**

### **Performance**
- Real-time subscriptions are **automatically optimized**
- Supabase handles **connection management**
- **Automatic reconnection** on network issues

### **Security**
- **Row Level Security (RLS)** still applies
- Users only see data they're authorized to see
- **Real-time respects all permissions**

### **Billing**
- Real-time is **included** in Supabase plans
- **No additional charges** for real-time features
- **Unlimited connections** per project

## 🎉 **Benefits**

✅ **Instant Updates**: No more page refreshes  
✅ **Multi-User Sync**: See changes from others immediately  
✅ **Better UX**: Smooth, responsive interface  
✅ **Live Collaboration**: Multiple users can work together  
✅ **Real-Time Notifications**: Instant alerts and updates  
✅ **Live Analytics**: Real-time user activity and statistics  

---

**Your app now has real-time data synchronization!** 🚀

All data changes will be instantly visible to all users across all devices.
