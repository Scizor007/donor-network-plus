import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileSetupComplete: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  completeProfileSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setProfileSetupComplete(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating new profile for user:', userId);
        await createProfile(userId);
      } else if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      } else {
        setProfile(data);
        // Check if profile setup is complete (has all required fields)
        const isComplete = data.full_name && data.age && data.gender && data.blood_group && data.phone && data.address && data.city;
        setProfileSetupComplete(isComplete);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: userData.user.email!,
          full_name: userData.user.user_metadata?.full_name ||
            userData.user.user_metadata?.name ||
            userData.user.email?.split('@')[0] || 'User',
          user_type: 'user', // Default to user, will be updated to donor after registration
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setLoading(false);
      } else {
        setProfile(data);
        // Profile is created but not complete, so setup is not complete
        setProfileSetupComplete(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      // Clear all state
      setUser(null);
      setProfile(null);
      setSession(null);
      setProfileSetupComplete(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setProfile(data);
      // Check if profile setup is complete after update
      const isComplete = data.full_name && data.age && data.gender && data.blood_group && data.phone && data.address && data.city;
      setProfileSetupComplete(isComplete);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const completeProfileSetup = () => {
    setProfileSetupComplete(true);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    profileSetupComplete,
    signInWithGoogle,
    signOut,
    updateProfile,
    completeProfileSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
