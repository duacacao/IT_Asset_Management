'use client'

import { useQuery } from '@tanstack/react-query'
import { getEndUsers, getEndUser, getAvailableDevices } from '@/app/actions/end-users'
import { getDepartments } from '@/app/actions/departments'
import { getPositions } from '@/app/actions/positions'
import { queryKeys } from './queryKeys'

// ============================================
// END USERS QUERIES
// ============================================

export function useEndUsersQuery() {
  return useQuery({
    queryKey: queryKeys.endUsers.list(),
    queryFn: async () => {
      const { data, error } = await getEndUsers()
      if (error) throw new Error(error)
      return data || []
    },
  })
}

export function useEndUserQuery(id: string | null) {
  return useQuery({
    queryKey: queryKeys.endUsers.detail(id || ''),
    enabled: !!id,
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
    queryFn: async () => {
      const { data, error } = await getDepartments()
      if (error) throw new Error(error)
      return (data || []).map((d) => ({ label: d.name, value: d.id }))
    },
  })
}

// ============================================
// POSITIONS QUERIES
// ============================================

export function usePositionsQuery() {
  return useQuery({
    queryKey: queryKeys.positions.list(),
    queryFn: async () => {
      const { data, error } = await getPositions()
      if (error) throw new Error(error)
      return (data || []).map((p) => ({ label: p.name, value: p.id }))
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
