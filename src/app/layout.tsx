import type { Metadata } from 'next'
import './globals.css'

import { ThemeProvider } from '@/components/theme-provider'
import { SidebarConfigProvider } from '@/contexts/sidebar-context'
import { inter, beVietnamPro, lexend, nunito } from '@/lib/fonts'

import { Toaster } from '@/components/ui/sonner'
import { CommandPalette } from '@/components/CommandPalette'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'IT Asset Management',
  description: 'Quản lý tài sản IT - Device Dashboard',
}

import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/providers/QueryProvider'

import { ThemeSyncProvider } from '@/components/theme-sync-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${beVietnamPro.variable} ${lexend.variable} ${nunito.variable} antialiased`}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider defaultTheme="light" storageKey="nextjs-ui-theme">
          <QueryProvider>
            <AuthProvider>
              <ThemeSyncProvider>
                <SidebarConfigProvider>
                  {children}
                  <CommandPalette />
                  <Toaster />
                </SidebarConfigProvider>
              </ThemeSyncProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
