'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { queryKeys } from '@/hooks/queries/queryKeys'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    useEffect(() => {
        const supabase = createClient()

        // Lắng nghe thay đổi toàn cầu trên 3 bảng chính để Invalidate Cache
        // refetchType: 'all' → buộc refetch cả inactive queries (VD: device detail khi user ở page khác)
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'devices',
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.devices.all, refetchType: 'all' })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'device_assignments',
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.devices.all, refetchType: 'all' })
                    queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.all, refetchType: 'all' })
                    queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.all, refetchType: 'all' })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'end_users',
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.all, refetchType: 'all' })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [queryClient])

    return <>{children}</>
}
