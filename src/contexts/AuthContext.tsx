'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { signOut as serverSignOut } from '@/app/actions/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoggingOut: boolean
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Memoize Supabase client — tránh tạo instance mới mỗi render
  const supabase = useMemo(() => createClient(), [])

  // Query Client for cache management
  const queryClient = useQueryClient()

  // onAuthStateChange — SINGLE SOURCE OF TRUTH cho auth state
  // Xử lý: INITIAL_SESSION (mount), SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
  // KHÔNG dùng pathname-based checkUser() để tránh:
  //   1. Race condition giữa 2 effects
  //   2. API call thừa trên mỗi navigation
  //   3. setUser(null) khi getUser() fail → NavUser biến mất
  // Callback PHẢI là sync — async bị await bởi Promise.all()
  // trong GoTrueClient._notifyAllSubscribers(), chạy trong exclusive lock → risk deadlock
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)

      if (event === 'SIGNED_IN') {
        // Fire-and-forget — KHÔNG await để tránh deadlock trong auth lock
        queryClient.invalidateQueries()
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        queryClient.removeQueries()
        setIsLoggingOut(false)
        router.push('/sign-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, queryClient])

  // refreshAuth — gọi sau server action sign-in để client-side detect session mới
  // Server action set cookies qua cookies() API → client cần đọc lại cookies
  // KHÔNG dùng cho navigation — chỉ gọi explicit khi biết session đã thay đổi
  // setIsLoading(false) đảm bảo UI không stuck ở loading state nếu
  // onAuthStateChange chưa fire (vd: gọi refreshAuth trước khi SIGNED_IN event)
  const refreshAuth = useCallback(async () => {
    try {
      // 1. Ép Supabase Client SDK đọc lại cookie thông qua storage adapter
      // Do Server action vừa set Http Cookie, in-memory state của client vẫn đang rỗng.
      // Việc gọi getSession() sẽ parse token từ cookie và populate vào memory.
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        setIsLoading(false)
        return
      }

      // 2. Fallback: Nếu JWT session chưa có user data, fetch từ API
      const {
        data: { user: currentUser },
        error
      } = await supabase.auth.getUser()
      
      if (error) {
        console.error('refreshAuth getUser error:', error.message)
      }
      
      if (currentUser) {
        setUser(currentUser)
        setIsLoading(false)
      }
    } catch (e) {
      console.error('refreshAuth exception:', e)
      // Network error ≠ signed out — giữ nguyên user state
    }
  }, [supabase])

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      // 1. Server action — xóa cookies qua cookies() API (cùng cơ chế với sign-in)
      // Đảm bảo xóa đúng cookies httpOnly đã set server-side
      await serverSignOut()

      // 2. Xóa in-memory session client-side — fire-and-forget
      // Không await vì signOut() có thể fail do API call (xem root cause analysis)
      supabase.auth.signOut({ scope: 'local' }).catch(() => {})

      // 3. Cleanup thủ công — không phụ thuộc vào SIGNED_OUT event
      // (event có thể không fire nếu signOut() internal fail)
      queryClient.removeQueries()
      setUser(null)
      setIsLoggingOut(false)
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: reset thủ công dù server action fail
      queryClient.removeQueries()
      setUser(null)
      setIsLoggingOut(false)
      router.push('/sign-in')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLoggingOut,
        logout,
        refreshAuth,
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
