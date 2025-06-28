// Local SQLite database for development/testing
// This provides a fallback when Supabase is not fully configured

import { createClient } from '@supabase/supabase-js';

// Mock Supabase client with local storage
class LocalSupabaseClient {
  private users: Map<string, any> = new Map();
  private profiles: Map<string, any> = new Map();
  private subscriptions: Map<string, any[]> = new Map();
  private currentUser: any = null;

  constructor() {
    // Load data from localStorage
    this.loadFromStorage();
    console.log('🔧 LocalSupabaseClient initialized');
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem('local_users');
      const storedProfiles = localStorage.getItem('local_profiles');
      const storedSubscriptions = localStorage.getItem('local_subscriptions');
      const storedCurrentUser = localStorage.getItem('local_current_user');

      if (storedUsers) this.users = new Map(JSON.parse(storedUsers));
      if (storedProfiles) this.profiles = new Map(JSON.parse(storedProfiles));
      if (storedSubscriptions) this.subscriptions = new Map(JSON.parse(storedSubscriptions));
      if (storedCurrentUser) this.currentUser = JSON.parse(storedCurrentUser);
      
      console.log('📊 Loaded from localStorage:', {
        users: this.users.size,
        profiles: this.profiles.size,
        subscriptions: this.subscriptions.size,
        currentUser: !!this.currentUser
      });
    } catch (error) {
      console.log('No existing local data found');
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('local_users', JSON.stringify(Array.from(this.users.entries())));
      localStorage.setItem('local_profiles', JSON.stringify(Array.from(this.profiles.entries())));
      localStorage.setItem('local_subscriptions', JSON.stringify(Array.from(this.subscriptions.entries())));
      localStorage.setItem('local_current_user', JSON.stringify(this.currentUser));
      console.log('💾 Saved to localStorage');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  auth = {
    getUser: async () => {
      console.log('🔧 Local getUser called, current user:', this.currentUser?.email);
      return { data: { user: this.currentUser }, error: null };
    },

    getSession: async () => {
      console.log('🔧 Local getSession called');
      return { data: { session: this.currentUser ? { user: this.currentUser } : null }, error: null };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔧 Local signUp called with:', { email, password });
      
      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      this.users.set(userId, { ...user, password });
      this.currentUser = user;

      // Create profile
      const profile = {
        user_id: userId,
        full_name: '',
        avatar_url: '',
        customer_id: '',
        subscription_id: '',
        subscription_status: '',
        seat_count: 1,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.profiles.set(userId, profile);
      this.subscriptions.set(userId, []);
      this.saveToStorage();

      console.log('✅ Local signUp successful for:', email);
      return { data: { user, session: { user } }, error: null };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('🔧 Local signInWithPassword called with:', { email, password });
      
      const user = Array.from(this.users.values()).find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword;
        this.saveToStorage();
        console.log('✅ Local signIn successful for:', email);
        return { data: { user: userWithoutPassword, session: { user: userWithoutPassword } }, error: null };
      }

      console.log('❌ Local signIn failed: invalid credentials');
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
    },

    signInWithOAuth: async ({ provider }: { provider: string }) => {
      console.log('🔧 Local signInWithOAuth called with provider:', provider);
      
      // Mock OAuth - create a user with provider email
      const email = `oauth_${provider}_${Date.now()}@example.com`;
      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      this.users.set(userId, user);
      this.currentUser = user;

      // Create profile
      const profile = {
        user_id: userId,
        full_name: `${provider} User`,
        avatar_url: '',
        customer_id: '',
        subscription_id: '',
        subscription_status: '',
        seat_count: 1,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.profiles.set(userId, profile);
      this.subscriptions.set(userId, []);
      this.saveToStorage();

      console.log('✅ Local OAuth signIn successful for:', email);
      return { data: { user, session: { user } }, error: null };
    },

    signOut: async () => {
      console.log('🔧 Local signOut called');
      this.currentUser = null;
      this.saveToStorage();
      return { error: null };
    },

    resetPasswordForEmail: async (email: string) => {
      console.log('🔧 Local resetPasswordForEmail called for:', email);
      // Mock password reset
      return { data: {}, error: null };
    },

    updateUser: async ({ password }: { password: string }) => {
      console.log('🔧 Local updateUser called');
      if (this.currentUser) {
        const user = this.users.get(this.currentUser.id);
        if (user) {
          user.password = password;
          this.users.set(this.currentUser.id, user);
          this.saveToStorage();
        }
      }
      return { data: { user: this.currentUser }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log('🔧 Local onAuthStateChange called');
      // Immediately call with current state
      if (this.currentUser) {
        callback('SIGNED_IN', { user: this.currentUser });
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // No-op for local storage
            }
          }
        }
      };
    }
  };

  from = (table: string) => {
    console.log('🔧 Local from called for table:', table);
    return {
      select: (columns: string = '*') => {
        if (table === 'profiles') {
          const data = Array.from(this.profiles.values());
          return { data, error: null };
        }
        if (table === 'subscriptions') {
          const data = Array.from(this.subscriptions.values()).flat();
          return { data, error: null };
        }
        return { data: [], error: null };
      },

      insert: (data: any) => {
        if (table === 'profiles') {
          const profile = { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          this.profiles.set(profile.user_id, profile);
          this.saveToStorage();
          return { data: profile, error: null };
        }
        if (table === 'subscriptions') {
          const subscription = { 
            id: `sub_${Date.now()}`,
            ...data, 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          };
          const userSubs = this.subscriptions.get(data.user_id) || [];
          userSubs.push(subscription);
          this.subscriptions.set(data.user_id, userSubs);
          this.saveToStorage();
          return { data: subscription, error: null };
        }
        return { data: null, error: null };
      },

      update: (data: any) => {
        if (table === 'profiles') {
          const profile = this.profiles.get(data.user_id);
          if (profile) {
            const updatedProfile = { ...profile, ...data, updated_at: new Date().toISOString() };
            this.profiles.set(data.user_id, updatedProfile);
            this.saveToStorage();
            return { data: updatedProfile, error: null };
          }
        }
        return { data: null, error: null };
      },

      eq: (column: string, value: any) => {
        if (table === 'profiles' && column === 'user_id') {
          const profile = this.profiles.get(value);
          return { data: profile ? [profile] : [], error: null };
        }
        return { data: [], error: null };
      },

      single: () => {
        if (table === 'profiles') {
          const profile = this.profiles.get(this.currentUser?.id);
          return { data: profile, error: null };
        }
        return { data: null, error: null };
      }
    };
  };

  rpc = (func: string, params: any) => {
    console.log('🔧 Local rpc called with function:', func);
    if (func === 'skip_onboarding') {
      if (this.currentUser) {
        const profile = this.profiles.get(this.currentUser.id);
        if (profile) {
          profile.onboarding_complete = true;
          this.profiles.set(this.currentUser.id, profile);
          this.saveToStorage();
          return { data: { success: true }, error: null };
        }
      }
    }
    return { data: null, error: null };
  };
}

// Export local client
export const localSupabase = new LocalSupabaseClient(); 