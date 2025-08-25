import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for skip auth on mount
  useEffect(() => {
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      // Create a mock user for demo purposes
      const mockUser: User = {
        id: 'demo-user-id',
        name: 'Usuario Demo',
        email: 'demo@chaski.com',
        role: 'buyer',
        profileImage: undefined,
        ci: undefined,
        address: 'Cochabamba, Bolivia',
        phoneNumber: '70123456'
      };
      setUser(mockUser);
      setIsLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    // Skip Supabase auth if using demo mode
    const skipAuth = localStorage.getItem('skipAuth');
    if (skipAuth === 'true') {
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        try {
          // Try to fetch existing profile
          const existingProfile = await fetchUserProfile(session.user.id);
          
          if (existingProfile) {
            // Profile exists, use it
            setUserFromProfile(existingProfile, session.user.email || '');
          } else {
            // No profile exists, create one for OAuth users
            if (session.user.app_metadata?.provider && session.user.app_metadata.provider !== 'email') {
              // This is an OAuth user, create profile automatically
              const newProfile = await createOAuthProfile(session.user.id, session.user.user_metadata || {});
              setUserFromProfile(newProfile, session.user.email || '');
            } else {
              // This is an email user without profile (shouldn't happen normally)
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, this is expected for new OAuth users
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const createOAuthProfile = async (userId: string, userMetadata: any) => {
    try {
      const profileData = {
        id: userId,
        name: userMetadata.full_name || userMetadata.name || '',
        role: 'buyer' as const,
        profile_image: userMetadata.avatar_url || userMetadata.picture || null,
        ci: null,
        address: null,
        phone_number: null
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating OAuth profile:', error);
      throw error;
    }
  };

  const setUserFromProfile = (profileData: any, email: string) => {
    setUser({
      id: profileData.id,
      name: profileData.name || '',
      email: email,
      role: profileData.role,
      profileImage: profileData.profile_image || undefined,
      ci: profileData.ci || undefined,
      address: profileData.address || undefined,
      phoneNumber: profileData.phone_number || undefined,
      averageRating: profileData.average_rating || 0,
      totalRatings: profileData.total_ratings || 0
    });
  };

  const createUserProfile = async (userId: string, userData: Partial<User>) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: userData.name,
        role: userData.role || 'buyer',
        profile_image: userData.profileImage,
        ci: userData.ci,
        address: userData.address,
        phone_number: userData.phoneNumber
      });

    if (error) throw error;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithApple = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    // Clear demo mode
    localStorage.removeItem('skipAuth');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateUserProfile = async (updates: { address?: string; phone_number?: string }) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    // Update local user state
    setUser(prev => prev ? {
      ...prev,
      address: updates.address ?? prev.address,
      phoneNumber: updates.phone_number ?? prev.phoneNumber,
      averageRating: prev.averageRating,
      totalRatings: prev.totalRatings
    } : null);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  };
  const register = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      await createUserProfile(data.user.id, userData);
    }
  };

  return {
    user,
    supabaseUser,
    login,
    loginWithGoogle,
    loginWithApple,
    logout,
    register,
    updateUserProfile,
    updatePassword,
    isLoading
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};