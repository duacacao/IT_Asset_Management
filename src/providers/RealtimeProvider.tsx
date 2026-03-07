'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { queryKeys } from '@/hooks/queries/queryKeys'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const pendingInvalidationsRef = useRef<Set<string>>(new Set())

    // Debounced invalidation - gom nhiều events trong 500ms thành 1 lần invalidate
    const debouncedInvalidate = useCallback(() => {
        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            // Invalidate all pending query keys
            pendingInvalidationsRef.current.forEach((key) => {
                // Parse key để xác định query type
                if (key.startsWith('devices')) {
                    queryClient.invalidateQueries({ queryKey: queryKeys.devices.all })
                } else if (key.startsWith('endUsers')) {
                    queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.all })
                } else if (key.startsWith('availableDevices')) {
                    queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.all })
                }
            })
            // Clear pending
            pendingInvalidationsRef.current.clear()
        }, 500)
    }, [queryClient])

    // Queue an invalidation request
    const queueInvalidation = useCallback((key: string) => {
        pendingInvalidationsRef.current.add(key)
        debouncedInvalidate()
    }, [debouncedInvalidate])

    useEffect(() => {
        const supabase = createClient()

        // Lắng nghe thay đổi toàn cầu trên 3 bảng chính để Invalidate Cache
        // Dùng debounce 500ms để tránh multiple invalidation cho 1 transaction
        // Bỏ refetchType: 'all' → chỉ refetch queries đang hiển thị
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
                    queueInvalidation('devices-all')
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
                    queueInvalidation('devices-all')
                    queueInvalidation('endUsers-all')
                    queueInvalidation('availableDevices-all')
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
                    queueInvalidation('endUsers-all')
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [queryClient, queueInvalidation])

    return <>{children}</>
}
