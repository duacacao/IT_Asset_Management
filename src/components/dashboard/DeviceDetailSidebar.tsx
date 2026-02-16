import { Laptop, Cpu, HardDrive, Monitor, Network, Calendar, SlidersHorizontal, Database as DatabaseIcon, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Device, DeviceInfo, DeviceStatus } from '@/types/device';
import { DEVICE_STATUS_CONFIG, STATUS_DOT_COLORS } from '@/constants/device';
import { InfoRow, EditField, DatabaseIcon as CustomDatabaseIcon } from './DeviceDetailHelpers';
import type { DeviceStatusMutation } from './DeviceDetail.types';

interface DeviceDetailSidebarProps {
    device: Device;
    isEditMode: boolean;
    editForm: Partial<DeviceInfo>;
    onEditFormChange: (form: Partial<DeviceInfo>) => void;
    onExport: (device: Device) => void;
    onDelete: (deviceId: string) => void;
    onClose: () => void;
    updateStatusMutation: DeviceStatusMutation;
}

export function DeviceDetailSidebar({
    device,
    isEditMode,
    editForm,
    onEditFormChange,
    onExport,
    onDelete,
    onClose,
    updateStatusMutation,
}: DeviceDetailSidebarProps) {
    const status = device.status ?? 'active';
    const statusConfig = DEVICE_STATUS_CONFIG[status];

    const handleStatusChange = (newStatus: string) => {
        updateStatusMutation.mutate({ deviceId: device.id, status: newStatus as DeviceStatus });
    };

    return (
        <div className="w-[300px] flex-shrink-0 border-r flex flex-col bg-muted/5 overflow-y-auto pt-10">
            <div className="p-5 space-y-5">
                {/* Device name + status */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                            <Monitor className="h-5 w-5 text-primary" />
                        </div>
                        {isEditMode ? (
                            <Input
                                name="deviceName"
                                type="text"
                                value={editForm.name ?? ''}
                                onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                                className="text-base font-bold h-8"
                                autoComplete="off"
                            />
                        ) : (
                            <h2 className="text-base font-bold leading-snug break-words">
                                {device.deviceInfo.name}
                            </h2>
                        )}
                    </div>
                    {/* Status — selector khi Edit, label khi View */}
                    {isEditMode ? (
                        <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                        {statusConfig.label}
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <span className={`mr-1.5 h-2 w-2 rounded-full ${STATUS_DOT_COLORS[key as DeviceStatus]} inline-block`} />
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex items-center gap-2 px-1">
                            <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            <span className="text-xs font-medium">{statusConfig.label}</span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Thông tin thiết bị */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin</p>
                    {isEditMode ? (
                        <div className="space-y-2.5">
                            <EditField icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={editForm.os ?? ''} onChange={(v) => onEditFormChange({ ...editForm, os: v })} />
                            <EditField icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={editForm.cpu ?? ''} onChange={(v) => onEditFormChange({ ...editForm, cpu: v })} />
                            <EditField icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={editForm.ram ?? ''} onChange={(v) => onEditFormChange({ ...editForm, ram: v })} />
                            <EditField icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={editForm.architecture ?? ''} onChange={(v) => onEditFormChange({ ...editForm, architecture: v })} />
                            <EditField icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={editForm.mac ?? ''} onChange={(v) => onEditFormChange({ ...editForm, mac: v })} />
                        </div>
                    ) : (
                        <>
                            <InfoRow icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={device.deviceInfo.os} />
                            <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={device.deviceInfo.cpu} />
                            <InfoRow icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={device.deviceInfo.ram} />
                            <InfoRow icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={device.deviceInfo.architecture} />
                            <InfoRow icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={device.deviceInfo.mac || 'Không có'} />
                        </>
                    )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chi tiết</p>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">{device.deviceInfo.lastUpdate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CustomDatabaseIcon className="h-3.5 w-3.5" />
                            <span className="text-xs">{device.metadata.fileSize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span className="text-xs">{device.metadata.totalSheets} sheet • {device.metadata.totalRows} dòng</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                    <div className={`grid gap-2 ${isEditMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onExport(device)}>
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Xuất file
                        </Button>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Xóa
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Thiết bị sẽ bị xóa vĩnh viễn. Bạn có thể dùng Undo (Ctrl+Z) để khôi phục.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                        onDelete(device.id);
                                        onClose();
                                    }}
                                >
                                    Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
