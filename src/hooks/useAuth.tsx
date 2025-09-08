import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
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
  updateUserProfile: (updates: { address?: string; phone_number?: string }) => Promise<void>;
  updateUserProfile: (updates: { address?: string; phone_number?: string; ci?: string; name?: string }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
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
  const [authError, setAuthError] = useState<string | null>(null);

  // Función para establecer un timeout en operaciones de autenticación
  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    let timeoutId: NodeJS.Timeout;
    
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('La operación ha excedido el tiempo máximo de espera'));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  };

  const setUserFromProfile = (profile: {
    id: string;
    name: string | null;
    role: 'buyer' | 'seller' | 'admin';
    profile_image: string | null;
    ci: string | null;
    address: string | null;
    phone_number: string | null;
    average_rating: number | null;
    total_ratings: number | null;
  }, email: string): void => {
    setUser({
      id: profile.id,
      name: profile.name || '',
      email,
      role: profile.role,
      profileImage: profile.profile_image || undefined,
      ci: profile.ci || undefined,
      address: profile.address || undefined,
      phoneNumber: profile.phone_number || undefined,
      averageRating: profile.average_rating || 0,
      totalRatings: profile.total_ratings || 0
    });
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
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

  const createProfileForNewUser = async (userId: string, userMetadata: any, userData?: Partial<User>) => {
    try {
      const profileData = {
        id: userId,
        name: userData?.name || userMetadata.full_name || userMetadata.name || '',
        role: (userData?.role || 'buyer') as const,
        profile_image: userData?.profileImage || userMetadata.avatar_url || userMetadata.picture || null,
        ci: userData?.ci || null,
        address: userData?.address || null,
        phone_number: userData?.phoneNumber || null
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile for new user:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const initializeAuth = async () => {
      try {
        // Skip Supabase auth if using demo mode
        const skipAuth = localStorage.getItem('skipAuth');
        if (skipAuth === 'true') {
          const mockUser: User = {
            id: 'demo-user-id',
            name: 'Usuario Demo',
            email: 'demo@chaski.com',
            role: 'buyer',
            profileImage: undefined,
            ci: undefined,
            address: 'Cochabamba, Bolivia',
            phoneNumber: '70123456',
            averageRating: 0,
            totalRatings: 0
          };
          if (isSubscribed) {
            setUser(mockUser);
            setIsLoading(false);
          }
          return;
        }

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile && isSubscribed) {
            setUserFromProfile(profile, session.user.email || '');
            setSupabaseUser(session.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isSubscribed = false;
    };

    let mounted = true;

    // Get initial session
    const initializeSession = async () => {
      try {
        if (!mounted) return;

        // Verificar si hay una sesión almacenada localmente
        const localAuth = localStorage.getItem('supabase.auth.token');
        if (!localAuth) {
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          
          if (!mounted) return;
          
          if (profile) {
            setUserFromProfile(profile, session.user.email || '');
          } else {
            // Si no hay perfil y no es un usuario nuevo, hacer logout
            const isNewUser = session.user.app_metadata?.provider !== 'email';
            if (!isNewUser) {
              await logout();
              return;
            }
          }
        } else {
          // Si no hay sesión pero hay token local, limpiar
          localStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        // En caso de error, limpiar el estado
        setUser(null);
        setSupabaseUser(null);
        localStorage.removeItem('supabase.auth.token');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session);
      
      if (!mounted) return;
      
      setSupabaseUser(session?.user ?? null);
      
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUserFromProfile(profile, session.user.email || '');
        } else if (session.user.app_metadata?.provider && session.user.app_metadata.provider !== 'email') {
          // For OAuth users, try to create profile or update existing one
          try {
            const newProfile = await createProfileForNewUser(session.user.id, session.user.user_metadata || {});
            if (newProfile) {
              setUserFromProfile(newProfile, session.user.email || '');
            }
          } catch (error) {
            // If profile creation fails, try to update existing profile with OAuth data
            console.log('Profile creation failed, trying to update existing profile');
            try {
              const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .limit(1);

              if (!fetchError && existingProfile && existingProfile.length > 0) {
                // Update existing profile with OAuth image
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({
                    profile_image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
                    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || existingProfile[0].name,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', session.user.id);

                if (!updateError) {
                  // Fetch updated profile
                  const { data: updatedProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .limit(1);

                  if (updatedProfile && updatedProfile.length > 0) {
                    setUserFromProfile(updatedProfile[0], session.user.email || '');
                  }
                }
              }
            } catch (updateError) {
              console.error('Error updating OAuth profile:', updateError);
            }
          }
        } else if (event === 'SIGNED_IN') {
          // For email users who just signed up, create profile if it doesn't exist
          try {
            const existingProfile = await fetchUserProfile(session.user.id);
            if (!existingProfile) {
              // Get user data from session metadata if available
              const userData = session.user.user_metadata || {};
              const newProfile = await createProfileForNewUser(session.user.id, userData, userData);
              if (newProfile) {
                setUserFromProfile(newProfile, session.user.email || '');
              }
            }
          } catch (error) {
            console.error('Error creating profile for new email user:', error);
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password
        })
      );
      
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      
      if (!data.user) {
        const noUserError = new Error('No se pudo obtener la información del usuario');
        setAuthError(noUserError.message);
        throw noUserError;
      }
      
      // El perfil se obtendrá automáticamente a través del listener de onAuthStateChange
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            skipBrowserRedirect: false
          }
        })
      );
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithApple = async () => {
    setIsLoading(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/`,
            skipBrowserRedirect: false
          }
        })
      );
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name
          }
        }
      })
      );

      if (error) {
        setAuthError(error.message);
        throw error;
      }
      if (!data.user) throw new Error('No se pudo crear el usuario');

      // Profile will be created automatically through the auth state change listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Primero limpiar el estado local
      setUser(null);
      setSupabaseUser(null);
      localStorage.removeItem('skipAuth');
      localStorage.removeItem('supabase.auth.token');
      
      try {
        // Intentar hacer logout en Supabase
        await supabase.auth.signOut();
      } catch (error) {
        // Si falla el logout en Supabase, no bloqueamos el proceso
        console.warn('Error en Supabase signOut:', error);
      }

      // Limpiar cualquier otra data de la sesión
      sessionStorage.clear();
      
      // Redirigir después de limpiar todo
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: { address?: string; phone_number?: string; ci?: string; name?: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        name: updates.name ?? prev.name,
        address: updates.address ?? prev.address,
        phoneNumber: updates.phone_number ?? prev.phoneNumber,
        ci: updates.ci ?? prev.ci
      } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
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
