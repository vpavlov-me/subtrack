import { createClient } from '@supabase/supabase-js'

// Берём переменные из .env.*
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Мини-мок, чтобы приложение работало без реального Supabase.
function createMockClient() {
  type QueryResult<T = unknown> = { data: T; error: unknown | null }

  const ok: QueryResult = { data: null, error: null }

  const query = {
    select: () => query,
    order: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    eq: () => query,
    single: () => ok,
  }

  return {
    from: () => query,
    auth: {
      setSession: async () => {},
      signOut: async () => {},
    },
  } as unknown as ReturnType<typeof createClient>
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      console.warn('Supabase env variables are missing. Running in offline/mock mode.')
      return createMockClient()
    })() 