'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileSpreadsheet, CheckSquare, Square } from 'lucide-react'
import { AppLoader } from '@/components/ui/app-loader'
import { scanSheetNames } from '@/lib/deviceUtils'
import { SHEET_NAMES } from '@/types/device'

interface SheetSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
  onConfirm: (selectedSheets: string[]) => void
}

// Map ten sheet normalized → ten hien thi (nhat quan voi Python output)
const getDisplayName = (sheetKey: string): string => {
  const mapped = SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES]
  if (mapped) return mapped
  // Fallback: thay _ bang space, chi capitalize chu dau tien
  const withSpaces = sheetKey.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

export function SheetSelectionDialog({
  isOpen,
  onClose,
  files,
  onConfirm,
}: SheetSelectionDialogProps) {
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheets, setSelectedSheets] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // Scan sheet names từ file đầu tiên khi dialog mở — luôn check ALL
  useEffect(() => {
    if (!isOpen || files.length === 0) return

    const scan = async () => {
      setIsScanning(true)
      try {
        const sheetNames = await scanSheetNames(files[0])
        setAvailableSheets(sheetNames)
        // Luôn chọn tất cả sheets — user tự deselect nếu cần
        setSelectedSheets(sheetNames)
      } catch {
        setAvailableSheets([])
        setSelectedSheets([])
      } finally {
        setIsScanning(false)
      }
    }

    scan()
  }, [isOpen, files])

  const toggleSheet = (sheet: string) => {
    setSelectedSheets((prev) =>
      prev.includes(sheet) ? prev.filter((s) => s !== sheet) : [...prev, sheet]
    )
  }

  const selectAll = () => setSelectedSheets([...availableSheets])
  const deselectAll = () => setSelectedSheets([])

  const handleConfirm = () => {
    if (selectedSheets.length === 0) return
    onConfirm(selectedSheets)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="text-primary h-5 w-5" />
            Chọn Sheet để Import
          </DialogTitle>
          <DialogDescription>
            {files.length === 1
              ? `File: ${files[0].name}`
              : `${files.length} files — áp dụng chung cho tất cả`}
          </DialogDescription>
        </DialogHeader>

        {isScanning ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <AppLoader layout="vertical" text="Đang quét sheet names…" />
          </div>
        ) : availableSheets.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p>Không tìm thấy sheet nào trong file.</p>
          </div>
        ) : (
          <>
            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between px-1">
              <span className="text-muted-foreground text-sm">
                {selectedSheets.length}/{availableSheets.length} sheets đã chọn
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Chọn tất cả
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll} className="h-7 text-xs">
                  <Square className="mr-1 h-3 w-3" />
                  Bỏ chọn
                </Button>
              </div>
            </div>

            {/* Sheet checkbox list */}
            <ScrollArea className="max-h-[300px] pr-3">
              <div className="space-y-1">
                {availableSheets.map((sheet) => (
                  <label
                    key={sheet}
                    className="hover:bg-muted/50 has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary/30 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <Checkbox
                      checked={selectedSheets.includes(sheet)}
                      onCheckedChange={() => toggleSheet(sheet)}
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium">{getDisplayName(sheet)}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {sheet}
                      </Badge>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isScanning || selectedSheets.length === 0}>
            Import {selectedSheets.length > 0 ? `(${selectedSheets.length} sheets)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
