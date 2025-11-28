# Code Playground Integration Guide

This guide will help you integrate the fully functional online code playground into your existing React + Supabase LMS portal.

## 🎯 Overview

The code playground includes:
- **Monaco Editor** with syntax highlighting for multiple languages
- **Judge0 API integration** for code execution
- **Supabase authentication** and data persistence
- **Responsive design** with TailwindCSS
- **Dark/Light theme** support
- **Code history** and submission tracking

## 📁 Files Created

### 1. Core Components
- `src/components/Playground.jsx` - Main playground component
- `src/services/judge0Service.js` - Judge0 API service
- `src/utils/languageMap.js` - Language mapping configuration

### 2. Database Setup
- `create-submissions-table.sql` - Supabase table creation script

## 🚀 Integration Steps

### Step 1: Database Setup

1. **Run the SQL script in your Supabase dashboard:**
   ```sql
   -- Copy and paste the contents of create-submissions-table.sql
   -- into your Supabase SQL Editor and execute it
   ```

2. **Verify the table was created:**
   - Go to your Supabase dashboard → Table Editor
   - You should see a new `submissions` table with the following columns:
     - `id` (UUID, Primary Key)
     - `user_id` (UUID, Foreign Key to auth.users)
     - `language` (Text)
     - `code` (Text)
     - `output` (Text)
     - `success` (Boolean)
     - `created_at` (Timestamp)
     - `updated_at` (Timestamp)

### Step 2: Add Route to Your Router

Add the playground route to your existing router configuration:

```tsx
// In your router configuration file (likely src/router/config.tsx or similar)
import Playground from '../components/Playground';

// Add this route to your routes array:
{
  path: '/playground',
  element: <Playground />,
  // Add any auth guards if needed
}
```

### Step 3: Add Navigation Link

Add a navigation link to access the playground:

```tsx
// In your navigation component (Header, Sidebar, etc.)
<Link to="/playground" className="nav-link">
  🚀 Code Playground
</Link>
```

### Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the playground:**
   - Go to `http://localhost:3000/playground`
   - You should see the authentication check first

3. **Sign in and test:**
   - Sign in with your Supabase account
   - Try writing and running code in different languages

## 🎨 Features Overview

### Supported Languages
- **Python** (ID: 71)
- **C** (ID: 50)
- **C++** (ID: 54)
- **Java** (ID: 62)
- **JavaScript** (ID: 63)
- **Go** (ID: 60)
- **PHP** (ID: 68)
- **Ruby** (ID: 72)

### Key Features
- ✅ **Monaco Editor** with syntax highlighting
- ✅ **Real-time code execution** via Judge0 API
- ✅ **Input support** for programs that require stdin
- ✅ **Code history** - saves and loads previous submissions
- ✅ **Download code** as files
- ✅ **Dark/Light theme** toggle
- ✅ **Responsive design** for mobile and desktop
- ✅ **Authentication required** - only logged-in users can access
- ✅ **Error handling** with detailed error messages

### UI Components
- **Language selector** dropdown
- **Code editor** with Monaco Editor
- **Run button** with loading state
- **Output console** with terminal-like styling
- **Input field** for stdin (toggleable)
- **History sidebar** showing past submissions
- **Download/Clear** buttons

## 🔧 Customization Options

### Adding New Languages

To add support for additional languages, edit `src/utils/languageMap.js`:

```javascript
export const languageMap = {
  // ... existing languages
  'Rust': {
    id: 73, // Judge0 language ID
    name: 'Rust',
    defaultCode: 'fn main() {\n    println!("Hello World");\n}',
    extension: 'rs'
  }
};
```

### Styling Customization

The component uses TailwindCSS classes. You can customize the appearance by modifying the className props in `Playground.jsx`.

### Judge0 API Configuration

If you want to use a different Judge0 instance, modify the `JUDGE0_API_URL` in `src/services/judge0Service.js`:

```javascript
const JUDGE0_API_URL = 'https://your-judge0-instance.com';
```

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication Required" message appears:**
   - Ensure user is signed in to Supabase
   - Check that Supabase client is properly configured

2. **Code execution fails:**
   - Check browser console for CORS errors
   - Verify Judge0 API is accessible
   - Ensure code is valid for the selected language

3. **Database errors:**
   - Verify the `submissions` table was created correctly
   - Check RLS policies are properly set up
   - Ensure user has proper permissions

4. **Monaco Editor not loading:**
   - Check that `@monaco-editor/react` is installed
   - Verify there are no console errors

### Debug Mode

Add this to your browser console to enable debug logging:

```javascript
localStorage.setItem('debug', 'playground:*');
```

## 🔒 Security Considerations

- **RLS Policies**: The submissions table has Row Level Security enabled
- **User Isolation**: Users can only see their own submissions
- **Input Validation**: Code is validated before execution
- **Rate Limiting**: Consider implementing rate limiting for code execution

## 🚀 Production Deployment

### Environment Variables
No additional environment variables are required. The playground uses:
- Existing Supabase configuration
- Public Judge0 API (no API key needed)

### Performance Optimization
- Monaco Editor is loaded on-demand
- Code history is limited to 10 recent submissions
- Output is truncated for very long results

### Monitoring
Consider adding:
- Error tracking (Sentry, etc.)
- Usage analytics
- Performance monitoring

## 📈 Future Enhancements

### Planned Features
- [ ] **Code sharing** - Generate shareable links
- [ ] **Collaborative editing** - Real-time collaboration
- [ ] **Custom test cases** - Add input/output validation
- [ ] **Code templates** - Pre-built code snippets
- [ ] **Execution time limits** - Prevent infinite loops
- [ ] **File upload support** - Upload and run files
- [ ] **Code formatting** - Auto-format code
- [ ] **IntelliSense** - Enhanced code completion

### Self-hosted Judge0
For production use, consider setting up your own Judge0 instance:
- Better performance
- Custom language support
- No rate limits
- Enhanced security

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Test with simple code first
4. Check Judge0 API status

## 🎉 Success!

Your code playground is now fully integrated! Users can:
- Write code in multiple languages
- Execute code in real-time
- Save and load their code history
- Download their code
- Switch between light and dark themes

The playground provides a professional coding environment similar to platforms like NxtWave, CodePen, and Replit.
