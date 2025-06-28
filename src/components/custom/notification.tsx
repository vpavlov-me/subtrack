import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { FadeIn } from './transitions';

interface NotificationProps {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationStyles = {
  success:
    'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
};

export function Notification({
  title,
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 5000,
  className,
}: NotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const Icon = notificationIcons[type];

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <FadeIn>
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border shadow-sm transition-all duration-300',
          notificationStyles[type],
          className
        )}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-medium text-sm mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="h-6 w-6 flex-shrink-0 focus-visible-ring"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

interface NotificationContainerProps {
  children: React.ReactNode;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  className?: string;
}

export function NotificationContainer({
  children,
  position = 'top-right',
  className,
}: NotificationContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 space-y-2 max-w-sm w-full',
        positionClasses[position],
        className
      )}
      role="region"
      aria-label="Notifications"
    >
      {children}
    </div>
  );
} 