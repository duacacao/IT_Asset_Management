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
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="text-muted-foreground text-sm">Đang tải thông tin thiết bị...</p>
                </div>
            </div>
        )
    }

    if (error || !device) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
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
        <div className="flex h-screen flex-col bg-background">
            {/* Main Layout with Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex h-full flex-col"
            >
                {/* Header Section */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-background shadow-sm z-10 shrink-0">
                    {/* LEFT: Back Button & Title */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-muted"
                            onClick={() => router.push('/devices')}
                            title="Quay lại danh sách"
                        >
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>


                    </div>

                    {/* RIGHT: Tabs Toggle */}
                    <TabsList className="grid w-[240px] grid-cols-2 bg-muted/50 p-1">
                        <TabsTrigger
                            value="overview"
                            className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            Tổng quan
                        </TabsTrigger>
                        <TabsTrigger
                            value="sheets"
                            className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                            Dữ liệu
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-hidden bg-muted/5">
                    <TabsContent value="overview" className="h-full m-0 p-0 overflow-auto data-[state=active]:block">
                        <DeviceOverviewTab
                            device={device}
                            onExport={handleExport}
                            onDelete={handleDelete}
                            onClose={() => router.push('/devices')}
                        />
                    </TabsContent>

                    <TabsContent value="sheets" className="h-full m-0 p-0 overflow-hidden flex flex-col data-[state=active]:flex">
                        <DeviceSheetsTab device={device} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
