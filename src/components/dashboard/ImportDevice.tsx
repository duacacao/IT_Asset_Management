import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportDeviceProps {
  onImport: (file: File) => Promise<any>
  onImportMultiple?: (files: File[]) => Promise<void>
  isLoading?: boolean
}

export function ImportDevice({ onImport, onImportMultiple, isLoading }: ImportDeviceProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Nhiều file → dùng bulk import
      if (acceptedFiles.length > 1 && onImportMultiple) {
        onImportMultiple(acceptedFiles)
      } else {
        onImport(acceptedFiles[0])
      }
    },
    [onImport, onImportMultiple]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    disabled: isLoading,
    // Cho phép chọn nhiều file
    multiple: true,
  })

  return (
    <Card
      className={cn(
        'hover:bg-muted/50 cursor-pointer border-2 border-dashed transition-colors',
        isDragActive && 'bg-muted'
      )}
    >
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-10 text-center"
        >
          <input {...getInputProps()} />

          {isLoading ? (
            <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" aria-hidden="true" />
          ) : (
            <div className="bg-primary/10 rounded-full p-4">
              <Upload className="text-primary h-8 w-8" aria-hidden="true" />
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {isLoading ? 'Đang import…' : isDragActive ? 'Thả file vào đây' : 'Import file Excel'}
            </h3>
            <p className="text-muted-foreground text-sm">
              Kéo thả hoặc bấm để tải lên (hỗ trợ nhiều file)
            </p>
          </div>

          <div className="text-muted-foreground bg-muted flex items-center gap-2 rounded-full px-3 py-1 text-xs">
            <FileSpreadsheet className="h-3 w-3" />
            <span>Hỗ trợ .xlsx, .xls • Nhiều file</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
