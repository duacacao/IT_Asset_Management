'use client'

import { useQuery } from '@tanstack/react-query'
import { getOrganizationHierarchy } from '@/app/actions/organization'
import { getMembers } from '@/app/actions/members'
import { queryKeys } from './queryKeys'

export function useOrganizationQuery() {
  return useQuery({
    queryKey: queryKeys.organization.hierarchy(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Luôn refetch khi mount — safety net cho staleTime: Infinity global
    // Đảm bảo sơ đồ tổ chức luôn phản ánh hierarchy mới nhất
    refetchOnMount: 'always',
    queryFn: async () => {
      const { departments, error } = await getOrganizationHierarchy()
      if (error) throw new Error(error)
      return departments
    },
  })
}

export function useMembersQuery() {
  return useQuery({
    queryKey: queryKeys.members.list(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always',
    queryFn: async () => {
      const { data, error } = await getMembers()
      if (error) throw new Error(error)
      return data
    },
  })
}
