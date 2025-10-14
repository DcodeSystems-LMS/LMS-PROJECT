// Security and Audit Service
import { supabase } from './supabase';

export interface SecuritySettings {
  ipRestrictions: string[];
  browserRestrictions: string[];
  proctoringEnabled: boolean;
  plagiarismDetection: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  sessionTimeout: number; // minutes
  maxConcurrentSessions: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SecurityEvent {
  type: 'suspicious_activity' | 'unauthorized_access' | 'data_breach' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  metadata: any;
}

export class SecurityService {
  private static instance: SecurityService;
  private securitySettings: SecuritySettings;
  private activeSessions: Map<string, any> = new Map();

  constructor() {
    this.securitySettings = this.loadSecuritySettings();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Load security settings
  private loadSecuritySettings(): SecuritySettings {
    return {
      ipRestrictions: [],
      browserRestrictions: [],
      proctoringEnabled: false,
      plagiarismDetection: false,
      encryptionEnabled: true,
      auditLogging: true,
      sessionTimeout: 120, // 2 hours
      maxConcurrentSessions: 3
    };
  }

  // Log audit action
  async logAuditAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: any = null,
    newValues: any = null,
    metadata: any = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.securitySettings.auditLogging) {
        return { success: true };
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
          ...metadata
        });

      if (error) {
        console.error('Error logging audit action:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in logAuditAction:', error);
      return { success: false, error: 'Failed to log audit action' };
    }
  }

  // Get client IP address
  private getClientIP(): string {
    // This would typically be handled by the backend
    // For now, return a placeholder
    return '127.0.0.1';
  }

  // Validate security requirements
  async validateSecurityRequirements(
    userId: string,
    action: string,
    context: any = {}
  ): Promise<{ allowed: boolean; reason?: string; securityFlags: string[] }> {
    const securityFlags: string[] = [];

    // Check IP restrictions
    if (this.securitySettings.ipRestrictions.length > 0) {
      const clientIP = this.getClientIP();
      if (!this.securitySettings.ipRestrictions.includes(clientIP)) {
        securityFlags.push('IP_NOT_ALLOWED');
        return { allowed: false, reason: 'IP address not allowed', securityFlags };
      }
    }

    // Check browser restrictions
    if (this.securitySettings.browserRestrictions.length > 0) {
      const userAgent = navigator.userAgent;
      const isAllowedBrowser = this.securitySettings.browserRestrictions.some(
        browser => userAgent.includes(browser)
      );
      if (!isAllowedBrowser) {
        securityFlags.push('BROWSER_NOT_ALLOWED');
        return { allowed: false, reason: 'Browser not allowed', securityFlags };
      }
    }

    // Check session limits
    if (this.activeSessions.size >= this.securitySettings.maxConcurrentSessions) {
      securityFlags.push('SESSION_LIMIT_EXCEEDED');
      return { allowed: false, reason: 'Maximum concurrent sessions exceeded', securityFlags };
    }

    // Check for suspicious activity
    const suspiciousActivity = await this.detectSuspiciousActivity(userId, action, context);
    if (suspiciousActivity) {
      securityFlags.push('SUSPICIOUS_ACTIVITY');
      await this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        description: `Suspicious activity detected for user ${userId}`,
        userId,
        ipAddress: this.getClientIP(),
        metadata: { action, context }
      });
    }

    return { allowed: true, securityFlags };
  }

  // Detect suspicious activity
  private async detectSuspiciousActivity(
    userId: string,
    action: string,
    context: any
  ): Promise<boolean> {
    try {
      // Get recent audit logs for this user
      const { data: recentLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recent logs:', error);
        return false;
      }

      // Check for rapid-fire actions
      if (recentLogs && recentLogs.length > 10) {
        return true;
      }

      // Check for unusual patterns
      const actionCounts = recentLogs?.reduce((counts, log) => {
        counts[log.action] = (counts[log.action] || 0) + 1;
        return counts;
      }, {});

      // If same action repeated more than 5 times in 5 minutes
      if (actionCounts && Object.values(actionCounts).some(count => count > 5)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in detectSuspiciousActivity:', error);
      return false;
    }
  }

  // Log security event
  async logSecurityEvent(event: SecurityEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          type: event.type,
          severity: event.severity,
          description: event.description,
          user_id: event.userId,
          ip_address: event.ipAddress,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging security event:', error);
        return { success: false, error: error.message };
      }

      // Send alert for high severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.sendSecurityAlert(event);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in logSecurityEvent:', error);
      return { success: false, error: 'Failed to log security event' };
    }
  }

  // Send security alert
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // This would integrate with alerting systems (email, Slack, etc.)
      console.warn('SECURITY ALERT:', event);
      
      // For now, just log to console
      // In production, this would send notifications to administrators
    } catch (error) {
      console.error('Error sending security alert:', error);
    }
  }

  // Encrypt sensitive data
  async encryptData(data: string): Promise<{ encrypted: string; error?: string }> {
    try {
      if (!this.securitySettings.encryptionEnabled) {
        return { encrypted: data };
      }

      // This would use a proper encryption library
      // For now, return base64 encoded data as placeholder
      const encrypted = btoa(data);
      return { encrypted };
    } catch (error) {
      console.error('Error encrypting data:', error);
      return { encrypted: '', error: 'Failed to encrypt data' };
    }
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: string): Promise<{ decrypted: string; error?: string }> {
    try {
      if (!this.securitySettings.encryptionEnabled) {
        return { decrypted: encryptedData };
      }

      // This would use a proper decryption library
      // For now, decode base64 as placeholder
      const decrypted = atob(encryptedData);
      return { decrypted };
    } catch (error) {
      console.error('Error decrypting data:', error);
      return { decrypted: '', error: 'Failed to decrypt data' };
    }
  }

  // Get audit logs
  async getAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resourceType?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number; error?: string }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], total: 0, error: error.message };
      }

      return { logs: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error in getAuditLogs:', error);
      return { logs: [], total: 0, error: 'Failed to fetch audit logs' };
    }
  }

  // Update security settings
  updateSecuritySettings(newSettings: Partial<SecuritySettings>): void {
    this.securitySettings = { ...this.securitySettings, ...newSettings };
    this.saveSecuritySettings();
  }

  // Save security settings
  private saveSecuritySettings(): void {
    try {
      localStorage.setItem('security-settings', JSON.stringify(this.securitySettings));
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  }

  // Get current security settings
  getSecuritySettings(): SecuritySettings {
    return { ...this.securitySettings };
  }

  // Check if proctoring is enabled
  isProctoringEnabled(): boolean {
    return this.securitySettings.proctoringEnabled;
  }

  // Check if plagiarism detection is enabled
  isPlagiarismDetectionEnabled(): boolean {
    return this.securitySettings.plagiarismDetection;
  }

  // Get security dashboard data
  async getSecurityDashboard(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    recentEvents: SecurityEvent[];
    securityScore: number;
  }> {
    try {
      // This would fetch real security metrics
      // For now, return mock data
      return {
        totalEvents: 0,
        criticalEvents: 0,
        recentEvents: [],
        securityScore: 100
      };
    } catch (error) {
      console.error('Error in getSecurityDashboard:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        recentEvents: [],
        securityScore: 0
      };
    }
  }
}

export const securityService = SecurityService.getInstance();
