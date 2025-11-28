# 🚀 Code Playground Setup Instructions

## Quick Start Guide

### 1. Database Setup (Required)
Run this SQL script in your Supabase dashboard:

```sql
-- Copy and paste the contents of create-submissions-table.sql
-- into your Supabase SQL Editor and execute it
```

### 2. Access the Playground

You can now access the playground in **3 ways**:

#### Option A: Direct URL
Navigate to: `http://localhost:3000/playground`

#### Option B: Main Navigation
- Click "Playground" in the main header navigation

#### Option C: Student Dashboard
- Sign in as a student
- Look for "Code Playground" in the left sidebar navigation

### 3. Test the Playground

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Sign in to your account** (authentication required)

3. **Navigate to the playground** using any of the methods above

4. **Try writing and running code:**
   - Select a language (Python, C, C++, Java, JavaScript, Go, PHP, Ruby)
   - Write some code
   - Click "Run Code" to execute it
   - View the output in the terminal below

### 4. Features Available

✅ **8 Programming Languages** supported  
✅ **Real-time code execution** via Judge0 API  
✅ **Code history** - saves your previous submissions  
✅ **Input support** - for programs that need stdin  
✅ **Download code** as files  
✅ **Dark/Light theme** toggle  
✅ **Responsive design** for mobile and desktop  
✅ **Authentication required** - secure access  

### 5. Troubleshooting

**If you see "Authentication Required":**
- Make sure you're signed in to your Supabase account
- Check that your Supabase client is properly configured

**If code execution fails:**
- Check browser console for errors
- Try with simple code first (like `print("Hello World")` in Python)
- Ensure you have internet connection for Judge0 API

**If the page doesn't load:**
- Check that all files were created correctly
- Verify the route was added to your router
- Check browser console for any errors

### 6. Next Steps

Once everything is working:
- Try different programming languages
- Test the code history feature
- Experiment with input/output
- Download your code as files
- Switch between light and dark themes

## 🎉 You're All Set!

Your code playground is now fully integrated and ready to use. Students can write, run, and save code in multiple programming languages with a professional coding environment.
