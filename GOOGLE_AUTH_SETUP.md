# Google Authentication Setup Guide

## Overview

Your Blood Bridge application now has Google OAuth authentication integrated with Supabase. Users can sign in with their Google accounts and manage their donor profiles.

## Features Implemented

### ✅ Authentication System

- **Google OAuth Integration**: Users can sign in with their Google accounts
- **Supabase Auth**: Secure authentication backend with session management
- **Automatic Profile Creation**: User profiles are automatically created on first sign-in
- **Protected Routes**: Profile page is protected and requires authentication

### ✅ User Interface

- **Login Page**: Clean, modern login interface with Google sign-in button
- **User Profile**: Comprehensive profile management with editable fields
- **Navigation Integration**: User avatar and dropdown menu in navigation
- **Responsive Design**: Works on both desktop and mobile devices

### ✅ User Profile Management

- **Personal Information**: Name, email, phone, location, age, gender
- **Blood Donor Details**: Blood group, availability status
- **Profile Editing**: In-place editing with save/cancel functionality
- **Avatar Display**: Shows Google profile picture or initials

## Setup Instructions

### 1. Supabase Configuration

Your Supabase project is already configured with the following:

- **Project URL**: `https://ynshlwliftchzcshzmrb.supabase.co`
- **Database**: Includes `profiles` table for user data
- **Auth**: OAuth providers configured

### 2. Google OAuth Setup (Required)

To enable Google authentication, you need to configure Google OAuth in your Supabase dashboard:

1. **Go to Supabase Dashboard**:

   - Visit [supabase.com](https://supabase.com)
   - Navigate to your project: `ynshlwliftchzcshzmrb`

2. **Configure Google OAuth**:

   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Add your Google OAuth credentials:
     - **Client ID**: From Google Cloud Console
     - **Client Secret**: From Google Cloud Console

3. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://ynshlwliftchzcshzmrb.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

### 3. Database Setup

The `profiles` table is already configured with the following fields:

- `user_id` (UUID, references auth.users)
- `email` (text)
- `full_name` (text)
- `phone` (text, nullable)
- `location` (text, nullable)
- `age` (integer, nullable)
- `gender` (text, nullable)
- `blood_group` (text, nullable)
- `is_available` (boolean, nullable)
- `is_verified` (boolean, nullable)
- `last_donation_date` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Usage

### For Users

1. **Sign In**: Click "Sign In" in the navigation or visit `/login`
2. **Google Authentication**: Click "Continue with Google" and authorize the app
3. **Profile Setup**: Complete your profile with personal and donor information
4. **Profile Management**: Edit your profile anytime from the user menu

### For Developers

1. **Authentication Context**: Use `useAuth()` hook to access user data
2. **Protected Routes**: Wrap components with `<ProtectedRoute>`
3. **User Data**: Access `user`, `profile`, and `session` from auth context
4. **Profile Updates**: Use `updateProfile()` function to modify user data

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context and hooks
├── components/
│   ├── GoogleAuth.tsx           # Google OAuth login component
│   ├── UserProfile.tsx          # User profile management
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   └── Navigation.tsx           # Updated navigation with auth
├── pages/
│   ├── Login.tsx                # Login page
│   ├── Profile.tsx              # User profile page
│   └── AuthCallback.tsx         # OAuth callback handler
└── integrations/
    └── supabase/
        ├── client.ts            # Supabase client configuration
        └── types.ts             # Database type definitions
```

## Security Features

- **JWT Tokens**: Secure session management with automatic refresh
- **Row Level Security**: Database policies protect user data
- **OAuth 2.0**: Industry-standard authentication protocol
- **HTTPS Only**: Secure communication in production
- **Session Persistence**: Users stay logged in across browser sessions

## Next Steps

1. Configure Google OAuth credentials in Supabase
2. Test the authentication flow
3. Customize the profile fields as needed
4. Add additional OAuth providers if required
5. Implement role-based access control if needed

## Troubleshooting

- **"Authentication failed"**: Check Google OAuth configuration in Supabase
- **"Profile not found"**: Ensure database tables are properly set up
- **Redirect issues**: Verify callback URLs in Google Cloud Console
- **Session issues**: Check browser localStorage and cookies

Your Google authentication system is now ready to use! 🎉
