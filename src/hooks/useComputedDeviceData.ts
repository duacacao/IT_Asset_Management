import { useMemo } from 'react'
import { Device } from '@/types/device'

export const isInvalidValue = (val: string) => {
    if (!val) return true
    const lower = val.toLowerCase().trim()
    return (
        lower === 'khong co' ||
        lower === 'không có' ||
        lower === 'unknown' ||
        lower === 'n/a' ||
        lower === '-' ||
        lower === '0' ||
        lower === 'none'
    )
}

export function extractGeneric(
    sheets: Record<string, Record<string, unknown>[]>,
    sheetKeys: string[],
    keywords: string[]
): string | null {
    for (const key of sheetKeys) {
        const data = sheets[key]
        if (!Array.isArray(data)) continue
        for (const row of data) {
            for (const [k, v] of Object.entries(row)) {
                const header = k.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
                const val = String(v).trim()
                if (isInvalidValue(val)) continue
                if (keywords.some((kw) => header.includes(kw))) {
                    return val
                }
            }
        }
    }
    return null
}

export interface ComputedDeviceData {
    gpu: string
    storage: string
    activationStatus: 'Actived' | 'Inactived' | 'Unknown'
    biosMode: string | null
    cpu: string | null
    ram: string | null
    os: string | null
    architecture: string | null
    ip: string | null
    mac: string | null
    screenSize: string | null
    resolution: string | null
    connectionType: string | null
}

export function extractGpu(
    sheets: Record<string, Record<string, unknown>[]>,
    sheetKeys: string[],
    normalizeKey: (k: string) => string
): string {
    let gpuRoi: string | null = null
    let gpuTichHop: string | null = null
    let genericGpu: string | null = null

    for (const key of sheetKeys) {
        const data = sheets[key]
        if (!Array.isArray(data)) continue
        for (const row of data) {
            for (const [k, v] of Object.entries(row)) {
                const header = k.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
                const val = String(v).trim()
                if (isInvalidValue(val)) continue
                if (header.includes('gpu roi') || header.includes('card rời') || header.includes('discrete')) gpuRoi = val
                else if (header.includes('gpu tich hop') || header.includes('card onboard') || header.includes('onboard')) gpuTichHop = val
            }
        }
    }

    const gpuSheets = sheetKeys.filter((k) => {
        const normalized = normalizeKey(k)
        return (
            normalized.includes('video') ||
            normalized.includes('display') ||
            normalized.includes('do hoa') ||
            normalized.includes('man hinh') ||
            normalized.includes('gpu') ||
            normalized.includes('vga')
        )
    })

    for (const key of gpuSheets) {
        const data = sheets[key]
        if (!Array.isArray(data)) continue
        for (const row of data) {
            for (const [k, v] of Object.entries(row)) {
                const header = k.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
                const value = String(v).trim()
                if (isInvalidValue(value)) continue

                if (
                    header.includes('name') ||
                    header.includes('caption') ||
                    header.includes('ten') ||
                    header.includes('processor') ||
                    header.includes('gpu') ||
                    header.includes('card')
                ) {
                    const lowerVal = value.toLowerCase()
                    const isDedicated =
                        lowerVal.includes('nvidia') ||
                        lowerVal.includes('amd') ||
                        lowerVal.includes('radeon') ||
                        lowerVal.includes('geforce') ||
                        lowerVal.includes('rtx') ||
                        lowerVal.includes('gtx')
                    if (!genericGpu) {
                        genericGpu = value
                    } else {
                        const currentIsDedicated =
                            genericGpu.toLowerCase().includes('nvidia') ||
                            genericGpu.toLowerCase().includes('amd') ||
                            genericGpu.toLowerCase().includes('radeon')
                        if (!currentIsDedicated && isDedicated) genericGpu = value
                    }
                }
            }
        }
    }

    if (!gpuRoi && !gpuTichHop && !genericGpu) {
        for (const key of sheetKeys) {
            if (gpuSheets.includes(key)) continue
            const data = sheets[key]
            if (!Array.isArray(data)) continue
            for (const row of data) {
                for (const [k, v] of Object.entries(row)) {
                    const header = k.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
                    const value = String(v).trim()
                    if (isInvalidValue(value)) continue
                    if (
                        (header.includes('name') || header.includes('caption') || header.includes('description')) &&
                        (value.toLowerCase().includes('graphics') ||
                            value.toLowerCase().includes('nvidia') ||
                            value.toLowerCase().includes('amd'))
                    ) {
                        genericGpu = value
                    }
                }
            }
        }
    }

    return gpuRoi || gpuTichHop || genericGpu || 'Unknown'
}

