

// Trạng thái thiết bị
export type DeviceStatus = 'active' | 'broken' | 'inactive';

export const DEVICE_STATUS_CONFIG = {
  active: { label: 'Đang sử dụng', color: 'bg-green-500', variant: 'default' as const },
  broken: { label: 'Hư hỏng', color: 'bg-red-500', variant: 'destructive' as const },
  inactive: { label: 'Không sử dụng', color: 'bg-gray-400', variant: 'secondary' as const },
} as const;

// Device data structure
export interface DeviceInfo {
  name: string;
  os: string;
  cpu: string;
  ram: string;
  architecture: string;
  ip: string;
  mac: string;
  lastUpdate: string;
}

export interface DeviceMetadata {
  totalSheets: number;
  totalRows: number;
  fileSize: string;
  importedAt: string;
  tags: string[];
  // Sheet nào được hiển thị (override per device, null = dùng global default)
  visibleSheets?: string[];
}

export interface Device {
  id: string;
  status: DeviceStatus;
  deviceInfo: DeviceInfo;
  fileName: string;
  sheets: {
    [sheetName: string]: any[];
  };
  metadata: DeviceMetadata;
}

// Sheet names mapping
export const SHEET_NAMES = {
  cau_hinh: 'Cấu hình',
  license: 'License',
  driver: 'Driver',
  o_cung: 'Ổ cứng',
  ram: 'RAM',
  phan_mem: 'Phần mềm',
} as const;

export type SheetNameKey = keyof typeof SHEET_NAMES;
