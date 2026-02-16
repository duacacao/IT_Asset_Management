'use client'

import React from 'react'
import { Layout, Palette, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useThemeManager } from '@/hooks/use-theme-manager'
import { useSidebarConfig } from '@/contexts/sidebar-context'
import { useAppearanceStore } from '@/stores/useAppearanceStore'
import { ThemeTab } from './theme-tab'
import { LayoutTab } from './layout-tab'
import { cn } from '@/lib/utils'

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomizerContent({ className }: { className?: string }) {
  const { resetTheme, applyRadius } = useThemeManager()
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig()

  const { resetAppearance } = useAppearanceStore()

  const [activeTab, setActiveTab] = React.useState('theme')

  const handleReset = () => {
    resetAppearance()
    resetTheme()
    applyRadius('0.5rem')
    updateSidebarConfig({ variant: 'inset', collapsible: 'offcanvas', side: 'left' })
  }

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm leading-none font-medium">Theme Customizer</h4>
          <p className="text-muted-foreground text-xs">Customize your theme and layout.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="cursor-pointer">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <div className="py-2">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-none p-1.5">
            <TabsTrigger value="theme" className="data-[state=active]:bg-background cursor-pointer">
              <Palette className="mr-1 h-4 w-4" /> Theme
            </TabsTrigger>
            <TabsTrigger
              value="layout"
              className="data-[state=active]:bg-background cursor-pointer"
            >
              <Layout className="mr-1 h-4 w-4" /> Layout
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="theme" className="mt-0 flex-1 space-y-4">
          <ThemeTab />
        </TabsContent>

        <TabsContent value="layout" className="mt-0 flex-1">
          <LayoutTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const { config: sidebarConfig } = useSidebarConfig()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side={sidebarConfig.side === 'left' ? 'right' : 'left'}
        className="pointer-events-auto flex w-[400px] flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="space-y-0 border-b p-4 pb-2">
          <SheetTitle className="text-lg font-semibold">Legacy Customizer</SheetTitle>
          <SheetDescription>Use Settings &gt; Appearance instead.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <CustomizerContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  const { config: sidebarConfig } = useSidebarConfig()

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'bg-primary hover:bg-primary/90 text-primary-foreground fixed top-1/2 z-50 h-12 w-12 -translate-y-1/2 cursor-pointer rounded-full shadow-lg',
        sidebarConfig.side === 'left' ? 'right-4' : 'left-4'
      )}
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
