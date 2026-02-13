"use client";

import { useDevices } from '@/hooks/useDevices';
import { ImportDevice } from '@/components/dashboard/ImportDevice';
import { DeviceList } from '@/components/dashboard/DeviceList';
import { DeviceDetail } from '@/components/dashboard/DeviceDetail';
import { SheetSelectionDialog } from '@/components/dashboard/SheetSelectionDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, Undo2, Redo2, Plus } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Device } from '@/types/device';
import { useDeviceStore, useTemporalStore } from '@/stores/useDeviceStore';
import { CreateDeviceDialog } from '@/components/dashboard/CreateDeviceDialog';

export default function DevicesPage() {
    const {
        devices,
        selectedDevice,
        setSelectedDevice,
        isLoading,
        addDevice,
        addMultipleDevices,
        removeDevice,
        exportDevice,
    } = useDevices();

    const importProgress = useDeviceStore((s) => s.importProgress);

    // Undo/Redo — reactive subscription thay vì getState()
    const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
    const canUndo = pastStates.length > 0;
    const canRedo = futureStates.length > 0;

    // Keyboard shortcut: Ctrl+Z / Ctrl+Y
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    // Files chờ chọn sheet
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isSheetSelectOpen, setIsSheetSelectOpen] = useState(false);

    // Highlight newly created device
    const [highlightId, setHighlightId] = useState<string | null>(null);

    // Auto-clear highlight after 3 seconds
    useEffect(() => {
        if (highlightId) {
            const timer = setTimeout(() => setHighlightId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [highlightId]);

    const handleViewDevice = (device: Device) => {
        setSelectedDevice(device);
        setDetailMode('view');
        setIsDetailOpen(true);
    };

    const handleUpdateDevice = (device: Device) => {
        setSelectedDevice(device);
        setDetailMode('edit');
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedDevice(null);
    };

    // Khi user drop/chọn files → mở Sheet Selection Dialog
    const handleFilesSelected = useCallback((files: File[]) => {
        setPendingFiles(files);
        setIsImportOpen(false);
        setIsSheetSelectOpen(true);
    }, []);

    // Sau khi chọn sheets → thực hiện import
    const handleSheetConfirm = useCallback(async (selectedSheets: string[]) => {
        setIsSheetSelectOpen(false);

        if (pendingFiles.length === 1) {
            await addDevice(pendingFiles[0], selectedSheets);
        } else {
            await addMultipleDevices(pendingFiles, selectedSheets);
        }
        setPendingFiles([]);
    }, [pendingFiles, addDevice, addMultipleDevices]);

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Thiết bị</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => undo()} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)" aria-label="Hoàn tác">
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => redo()} disabled={!canRedo} title="Làm lại (Ctrl+Y)" aria-label="Làm lại">
                        <Redo2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateOpen(true)} disabled={importProgress.isImporting}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo mới
                    </Button>
                    <Button onClick={() => setIsImportOpen(true)} disabled={importProgress.isImporting}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                </div>
            </div>

            {/* Import progress bar */}
            {importProgress.isImporting && (
                <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                            Đang import… {importProgress.current}/{importProgress.total}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {importProgress.successCount > 0 && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {importProgress.successCount}
                                </span>
                            )}
                            {importProgress.failCount > 0 && (
                                <span className="flex items-center gap-1 text-red-600">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {importProgress.failCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <Progress
                        value={importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}
                    />
                </div>
            )}

            {devices.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-muted p-6 mb-6">
                        <Upload className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có thiết bị nào</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Import file Excel (.xlsx) để bắt đầu quản lý thiết bị. Hỗ trợ import nhiều files cùng lúc.
                    </p>
                    <Button size="lg" onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
                        Import thiết bị đầu tiên
                    </Button>
                </div>
            ) : (
                <div className="flex-1 flex-col space-y-8 flex">
                    <DeviceList
                        devices={devices}
                        onViewDevice={handleViewDevice}
                        onUpdateDevice={handleUpdateDevice}
                        onExportDevice={exportDevice}
                        onDeleteDevice={removeDevice}
                        highlightId={highlightId}
                    />
                </div>
            )}

            {/* Import Dialog — chỉ chọn files */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Import thiết bị</DialogTitle>
                        <DialogDescription>
                            Kéo thả file Excel vào đây để import thiết bị.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ImportDevice
                            onImport={async (file) => handleFilesSelected([file])}
                            onImportMultiple={async (files) => handleFilesSelected(files)}
                            isLoading={isLoading}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sheet Selection Dialog — chọn sheet trước khi import */}
            <SheetSelectionDialog
                isOpen={isSheetSelectOpen}
                onClose={() => {
                    setIsSheetSelectOpen(false);
                    setPendingFiles([]);
                }}
                files={pendingFiles}
                onConfirm={handleSheetConfirm}
            />

            <DeviceDetail
                device={selectedDevice}
                isOpen={isDetailOpen}
                mode={detailMode}
                onClose={handleCloseDetail}
                onExport={exportDevice}
                onDelete={removeDevice}
            />

            {/* Create Device Dialog */}
            <CreateDeviceDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={(deviceId) => {
                    const device = devices.find((d) => d.id === deviceId) ||
                        useDeviceStore.getState().devices.find((d) => d.id === deviceId);

                    if (device) {
                        // Don't open update dialog immediately, instead highlight and scroll
                        // handleUpdateDevice(device); 
                        // UX Change: Scroll to new device instead of opening it
                        setHighlightId(deviceId);
                    }
                }}
            />
        </div>
    );
}
