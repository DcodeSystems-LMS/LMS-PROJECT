import { useState, useEffect, useCallback } from 'react';
import { realtimeDataService } from '@/services/realtimeDataService';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Discussion = Database['public']['Tables']['discussions']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];

// Hook for real-time profiles
export const useRealtimeProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial data
        console.log('🔄 Fetching initial profiles data...');
        const { data: initialData, error: initialError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (initialError) {
          console.error('❌ Error fetching initial data:', initialError);
          throw initialError;
        }

        if (mounted) {
          console.log('✅ Initial profiles loaded:', initialData?.length || 0, 'profiles');
          setProfiles(initialData || []);
          setLastUpdate(new Date());
        }

        // Set up real-time subscription with better error handling
        console.log('🔄 Setting up real-time subscription...');
        try {
          channel = supabase
            .channel('profiles-realtime')
            .on('postgres_changes', 
              { 
                event: '*', 
                schema: 'public', 
                table: 'profiles' 
              },
              async (payload) => {
                console.log('📡 Real-time update received:', payload);
                
                if (mounted) {
                  // Refetch all profiles to ensure we have the latest data
                  const { data: updatedData, error: updateError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                  if (!updateError && updatedData) {
                    console.log('✅ Profiles updated via real-time:', updatedData.length, 'profiles');
                    setProfiles(updatedData);
                    setLastUpdate(new Date());
                  } else {
                    console.error('❌ Error updating profiles:', updateError);
                  }
                }
              }
            )
            .subscribe((status) => {
              console.log('📡 Real-time subscription status:', status);
              if (status === 'SUBSCRIBED') {
                console.log('✅ Real-time subscription active');
                if (mounted) {
                  setLoading(false);
                }
              } else if (status === 'CHANNEL_ERROR') {
                console.warn('⚠️ Real-time channel error - continuing without real-time updates');
                if (mounted) {
                  setLoading(false);
                  // Don't set error for real-time failures, just log it
                }
              } else if (status === 'TIMED_OUT') {
                console.warn('⚠️ Real-time subscription timed out - continuing without real-time updates');
                if (mounted) {
                  setLoading(false);
                }
              } else if (status === 'CLOSED') {
                console.warn('⚠️ Real-time subscription closed - continuing without real-time updates');
                if (mounted) {
                  setLoading(false);
                }
              }
            });
        } catch (realtimeError) {
          console.warn('⚠️ Failed to set up real-time subscription:', realtimeError);
          // Continue without real-time features
          if (mounted) {
            setLoading(false);
          }
        }

      } catch (err) {
        console.error('❌ Error setting up profiles data:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profiles');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        console.log('🔄 Cleaning up real-time subscription...');
        try {
          supabase.removeChannel(channel);
        } catch (cleanupError) {
          console.warn('⚠️ Error cleaning up real-time subscription:', cleanupError);
        }
      }
    };
  }, []);

  return { profiles, loading, error, lastUpdate };
};

// Hook for real-time courses
export const useRealtimeCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        const channel = await realtimeDataService.getCoursesWithRealtime((data) => {
          if (mounted) {
            setCourses(data);
            setLoading(false);
          }
        });

        return channel;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load courses');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      realtimeDataService.unsubscribe('courses');
    };
  }, []);

  return { courses, loading, error };
};

// Hook for real-time sessions
export const useRealtimeSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        const channel = await realtimeDataService.getSessionsWithRealtime((data) => {
          if (mounted) {
            setSessions(data);
            setLoading(false);
          }
        });

        return channel;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load sessions');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      realtimeDataService.unsubscribe('sessions');
    };
  }, []);

  return { sessions, loading, error };
};

// Hook for real-time discussions
export const useRealtimeDiscussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        const channel = await realtimeDataService.getDiscussionsWithRealtime((data) => {
          if (mounted) {
            setDiscussions(data);
            setLoading(false);
          }
        });

        return channel;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load discussions');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      realtimeDataService.unsubscribe('discussions');
    };
  }, []);

  return { discussions, loading, error };
};

// Hook for real-time notifications
export const useRealtimeNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        const channel = await realtimeDataService.getNotificationsWithRealtime(
          userId,
          (data) => {
            if (mounted) {
              setNotifications(data);
              setLoading(false);
            }
          }
        );

        return channel;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load notifications');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      realtimeDataService.unsubscribe(`notifications-${userId}`);
    };
  }, [userId]);

  return { notifications, loading, error };
};

// Hook for real-time student enrollments
export const useRealtimeStudentEnrollments = (studentId: string) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    let mounted = true;

    const setupRealtime = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial data
        const { data: initialData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', studentId);

        if (initialData && mounted) {
          setEnrollments(initialData);
          setLoading(false);
        }

        // Set up real-time subscription
        const channel = realtimeDataService.subscribeToStudentEnrollments(
          studentId,
          (data) => {
            if (mounted) {
              setEnrollments(data);
              setLoading(false);
            }
          }
        );

        return channel;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load enrollments');
          setLoading(false);
        }
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      realtimeDataService.unsubscribe(`enrollments-${studentId}`);
    };
  }, [studentId]);

  return { enrollments, loading, error };
};

