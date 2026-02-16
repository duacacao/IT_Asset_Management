import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Minimal.cc-style soft label — bg nhẹ opacity + text cùng tông, không border cứng
const softLabelVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      color: {
        success: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/16 dark:text-emerald-400',
        error: 'bg-red-500/10 text-red-600 dark:bg-red-500/16 dark:text-red-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/16 dark:text-amber-400',
        info: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/16 dark:text-blue-400',
        default: 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/16 dark:text-gray-400',
        primary: 'bg-primary/10 text-primary dark:bg-primary/16',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'md',
    },
  }
)

export type SoftLabelProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> &
  VariantProps<typeof softLabelVariants> & {
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
  }

const SoftLabel = React.forwardRef<HTMLSpanElement, SoftLabelProps>(
  ({ className, color, size, startIcon, endIcon, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(softLabelVariants({ color, size }), className)} {...props}>
        {startIcon}
        {children}
        {endIcon}
      </span>
    )
  }
)
SoftLabel.displayName = 'SoftLabel'

export { SoftLabel, softLabelVariants }
