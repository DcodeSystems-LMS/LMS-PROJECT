# Local Development Setup Guide

This guide will help you set up the DCode Learning Platform for local development.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** (comes with Node.js)
3. **Supabase account** and project

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the template file
cp env.local.template .env.local

# Edit .env.local with your Supabase credentials
# You'll need to get these from your Supabase project dashboard
```

### 3. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 4. Update .env.local
```bash
# Example .env.local content:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:3000
```

### 5. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents from `supabase-schema-final.sql`
3. Paste and run the SQL to create all necessary tables

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for production (optimized)
npm run build:prod

# Preview production build locally
npm run preview

# Serve production build locally
npm run serve

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── base/           # Basic components (Button, Card, etc.)
│   └── feature/        # Feature-specific components
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── mentor/         # Mentor dashboard pages
│   └── student/        # Student dashboard pages
├── lib/                # External service integrations
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── router/             # Routing configuration
├── services/           # API services
└── utils/              # Utility functions
```

## Authentication Flow

The app uses Supabase Auth with the following flow:
1. User signs up/signs in through Supabase
2. User profile is automatically created via database trigger
3. Role-based access control determines available features

## Available User Roles

- **Student**: Access to courses, assessments, mentoring sessions
- **Mentor**: Can create courses, manage students, conduct sessions
- **Admin**: Full system access, analytics, user management

## Testing Authentication

1. Visit `http://localhost:3000/auth/signup`
2. Create a test account
3. Check your Supabase dashboard → **Authentication** → **Users**
4. Verify the user appears in the **profiles** table

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Check your `.env.local` file has correct values
   - Restart the development server after updating env vars

2. **Database connection issues**:
   - Verify your Supabase project is active
   - Check that the database schema was created successfully

3. **Port already in use**:
   - Change the port in `vite.config.ts` server configuration
   - Or kill the process using port 3000

4. **Build errors**:
   - Run `npm run lint` to check for code issues
   - Ensure all TypeScript types are properly defined

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Router Documentation](https://reactrouter.com/)
- Check the [Vite Documentation](https://vitejs.dev/)

## Next Steps

After successful local setup:
1. Create test users with different roles
2. Add sample courses and content
3. Test all user flows (signup, course enrollment, etc.)
4. Customize the UI and branding
5. Add additional features as needed
