'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppStats } from '@/app/actions/app-stats'
import { queryKeys } from './queryKeys'

// ============================================
// APP STATS QUERY
// Fetches unified dashboard stats (device + end user counts) in a single request
// ============================================

export function useAppStatsQuery() {
    return useQuery({
        queryKey: queryKeys.appStats.all,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        queryFn: async () => {
            const data = await getAppStats()
            return data
        },
    })
}
