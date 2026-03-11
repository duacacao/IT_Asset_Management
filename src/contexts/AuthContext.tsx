'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { signOut as serverSignOut } from '@/app/actions/auth'
import { type Role } from '@/types/permission'

// ============================================
// AuthContext — mở rộng thêm organization + role
// Client-side source of truth cho auth + org context
// ============================================

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoggingOut: boolean
  // Thông tin organization của user hiện tại
  organization: { id: string; name: string; slug: string } | null
  role: Role | null
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  // Organization + role state — fetch sau khi user authenticated
  const [organization, setOrganization] = useState<{
    id: string
    name: string
    slug: string
  } | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const router = useRouter()

  // Memoize Supabase client — tránh tạo instance mới mỗi render
  const supabase = useMemo(() => createClient(), [])

  // Query Client for cache management
  const queryClient = useQueryClient()

  // Fetch organization + role từ DB khi user thay đổi
  const fetchOrgContext = useCallback(
    async (userId: string) => {
      try {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('role, organizations(id, name, slug)')
          .eq('user_id', userId)
          .single()

        if (membership?.organizations) {
          const org = membership.organizations as unknown as {
            id: string
            name: string
            slug: string
          }
          setOrganization(org)
          setRole(membership.role as Role)
        } else {
          setOrganization(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error fetching org context:', error)
        setOrganization(null)
        setRole(null)
      }
    },
    [supabase]
  )

  // onAuthStateChange — SINGLE SOURCE OF TRUTH cho auth state
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsLoading(false)

      if (event === 'SIGNED_IN' && currentUser) {
        // Fetch org context sau khi sign in
        fetchOrgContext(currentUser.id)
        queryClient.invalidateQueries()
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        setOrganization(null)
        setRole(null)
        queryClient.removeQueries()
        setIsLoggingOut(false)
        router.push('/sign-in')
      }

      // INITIAL_SESSION — fetch org context nếu user có session
      if (event === 'INITIAL_SESSION' && currentUser) {
        fetchOrgContext(currentUser.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, queryClient, fetchOrgContext])

  // ============================================
  // Realtime: lắng nghe thay đổi role trên organization_members
  // Khi admin đổi role của user hiện tại → tự động refresh
  // ============================================
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('org-member-role-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organization_members',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Role thay đổi → cập nhật state ngay lập tức
          const newRole = payload.new?.role as Role | undefined
          if (newRole && newRole !== role) {
            setRole(newRole)
            // Invalidate tất cả queries để UI refresh theo quyền mới
            queryClient.invalidateQueries()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, role, supabase, queryClient])

  // refreshAuth — gọi sau server action sign-in để client-side detect session mới
  const refreshAuth = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        setIsLoading(false)
        await fetchOrgContext(session.user.id)
        return
      }

      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('refreshAuth getUser error:', error.message)
      }

      if (currentUser) {
        setUser(currentUser)
        setIsLoading(false)
        await fetchOrgContext(currentUser.id)
      }
    } catch (e) {
      console.error('refreshAuth exception:', e)
    }
  }, [supabase, fetchOrgContext])

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      await serverSignOut()
      supabase.auth.signOut({ scope: 'local' }).catch(() => {})

      queryClient.removeQueries()
      setUser(null)
      setOrganization(null)
      setRole(null)
      setIsLoggingOut(false)
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
      queryClient.removeQueries()
      setUser(null)
      setOrganization(null)
      setRole(null)
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
        organization,
        role,
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
