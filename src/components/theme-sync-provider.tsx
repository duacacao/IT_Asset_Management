'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { updateProfileSettings, getProfile } from '@/app/actions/profile'
import { useAppearanceStore } from '@/stores/useAppearanceStore'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { tweakcnThemes } from '@/config/theme-data'

export function ThemeSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const { applyTheme, applyTweakcnTheme, applyRadius, resetTheme, isDarkMode, applyTypography } = useThemeManager()
  const isSyncedRef = useRef(false)
  const lastSyncedThemeRef = useRef<string | null>(null)

  // Get state and setters from appearance store
  const {
    selectedTheme,
    setSelectedTheme,
    selectedTweakcnTheme,
    setSelectedTweakcnTheme,
    selectedRadius,
    fontSize,
    fontWeight,
    fontFamily,
  } = useAppearanceStore()

  // 1. Initial Sync: Lấy theme từ DB khi user login + auth đã load xong
  // Reset trạng thái sync khi đổi user để tránh leak dữ liệu từ user trước
  useEffect(() => {
    isSyncedRef.current = false
  }, [user?.id])

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) return
    if (isSyncedRef.current) return

    const syncFromDb = async () => {
      try {
        const { data } = await getProfile()
        if (data?.settings) {
          const settings = data.settings as Record<string, any>
          if (settings.theme) {
            const dbTheme = settings.theme
            if (dbTheme !== theme) {
              setTheme(dbTheme)
            }
            if (dbTheme.startsWith('tweakcn-')) {
              setSelectedTweakcnTheme(dbTheme.replace('tweakcn-', ''))
            } else if (dbTheme === 'default' || dbTheme === 'dark' || dbTheme === 'light') {
              setSelectedTheme(dbTheme)
            }
            lastSyncedThemeRef.current = dbTheme
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile settings:', error)
      } finally {
        isSyncedRef.current = true
      }
    }

    syncFromDb()
  }, [
    isAuthenticated,
    user,
    isAuthLoading,
    setTheme,
    setSelectedTheme,
    setSelectedTweakcnTheme,
    theme,
  ])

  // 2. Apply CSS variables - LUÔN LUÔN chạy khi store thay đổi
  // Đây là logic QUAN TRỌNG để theme được apply toàn website
  useEffect(() => {
    // Apply tweakcn theme (custom colors) if selected
    if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find((t) => t.value === selectedTweakcnTheme)?.preset
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode)
      }
    }
    // Apply shadcn theme if selected
    else if (selectedTheme && selectedTheme !== 'default') {
      applyTheme(selectedTheme, isDarkMode)
    }
    // Otherwise reset to default
    else {
      resetTheme()
    }

    // Apply radius
    if (selectedRadius && selectedRadius !== '0.5rem') {
      applyRadius(selectedRadius)
    }

    // Apply typography
    if (fontSize && fontWeight && fontFamily) {
      applyTypography(fontSize, fontWeight, fontFamily)
    }
  }, [
    selectedTheme,
    selectedTweakcnTheme,
    selectedRadius,
    fontSize,
    fontWeight,
    fontFamily,
    isDarkMode,
    applyTheme,
    applyTweakcnTheme,
    applyRadius,
    applyTypography,
    resetTheme,
  ])

  // 3. Sync to DB: Khi user đổi theme (sau khi đã initial sync và auth load xong)
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !isSyncedRef.current) return
    if (!theme) return

    if (theme === lastSyncedThemeRef.current) return

    const timer = setTimeout(async () => {
      try {
        await updateProfileSettings({ theme })
        lastSyncedThemeRef.current = theme
      } catch (error) {
        console.error('Failed to sync theme to DB:', error)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [theme, isAuthenticated, isAuthLoading])

  return <>{children}</>
}
