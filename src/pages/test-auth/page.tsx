import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/lib/auth';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';

const TestAuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testLogin = async (email: string, role: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      await authService.signIn(email, 'password');
      setMessage(`Successfully logged in as ${role}!`);
      
      // Redirect based on role
      setTimeout(() => {
        switch (role) {
          case 'student':
            window.location.href = '/student/dashboard';
            break;
          case 'mentor':
            window.location.href = '/mentor/dashboard';
            break;
          case 'admin':
            window.location.href = '/admin/dashboard';
            break;
        }
      }, 1000);
    } catch (error) {
      setMessage(`Login failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.signOut();
    setMessage('Logged out successfully!');
  };

  const currentUser = authService.getCurrentUserSync();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-center mb-8">DCODE Auth Test</h1>
          
          {currentUser && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">Currently Logged In:</h3>
              <p className="text-green-700">Name: {currentUser.name}</p>
              <p className="text-green-700">Email: {currentUser.email}</p>
              <p className="text-green-700">Role: {currentUser.role}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">Quick Login Options:</h2>
            
            <div className="grid gap-4">
              <Button
                onClick={() => testLogin('student@example.com', 'student')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Login as Student
              </Button>
              
              <Button
                onClick={() => testLogin('mentor@example.com', 'mentor')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Login as Mentor
              </Button>
              
              <Button
                onClick={() => testLogin('admin@example.com', 'admin')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Login as Admin
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('Successfully') || message.includes('Logged out')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-gray-600">Test Credentials:</p>
            <p className="text-sm text-gray-500">Email: student@example.com, mentor@example.com, admin@example.com</p>
            <p className="text-sm text-gray-500">Password: password</p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestAuthPage;