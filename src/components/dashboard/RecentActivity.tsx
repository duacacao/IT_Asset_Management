'use client'

import * as React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Device, DeviceStatus } from '@/types/device'
import { DEVICE_STATUS_CONFIG } from '@/constants/device'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/time'
import { Laptop, Server, Smartphone, User, Clock } from 'lucide-react'
import { EndUserWithDevice } from '@/types/end-user'

interface RecentActivityProps {
  devices: Device[]
  endUsers: EndUserWithDevice[]
}

function getDeviceIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('server')) return Server
  if (n.includes('iphone') || n.includes('android')) return Smartphone
  return Laptop
}

type ActivityItem = {
  id: string
  type: 'device' | 'user'
  name: string
  timestamp: string
  status?: DeviceStatus
  extra?: string
}

export function RecentActivity({ devices, endUsers }: RecentActivityProps) {
  const activities = React.useMemo(() => {
    const deviceItems: ActivityItem[] = devices
      .sort(
        (a, b) =>
          new Date(b.metadata.importedAt).getTime() - new Date(a.metadata.importedAt).getTime()
      )
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        type: 'device' as const,
        name: d.deviceInfo.name,
        timestamp: d.metadata.importedAt,
        status: d.status ?? 'active',
      }))

    const userItems: ActivityItem[] = endUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        type: 'user' as const,
        name: u.full_name,
        timestamp: u.created_at,
        extra: u.department || undefined,
      }))

    const allItems = [...deviceItems, ...userItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return allItems.slice(0, 10)
  }, [devices, endUsers])

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border-none bg-white shadow-md dark:bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 shadow-sm dark:bg-blue-950/50">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">Hoạt động gần đây</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-0">
        {activities.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center text-sm">
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="flex flex-col gap-0 px-4 pb-4">
              {activities.map((item, index) => {
                const isLast = index === activities.length - 1

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`group/item hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors ${!isLast ? 'border-border/40 border-b' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-background group-hover/item:border-primary/20 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors">
                        {item.type === 'device' ? (
                          (() => {
                            const Icon = getDeviceIcon(item.name)
                            return (
                              <>
                                <Icon className="text-muted-foreground group-hover/item:text-primary h-4 w-4 transition-colors" />
                                <span
                                  className={`ring-background absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ring-2 ${item.status === 'active'
                                    ? 'bg-amber-500'
                                    : item.status === 'broken'
                                      ? 'bg-red-500'
                                      : 'bg-emerald-500'
                                    }`}
                                />
                              </>
                            )
                          })()
                        ) : (
                          <>
                            <User className="text-muted-foreground group-hover/item:text-primary h-4 w-4 transition-colors" />
                            <span className="ring-background absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2" />
                          </>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <p className="group-hover/item:text-primary truncate text-sm leading-none font-medium transition-colors">
                          {item.name}
                        </p>
                        <span className="text-muted-foreground mt-1 text-[11px]">
                          {timeAgo(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    {item.type === 'device' && item.status && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${item.status === 'active'
                          ? 'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          : item.status === 'broken'
                            ? 'border-red-200 bg-red-50/50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                            : 'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                          }`}
                      >
                        {DEVICE_STATUS_CONFIG[item.status].label}
                      </Badge>
                    )}
                    {item.type === 'user' && item.extra && (
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full border border-blue-200 bg-blue-50/50 px-2.5 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                      >
                        {item.extra}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
