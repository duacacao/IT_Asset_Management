

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
}

export interface Device {
  id: string;
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
