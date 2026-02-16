import { Device } from '@/types/device'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { SheetTable } from '../SheetTable'
import { SheetTabsCarousel } from '@/components/carousel/SheetTabsCarousel'
import { useState } from 'react'
import {
  useCreateSheetMutation,
  useUpdateCellMutation,
  useAddRowMutation,
  useAddColumnMutation,
} from '@/hooks/useDevicesQuery'
import { TabsContent } from '@/components/ui/tabs'

interface DeviceSheetsTabProps {
  device: Device
}

// Ten hien thi cho sheet
const getDisplayName = (sheetKey: string): string => {
  // Fallback logic
  const withSpaces = sheetKey.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

export function DeviceSheetsTab({ device }: DeviceSheetsTabProps) {
  const allSheetKeys = Object.keys(device.sheets)
  const [activeSheet, setActiveSheet] = useState<string>(allSheetKeys[0] || '')
  const [isAddingSheet, setIsAddingSheet] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [newColumnNames, setNewColumnNames] = useState<Record<string, string>>({})

  const createSheetMutation = useCreateSheetMutation()
  const updateCellMutation = useUpdateCellMutation()
  const addRowMutation = useAddRowMutation()
  const addColumnMutation = useAddColumnMutation()

  const sheetIdMap = (device as any).sheetIdMap || {} // Fallback if type missing

  return (
    <div className="flex h-full flex-col">
      {/* Sheet Tabs Bar */}
      <div className="bg-background flex items-center gap-2 border-b px-4 py-2">
        <div className="min-w-0 flex-1">
          <SheetTabsCarousel
            sheets={allSheetKeys}
            activeSheet={activeSheet}
            onSelectSheet={setActiveSheet}
            getDisplayName={getDisplayName}
            getCount={(sheet) => device.sheets[sheet]?.length ?? 0}
            slidesToShow={6}
          />
        </div>
        {/* Quick Add Sheet */}
        <div className="ml-2 border-l pl-2">
          {isAddingSheet ? (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault()
                if (newSheetName.trim()) {
                  createSheetMutation.mutate({
                    deviceId: device.id,
                    sheetName: newSheetName,
                  })
                  setNewSheetName('')
                }
                setIsAddingSheet(false)
              }}
            >
              <Input
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                placeholder="Tên sheet..."
                className="h-8 w-32"
                autoFocus
                onBlur={() => setIsAddingSheet(false)}
              />
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsAddingSheet(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sheet Content */}
      <div className="bg-background relative flex-1 overflow-hidden">
        {allSheetKeys.length === 0 ? (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center">
            <p>Chưa có sheet dữ liệu nào.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingSheet(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm sheet mới
            </Button>
          </div>
        ) : (
          activeSheet && (
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1 overflow-auto p-4">
                {device.sheets[activeSheet]?.length > 0 ? (
                  <SheetTable
                    data={device.sheets[activeSheet]}
                    sheetName={activeSheet}
                    deviceId={device.id}
                    readOnly={false} // Always editable in this view
                    onCellUpdate={(rowIndex, column, value) => {
                      const sheetId = sheetIdMap[activeSheet]
                      if (sheetId) {
                        updateCellMutation.mutate({
                          deviceId: device.id,
                          sheetId,
                          sheetName: activeSheet,
                          rowIndex,
                          columnKey: column,
                          value,
                        })
                      }
                    }}
                  />
                ) : (
                  <div className="bg-muted/5 m-4 flex h-full flex-col items-center justify-center rounded-md border border-dashed p-8">
                    <p className="text-muted-foreground mb-4 text-sm">Sheet trống</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const sheetId = sheetIdMap[activeSheet]
                          if (sheetId) addRowMutation.mutate({ deviceId: device.id, sheetId })
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm dòng
                      </Button>
                      {/* Simple Add Column for now */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
