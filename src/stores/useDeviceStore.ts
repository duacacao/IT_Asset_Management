import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { Device, DeviceStatus } from '@/types/device';
import { importExcelDevice, exportDeviceToExcel } from '@/lib/deviceUtils';
import { indexedDBStorage } from '@/lib/indexeddb-storage';
import { toast } from 'sonner';

interface ImportProgress {
    current: number;
    total: number;
    successCount: number;
    failCount: number;
    isImporting: boolean;
}

interface DeviceState {
    devices: Device[];
    selectedDevice: Device | null;
    isLoading: boolean;
    defaultVisibleSheets: string[];
    importProgress: ImportProgress;

    // Actions
    setSelectedDevice: (device: Device | null) => void;
    setDefaultVisibleSheets: (sheets: string[]) => void;
    addDevice: (file: File, selectedSheets?: string[]) => Promise<Device>;
    addMultipleDevices: (files: File[], selectedSheets?: string[]) => Promise<void>;
    removeDevice: (deviceId: string) => void;
    undoRemoveDevice: (device: Device) => void;
    updateDevice: (deviceId: string, updates: Partial<Device>) => void;
    updateDeviceVisibleSheets: (deviceId: string, visibleSheets: string[]) => void;
    // Status & Tags
    setDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
    addTag: (deviceId: string, tag: string) => void;
    removeTag: (deviceId: string, tag: string) => void;
    // Inline editing
    updateSheetCell: (deviceId: string, sheetName: string, rowIndex: number, column: string, value: any) => void;
    exportDevice: (device: Device) => void;
}

const INITIAL_PROGRESS: ImportProgress = {
    current: 0,
    total: 0,
    successCount: 0,
    failCount: 0,
    isImporting: false,
};

