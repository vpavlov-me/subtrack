import { createClient } from '@supabase/supabase-js';
import type { User, Session, Provider } from '@supabase/supabase-js';
import { localSupabase } from './local-db';

// Берём переменные из .env.*
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

// Debug logging for Supabase initialization
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Config:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined',
  });
}

// Мини-мок, чтобы приложение работало без реального Supabase.
function createMockClient() {
  type QueryResult<T = unknown> = { data: T; error: unknown | null };

  const ok: QueryResult = { data: null, error: null };
  const okArray: QueryResult<unknown[]> = { data: [], error: null };

  // Mock user for development
  const mockUser: User = {
    id: 'dev-user-id',
    email: 'dev@subtrack.dev',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-01-01T00:00:00Z',
    role: 'authenticated',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  let currentUser: User | null = null;
  let currentSession: Session | null = null;
  let authListeners: Array<(event: string, session: Session | null) => void> = [];

  const query = {
    select: () => query,
    order: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    eq: () => query,
    single: () => ok,
    // Для select().single()
    then: (cb: (arg: QueryResult) => unknown) => Promise.resolve(cb(ok)),
  };

  return {
    from: () => ({
      select: () => okArray,
      order: () => okArray,
      insert: () => ok,
      update: () => ok,
      delete: () => ok,
      eq: () => okArray,
      single: () => ok,
    }),
    auth: {
      setSession: async (session: Session) => {
        currentSession = session;
        currentUser = session?.user || null;
        authListeners.forEach(listener => listener('TOKEN_REFRESHED', session));
      },
      signOut: async () => {
        currentUser = null;
        currentSession = null;
        authListeners.forEach(listener => listener('SIGNED_OUT', null));
      },
      getUser: async () => ({ data: { user: currentUser }, error: null }),
      getSession: async () => ({ data: { session: currentSession }, error: null }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        console.log('🔧 Mock signInWithPassword called with:', { email, password });
        if (email === 'dev@subtrack.dev' && password === 'dev123') {
          currentUser = mockUser;
          currentSession = mockSession;
          authListeners.forEach(listener => listener('SIGNED_IN', mockSession));
          console.log('✅ Mock login successful');
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        console.log('❌ Mock login failed: invalid credentials');
        return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        console.log('🔧 Mock signUp called with:', { email, password });
        if (email === 'dev@subtrack.dev' && password === 'dev123') {
          currentUser = mockUser;
          currentSession = mockSession;
          authListeners.forEach(listener => listener('SIGNED_IN', mockSession));
          console.log('✅ Mock registration successful');
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        console.log('❌ Mock registration failed');
        return { data: { user: null, session: null }, error: { message: 'Registration failed' } };
      },
      signInWithOAuth: async ({ provider: _provider }: { provider: Provider }) => {
        // Mock OAuth for development
        currentUser = mockUser;
        currentSession = mockSession;
        authListeners.forEach(listener => listener('SIGNED_IN', mockSession));
        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      resetPasswordForEmail: async (_email: string) => {
        return { data: {}, error: null };
      },
      updateUser: async ({ password: _password }: { password: string }) => {
        return { data: { user: mockUser }, error: null };
      },
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        authListeners.push(callback);
        // Immediately call with current state
        if (currentSession) {
          callback('SIGNED_IN', currentSession);
        }
        return {
          data: { 
            subscription: { 
              unsubscribe: () => {
                authListeners = authListeners.filter(listener => listener !== callback);
              } 
            } 
          }
        };
      },
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
  } as unknown as ReturnType<typeof createClient>;
}

// Smart Supabase client that falls back to local storage when tables don't exist
class SmartSupabaseClient {
  private realClient: ReturnType<typeof createClient>;
  private useLocalStorage = false;
  private localClient = localSupabase;
  private tableCheckDone = false;

  constructor() {
    if (supabaseUrl && supabaseAnonKey) {
      console.log('✅ Using real Supabase client');
      this.realClient = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      console.warn('⚠️ Supabase env variables are missing. Running in offline/mock mode.');
      this.realClient = createMockClient();
    }
  }

  private async checkTableExists() {
    if (this.tableCheckDone) {
      return !this.useLocalStorage;
    }
    
    try {
      console.log('🔍 Checking if tables exist...');
      const { error } = await this.realClient.from('profiles').select('count').limit(1);
      if (error && error.message.includes('relation "public.profiles" does not exist')) {
        if (!this.useLocalStorage) {
          console.log('🔄 Tables not found, switching to local storage mode');
          this.useLocalStorage = true;
        }
        this.tableCheckDone = true;
        return false;
      }
      console.log('✅ Tables exist, using real Supabase');
      this.tableCheckDone = true;
      return true;
    } catch (error) {
      if (!this.useLocalStorage) {
        console.log('🔄 Error checking tables, switching to local storage mode');
        this.useLocalStorage = true;
      }
      this.tableCheckDone = true;
      return false;
    }
  }

  private async getAuthClient() {
    // For auth operations, we need to be smarter about when to switch
    if (this.useLocalStorage) {
      console.log('🔧 Using local storage auth');
      return this.localClient.auth;
    }
    
    // Check if we should switch to local storage for dev login
    if (import.meta.env.DEV) {
      console.log('🔧 Using real Supabase auth (dev mode)');
      return this.realClient.auth;
    }
    
    console.log('🔧 Using real Supabase auth');
    return this.realClient.auth;
  }

  get auth() {
    return {
      getUser: async () => {
        const authClient = await this.getAuthClient();
        return authClient.getUser();
      },
      getSession: async () => {
        const authClient = await this.getAuthClient();
        return authClient.getSession();
      },
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        console.log('🔧 signInWithPassword called with:', credentials.email);
        
        // Special handling for dev login
        if (credentials.email === 'dev@subtrack.dev' && credentials.password === 'dev123') {
          console.log('🚀 Dev login detected, using local storage');
          return this.localClient.auth.signInWithPassword(credentials);
        }
        
        // Try real Supabase first
        try {
          const result = await this.realClient.auth.signInWithPassword(credentials);
          if (result.error) {
            console.log('❌ Real Supabase auth failed:', result.error.message);
            // If it's a table/relation error, switch to local storage
            if (result.error.message.includes('relation') || result.error.message.includes('table')) {
              console.log('🔄 Switching to local storage due to table error');
              this.useLocalStorage = true;
              return this.localClient.auth.signInWithPassword(credentials);
            }
          }
          return result;
        } catch (error) {
          console.log('❌ Real Supabase auth error:', error);
          console.log('🔄 Switching to local storage due to error');
          this.useLocalStorage = true;
          return this.localClient.auth.signInWithPassword(credentials);
        }
      },
      signUp: async (credentials: { email: string; password: string }) => {
        console.log('🔧 signUp called with:', credentials.email);
        
        // Special handling for dev registration
        if (credentials.email === 'dev@subtrack.dev' && credentials.password === 'dev123') {
          console.log('🚀 Dev registration detected, using local storage');
          return this.localClient.auth.signUp(credentials);
        }
        
        // Try real Supabase first
        try {
          const result = await this.realClient.auth.signUp(credentials);
          if (result.error) {
            console.log('❌ Real Supabase signup failed:', result.error.message);
            // If it's a table/relation error, switch to local storage
            if (result.error.message.includes('relation') || result.error.message.includes('table')) {
              console.log('🔄 Switching to local storage due to table error');
              this.useLocalStorage = true;
              return this.localClient.auth.signUp(credentials);
            }
          }
          return result;
        } catch (error) {
          console.log('❌ Real Supabase signup error:', error);
          console.log('🔄 Switching to local storage due to error');
          this.useLocalStorage = true;
          return this.localClient.auth.signUp(credentials);
        }
      },
      signOut: async () => {
        const authClient = await this.getAuthClient();
        return authClient.signOut();
      },
      signInWithOAuth: async (options: { provider: Provider }) => {
        const authClient = await this.getAuthClient();
        return authClient.signInWithOAuth(options);
      },
      resetPasswordForEmail: async (email: string) => {
        const authClient = await this.getAuthClient();
        return authClient.resetPasswordForEmail(email);
      },
      updateUser: async (options: { password: string }) => {
        const authClient = await this.getAuthClient();
        return authClient.updateUser(options);
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Use real Supabase for auth state changes
        return this.realClient.auth.onAuthStateChange(callback);
      }
    };
  }

  get from() {
    if (this.useLocalStorage) {
      console.log('🔧 Using local storage from');
      return this.localClient.from;
    }
    console.log('🔧 Using real Supabase from');
    return this.realClient.from;
  }

  get rpc() {
    if (this.useLocalStorage) {
      console.log('🔧 Using local storage rpc');
      return this.localClient.rpc;
    }
    console.log('🔧 Using real Supabase rpc');
    return this.realClient.rpc;
  }

  get functions() {
    return this.realClient.functions;
  }

  // Override from method to check table existence
  async fromWithFallback(table: string) {
    const tableExists = await this.checkTableExists();
    
    if (tableExists) {
      return this.realClient.from(table);
    } else {
      return this.localClient.from(table);
    }
  }
}

export const supabase = new SmartSupabaseClient();

// Auth helper functions
export const signUpWithEmail = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};
