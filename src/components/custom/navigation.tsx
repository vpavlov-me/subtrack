import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationItem {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Navigation({
  items,
  orientation = 'horizontal',
  className,
}: NavigationProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        {
          const nextIndex = (index + 1) % items.length;
          setActiveIndex(nextIndex);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        {
          const prevIndex = index === 0 ? items.length - 1 : index - 1;
          setActiveIndex(prevIndex);
        }
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-6' : 'flex-col gap-2',
        className
      )}
      role="navigation"
      aria-label="Primary navigation"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = index === activeIndex;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive: isNavActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible-ring',
                'hover:bg-accent hover:text-accent-foreground',
                isNavActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
                item.disabled && 'pointer-events-none opacity-50',
                isActive && 'ring-2 ring-ring ring-offset-2'
              )
            }
            tabIndex={item.disabled ? -1 : 0}
            aria-current={item.disabled ? undefined : 'page'}
            aria-disabled={item.disabled}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={() => setActiveIndex(index)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
} 