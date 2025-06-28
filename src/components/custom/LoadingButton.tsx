import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends Omit<React.ComponentProps<typeof Button>, 'loading' | 'loadingText'> {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  className,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      className={cn(
        'focus-visible-ring transition-all duration-200',
        isDisabled && 'cursor-not-allowed opacity-60',
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
} 