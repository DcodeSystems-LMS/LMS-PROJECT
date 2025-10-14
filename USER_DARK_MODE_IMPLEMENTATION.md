# User-Specific Dark Mode Implementation

## Overview
This implementation provides user-specific dark mode functionality where:
- Dark mode is **disabled by default** for all users
- Individual users can enable dark mode for their account
- Dark mode is **NOT applied** to home page, signup, or login pages
- Only authenticated users can use dark mode

## Implementation Details

### 1. Database Changes
- Added `dark_mode` column to `profiles` table (default: `false`)
- Run the SQL script: `add-dark-mode-column.sql`

### 2. User Interface Updates
- **User Type**: Added `dark_mode?: boolean` to User interface
- **Auth Service**: Updated to handle dark mode preferences
- **Theme Context**: Created new `UserThemeContext` with user-specific logic

### 3. Route Protection
Dark mode is **disabled** on these pages:
- `/` (Home page)
- `/auth/signin` (Login page)
- `/auth/signup` (Signup page)
- `/auth/reset-password`
- `/auth/create-admin`
- `/contact`
- `/courses`
- `/mentors`
- `/leaderboard`
- `/privacy`
- `/terms`
- `/cookies`
- `/verify`
- `/test-auth`

### 4. Components Created/Updated

#### New Components:
- `src/contexts/UserThemeContext.tsx` - User-specific theme management
- `src/components/feature/DarkModeToggle.tsx` - Dark mode toggle component

#### Updated Components:
- `src/App.tsx` - Uses UserThemeProvider instead of ThemeProvider
- `src/lib/supabaseAuth.ts` - Added dark mode support
- `src/lib/supabase.ts` - Updated User interface
- `src/pages/student/settings/page.tsx` - Added dark mode toggle

### 5. Key Features

#### User Authentication Check
```typescript
// Only authenticated users can use dark mode
if (!isUserAuthenticated) {
  setIsDarkModeEnabled(false);
  setThemeState('light');
}
```

#### Route-Based Dark Mode Control
```typescript
// Pages where dark mode is disabled
const DISABLED_DARK_MODE_PAGES = [
  '/', '/auth/signin', '/auth/signup', // ... etc
];

const isDarkModeDisabled = DISABLED_DARK_MODE_PAGES.includes(location.pathname);
```

#### Database Integration
```typescript
// Update user's dark mode preference
await updateUserDarkModePreference(enabled);
```

### 6. Usage

#### For Users:
1. **Sign up/Login** - Dark mode is disabled on auth pages
2. **Navigate to Settings** - Go to `/student/settings` → Appearance tab
3. **Toggle Dark Mode** - Use the "Dark Mode" toggle switch
4. **Preference Saved** - Setting is saved to user's profile

#### For Developers:
```typescript
// Use the new theme context
import { useUserTheme } from '@/contexts/UserThemeContext';

const { isDarkModeEnabled, setDarkModeEnabled, isUserAuthenticated } = useUserTheme();
```

### 7. Behavior Summary

| User State | Page Type | Dark Mode | Notes |
|------------|-----------|-----------|-------|
| Not Authenticated | Any | ❌ Disabled | Always light mode |
| Authenticated | Auth Pages | ❌ Disabled | Home, login, signup |
| Authenticated | App Pages | ✅ User Choice | Based on user preference |
| Authenticated | App Pages | ❌ Default | If user hasn't enabled |

### 8. Database Schema
```sql
ALTER TABLE public.profiles 
ADD COLUMN dark_mode BOOLEAN DEFAULT FALSE;
```

### 9. Files Modified
- `src/contexts/UserThemeContext.tsx` (new)
- `src/components/feature/DarkModeToggle.tsx` (new)
- `src/App.tsx`
- `src/lib/supabaseAuth.ts`
- `src/lib/supabase.ts`
- `src/pages/student/settings/page.tsx`
- `add-dark-mode-column.sql` (new)

## Testing
1. **Unauthenticated Users**: Verify dark mode is disabled on all pages
2. **Authenticated Users**: Test dark mode toggle in settings
3. **Route Protection**: Verify auth pages always use light mode
4. **Persistence**: Check that dark mode preference is saved and restored

## Notes
- Dark mode is completely disabled for unauthenticated users
- Auth pages (home, login, signup) always use light mode
- User preferences are stored in the database and persist across sessions
- The implementation respects user choice while maintaining design consistency on public pages
