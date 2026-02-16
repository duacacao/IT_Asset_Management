

// Trạng thái thiết bị
export type DeviceStatus = 'active' | 'broken' | 'inactive';

// Loại thiết bị
export type DeviceType = 'PC' | 'Laptop' | 'Monitor' | 'Printer' | 'Phone' | 'Tablet' | 'Network' | 'Other';

// Status config moved to @/constants/device

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
  type?: DeviceType;
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
  name: string; // Adding name to top level if convenient, but refering to schema it is in deviceInfo? Wait.
  // In Schema: id, name, status, type, ...
  // In Interface Device: id, status, deviceInfo... 
  // The 'name' is in deviceInfo currently in the frontend type. 
  // But in DB it is a column 'name'.
  // I should check if I should add 'type' to Device interface.
  type: DeviceType;
  status: DeviceStatus;
  deviceInfo: DeviceInfo;
  fileName: string;
  sheets: {
    [sheetName: string]: any[];
  };
  metadata: DeviceMetadata;
  assignment?: {
    id: string;
    end_user_id: string;
    assignee_name?: string;
    assignee_email?: string;
    assigned_at: string;
  };
}

// Sheet names mapping - Tieng Viet khong dau de nhat quan voi Python output
export const SHEET_NAMES = {
  cau_hinh: 'Cau hinh',
  license: 'License',
  driver: 'Driver',
  o_cung: 'O cung',
  ram: 'RAM',
  phan_mem: 'Phan mem',
  bios_info: 'BIOS Info',
  lan: 'LAN',
} as const;

export type SheetNameKey = keyof typeof SHEET_NAMES;
