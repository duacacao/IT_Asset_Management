"use client";

import { useDevices } from '@/hooks/useDevices';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ImportDevice } from '@/components/dashboard/ImportDevice';
import { DeviceList } from '@/components/dashboard/DeviceList';
import { DeviceDetail } from '@/components/dashboard/DeviceDetail';
import { SheetSelectionDialog } from '@/components/dashboard/SheetSelectionDialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Device } from '@/types/device';
import { useDeviceStore } from '@/stores/useDeviceStore';

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

    const defaultVisibleSheets = useDeviceStore((s) => s.defaultVisibleSheets);
    const setDefaultVisibleSheets = useDeviceStore((s) => s.setDefaultVisibleSheets);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    // Files chờ chọn sheet
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isSheetSelectOpen, setIsSheetSelectOpen] = useState(false);

    const handleViewDevice = (device: Device) => {
        setSelectedDevice(device);
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
        // Lưu lại làm global default
        setDefaultVisibleSheets(selectedSheets);

        if (pendingFiles.length === 1) {
            await addDevice(pendingFiles[0], selectedSheets);
        } else {
            await addMultipleDevices(pendingFiles, selectedSheets);
        }
        setPendingFiles([]);
    }, [pendingFiles, addDevice, addMultipleDevices, setDefaultVisibleSheets]);

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Devices</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                </div>
            </div>

            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <DeviceList
                    devices={devices}
                    onViewDevice={handleViewDevice}
                    onExportDevice={exportDevice}
                    onDeleteDevice={removeDevice}
                />
            </div>

            {/* Import Dialog — chỉ chọn files */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Import Devices</DialogTitle>
                        <DialogDescription>
                            Drag and drop your Excel file here to import devices.
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
                defaultSelected={defaultVisibleSheets}
                onConfirm={handleSheetConfirm}
            />

            <DeviceDetail
                device={selectedDevice}
                isOpen={isDetailOpen}
                onClose={handleCloseDetail}
                onExport={exportDevice}
                onDelete={removeDevice}
            />
        </div>
    );
}
