'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[type=success]:!bg-[var(--success-bg)] data-[type=success]:!text-[var(--success-text)] data-[type=success]:!border-[var(--success-border)] data-[type=error]:!bg-[var(--error-bg)] data-[type=error]:!text-[var(--error-text)] data-[type=error]:!border-[var(--error-border)] data-[type=warning]:!bg-[var(--warning-bg)] data-[type=warning]:!text-[var(--warning-text)] data-[type=warning]:!border-[var(--warning-border)] data-[type=info]:!bg-[var(--info-bg)] data-[type=info]:!text-[var(--info-text)] data-[type=info]:!border-[var(--info-border)]',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        style: {
          '--success-bg':
            'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
          '--success-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
          '--success-border': 'light-dark(var(--color-green-600), var(--color-green-400))',
          '--error-bg':
            'color-mix(in oklab, light-dark(var(--color-red-600), var(--color-red-400)) 10%, var(--background))',
          '--error-text': 'light-dark(var(--color-red-600), var(--color-red-400))',
          '--error-border': 'light-dark(var(--color-red-600), var(--color-red-400))',
          '--warning-bg':
            'color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))',
          '--warning-text': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
          '--warning-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
          '--info-bg':
            'color-mix(in oklab, light-dark(var(--color-blue-600), var(--color-blue-400)) 10%, var(--background))',
          '--info-text': 'light-dark(var(--color-blue-600), var(--color-blue-400))',
          '--info-border': 'light-dark(var(--color-blue-600), var(--color-blue-400))',
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
