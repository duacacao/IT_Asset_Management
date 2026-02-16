import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Device } from '@/types/device';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { DeviceOverviewTab } from './DeviceOverviewTab';
import { DeviceSheetsTab } from './DeviceSheetsTab';
import { useDeviceDetailQuery } from '@/hooks/useDevicesQuery';

interface DeviceDetailModalProps {
    device: Device | null;
    isOpen: boolean;
    onClose: () => void;
    onExport: (device: Device) => void;
    onDelete: (deviceId: string) => void;
}

export function DeviceDetailModal({
    device,
    isOpen,
    onClose,
    onExport,
    onDelete,
}: DeviceDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'sheets'>('overview');

    // Fetch full data if we have an ID
    const { data: detailData } = useDeviceDetailQuery(device?.id ?? null);
    const fullDevice = detailData?.device ?? device;

    if (!fullDevice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
                {/* Accessible Title */}
                <VisuallyHidden.Root>
                    <DialogTitle>{fullDevice.deviceInfo.name}</DialogTitle>
                </VisuallyHidden.Root>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold tracking-tight">{fullDevice.deviceInfo.name}</h2>
                            <TabsList className="grid w-[200px] grid-cols-2">
                                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                                <TabsTrigger value="sheets">Dữ liệu</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden min-h-0 bg-muted/5">
                        <TabsContent value="overview" className="h-full m-0 p-0 overflow-auto">
                            <DeviceOverviewTab
                                device={fullDevice}
                                onExport={() => onExport(fullDevice)}
                                onDelete={onDelete}
                                onClose={onClose}
                            />
                        </TabsContent>
                        <TabsContent value="sheets" className="h-full m-0 p-0 flex flex-col">
                            <DeviceSheetsTab device={fullDevice} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
