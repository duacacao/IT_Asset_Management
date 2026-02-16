'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'
import { useDevicesQuery } from '@/hooks/useDevicesQuery'
import { Monitor, Settings, Moon, Sun, Search, Download, Plus, FileText } from 'lucide-react'
import { useTheme } from 'next-themes'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: devices = [] } = useDevicesQuery()
  const { setTheme, theme } = useTheme()

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  // Recent devices (last 5)
  const recentDevices = devices.slice(0, 5)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search devices, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <Monitor className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings/appearance'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                // Trigger create device dialog
                const event = new CustomEvent('open-create-device')
                window.dispatchEvent(event)
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Device
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Recent Devices */}
        {recentDevices.length > 0 && (
          <CommandGroup heading="Recent Devices">
            {recentDevices.map((device) => (
              <CommandItem
                key={device.id}
                onSelect={() =>
                  runCommand(() => {
                    // Open device detail
                    const event = new CustomEvent('open-device-detail', {
                      detail: { deviceId: device.id },
                    })
                    window.dispatchEvent(event)
                  })
                }
              >
                <Monitor className="mr-2 h-4 w-4" />
                {device.deviceInfo.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Theme Switcher */}
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Settings className="mr-2 h-4 w-4" />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
