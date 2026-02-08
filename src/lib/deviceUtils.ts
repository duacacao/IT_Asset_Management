import * as XLSX from 'xlsx';
import { Device, DeviceInfo } from '@/types/device';

/**
 * IMPORTANT: Follow xlsx best practices
 * - Read as array buffer
 * - Handle type safety
 * - Handle multiple sheets
 */

// Scan tên sheet từ file Excel (không parse data) — dùng cho Sheet Selection Dialog
export const scanSheetNames = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', bookSheets: true });
                const normalized = workbook.SheetNames.map((name) =>
                    name.toLowerCase().replace(/\s+/g, '_')
                );
                resolve(normalized);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

export const importExcelDevice = async (
    file: File,
    selectedSheets?: string[]
): Promise<Device> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Parse all sheets
                const sheets: { [key: string]: any[] } = {};
                let totalRows = 0;

                workbook.SheetNames.forEach((sheetName) => {
                    const normalizedName = sheetName.toLowerCase().replace(/\s+/g, '_');

                    // Chỉ parse sheet được chọn (nếu có filter)
                    if (selectedSheets && !selectedSheets.includes(normalizedName)) return;

                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    sheets[normalizedName] = jsonData;
                    totalRows += jsonData.length;
                });

                // Extract device info from first sheet - assuming it's configuration or general info
                // Using loose matching for Vietnamese headers as per common Excel usage
                const configSheet = sheets.cau_hinh || sheets[Object.keys(sheets)[0]];
                const firstRow: any = configSheet[0] || {};

                const device: Device = {
                    id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    deviceInfo: {
                        name: firstRow["Ten may"] || firstRow["Tên máy"] || extractDeviceNameFromFile(file.name),
                        os: firstRow["He dieu hanh"] || firstRow["Hệ điều hành"] || "Unknown OS",
                        cpu: firstRow["CPU"] || "Unknown CPU",
                        ram: firstRow["RAM"] || "Unknown RAM",
                        architecture: firstRow["Kien truc"] || firstRow["Kiến trúc"] || "",
                        ip: firstRow["IP"] || "",
                        mac: firstRow["MAC"] || "",
                        lastUpdate: firstRow["Thoi gian"] || new Date().toLocaleString('vi-VN'),
                    },
                    fileName: file.name,
                    sheets,
                    metadata: {
                        totalSheets: Object.keys(sheets).length,
                        totalRows,
                        fileSize: formatFileSize(file.size),
                        importedAt: new Date().toISOString(),
                        tags: [],
                    },
                };

                resolve(device);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
};

export const exportDeviceToExcel = (device: Device): void => {
    const workbook = XLSX.utils.book_new();

    Object.entries(device.sheets).forEach(([sheetName, sheetData]) => {
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // Auto-size columns logic
        const maxWidth = 50;
        const colWidths = Object.keys(sheetData[0] || {}).map(key => ({
            wch: Math.min(
                maxWidth,
                Math.max(
                    key.length,
                    ...sheetData.map(row => String(row[key] || '').length)
                )
            ),
        }));
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const filename = `${device.deviceInfo.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
};

const extractDeviceNameFromFile = (filename: string): string => {
    const match = filename.match(/^([^_]+)/);
    return match ? match[1] : filename.replace(/\.(xlsx|xls)$/i, '');
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
