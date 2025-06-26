import { useAuth } from '@workos-inc/authkit-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * useUser
 * Хук-обёртка над `useAuth`, который:
 * 1.  Возвращает объект пользователя (или `null`, если не залогинен).
 * 2.  Если пользователь не залогинен и статус загрузки завершился —
 *     автоматически инициирует `signIn()` и передаёт текущий путь в `state`,
 *     чтобы после успешного логина вернуться обратно.
 */
export const useUser = () => {
  const { user, isLoading, signIn } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !user) {
      // Перенаправляем на WorkOS hosted-login, сохраняя, куда возвращаться
      signIn({ state: { returnTo: location.pathname } })
    }
  }, [isLoading, user, signIn, location])

  return user
} 