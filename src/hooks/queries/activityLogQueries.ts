'use client'

import { useQuery } from '@tanstack/react-query'
import { getActivityLogs } from '@/app/actions/activity-logs'
import { queryKeys } from './queryKeys'

interface UseActivityLogsParams {
  page?: number
  pageSize?: number
  action?: string
}

export function useActivityLogsQuery(params: UseActivityLogsParams = {}) {
  const { page = 1, pageSize = 30, action } = params

  return useQuery({
    queryKey: queryKeys.activityLogs.list({ page, action }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, count, error } = await getActivityLogs({ page, pageSize, action })
      if (error) throw new Error(error)
      return { logs: data, totalCount: count }
    },
  })
}
