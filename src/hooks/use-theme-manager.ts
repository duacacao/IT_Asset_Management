'use client'

import React from 'react'
import { useTheme } from '@/hooks/use-theme'
import { colorThemes } from '@/config/theme-data'
import type { ThemePreset } from '@/types/theme'

export function useThemeManager() {
  const { theme, setTheme } = useTheme()

  const isDarkMode = React.useMemo(() => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  }, [theme])

  const resetTheme = React.useCallback(() => {
    const root = document.documentElement
    const allPossibleVars = [
      'background',
      'foreground',
      'card',
      'card-foreground',
      'popover',
      'popover-foreground',
      'primary',
      'primary-foreground',
      'secondary',
      'secondary-foreground',
      'muted',
      'muted-foreground',
      'accent',
      'accent-foreground',
      'destructive',
      'destructive-foreground',
      'border',
      'input',
      'ring',
      'radius',
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
      'chart-5',
      'sidebar',
      'sidebar-background',
      'sidebar-foreground',
      'sidebar-primary',
      'sidebar-primary-foreground',
      'sidebar-accent',
      'sidebar-accent-foreground',
      'sidebar-border',
      'sidebar-ring',
      'font-sans',
      'font-serif',
      'font-mono',
      'shadow-2xs',
      'shadow-xs',
      'shadow-sm',
      'shadow',
      'shadow-md',
      'shadow-lg',
      'shadow-xl',
      'shadow-2xl',
      'spacing',
      'tracking-normal',
      'card-header',
      'card-content',
      'card-footer',
      'muted-background',
      'accent-background',
      'destructive-background',
      'warning',
      'warning-foreground',
      'success',
      'success-foreground',
      'info',
      'info-foreground',
    ]

    allPossibleVars.forEach((varName) => {
      root.style.removeProperty(`--${varName}`)
    })

    const inlineStyles = root.style
    for (let i = inlineStyles.length - 1; i >= 0; i--) {
      const property = inlineStyles[i]
      if (property.startsWith('--')) {
        root.style.removeProperty(property)
      }
    }
  }, [])

  const applyTheme = React.useCallback(
    (themeValue: string, darkMode: boolean) => {
      const themeConfig = colorThemes.find((t) => t.value === themeValue)
      if (!themeConfig) return

      resetTheme()
      const styles = darkMode ? themeConfig.preset.styles.dark : themeConfig.preset.styles.light
      const root = document.documentElement

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    },
    [resetTheme]
  )

  const applyTweakcnTheme = React.useCallback(
    (themePreset: ThemePreset, darkMode: boolean) => {
      resetTheme()
      const styles = darkMode ? themePreset.styles.dark : themePreset.styles.light
      const root = document.documentElement

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    },
    [resetTheme]
  )

  const applyRadius = (radius: string) => {
    document.documentElement.style.setProperty('--radius', radius)
  }

  return {
    theme,
    setTheme,
    isDarkMode,
    resetTheme,
    applyTheme,
    applyTweakcnTheme,
    applyRadius,
  }
}
