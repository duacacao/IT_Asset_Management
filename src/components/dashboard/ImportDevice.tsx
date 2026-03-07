import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { AppLoader } from '@/components/ui/app-loader'
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
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-white transition-all dark:bg-card',
        isDragActive
          ? 'border-primary/50 bg-primary/5 shadow-md dark:bg-primary/5'
          : 'hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm',
        isLoading && 'pointer-events-none opacity-70'
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 h-0.5 w-full bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        {...getRootProps()}
        className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-10 text-center"
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <AppLoader layout="vertical" text="Đang xử lý file…" />
        ) : (
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-colors duration-300',
              isDragActive
                ? 'bg-primary'
                : 'bg-blue-50 group-hover:bg-primary dark:bg-blue-950/50'
            )}
          >
            <Upload
              className={cn(
                'h-7 w-7 transition-colors duration-300',
                isDragActive ? 'text-primary-foreground' : 'text-primary group-hover:text-primary-foreground'
              )}
              aria-hidden="true"
            />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {isLoading ? 'Đang import…' : isDragActive ? 'Thả file vào đây' : 'Import file Excel'}
          </h3>
          <p className="text-muted-foreground text-sm">
            Kéo thả hoặc bấm để tải lên (hỗ trợ nhiều file)
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-3 w-3" />
          <span>Hỗ trợ .xlsx, .xls • Nhiều file</span>
        </div>
      </div>
    </div>
  )
}
