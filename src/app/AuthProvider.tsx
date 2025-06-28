import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInAsTestUser: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AuthProvider: Initializing...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔧 AuthProvider: Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔧 AuthProvider: Auth state changed:', _event, session?.user?.email);
      setSession(session as Session | null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔧 AuthProvider: signIn called with email:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔧 AuthProvider: signIn result:', { error: error?.message });
      return { error };
    } catch (error) {
      console.error('🔧 AuthProvider: signIn error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('🔧 AuthProvider: signUp called with email:', email);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log('🔧 AuthProvider: signUp result:', { error: error?.message });
      return { error };
    } catch (error) {
      console.error('🔧 AuthProvider: signUp error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🔧 AuthProvider: signOut called');
    await supabase.auth.signOut();
  };

  const signInAsTestUser = async (email: string) => {
    console.log('🔧 AuthProvider: signInAsTestUser called with email:', email);
    
    // Only allow in development with test auth enabled
    if (!import.meta.env.DEV || !import.meta.env.VITE_TEST_AUTH) {
      console.error('❌ Test user login not allowed in this environment');
      return { error: { message: 'Test user login not allowed in this environment' } };
    }

    // Validate test user email
    const testEmails = ['admin@demo.dev', 'member@demo.dev'];
    if (!testEmails.includes(email)) {
      console.error('❌ Invalid test user email:', email);
      return { error: { message: 'Invalid test user email' } };
    }

    try {
      // Use default test password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'test123456',
      });
      
      console.log('🔧 AuthProvider: signInAsTestUser result:', { error: error?.message });
      return { error };
    } catch (error) {
      console.error('🔧 AuthProvider: signInAsTestUser error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInAsTestUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 