import { TableCell, TableHead, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useRef, useState, useCallback, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SHEET_TABLE_COLUMNS } from '@/constants/device'
import { SingleRowView } from './SheetTableSingleRow'
import { SheetTableEmptyState } from './SheetTableEmptyState'

interface SheetTableProps {
  data: any[]
  sheetName: string
  deviceId?: string
  readOnly?: boolean
  onCellUpdate?: (rowIndex: number, column: string, value: any) => void
}

// Cell đang được chỉnh sửa
interface EditingCell {
  rowIndex: number
  column: string
}

const { MIN_WIDTH, DEFAULT_WIDTH } = SHEET_TABLE_COLUMNS

export function SheetTable({ data, sheetName, deviceId, readOnly, onCellUpdate }: SheetTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Xử lý trường hợp data rỗng hoặc null
  if (!data || data.length === 0) {
    return <SheetTableEmptyState />
  }

  const headers = Object.keys(data[0])

  // --- CASE 1: Single-row card view (Cấu hình) ---
  // Tối ưu cho mobile: Grid 1 cột trên mobile, 2-3 cột trên tablet/desktop
  if (data.length === 1) {
    return <SingleRowView data={data} headers={headers} />
  }

  // --- CASE 2: Multi-row view ---
  // Responsive Switcher: Desktop -> Table, Mobile -> Card List
  return (
    <div ref={parentRef} className="bg-background relative h-full w-full">
      {/* Desktop View: Virtual Table */}
      <div className="hidden h-full w-full md:block">
        <VirtualTable
          data={data}
          headers={headers}
          parentRef={parentRef}
          readOnly={readOnly}
          onCellUpdate={onCellUpdate}
        />
      </div>

      {/* Mobile View: Vertical Card List */}
      <div className="block h-full w-full md:hidden">
        <MobileCardList
          data={data}
          headers={headers}
          readOnly={readOnly}
          onCellUpdate={onCellUpdate}
        />
      </div>
    </div>
  )
}

