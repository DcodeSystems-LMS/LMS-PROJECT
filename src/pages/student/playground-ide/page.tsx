import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';

export default function PlaygroundIDE() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove body margins and padding for full-screen experience
    const originalStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
    };

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';

    // Check authentication
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          navigate('/auth/signin');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth/signin');
      }
    };

    checkAuth();

    // Listen for navigation messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigate' && event.data.path) {
        navigate(event.data.path);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup: restore original styles when component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
      document.body.style.margin = originalStyle.margin || '';
      document.body.style.padding = originalStyle.padding || '';
      document.body.style.overflow = originalStyle.overflow || '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
    };
  }, [navigate]);

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        zIndex: 9999
      }}
    >
      <iframe
        src="/judge0-ide/index.html"
        className="w-full h-full border-0"
        title="Judge0 IDE"
        allow="clipboard-read; clipboard-write"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}
