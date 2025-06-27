import * as React from 'react';

import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean;
  errorMessage?: string;
}

function Input({
  className,
  type,
  error = false,
  errorMessage,
  'aria-describedby': ariaDescribedby,
  ...props
}: InputProps) {
  const errorId = React.useId();
  const describedBy = [ariaDescribedby, error && errorId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative">
      <input
        type={type}
        data-slot="input"
        aria-invalid={error}
        aria-describedby={describedBy || undefined}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible-ring',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          error && 'border-destructive focus-visible:border-destructive',
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <div
          id={errorId}
          className="mt-1 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export { Input };
