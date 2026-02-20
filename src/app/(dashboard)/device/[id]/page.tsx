'use client'

import { use, useState } from 'react'
import { useDeviceDetailQuery } from '@/hooks/useDevicesQuery'
import { DeviceOverviewTab } from '@/components/dashboard/detail/DeviceOverviewTab'
import { DeviceSheetsTab } from '@/components/dashboard/detail/DeviceSheetsTab'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Next.js 15+ / 16: params là Promise, cần dùng React.use() để unwrap
interface DeviceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  // Unwrap async params bằng React.use() — bắt buộc với Next.js 16
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: detailData, isLoading, error } = useDeviceDetailQuery(id)
  const device = detailData?.device

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-sm">Đang tải thông tin thiết bị...</p>
        </div>
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="bg-background flex h-screen w-full flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Không tìm thấy thiết bị</h2>
        <p className="text-muted-foreground">Thiết bị có thể đã bị xóa hoặc không tồn tại.</p>
        <Button onClick={() => router.push('/devices')}>Quay lại danh sách</Button>
      </div>
    )
  }

  const handleExport = () => {
    toast.info('Tính năng xuất file đang được cập nhật cho giao diện mới')
  }

  const handleDelete = (id: string) => {
    toast.info('Tính năng xóa đang được cập nhật cho giao diện mới')
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Main Layout with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        {/* Header Section */}
        <div className="z-10 flex shrink-0 items-center justify-between bg-transparent px-6 pt-6 pb-2">
          {/* LEFT: Back Button & Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-9 w-9 rounded-full"
              onClick={() => router.push('/devices')}
              title="Quay lại danh sách"
            >
              <ArrowLeft className="text-muted-foreground h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                {device.deviceInfo.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Tabs Toggle */}
          <TabsList className="bg-muted text-muted-foreground grid h-8 w-[180px] grid-cols-2 items-center rounded-lg p-0.5">
            <TabsTrigger
              value="overview"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex h-7 items-center justify-center rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="sheets"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex h-7 items-center justify-center rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
            >
              Dữ liệu
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Section */}
        <div className="bg-muted/5 flex-1 overflow-hidden">
          <TabsContent
            value="overview"
            className="m-0 h-full overflow-auto p-0 data-[state=active]:block"
          >
            <DeviceOverviewTab
              device={device}
              onExport={handleExport}
              onDelete={handleDelete}
              onClose={() => router.push('/devices')}
            />
          </TabsContent>

          <TabsContent
            value="sheets"
            className="m-0 flex h-full flex-col overflow-hidden p-0 data-[state=active]:flex"
          >
            <DeviceSheetsTab device={device} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
