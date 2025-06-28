import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardWithActionProps extends Omit<React.ComponentProps<typeof Card>, 'title'> {
  cardTitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function CardWithAction({
  cardTitle,
  description,
  action,
  children,
  footer,
  className,
  ...props
}: CardWithActionProps) {
  return (
    <Card className={cn('flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className)} {...props}>
      {(cardTitle || description || action) && (
        <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <div className="space-y-1.5">
            {cardTitle && <CardTitle className="leading-none font-semibold">{cardTitle}</CardTitle>}
            {description && <CardDescription className="text-muted-foreground text-sm">{description}</CardDescription>}
          </div>
          {action && (
            <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
              {action}
            </div>
          )}
        </CardHeader>
      )}
      {children && <CardContent className="px-6">{children}</CardContent>}
      {footer && <CardFooter className="flex items-center px-6 [.border-t]:pt-6">{footer}</CardFooter>}
    </Card>
  );
} 