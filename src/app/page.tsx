'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// Client Component — check auth state và redirect
export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/devices')
      } else {
        router.push('/sign-in')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading skeleton while checking auth
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="bg-muted mx-auto h-12 w-12 animate-pulse rounded-full" />
        <div className="bg-muted mx-auto h-4 w-32 animate-pulse" />
      </div>
    </div>
  )
}
