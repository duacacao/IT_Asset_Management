'use client'

import * as React from 'react'
import { useAppearanceStore } from '@/stores/useAppearanceStore'

export interface SidebarConfig {
  variant: 'sidebar' | 'floating' | 'inset'
  collapsible: 'offcanvas' | 'icon' | 'none'
  side: 'left' | 'right'
}

export interface SidebarContextValue {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  const { sidebarVariant, sidebarCollapsible, sidebarSide, updateSidebarConfig } =
    useAppearanceStore()

  const config: SidebarConfig = {
    variant: sidebarVariant,
    collapsible: sidebarCollapsible,
    side: sidebarSide,
  }

  const updateConfig = React.useCallback(
    (newConfig: Partial<SidebarConfig>) => {
      updateSidebarConfig({
        sidebarVariant: newConfig.variant,
        sidebarCollapsible: newConfig.collapsible,
        sidebarSide: newConfig.side,
      })
    },
    [updateSidebarConfig]
  )

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>{children}</SidebarContext.Provider>
  )
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarConfig must be used within a SidebarConfigProvider')
  }
  return context
}
