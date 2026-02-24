'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    useEffect(() => {
        const supabase = createClient()

        // Lắng nghe thay đổi toàn cầu trên 3 bảng chính để Invalidate Cache
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
                    queryClient.invalidateQueries({ queryKey: ['devices'] })
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
                    queryClient.invalidateQueries({ queryKey: ['devices'] })
                    queryClient.invalidateQueries({ queryKey: ['end-users'] })
                    queryClient.invalidateQueries({ queryKey: ['available-devices'] })
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
                    queryClient.invalidateQueries({ queryKey: ['end-users'] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [queryClient])

    return <>{children}</>
}
