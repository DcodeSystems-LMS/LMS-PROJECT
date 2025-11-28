
import { supabaseAuthService } from './supabaseAuth'
import type { User } from './supabaseAuth'

class AuthService {
  private currentUser: User | null = null

  async signIn(email: string, password: string): Promise<User> {
    try {
      const user = await supabaseAuthService.signIn(email, password)
      this.currentUser = user
      return user
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign in failed')
    }
  }

  async signUp(email: string, password: string, name: string, role: 'student' | 'mentor' | 'admin' = 'student'): Promise<{ user: User | null; needsVerification: boolean }> {
    try {
      const result = await supabaseAuthService.signUp(email, password, name, role)
      if (result.user) {
        this.currentUser = result.user
      }
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  async signOut(): Promise<void> {
    await supabaseAuthService.signOut()
    this.currentUser = null
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await supabaseAuthService.getCurrentUser()
      this.currentUser = user
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      this.currentUser = null
      return null
    }
  }

  getCurrentUserSync(): User | null {
    return supabaseAuthService.getCurrentUserSync()
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await supabaseAuthService.resetPassword(email)
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(error instanceof Error ? error.message : 'Reset password failed')
    }
  }

  // Initialize auth state
  async initialize(): Promise<void> {
    await supabaseAuthService.initialize()
    this.currentUser = await supabaseAuthService.getCurrentUser()
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      await supabaseAuthService.resendVerificationEmail(email)
    } catch (error) {
      console.error('Resend verification error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to resend verification email')
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    try {
      const user = await supabaseAuthService.updateProfile(updates)
      this.currentUser = user
      return user
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error(error instanceof Error ? error.message : 'Update profile failed')
    }
  }

  // Update user profile with dark mode support
  async updateUserProfile(updates: Partial<User>): Promise<{ error?: any }> {
    try {
      const result = await supabaseAuthService.updateUserProfile(updates)
      if (result.error) {
        return result
      }
      
      // Update local user data
      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...updates }
      }
      
      return {}
    } catch (error) {
      console.error('Update user profile error:', error)
      return { error }
    }
  }
}

export const authService = new AuthService();
export type { User };
