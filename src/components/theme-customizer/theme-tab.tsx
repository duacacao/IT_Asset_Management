'use client'

import { Palette, Dices, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useCircularTransition } from '@/hooks/use-circular-transition'
import { colorThemes, tweakcnThemes } from '@/config/theme-data'
import { radiusOptions } from '@/config/theme-customizer-constants'
import { useAppearanceStore } from '@/stores/useAppearanceStore'
import React from 'react'
import './circular-transition.css'

export function ThemeTab() {
  const {
    selectedTheme,
    setSelectedTheme,
    selectedTweakcnTheme,
    setSelectedTweakcnTheme,
    selectedRadius,
    setSelectedRadius,
  } = useAppearanceStore()

  const { isDarkMode, applyTheme, applyTweakcnTheme, applyRadius } = useThemeManager()

  const { toggleTheme } = useCircularTransition()

  const handleRandomShadcn = () => {
    const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)]
    setSelectedTheme(randomTheme.value)
    applyTheme(randomTheme.value, isDarkMode)
  }

  const handleRandomTweakcn = () => {
    const randomTheme = tweakcnThemes[Math.floor(Math.random() * tweakcnThemes.length)]
    setSelectedTweakcnTheme(randomTheme.value)
    applyTweakcnTheme(randomTheme.preset, isDarkMode)
  }

  const handleRadiusSelect = (radius: string) => {
    setSelectedRadius(radius)
    applyRadius(radius)
  }

  const handleLightMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === false) return
    toggleTheme(event)
  }

  const handleDarkMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === true) return
    toggleTheme(event)
  }

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    applyTheme(value, isDarkMode)
  }

  const handleTweakcnThemeChange = (value: string) => {
    setSelectedTweakcnTheme(value)
    const selectedPreset = tweakcnThemes.find((t) => t.value === value)?.preset
    if (selectedPreset) {
      applyTweakcnTheme(selectedPreset, isDarkMode)
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Shadcn UI Theme Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Shadcn UI Theme Presets</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomShadcn}
            className="cursor-pointer"
          >
            <Dices className="mr-1.5 h-3.5 w-3.5" />
            Random
          </Button>
        </div>

        <Select value={selectedTheme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Choose Shadcn Theme" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="p-2">
              {colorThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.primary }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.secondary }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.accent }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.muted }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Tweakcn Theme Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Tweakcn Theme Presets</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomTweakcn}
            className="cursor-pointer"
          >
            <Dices className="mr-1.5 h-3.5 w-3.5" />
            Random
          </Button>
        </div>

        <Select value={selectedTweakcnTheme} onValueChange={handleTweakcnThemeChange}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Choose Tweakcn Theme" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="p-2">
              {tweakcnThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.primary }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.secondary }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.accent }}
                      />
                      <div
                        className="border-border/20 h-3 w-3 rounded-full border"
                        style={{ backgroundColor: theme.preset.styles.light.muted }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Radius Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Radius</Label>
        <div className="grid grid-cols-5 gap-2">
          {radiusOptions.map((option) => (
            <div
              key={option.value}
              className={`relative cursor-pointer rounded-md border p-3 transition-colors ${
                selectedRadius === option.value
                  ? 'border-primary'
                  : 'border-border hover:border-border/60'
              }`}
              onClick={() => handleRadiusSelect(option.value)}
            >
              <div className="text-center">
                <div className="text-xs font-medium">{option.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Mode Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={!isDarkMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleLightMode}
            className="cursor-pointer"
          >
            <Sun className="mr-1 h-4 w-4" />
            Light
          </Button>
          <Button
            variant={isDarkMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleDarkMode}
            className="cursor-pointer"
          >
            <Moon className="mr-1 h-4 w-4" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  )
}
