'use client'

import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useSidebarConfig } from '@/hooks/use-sidebar-config'

// ============================================
// Client wrapper chứa sidebar config logic
// Tách ra từ layout.tsx để layout trở thành Server Component
// → children (pages) không bị force 'use client' cascade
// ============================================
export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { config } = useSidebarConfig()

    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': '16rem',
                    '--sidebar-width-icon': '3rem',
                    '--header-height': 'calc(var(--spacing) * 14)',
                } as React.CSSProperties
            }
            className={config.collapsible === 'none' ? 'sidebar-none-mode' : ''}
        >
            {config.side === 'left' ? (
                <>
                    {/* Skip link for keyboard navigation */}
                    <a
                        href="#main-content"
                        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
                    >
                        Skip to main content
                    </a>

                    <AppSidebar
                        variant={config.variant}
                        collapsible={config.collapsible}
                        side={config.side}
                    />
                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div id="main-content" className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </SidebarInset>
                </>
            ) : (
                <>
                    {/* Skip link for keyboard navigation */}
                    <a
                        href="#main-content"
                        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg"
                    >
                        Skip to main content
                    </a>

                    <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                <div id="main-content" className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </SidebarInset>
                    <AppSidebar
                        variant={config.variant}
                        collapsible={config.collapsible}
                        side={config.side}
                    />
                </>
            )}
        </SidebarProvider>
    )
}
