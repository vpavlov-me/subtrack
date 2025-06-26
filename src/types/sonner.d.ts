declare module 'sonner' {
  import { FC } from 'react'

  export interface ToasterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    richColors?: boolean
    ariaLive?: 'assertive' | 'polite'
  }

  export const Toaster: FC<ToasterProps>

  interface ToastOptions {
    description?: string
  }

  export function toast(message: string, opts?: ToastOptions): void
  export namespace toast {
    function success(message: string, opts?: ToastOptions): void
    function error(message: string, opts?: ToastOptions): void
    function warning(message: string, opts?: ToastOptions): void
    function info(message: string, opts?: ToastOptions): void
  }
} 