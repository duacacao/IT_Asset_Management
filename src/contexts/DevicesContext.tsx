"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Device } from '@/types/device';
import { importExcelDevice, exportDeviceToExcel } from '@/lib/deviceUtils';
import { toast } from 'sonner';

interface DevicesContextType {
    devices: Device[];
    selectedDevice: Device | null;
    setSelectedDevice: (device: Device | null) => void;
    isLoading: boolean;
    addDevice: (file: File) => Promise<Device>;
    removeDevice: (deviceId: string) => void;
    updateDevice: (deviceId: string, updates: Partial<Device>) => void;
    exportDevice: (device: Device) => void;
}

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

export const DevicesProvider = ({ children }: { children: ReactNode }) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const addDevice = useCallback(async (file: File) => {
        setIsLoading(true);
        try {
            const device = await importExcelDevice(file);
            setDevices(prev => [...prev, device]);
            toast.success(`Imported ${device.deviceInfo.name}`, {
                description: `${device.metadata.totalSheets} sheets, ${device.metadata.totalRows} rows`
            });
            return device;
        } catch (error) {
            toast.error('Import failed', {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeDevice = useCallback((deviceId: string) => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
        toast.success('Device deleted');
    }, []);

    const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
        setDevices(prev => prev.map(d =>
            d.id === deviceId ? { ...d, ...updates } : d
        ));
    }, []);

    const exportDevice = useCallback((device: Device) => {
        try {
            exportDeviceToExcel(device);
            toast.success('Device exported');
        } catch (error) {
            toast.error('Export failed');
        }
    }, []);

    return (
        <DevicesContext.Provider value={{
            devices,
            selectedDevice,
            setSelectedDevice,
            isLoading,
            addDevice,
            removeDevice,
            updateDevice,
            exportDevice,
        }}>
            {children}
        </DevicesContext.Provider>
    );
};

export const useDevicesContext = () => {
    const context = useContext(DevicesContext);
    if (context === undefined) {
        throw new Error('useDevicesContext must be used within a DevicesProvider');
    }
    return context;
};