export const useDeviceStore = create<DeviceState>()(
    persist(
        temporal(
        (set, get) => ({
            devices: [],
            selectedDevice: null,
            isLoading: false,
            defaultVisibleSheets: [],
            importProgress: INITIAL_PROGRESS,

            setSelectedDevice: (device) => set({ selectedDevice: device }),

            setDefaultVisibleSheets: (sheets) => set({ defaultVisibleSheets: sheets }),

            addDevice: async (file: File, selectedSheets?: string[]) => {
                set({ isLoading: true });
                try {
                    const device = await importExcelDevice(file, selectedSheets);
                    set((state) => ({ devices: [...state.devices, device] }));
                    toast.success(`Imported ${device.deviceInfo.name}`, {
                        description: `${device.metadata.totalSheets} sheets, ${device.metadata.totalRows} rows`,
                    });
                    return device;
                } catch (error) {
                    toast.error('Import failed', {
                        description: error instanceof Error ? error.message : 'Unknown error',
                    });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            addMultipleDevices: async (files: File[], selectedSheets?: string[]) => {
                set({
                    isLoading: true,
                    importProgress: { current: 0, total: files.length, successCount: 0, failCount: 0, isImporting: true },
                });

                const newDevices: Device[] = [];
                let successCount = 0;
                let failCount = 0;

                for (let i = 0; i < files.length; i++) {
                    try {
                        const device = await importExcelDevice(files[i], selectedSheets);
                        newDevices.push(device);
                        successCount++;
                    } catch {
                        failCount++;
                    }
                    // Cập nhật progress sau mỗi file
                    set({
                        importProgress: {
                            current: i + 1,
                            total: files.length,
                            successCount,
                            failCount,
                            isImporting: true,
                        },
                    });
                }

                // Batch update — gom 1 lần set thay vì N lần
                set((state) => ({ devices: [...state.devices, ...newDevices] }));
                set({ isLoading: false, importProgress: INITIAL_PROGRESS });

                if (failCount === 0) {
                    toast.success(`Imported ${successCount} device(s) successfully`);
                } else {
                    toast.warning(`Imported ${successCount}/${files.length}`, {
                        description: `${failCount} file(s) failed`,
                    });
                }
            },

            removeDevice: (deviceId: string) => {
                const device = get().devices.find((d) => d.id === deviceId);
                if (!device) return;

                set((state) => ({
                    devices: state.devices.filter((d) => d.id !== deviceId),
                    // Đóng detail nếu đang xem device bị xóa
                    selectedDevice:
                        state.selectedDevice?.id === deviceId ? null : state.selectedDevice,
                }));

                // Toast với nút Undo
                toast.success(`Deleted ${device.deviceInfo.name}`, {
                    action: {
                        label: 'Undo',
                        onClick: () => get().undoRemoveDevice(device),
                    },
                    duration: 5000,
                });
            },

            undoRemoveDevice: (device: Device) => {
                set((state) => ({ devices: [...state.devices, device] }));
                toast.success(`Restored ${device.deviceInfo.name}`);
            },

            updateDevice: (deviceId: string, updates: Partial<Device>) => {
                set((state) => ({
                    devices: state.devices.map((d) =>
                        d.id === deviceId ? { ...d, ...updates } : d
                    ),
                }));
                toast.success('Saved', { duration: 1500 });
            },

            // Toggle ẩn/hiện sheet per device
            updateDeviceVisibleSheets: (deviceId: string, visibleSheets: string[]) => {
                set((state) => ({
                    devices: state.devices.map((d) =>
                        d.id === deviceId
                            ? { ...d, metadata: { ...d.metadata, visibleSheets } }
                            : d
                    ),
                }));
            },

            // Đổi trạng thái thiết bị
            setDeviceStatus: (deviceId: string, status: DeviceStatus) => {
                set((state) => ({
                    devices: state.devices.map((d) =>
                        d.id === deviceId ? { ...d, status } : d
                    ),
                }));
                toast.success('Status updated', { duration: 1500 });
            },

            // Thêm custom tag
            addTag: (deviceId: string, tag: string) => {
                const trimmed = tag.trim();
                if (!trimmed) return;
                set((state) => ({
                    devices: state.devices.map((d) => {
                        if (d.id !== deviceId) return d;
                        // Tránh trùng tag
                        if (d.metadata.tags.includes(trimmed)) return d;
                        return { ...d, metadata: { ...d.metadata, tags: [...d.metadata.tags, trimmed] } };
                    }),
                }));
            },

            // Xóa custom tag
            removeTag: (deviceId: string, tag: string) => {
                set((state) => ({
                    devices: state.devices.map((d) =>
                        d.id === deviceId
                            ? { ...d, metadata: { ...d.metadata, tags: d.metadata.tags.filter((t) => t !== tag) } }
                            : d
                    ),
                }));
            },

            // Cập nhật 1 cell trong sheet data
            updateSheetCell: (deviceId: string, sheetName: string, rowIndex: number, column: string, value: any) => {
                set((state) => ({
                    devices: state.devices.map((d) => {
                        if (d.id !== deviceId) return d;
                        const sheetData = [...d.sheets[sheetName]];
                        sheetData[rowIndex] = { ...sheetData[rowIndex], [column]: value };
                        return { ...d, sheets: { ...d.sheets, [sheetName]: sheetData } };
                    }),
                }));
            },

            exportDevice: (device: Device) => {
                try {
                    exportDeviceToExcel(device);
                    toast.success('Device exported');
                } catch {
                    toast.error('Export failed');
                }
            },
        }),
        {
            // Chỉ track thay đổi devices — không track transient state
            partialize: (state) => ({
                devices: state.devices,
                defaultVisibleSheets: state.defaultVisibleSheets,
            }),
            limit: 30, // Giữ tối đa 30 bước undo
        }),
        {
            name: 'device-storage',
            // Sử dụng IndexedDB thay localStorage — hỗ trợ hàng trăm MB
            storage: indexedDBStorage,
            // Không persist selectedDevice, isLoading, importProgress (transient state)
            partialize: (state) => ({
                devices: state.devices,
                defaultVisibleSheets: state.defaultVisibleSheets,
            }),
        }
    )
);
