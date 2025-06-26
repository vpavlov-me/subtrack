import { useEffect } from 'react'
import { useAuth } from '@workos-inc/authkit-react'
import { supabase } from '@/lib/supabase'

/**
 * Слушает AuthKit и пробрасывает access_token в Supabase Auth, 
 * чтобы запросы к БД выполнялись от имени пользователя.
 */
export function useSupabaseAuthSync() {
  const { isLoading, user, getAccessToken } = useAuth()

  useEffect(() => {
    if (isLoading) return

    async function sync() {
      if (user) {
        try {
          const token = await getAccessToken()
          if (token) {
            // В supabase-js v2 нет setAuth(), используем setSession().
            // refresh_token не нужен для коротких запросов, поэтому передаём заглушку.
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: token, // fallback – Supabase требует строку
            })
          }
        } catch (err) {
          console.error('Failed to set Supabase session', err)
        }
      } else {
        void supabase.auth.signOut()
      }
    }
    void sync()
  }, [isLoading, user, getAccessToken])
} 