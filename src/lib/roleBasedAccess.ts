// Role-Based Access Control System
import { supabase } from './supabase';

export type UserRole = 'student' | 'mentor' | 'admin';
export type Permission = string;

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  canCreateAssessments: boolean;
  canViewAllAssessments: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canOverrideSettings: boolean;
}

export class RoleBasedAccess {
  private static instance: RoleBasedAccess;
  private userPermissions: Map<string, UserPermissions> = new Map();

  static getInstance(): RoleBasedAccess {
    if (!RoleBasedAccess.instance) {
      RoleBasedAccess.instance = new RoleBasedAccess();
    }
    return RoleBasedAccess.instance;
  }

  // Get user role and permissions
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    if (this.userPermissions.has(userId)) {
      return this.userPermissions.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user permissions:', error);
        return this.getDefaultPermissions('student');
      }

      const permissions = this.buildPermissions(data.role, data.permissions || {});
      this.userPermissions.set(userId, permissions);
      return permissions;
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      return this.getDefaultPermissions('student');
    }
  }

  // Build permissions based on role
  private buildPermissions(role: UserRole, customPermissions: any): UserPermissions {
    const basePermissions = this.getBasePermissions(role);
    
    return {
      role,
      permissions: [...basePermissions, ...(customPermissions.permissions || [])],
      canCreateAssessments: role === 'mentor' || role === 'admin',
      canViewAllAssessments: role === 'admin',
      canManageUsers: role === 'admin',
      canViewAnalytics: role === 'mentor' || role === 'admin',
      canOverrideSettings: role === 'admin'
    };
  }

  // Get base permissions for each role
  private getBasePermissions(role: UserRole): Permission[] {
    switch (role) {
      case 'admin':
        return [
          'assessments:read:all',
          'assessments:create:all',
          'assessments:update:all',
          'assessments:delete:all',
          'users:read:all',
          'users:create:all',
          'users:update:all',
          'users:delete:all',
          'analytics:read:all',
          'settings:override:all'
        ];
      case 'mentor':
        return [
          'assessments:read:own',
          'assessments:create:own',
          'assessments:update:own',
          'assessments:delete:own',
          'students:read:assigned',
          'analytics:read:own'
        ];
      case 'student':
        return [
          'assessments:read:assigned',
          'assessments:attempt:assigned',
          'results:read:own'
        ];
      default:
        return [];
    }
  }

  // Get default permissions for new users
  private getDefaultPermissions(role: UserRole): UserPermissions {
    return this.buildPermissions(role, {});
  }

  // Check if user has specific permission
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.permissions.includes(permission);
  }

  // Check if user can perform action on resource
  async canPerformAction(
    userId: string, 
    action: string, 
    resourceType: string, 
    resourceId?: string
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    // Admin can do everything
    if (userPermissions.role === 'admin') {
      return true;
    }

    // Check specific permissions
    const permission = `${resourceType}:${action}`;
    
    // Check for specific resource access
    if (resourceId) {
      return await this.checkResourceAccess(userId, action, resourceType, resourceId);
    }

    return userPermissions.permissions.some(p => 
      p.startsWith(permission) || p.includes('all')
    );
  }

  // Check access to specific resource
  private async checkResourceAccess(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    if (resourceType === 'assessments') {
      if (action === 'read' || action === 'update' || action === 'delete') {
        // Check if user owns the assessment
        const { data } = await supabase
          .from('assessments')
          .select('mentor_id')
          .eq('id', resourceId)
          .single();

        return data?.mentor_id === userId;
      }
    }

    return false;
  }

  // Clear user permissions cache
  clearUserPermissions(userId: string): void {
    this.userPermissions.delete(userId);
  }

  // Update user role
  async updateUserRole(userId: string, role: UserRole, permissions?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          permissions: permissions || {},
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      // Clear cache
      this.clearUserPermissions(userId);
      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  // Get all users with their roles (admin only)
  async getAllUsersWithRoles(): Promise<Array<{userId: string, role: UserRole, permissions: any}>> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, permissions');

      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }
}

export const roleBasedAccess = RoleBasedAccess.getInstance();
