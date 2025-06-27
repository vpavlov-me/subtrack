import * as React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export function Sheet({ children, open, onOpenChange }: SheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

export function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
}

export function SheetContent({
  children,
  side = 'right',
  className,
}: SheetContentProps) {
  const sideClasses = {
    left: 'left-0 top-0 h-full data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
    right:
      'right-0 top-0 h-full data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    top: 'top-0 left-0 right-0 h-auto data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
    bottom:
      'bottom-0 left-0 right-0 h-auto data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  };

  return (
    <DialogContent
      className={cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
        sideClasses[side],
        className
      )}
    >
      {children}
    </DialogContent>
  );
}
