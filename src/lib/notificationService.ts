// Notification Service for Assessment System
import { supabase } from './supabase';
import type { Database } from './supabase';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export type NotificationType = 
  | 'assessment_published'
  | 'assessment_assigned'
  | 'assessment_due_reminder'
  | 'assessment_submitted'
  | 'assessment_graded'
  | 'assessment_deadline_missed'
  | 'assessment_overdue';

export interface NotificationData {
  assessmentId?: string;
  assessmentTitle?: string;
  studentId?: string;
  mentorId?: string;
  dueDate?: string;
  score?: number;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  emailSent: boolean;
  inAppRead: boolean;
  scheduledFor: string;
  sentAt?: string;
  createdAt: string;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create a new notification
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: NotificationData = {},
    scheduledFor?: Date
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: type as 'info' | 'success' | 'warning' | 'error',
          title,
          message: message + (Object.keys(data).length > 0 ? ` | Data: ${JSON.stringify(data)}` : ''),
          scheduled_for: scheduledFor?.toISOString() || new Date().toISOString()
        } as Database['public']['Tables']['notifications']['Insert'])
        .select()
        .single();

      if (error || !notification) {
        console.error('Error creating notification:', error);
        return { success: false, error: error?.message || 'Failed to create notification' };
      }

      // Send email notification if configured
      if (this.shouldSendEmail(type)) {
        await this.sendEmailNotification(notification as NotificationRow);
      }

      return { success: true, notificationId: notification.id };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return { success: false, error: 'Failed to create notification' };
    }
  }

  // Get notifications for a user
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: Notification[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], error: error.message };
      }

      return { notifications: (data || []) as Notification[] };
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return { notifications: [], error: 'Failed to fetch notifications' };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ in_app_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  // Assessment-specific notifications
  async notifyAssessmentPublished(
    assessmentId: string,
    assessmentTitle: string,
    mentorId: string,
    studentIds: string[]
  ): Promise<void> {
    const promises = studentIds.map(studentId =>
      this.createNotification(
        studentId,
        'assessment_published',
        'New Assessment Available',
        `A new assessment "${assessmentTitle}" has been published and is now available for you to take.`,
        { assessmentId, assessmentTitle, mentorId }
      )
    );

    await Promise.all(promises);
  }

  async notifyAssessmentAssigned(
    assessmentId: string,
    assessmentTitle: string,
    mentorId: string,
    studentIds: string[],
    dueDate?: string
  ): Promise<void> {
    const promises = studentIds.map(studentId =>
      this.createNotification(
        studentId,
        'assessment_assigned',
        'Assessment Assigned',
        `You have been assigned the assessment "${assessmentTitle}".${dueDate ? ` Due: ${new Date(dueDate).toLocaleDateString()}` : ''}`,
        { assessmentId, assessmentTitle, mentorId, dueDate }
      )
    );

    await Promise.all(promises);
  }

  async notifyAssessmentSubmitted(
    assessmentId: string,
    assessmentTitle: string,
    studentId: string,
    mentorId: string
  ): Promise<void> {
    await this.createNotification(
      mentorId,
      'assessment_submitted',
      'Assessment Submitted',
      `Student has submitted the assessment "${assessmentTitle}".`,
      { assessmentId, assessmentTitle, studentId }
    );
  }

  async notifyAssessmentGraded(
    assessmentId: string,
    assessmentTitle: string,
    studentId: string,
    score: number,
    totalScore: number
  ): Promise<void> {
    await this.createNotification(
      studentId,
      'assessment_graded',
      'Assessment Graded',
      `Your assessment "${assessmentTitle}" has been graded. Score: ${score}/${totalScore}`,
      { assessmentId, assessmentTitle, score, totalScore }
    );
  }

  async scheduleDueDateReminder(
    assessmentId: string,
    assessmentTitle: string,
    studentId: string,
    dueDate: Date,
    reminderHours: number = 24
  ): Promise<void> {
    const reminderTime = new Date(dueDate.getTime() - (reminderHours * 60 * 60 * 1000));
    
    if (reminderTime > new Date()) {
      await this.createNotification(
        studentId,
        'assessment_due_reminder',
        'Assessment Due Soon',
        `Your assessment "${assessmentTitle}" is due in ${reminderHours} hours.`,
        { assessmentId, assessmentTitle, dueDate: dueDate.toISOString() },
        reminderTime
      );
    }
  }

  // Check if notification type should send email
  private shouldSendEmail(type: NotificationType): boolean {
    const emailTypes: NotificationType[] = [
      'assessment_published',
      'assessment_assigned',
      'assessment_due_reminder',
      'assessment_graded'
    ];
    return emailTypes.includes(type);
  }

  // Send email notification (placeholder - integrate with email service)
  private async sendEmailNotification(notification: NotificationRow): Promise<void> {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log('Email notification would be sent:', notification);
      
      // Update notification as email sent
      await supabase
        .from('notifications')
        .update({ email_sent: true, sent_at: new Date().toISOString() })
        .eq('id', notification.id);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('email_sent', false)
        .lte('scheduled_for', now);

      if (error) {
        console.error('Error fetching scheduled notifications:', error);
        return;
      }

      const notificationList = (notifications || []) as NotificationRow[];
      for (const notification of notificationList) {
        if (notification.type && this.shouldSendEmail(notification.type as NotificationType)) {
          await this.sendEmailNotification(notification);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('type, in_app_read')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching notification stats:', error);
        return { total: 0, unread: 0, byType: {} };
      }

      const notifications = (data || []) as Pick<NotificationRow, 'type' | 'in_app_read'>[];
      const total = notifications.length;
      const unread = notifications.filter(n => !n.in_app_read).length;
      const byType = notifications.reduce((acc, n) => {
        const type = n.type || 'info';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, unread, byType };
    } catch (error) {
      console.error('Error in getNotificationStats:', error);
      return { total: 0, unread: 0, byType: {} };
    }
  }
}

export const notificationService = NotificationService.getInstance();
