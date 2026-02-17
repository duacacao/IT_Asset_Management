'use client'

import { ImportDevice } from '@/components/dashboard/ImportDevice'
import { DeviceList } from '@/components/dashboard/DeviceList'
import { DeviceDetailModal } from '@/components/dashboard/detail/DeviceDetailModal'
import { SheetSelectionDialog } from '@/components/dashboard/SheetSelectionDialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Upload, Plus, Loader2, MoreHorizontal, FileDown } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Device } from '@/types/device'
import { CreateDeviceDialog } from '@/components/dashboard/CreateDeviceDialog'
import { toast } from 'sonner'

// Hooks mới — React Query cho data, UIStore cho UI state
import {
  useDevicesQuery,
  useDeleteDeviceMutation,
  useImportDeviceMutation,
} from '@/hooks/useDevicesQuery'
import { useUIStore } from '@/stores/useUIStore'
import { parseExcelForImport, exportDeviceToExcel } from '@/lib/excel-import'
import { exportDevicesToCSV } from '@/lib/export-utils'

export default function DevicesPage() {
  // Data từ Supabase qua React Query
  const { data: devices = [], isLoading } = useDevicesQuery()

  // Mutations
  const deleteMutation = useDeleteDeviceMutation()
  const importMutation = useImportDeviceMutation()

  // UI state
  const { highlightId, setHighlightId, isImporting, setImporting } = useUIStore()

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([])

  // Files chờ chọn sheet
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSheetSelectOpen, setIsSheetSelectOpen] = useState(false)

  // Import progress state (local cho UI)
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    isImporting: false,
  })

  // Auto-clear highlight sau 3 giây
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setHighlightId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightId, setHighlightId])

  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device)
    setIsDetailOpen(true)
  }

  const handleUpdateDevice = (device: Device) => {
    setSelectedDevice(device)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedDevice(null)
  }

  // Export device — cần resolve sheets từ detail query
  const handleExportDevice = useCallback((device: Device) => {
    if (Object.keys(device.sheets).length > 0) {
      exportDeviceToExcel(device.deviceInfo.name, device.sheets)
    } else {
      toast.info('Mở chi tiết thiết bị trước khi xuất file')
    }
  }, [])

  // Delete device
  const handleDeleteDevice = useCallback(
    (deviceId: string) => {
      deleteMutation.mutate(deviceId)
    },
    [deleteMutation]
  )

  // Khi user drop/chọn files → mở Sheet Selection Dialog
  const handleFilesSelected = useCallback((files: File[]) => {
    setPendingFiles(files)
    setIsImportOpen(false)
    setIsSheetSelectOpen(true)
  }, [])

  // Sau khi chọn sheets → thực hiện import
  const handleSheetConfirm = useCallback(
    async (selectedSheets: string[]) => {
      setIsSheetSelectOpen(false)

      const filesToImport = pendingFiles
      setPendingFiles([])

      // Import progress tracking
      setImportProgress({
        current: 0,
        total: filesToImport.length,
        isImporting: true,
      })
      setImporting(true)

      for (let i = 0; i < filesToImport.length; i++) {
        try {
          // Parse Excel client-side → chuẩn bị data cho Server Action
          const parsed = await parseExcelForImport(filesToImport[i], selectedSheets)
          // Upload lên server qua Server Action
          const result = await importMutation.mutateAsync(parsed)
          // Highlight device mới
          if (result) {
            setHighlightId(result.id)
          }
        } catch (error) {
          toast.error(`Import thất bại: ${filesToImport[i].name}`, {
            description: error instanceof Error ? error.message : 'Lỗi không xác định',
          })
        }
        setImportProgress((prev) => ({
          ...prev,
          current: i + 1,
        }))
      }

      setImportProgress((prev) => ({ ...prev, isImporting: false }))
      setImporting(false)
    },
    [pendingFiles, importMutation, setHighlightId, setImporting]
  )

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý thiết bị</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isImporting}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo mới
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const devicesToExport =
                  selectedDevices.length > 0 ? selectedDevices : devices
                exportDevicesToCSV(devicesToExport)
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export CSV
              {selectedDevices.length > 0 && (
                <span className="text-muted-foreground ml-2 text-xs">
                  ({selectedDevices.length})
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Import progress bar */}
      {importProgress.isImporting && (
        <div className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Đang import… {importProgress.current}/{importProgress.total}
            </span>
          </div>
          <Progress
            value={
              importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0
            }
          />
        </div>
      )}

      {/* Loading state — lần đầu fetch từ server */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="text-muted-foreground mb-4 h-10 w-10 animate-spin" />
          <p className="text-muted-foreground">Đang tải danh sách thiết bị...</p>
        </div>
      ) : devices.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted mb-6 rounded-full p-6">
            <Upload className="text-muted-foreground h-10 w-10" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Chưa có thiết bị nào</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Import file Excel (.xlsx) để bắt đầu quản lý thiết bị. Hỗ trợ import nhiều files cùng
            lúc.
          </p>
          <Button size="lg" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
            Import thiết bị đầu tiên
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col space-y-8">
          <DeviceList
            devices={devices}
            onViewDevice={handleViewDevice}
            onUpdateDevice={handleUpdateDevice}
            onExportDevice={handleExportDevice}
            onDeleteDevice={handleDeleteDevice}
            onSelectionChange={setSelectedDevices}
            highlightId={highlightId}
          />
        </div>
      )}

      {/* Import Dialog — chỉ chọn files */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import thiết bị</DialogTitle>
            <DialogDescription>Kéo thả file Excel vào đây để import thiết bị.</DialogDescription>
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
          setIsSheetSelectOpen(false)
          setPendingFiles([])
        }}
        files={pendingFiles}
        onConfirm={handleSheetConfirm}
      />

      <DeviceDetailModal
        device={selectedDevice}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onExport={handleExportDevice}
        onDelete={handleDeleteDevice}
      />

      {/* Create Device Dialog */}
      <CreateDeviceDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(deviceId) => {
          setHighlightId(deviceId)
        }}
      />
    </div>
  )
}
