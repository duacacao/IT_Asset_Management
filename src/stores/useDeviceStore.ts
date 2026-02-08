import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Device } from '@/types/device';
import { importExcelDevice, exportDeviceToExcel } from '@/lib/deviceUtils';
import { toast } from 'sonner';

interface DeviceState {
    devices: Device[];
    selectedDevice: Device | null;
    isLoading: boolean;
    // Global default: danh sách sheet mặc định được import
    defaultVisibleSheets: string[];

    // Actions
    setSelectedDevice: (device: Device | null) => void;
    setDefaultVisibleSheets: (sheets: string[]) => void;
    addDevice: (file: File, selectedSheets?: string[]) => Promise<Device>;
    addMultipleDevices: (files: File[], selectedSheets?: string[]) => Promise<void>;
    removeDevice: (deviceId: string) => void;
    undoRemoveDevice: (device: Device) => void;
    updateDevice: (deviceId: string, updates: Partial<Device>) => void;
    updateDeviceVisibleSheets: (deviceId: string, visibleSheets: string[]) => void;
    exportDevice: (device: Device) => void;
}

export const useDeviceStore = create<DeviceState>()(
    persist(
        (set, get) => ({
            devices: [],
            selectedDevice: null,
            isLoading: false,
            defaultVisibleSheets: [],

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
                set({ isLoading: true });
                let successCount = 0;
                let failCount = 0;
                const newDevices: Device[] = [];

                for (const file of files) {
                    try {
                        const device = await importExcelDevice(file, selectedSheets);
                        newDevices.push(device);
                        successCount++;
                    } catch {
                        failCount++;
                    }
                }

                // Batch update — gom 1 lần set thay vì N lần
                set((state) => ({ devices: [...state.devices, ...newDevices] }));
                set({ isLoading: false });

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
            name: 'device-storage',
            // Không persist selectedDevice và isLoading (transient state)
            partialize: (state) => ({
                devices: state.devices,
                defaultVisibleSheets: state.defaultVisibleSheets,
            }),
        }
    )
);
