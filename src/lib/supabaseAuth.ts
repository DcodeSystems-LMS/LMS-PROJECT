import { supabase, type User, type Database } from './supabase'

class SupabaseAuthService {
  private currentUser: User | null = null

  async signIn(email: string, password: string): Promise<User> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication')
      }

      // TEMPORARY: Skip email verification for development
      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        console.log('Email not verified but allowing sign in for development');
        // Continue with sign in for development
      }

      // Try to get user profile, but fallback to session data if it doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        // If profile doesn't exist, create it automatically
        console.log('Profile not found, creating new profile...')
        
        const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
          id: authData.user.id,
          email: authData.user.email || email,
          name: authData.user.user_metadata?.name || 'User',
          role: (authData.user.user_metadata?.role || 'student') as 'student' | 'mentor' | 'admin',
          avatar_url: authData.user.user_metadata?.avatar_url || null,
          dark_mode: false, // Default to light mode
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError || !createdProfile) {
          console.warn('Failed to create profile, using session data:', createError)
          const user: User = {
            id: authData.user.id,
            email: authData.user.email || email,
            name: authData.user.user_metadata?.name || 'User',
            role: authData.user.user_metadata?.role || 'student',
            created_at: authData.user.created_at,
            updated_at: new Date().toISOString(),
          }
          this.currentUser = user
          return user
        }

        const profileRow = createdProfile as Database['public']['Tables']['profiles']['Row'];
        const user: User = {
          id: profileRow.id,
          email: profileRow.email,
          name: profileRow.name,
          role: profileRow.role,
          avatar: profileRow.avatar_url,
          dark_mode: profileRow.dark_mode || false,
          created_at: profileRow.created_at,
          updated_at: profileRow.updated_at,
        }
        this.currentUser = user
        return user
      }

      const profileRow = profile as Database['public']['Tables']['profiles']['Row'];
      const user: User = {
        id: profileRow.id,
        email: profileRow.email,
        name: profileRow.name,
        role: profileRow.role,
        avatar: profileRow.avatar_url,
        dark_mode: profileRow.dark_mode || false,
        created_at: profileRow.created_at,
        updated_at: profileRow.updated_at,
      }

      this.currentUser = user
      return user
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign in failed')
    }
  }

  async signUp(email: string, password: string, name: string, role: 'student' | 'mentor' | 'admin' = 'student'): Promise<{ user: User | null; needsVerification: boolean }> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('No user returned from registration')
      }

      // For development: Skip email verification temporarily
      // Check if email verification is required
      const needsVerification = !authData.user.email_confirmed_at

      // TEMPORARY: Skip verification for development
      if (needsVerification) {
        console.log('Email verification required but skipping for development');
        // Return user as if verified for development
        const user: User = {
          id: authData.user.id,
          email: authData.user.email || email,
          name: name,
          role: role,
          created_at: authData.user.created_at,
          updated_at: new Date().toISOString(),
        }

        this.currentUser = user
        return { user, needsVerification: false }
      }

      // User is already verified
      const user: User = {
        id: authData.user.id,
        email: authData.user.email || email,
        name: name,
        role: role,
        created_at: authData.user.created_at,
        updated_at: new Date().toISOString(),
      }

      this.currentUser = user
      return { user, needsVerification: false }
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign up failed')
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      this.currentUser = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error(error instanceof Error ? error.message : 'Sign out failed')
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error)
        return null
      }

      if (!session?.user) {
        this.currentUser = null
        return null
      }

      // Try to get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile) {
        // If profile doesn't exist, create it automatically
        console.log('Profile not found, creating new profile...')
        
        const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          role: (session.user.user_metadata?.role || 'student') as 'student' | 'mentor' | 'admin',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          dark_mode: false, // Default to light mode
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError || !createdProfile) {
          console.warn('Failed to create profile, using session data:', createError)
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            role: session.user.user_metadata?.role || 'student',
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          }
          this.currentUser = user
          return user
        }

        const profileRow = createdProfile as Database['public']['Tables']['profiles']['Row'];
        const user: User = {
          id: profileRow.id,
          email: profileRow.email,
          name: profileRow.name,
          role: profileRow.role,
          avatar: profileRow.avatar_url,
          dark_mode: profileRow.dark_mode || false,
          created_at: profileRow.created_at,
          updated_at: profileRow.updated_at,
        }
        this.currentUser = user
        return user
      }

      const profileRow = profile as Database['public']['Tables']['profiles']['Row'];
      const user: User = {
        id: profileRow.id,
        email: profileRow.email,
        name: profileRow.name,
        role: profileRow.role,
        avatar: profileRow.avatar_url,
        dark_mode: profileRow.dark_mode || false,
        created_at: profileRow.created_at,
        updated_at: profileRow.updated_at,
      }

      this.currentUser = user
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      this.currentUser = null
      return null
    }
  }

  getCurrentUserSync(): User | null {
    return this.currentUser
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      throw new Error(error instanceof Error ? error.message : 'Reset password failed')
    }
  }

  // Initialize auth state and listen for changes
  async initialize(): Promise<void> {
    try {
      // Get initial user
      await this.getCurrentUser()

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.getCurrentUser()
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to resend verification email')
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('id', this.currentUser.id)
        .select()
        .single()

      if (error || !data) {
        throw new Error(error?.message || 'Failed to update profile')
      }

      const profileRow = data as Database['public']['Tables']['profiles']['Row'];
      const updatedUser: User = {
        ...this.currentUser,
        name: profileRow.name,
        avatar: profileRow.avatar_url,
        updated_at: profileRow.updated_at,
      }

      this.currentUser = updatedUser
      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error(error instanceof Error ? error.message : 'Update profile failed')
    }
  }

  // Update user profile with dark mode support
  async updateUserProfile(updates: Partial<User>): Promise<{ error?: any }> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('id', this.currentUser.id)

      if (error) {
        console.error('Update profile error:', error)
        return { error }
      }

      // Update local user data
      this.currentUser = { ...this.currentUser, ...updates }

      return {}
    } catch (error) {
      console.error('Update user profile error:', error)
      return { error }
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService()
export type { User }
