// ThemePreset — re-export từ theme.ts (canonical source với ThemeStyles mạnh hơn)
// Tránh duplicate definition gây conflict type giữa 2 file
import type { ThemePreset } from './theme'
export type { ThemePreset } from './theme'


export interface ColorTheme {
  name: string
  value: string
  preset: ThemePreset
}

export interface SidebarVariant {
  name: string
  value: 'sidebar' | 'floating' | 'inset'
  description: string
}

export interface SidebarCollapsibleOption {
  name: string
  value: 'offcanvas' | 'icon' | 'none'
  description: string
}

export interface SidebarSideOption {
  name: string
  value: 'left' | 'right'
}

export interface RadiusOption {
  name: string
  value: string
}
