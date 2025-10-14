import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Type definitions
type Profile = Database['public']['Tables']['profiles']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];
type Assessment = Database['public']['Tables']['assessments']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Discussion = Database['public']['Tables']['discussions']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

// Real-time data service
class RealtimeDataService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to profiles changes
  subscribeToProfiles(callback: (profiles: Profile[]) => void) {
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        async () => {
          const { data } = await supabase.from('profiles').select('*');
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set('profiles', channel);
    return channel;
  }

  // Subscribe to courses changes
  subscribeToCourses(callback: (courses: Course[]) => void) {
    const channel = supabase
      .channel('courses-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        async () => {
          const { data } = await supabase.from('courses').select('*');
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set('courses', channel);
    return channel;
  }

  // Subscribe to sessions changes
  subscribeToSessions(callback: (sessions: Session[]) => void) {
    const channel = supabase
      .channel('sessions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        async () => {
          const { data } = await supabase.from('sessions').select('*');
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set('sessions', channel);
    return channel;
  }

  // Subscribe to discussions changes
  subscribeToDiscussions(callback: (discussions: Discussion[]) => void) {
    const channel = supabase
      .channel('discussions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'discussions' },
        async () => {
          const { data } = await supabase.from('discussions').select('*');
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set('discussions', channel);
    return channel;
  }

  // Subscribe to notifications for a specific user
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set(`notifications-${userId}`, channel);
    return channel;
  }

  // Subscribe to enrollments for a specific student
  subscribeToStudentEnrollments(studentId: string, callback: (enrollments: Enrollment[]) => void) {
    const channel = supabase
      .channel(`enrollments-${studentId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'enrollments',
          filter: `student_id=eq.${studentId}`
        },
        async () => {
          const { data } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', studentId);
          if (data) callback(data);
        }
      )
      .subscribe();

    this.channels.set(`enrollments-${studentId}`, channel);
    return channel;
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get initial data and set up real-time subscription
  async getProfilesWithRealtime(callback: (profiles: Profile[]) => void) {
    // Get initial data
    const { data: initialData } = await supabase.from('profiles').select('*');
    if (initialData) callback(initialData);

    // Set up real-time subscription
    return this.subscribeToProfiles(callback);
  }

  async getCoursesWithRealtime(callback: (courses: Course[]) => void) {
    // Get initial data
    const { data: initialData } = await supabase.from('courses').select('*');
    if (initialData) callback(initialData);

    // Set up real-time subscription
    return this.subscribeToCourses(callback);
  }

  async getSessionsWithRealtime(callback: (sessions: Session[]) => void) {
    // Get initial data
    const { data: initialData } = await supabase.from('sessions').select('*');
    if (initialData) callback(initialData);

    // Set up real-time subscription
    return this.subscribeToSessions(callback);
  }

  async getDiscussionsWithRealtime(callback: (discussions: Discussion[]) => void) {
    // Get initial data
    const { data: initialData } = await supabase.from('discussions').select('*');
    if (initialData) callback(initialData);

    // Set up real-time subscription
    return this.subscribeToDiscussions(callback);
  }

  async getNotificationsWithRealtime(userId: string, callback: (notifications: Notification[]) => void) {
    // Get initial data
    const { data: initialData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (initialData) callback(initialData);

    // Set up real-time subscription
    return this.subscribeToNotifications(userId, callback);
  }
}

// Export singleton instance
export const realtimeDataService = new RealtimeDataService();

// Export individual functions for easy use
export const {
  getProfilesWithRealtime,
  getCoursesWithRealtime,
  getSessionsWithRealtime,
  getDiscussionsWithRealtime,
  getNotificationsWithRealtime,
  unsubscribe,
  unsubscribeAll
} = realtimeDataService;
