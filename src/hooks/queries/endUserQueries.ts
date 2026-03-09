'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getEndUsers,
  getEndUser,
  getAvailableDevices,
  getEndUserStats,
} from '@/app/actions/end-users'
import { toFrontendEndUser } from '@/lib/supabase-adapter'
import { getDepartments } from '@/app/actions/departments'
import { getPositions } from '@/app/actions/positions'
import { queryKeys } from './queryKeys'

// ============================================
// END USERS QUERIES
// ============================================

export function useEndUsersQuery() {
  return useQuery({
    queryKey: queryKeys.endUsers.list(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getEndUsers()
      if (error) throw new Error(error)
      if (!data) return []

      const { endUsers, assignments } = data

      // Pre-build grouped Map để tránh O(n²) — .filter() bên trong toFrontendEndUser
      // EndUser có thể có nhiều assignments (1:N), nên dùng Map<userId, assignment[]>
      const assignmentsByUser = new Map<string, any[]>()
      for (const a of assignments) {
        const list = assignmentsByUser.get(a.end_user_id) || []
        list.push(a)
        assignmentsByUser.set(a.end_user_id, list)
      }

      return endUsers.map((user: any) =>
        toFrontendEndUser(user, assignmentsByUser.get(user.id) || [])
      )
    },
  })
}

export function useEndUserQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.endUsers.detail(id || ''),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Luôn refetch khi mount — safety net cho staleTime: Infinity global
    // Đảm bảo end-user detail luôn có data mới nhất khi mở dialog
    refetchOnMount: 'always',
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await getEndUser(id)
      if (error) throw new Error(error)
      return data
    },
  })
}

// ============================================
// DEPARTMENTS QUERIES
// ============================================

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getDepartments()
      if (error) throw new Error(error)
      return (data || []).map((d) => ({ label: d.name, value: d.id }))
    },
  })
}

// Raw Department[] for department management table
export function useDepartmentsRawQuery() {
  return useQuery({
    queryKey: [...queryKeys.departments.all, 'raw'] as const,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getDepartments()
      if (error) throw new Error(error)
      return data || []
    },
  })
}

// ============================================
// POSITIONS QUERIES
// ============================================

export function usePositionsQuery() {
  return useQuery({
    queryKey: queryKeys.positions.list(),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getPositions()
      if (error) throw new Error(error)
      return (data || []).map((p) => ({ label: p.name, value: p.id }))
    },
  })
}

// Raw Position[] for department management table
export function usePositionsRawQuery() {
  return useQuery({
    queryKey: [...queryKeys.positions.all, 'raw'] as const,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await getPositions()
      if (error) throw new Error(error)
      return data || []
    },
  })
}

// ============================================
// AVAILABLE DEVICES QUERIES
// ============================================

export function useAvailableDevicesQuery() {
  return useQuery({
    queryKey: queryKeys.availableDevices.list(),
    queryFn: async () => {
      const { data, error } = await getAvailableDevices()
      if (error) throw new Error(error)
      return data || []
    },
  })
}

// ============================================
// END USER STATS QUERY
// ============================================

export function useEndUserStatsQuery() {
  return useQuery({
    queryKey: queryKeys.endUsers.stats(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const data = await getEndUserStats()
      return data
    },
  })
}
