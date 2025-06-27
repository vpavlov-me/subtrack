import * as React from 'react';
import { cn } from '@/lib/utils';

// Utility hook for keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  onSelect?: (item: any, index: number) => void
) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setActiveIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setActiveIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setActiveIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (onSelect) {
            onSelect(items[activeIndex], activeIndex);
          }
          break;
      }
    },
    [items, activeIndex, onSelect]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}

// Focus trap hook
export function useFocusTrap(enabled = true) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return containerRef;
}

// Screen reader only text
export function SrOnly({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}

// Live region for announcements
export function LiveRegion({
  children,
  ariaLive = 'polite',
  className,
}: {
  children: React.ReactNode;
  ariaLive?: 'polite' | 'assertive' | 'off';
  className?: string;
}) {
  return (
    <div
      className={cn('sr-only', className)}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {children}
    </div>
  );
}

// Skip link component
export function SkipToContent({
  targetId = 'main-content',
  children = 'Skip to main content',
}: {
  targetId?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// Visually hidden but accessible
export function VisuallyHidden({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </span>
  );
}

// Loading state component
export function LoadingState({
  message = 'Loading...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-center p-4', className)}
      role="status"
      aria-live="polite"
    >
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
      <span className="sr-only">{message}</span>
    </div>
  );
}

// Error boundary component
export function ErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      setHasError(true);
      setError(error);
      onError?.(error, errorInfo);
    };

    // Add global error handler
    window.addEventListener('error', event => {
      handleError(event.error, { componentStack: '' });
    });

    return () => {
      window.removeEventListener('error', event => {
        handleError(event.error, { componentStack: '' });
      });
    };
  }, [onError]);

  if (hasError && error) {
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent error={error} />;
    }

    return (
      <div
        className="p-4 border border-destructive bg-destructive/10 rounded-md"
        role="alert"
      >
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline focus-visible-ring"
        >
          Reload page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
