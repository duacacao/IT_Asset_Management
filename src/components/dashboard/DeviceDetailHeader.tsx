import { Device, DeviceStatus } from '@/types/device';
import { STATUS_DOT_COLORS } from '@/constants/device';
import { DEVICE_STATUS_CONFIG } from '@/types/device';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Download, Trash2, Pencil, CheckCircle2, X } from 'lucide-react';

interface DeviceDetailHeaderProps {
    device: Device;
    isEditMode: boolean;
    onExport: (device: Device) => void;
    onDelete: (deviceId: string) => void;
    onModeChange: (mode: 'view' | 'edit') => void;
    onSave: () => void;
    onCancel: () => void;
}

export function DeviceDetailHeader({
    device,
    isEditMode,
    onExport,
    onDelete,
    onModeChange,
    onSave,
    onCancel,
}: DeviceDetailHeaderProps) {
    const status = device.status ?? 'active';
    const statusConfig = DEVICE_STATUS_CONFIG[status];

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                <span className="text-sm font-medium">{statusConfig.label}</span>
            </div>
            <div className="flex items-center gap-2">
                {!isEditMode ? (
                    <>
                        <Button variant="outline" size="sm" onClick={() => onExport(device)}>
                            <Download className="mr-2 h-4 w-4" />
                            Xuất
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onModeChange('edit')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xóa thiết bị</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc muốn xóa "{device.deviceInfo.name}"? Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(device.id)}>
                                        Xóa
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                ) : (
                    <>
                        <Button size="sm" onClick={onSave}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Lưu
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Hủy
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
