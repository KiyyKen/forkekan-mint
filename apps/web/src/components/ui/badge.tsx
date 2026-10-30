import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

// Variant sesuai docs/09-ui-design-system.md (Badge: Status/Platform/Queue/AI Recommendation).
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success',
        outline: 'border border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
