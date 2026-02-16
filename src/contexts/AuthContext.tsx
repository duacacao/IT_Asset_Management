'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Memoize Supabase client — tránh tạo instance mới mỗi render
  const supabase = useMemo(() => createClient(), [])

  // Re-check user mỗi khi route thay đổi
  // Giải quyết: server action sign-in → redirect → client cần đọc lại cookies
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [pathname, supabase])

  // Query Client for cache management
  const queryClient = useQueryClient()

  // Listener cho auth state changes (tab switch, token refresh, client-side auth)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_IN') {
        // Xóa cache cũ & fetch lại data mới cho user mới
        await queryClient.invalidateQueries()
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        // Xóa sạch cache khi logout để tránh lộ data giữa các acc
        queryClient.removeQueries()
        router.push('/sign-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, queryClient])

  const logout = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
