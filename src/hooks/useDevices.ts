import { useDevicesContext } from '@/contexts/DevicesContext';

export const useDevices = () => {
    return useDevicesContext();
};
