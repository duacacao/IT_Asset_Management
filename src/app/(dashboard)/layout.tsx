import React from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

// ============================================
// Server Component layout — không còn 'use client'
// Logic sidebar đã chuyển vào DashboardShell (client component)
// → Next.js có thể SSR children pages, giảm JS bundle gửi xuống client
// ============================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
