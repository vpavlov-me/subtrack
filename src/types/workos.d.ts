declare module '@workos-inc/authkit-react' {
  import { ReactNode } from 'react'

  interface AuthKitProviderProps {
    clientId: string
    apiHostname?: string
    devMode?: boolean
    children: ReactNode
  }

  export function AuthKitProvider(props: AuthKitProviderProps): JSX.Element

  interface SignInOptions {
    state?: Record<string, unknown>
  }

  interface SignUpOptions {
    state?: Record<string, unknown>
  }

  export function useAuth(): {
    isLoading: boolean
    user: {
      id: string
      email?: string
      firstName?: string
      [key: string]: unknown
    } | null
    getAccessToken: () => Promise<string | null>
    signIn: (options?: SignInOptions) => void
    signUp: (options?: SignUpOptions) => void
    signOut: () => void
  }
} 