export function extractStorage(
    sheets: Record<string, Record<string, unknown>[]>,
    sheetKeys: string[],
    normalizeKey: (k: string) => string
): string {
    let storage: string | null = null

    const storageSheets = sheetKeys.filter((k) => {
        const normalized = normalizeKey(k)
        return (
            normalized.includes('disk') ||
            normalized.includes('drive') ||
            normalized.includes('o cung') ||
            normalized.includes('o dia') ||
            normalized.includes('storage') ||
            normalized.includes('hdd') ||
            normalized.includes('ssd')
        )
    })

    storageSheets.sort((a, b) => {
        const aHas = normalizeKey(a).includes('o cung')
        const bHas = normalizeKey(b).includes('o cung')
        return aHas === bHas ? 0 : aHas ? -1 : 1
    })

    for (const key of storageSheets) {
        if (storage) break
        const data = sheets[key]
        if (!Array.isArray(data)) continue
        for (const row of data) {
            for (const [k, v] of Object.entries(row)) {
                const header = k
                    .toLowerCase()
                    .replace(/[\s_-]+/g, ' ')
                    .trim()
                const value = String(v).trim()

                if (isInvalidValue(value)) continue

                const isDungLuong = header.includes('dung') && header.includes('luong')

                if (isDungLuong || header.includes('capacity') || header.includes('size')) {
                    if (/\d/.test(value)) {
                        storage = value
                        break
                    }
                }
            }
            if (storage) break
        }
    }

    // Fallback: Tìm các dòng có chữ hdd, ssd, storage trên tất cả các sheet
    if (!storage) {
        for (const key of sheetKeys) {
            if (storage) break
            const data = sheets[key]
            if (!Array.isArray(data)) continue
            for (const row of data) {
                for (const [k, v] of Object.entries(row)) {
                    const header = k.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
                    const value = String(v).trim()
                    if (isInvalidValue(value)) continue

                    if (header.includes('storage') || header.includes('o cung') || header.includes('hdd') || header.includes('ssd') || header.includes('disk')) {
                        if (/\d/.test(value)) {
                            storage = value
                            break
                        }
                    }
                }
                if (storage) break
            }
        }
    }

    return storage || 'Unknown'
}

export function extractOsInfo(
    sheets: Record<string, Record<string, unknown>[]>,
    sheetKeys: string[]
): { activationStatus: 'Actived' | 'Inactived' | 'Unknown'; biosMode: string | null } {
    let activationStatus: 'Actived' | 'Inactived' | 'Unknown' = 'Unknown'
    let biosMode: string | null = null

    const targetSheets = sheetKeys.filter(
        (k) =>
            k.toLowerCase().includes('license') ||
            k.toLowerCase().includes('ban quyen') ||
            k.toLowerCase().includes('cau hinh') ||
            k.toLowerCase().includes('config') ||
            k.toLowerCase().includes('bios')
    )

    const searchData = (data: Record<string, unknown>[]) => {
        if (!Array.isArray(data)) return
        for (const row of data) {
            for (const [key, val] of Object.entries(row)) {
                const header = key.toLowerCase()
                const value = String(val).trim()
                if (isInvalidValue(value)) continue

                if (activationStatus === 'Unknown') {
                    if (
                        header.includes('active windows') ||
                        header.includes('trang thai') ||
                        header.includes('status')
                    ) {
                        const lowerVal = value.toLowerCase()
                        if (
                            lowerVal === 'true' ||
                            lowerVal === 'yes' ||
                            lowerVal.includes('active') ||
                            lowerVal.includes('da kich hoat')
                        ) {
                            activationStatus = 'Actived'
                        } else if (
                            lowerVal === 'false' ||
                            lowerVal === 'no' ||
                            lowerVal.includes('inactive') ||
                            lowerVal.includes('chua')
                        ) {
                            activationStatus = 'Inactived'
                        }
                    }
                }

                if (!biosMode && (header.includes('bios mode') || header.includes('che do bios'))) {
                    biosMode = value
                }
            }
        }
    }

    for (const sheetKey of targetSheets) {
        searchData(sheets[sheetKey])
    }

    if (activationStatus === 'Unknown' || !biosMode) {
        for (const key of sheetKeys) {
            if (targetSheets.includes(key)) continue
            searchData(sheets[key])
        }
    }

    return { activationStatus, biosMode }
}

export function useComputedDeviceData(device: Device): ComputedDeviceData {
    return useMemo(() => {
        const result: ComputedDeviceData = {
            gpu: 'Unknown',
            storage: 'Unknown',
            activationStatus: 'Unknown',
            biosMode: null,
            cpu: null,
            ram: null,
            os: null,
            architecture: null,
            ip: null,
            mac: null,
            screenSize: null,
            resolution: null,
            connectionType: null,
        }

        const sheetKeys = Object.keys(device.sheets || {})
        const normalizeKey = (k: string) => k.toLowerCase().replace(/_/g, ' ')
        const sheets = device.sheets as Record<string, Record<string, unknown>[]>

        result.gpu = extractGpu(sheets, sheetKeys, normalizeKey)
        result.storage = extractStorage(sheets, sheetKeys, normalizeKey)
        const osInfo = extractOsInfo(sheets, sheetKeys)
        result.activationStatus = osInfo.activationStatus
        result.biosMode = osInfo.biosMode

        // Tự động rà soát lấy các trường hệ thống tương đương
        result.cpu = extractGeneric(sheets, sheetKeys, ['cpu', 'processor', 'vi xu ly', 'bộ xử lý'])
        result.ram = extractGeneric(sheets, sheetKeys, ['ram', 'bo nho trong', 'memory', 'bộ nhớ trong'])
        result.os = extractGeneric(sheets, sheetKeys, ['tên hệ điều hành', 'os name', 'operating system', 'he dieu hanh', 'hệ điều hành'])
        result.architecture = extractGeneric(sheets, sheetKeys, ['system type', 'architecture', 'kieu he thong', 'loại hệ thống'])
        result.ip = extractGeneric(sheets, sheetKeys, ['ip address', 'dia chi ip', 'địa chỉ ip', 'ipv4'])
        result.mac = extractGeneric(sheets, sheetKeys, ['mac address', 'dia chi mac', 'địa chỉ mac', 'physical address'])
        result.screenSize = extractGeneric(sheets, sheetKeys, ['screen size', 'kich thuoc man hinh', 'kích thước màn hình'])
        result.resolution = extractGeneric(sheets, sheetKeys, ['resolution', 'do phan giai', 'độ phân giải'])
        result.connectionType = extractGeneric(sheets, sheetKeys, ['connection type', 'loai ket noi', 'loại kết nối'])

        return result
    }, [device.sheets])
}