// --- Mobile Card Component ---
function MobileCardList({
  data,
  headers,
  readOnly,
  onCellUpdate,
}: {
  data: any[]
  headers: string[]
  readOnly?: boolean
  onCellUpdate?: (rowIndex: number, column: string, value: any) => void
}) {
  // Primary Header là cột đầu tiên (thường là Tên Driver/Phần mềm)
  const primaryHeader = headers[0]
  const secondaryHeaders = headers.slice(1)

  return (
    <div className="scrollbar-none h-full space-y-3 overflow-y-auto p-4 pb-20">
      {data.map((row, rowIndex) => (
        <Card key={rowIndex} className="overflow-hidden border shadow-sm">
          <CardHeader className="bg-muted/30 flex flex-row items-center justify-between border-b px-4 py-3">
            <CardTitle className="text-primary truncate pr-2 text-sm leading-tight font-bold">
              {row[primaryHeader]?.toString() || '(Trống)'}
            </CardTitle>
            <span className="text-muted-foreground bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
              #{rowIndex + 1}
            </span>
          </CardHeader>
          <CardContent className="grid gap-3 p-4">
            {secondaryHeaders.map((header) => (
              <div key={header} className="flex flex-col gap-1">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                  {header}
                </span>
                <div className="text-foreground text-sm break-words">
                  {row[header]?.toString() || '-'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Desktop Components (Virtual Table logic) ---

function EditableCell({
  value,
  rowIndex,
  column,
  isEditing,
  isLastColumn,
  width,
  onStartEdit,
  onSave,
  onCancel,
  onNavigate,
}: {
  value: any
  rowIndex: number
  column: string
  isEditing: boolean
  isLastColumn?: boolean
  width: number
  onStartEdit: (() => void) | null
  onSave: (value: any) => void
  onCancel: () => void
  onNavigate: (direction: 'next' | 'prev') => void
}) {
  const [editValue, setEditValue] = useState(String(value ?? ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setEditValue(String(value ?? ''))
      // Timeout nhỏ để đảm bảo render xong mới focus
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [isEditing, value])

  const borderClass = isLastColumn ? '' : 'border-r border-border/50'
  const displayValue = String(value ?? '')

  if (!isEditing) {
    return (
      <div
        className={`flex h-full flex-shrink-0 items-center px-4 py-2.5 text-sm ${onStartEdit ? 'hover:bg-muted/10 cursor-text' : ''} ${borderClass}`}
        style={{ width, minWidth: width, maxWidth: width }}
        onDoubleClick={onStartEdit || undefined}
        title={displayValue} // Native tooltip for truncated text
      >
        <div className="w-full truncate">{displayValue}</div>
      </div>
    )
  }

  return (
    <div
      className={`flex h-full flex-shrink-0 items-center px-1 py-1 ${borderClass}`}
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="bg-background h-8 w-full text-sm focus-visible:ring-1"
        aria-label="Chỉnh sửa ô"
        onBlur={() => onSave(editValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSave(editValue)
            onNavigate('next')
          } else if (e.key === 'Tab') {
            e.preventDefault()
            onSave(editValue)
            onNavigate(e.shiftKey ? 'prev' : 'next')
          } else if (e.key === 'Escape') {
            onCancel()
          }
        }}
      />
    </div>
  )
}

function VirtualTable({
  data,
  headers,
  parentRef,
  readOnly,
  onCellUpdate,
}: {
  data: any[]
  headers: string[]
  parentRef: React.RefObject<HTMLDivElement | null>
  readOnly?: boolean
  onCellUpdate?: (rowIndex: number, column: string, value: any) => void
}) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Logic Resize cột
  // ----------------
  // Khởi tạo width mặc định cho mỗi cột
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    headers.forEach((h) => {
      widths[h] = DEFAULT_WIDTH
    })
    return widths
  })

  // Cập nhật khi headers thay đổi
  useEffect(() => {
    setColWidths((prev) => {
      const next = { ...prev }
      headers.forEach((h) => {
        if (!(h in next)) next[h] = DEFAULT_WIDTH
      })
      return next
    })
  }, [headers])

  // State khi đang drag resize
  const [resizing, setResizing] = useState<{
    column: string
    startX: number
    startWidth: number
  } | null>(null)

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return
      const delta = e.clientX - resizing.startX
      const newWidth = Math.max(MIN_WIDTH, resizing.startWidth + delta)
      setColWidths((prev) => ({ ...prev, [resizing.column]: newWidth }))
    },
    [resizing]
  )

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setResizing(null)
  }, [])

  // Attach/detach listeners
  useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [resizing, handleMouseMove, handleMouseUp])

  const startResize = useCallback(
    (column: string, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setResizing({
        column,
        startX: e.clientX,
        startWidth: colWidths[column] || DEFAULT_WIDTH,
      })
    },
    [colWidths]
  )
  // ----------------

  const totalWidth = headers.reduce((sum, h) => sum + (colWidths[h] || DEFAULT_WIDTH), 0)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef.current, // Use local ref for scrolling
    estimateSize: () => 45, // Row height estimate
    overscan: 10,
  })

  const handleSave = useCallback(
    (rowIndex: number, column: string, value: any) => {
      if (onCellUpdate && data[rowIndex][column] !== value) {
        onCellUpdate(rowIndex, column, value)
      }
      setEditingCell(null)
    },
    [onCellUpdate, data]
  )

  const handleNavigate = useCallback(
    (rowIndex: number, column: string, direction: 'next' | 'prev') => {
      const colIdx = headers.indexOf(column)
      if (direction === 'next') {
        if (colIdx < headers.length - 1) {
          setEditingCell({ rowIndex, column: headers[colIdx + 1] })
        } else if (rowIndex < data.length - 1) {
          setEditingCell({ rowIndex: rowIndex + 1, column: headers[0] })
        } else {
          setEditingCell(null)
        }
      } else {
        if (colIdx > 0) {
          setEditingCell({ rowIndex, column: headers[colIdx - 1] })
        } else if (rowIndex > 0) {
          setEditingCell({ rowIndex: rowIndex - 1, column: headers[headers.length - 1] })
        } else {
          setEditingCell(null)
        }
      }
    },
    [headers, data.length]
  )

  return (
    <div
      ref={containerRef}
      className="bg-background scrollbar-thin scrollbar-thumb-muted-foreground/20 h-full w-full overflow-auto rounded-md border text-sm"
    >
      <div className="relative min-w-full" style={{ width: totalWidth }}>
        {/* Header Row */}
        <div className="bg-muted/90 sticky top-0 z-10 flex border-b shadow-sm backdrop-blur-sm">
          {headers.map((header, idx) => {
            const w = colWidths[header] || DEFAULT_WIDTH
            const isLast = idx === headers.length - 1
            return (
              <div
                key={header}
                className={`text-foreground relative truncate px-4 py-3 font-semibold select-none ${!isLast ? 'border-border/50 border-r' : ''}`}
                style={{ width: w, minWidth: w, maxWidth: w }}
              >
                {header}
                {!isLast && (
                  <div
                    className="hover:bg-primary/50 group absolute top-0 right-0 bottom-0 z-20 w-1 cursor-col-resize transition-all hover:w-1.5"
                    onMouseDown={(e) => startResize(header, e)}
                  >
                    <div className="bg-border group-hover:bg-primary absolute inset-y-1 right-0 w-[1px]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Body Rows */}
        <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                className="hover:bg-muted/5 absolute top-0 left-0 flex w-full items-center border-b transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {headers.map((header, idx) => (
                  <EditableCell
                    key={`${virtualRow.index}-${header}`}
                    value={row[header]}
                    rowIndex={virtualRow.index}
                    column={header}
                    isEditing={
                      editingCell?.rowIndex === virtualRow.index && editingCell?.column === header
                    }
                    isLastColumn={idx === headers.length - 1}
                    width={colWidths[header] || DEFAULT_WIDTH}
                    onStartEdit={
                      !readOnly && onCellUpdate
                        ? () => setEditingCell({ rowIndex: virtualRow.index, column: header })
                        : null
                    }
                    onSave={(value) => handleSave(virtualRow.index, header, value)}
                    onCancel={() => setEditingCell(null)}
                    onNavigate={(dir) => handleNavigate(virtualRow.index, header, dir)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
