
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  avatar?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
}

// Static credentials configuration
const STATIC_CREDENTIALS: AuthCredentials[] = [
  {
    email: 'admin@dcode.ai',
    password: 'AdminPass123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'mentor@dcode.ai',
    password: 'MentorPass123',
    name: 'Mentor User',
    role: 'mentor'
  },
  {
    email: 'student@dcode.ai',
    password: 'StudentPass123',
    name: 'Student User',
    role: 'student'
  }
];

class MockAuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('dcode_current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('dcode_current_user');
    }
  }

  private saveUserToStorage(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem('dcode_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('dcode_current_user');
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const credentials = STATIC_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    if (!credentials) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: `${credentials.role}_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      role: credentials.role,
      avatar: undefined
    };

    this.currentUser = user;
    this.saveUserToStorage(user);

    return user;
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if email already exists
    const existingCredentials = STATIC_CREDENTIALS.find(cred => cred.email === email);
    if (existingCredentials) {
      throw new Error('An account with this email already exists');
    }

    // For demo purposes, create a student account
    const user: User = {
      id: `student_${Date.now()}`,
      email,
      name,
      role: 'student',
      avatar: undefined
    };

    this.currentUser = user;
    this.saveUserToStorage(user);

    return user;
  }

  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    this.currentUser = null;
    this.saveUserToStorage(null);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async resetPassword(email: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const credentials = STATIC_CREDENTIALS.find(cred => cred.email === email);
    if (!credentials) {
      throw new Error('No account found with this email address');
    }

    // In a real app, this would send an email
    console.log(`Password reset email would be sent to: ${email}`);
  }

  // Initialize auth state (for compatibility with existing code)
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    this.loadUserFromStorage();
    this.isInitialized = true;
  }

  // Get static credentials for reference (admin use only)
  getStaticCredentials(): AuthCredentials[] {
    return [...STATIC_CREDENTIALS];
  }
}

export const mockAuthService = new MockAuthService();
