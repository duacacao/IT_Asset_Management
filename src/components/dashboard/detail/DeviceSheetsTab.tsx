import { Device } from '@/types/device';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { SheetTable } from '../SheetTable';
import { SheetTabsCarousel } from '@/components/carousel/SheetTabsCarousel';
import { useState } from 'react';
import { useCreateSheetMutation, useUpdateCellMutation, useAddRowMutation, useAddColumnMutation } from '@/hooks/useDevicesQuery';
import { TabsContent } from '@/components/ui/tabs';

interface DeviceSheetsTabProps {
    device: Device;
}

// Ten hien thi cho sheet
const getDisplayName = (sheetKey: string): string => {
    // Fallback logic
    const withSpaces = sheetKey.replace(/_/g, ' ');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export function DeviceSheetsTab({ device }: DeviceSheetsTabProps) {
    const allSheetKeys = Object.keys(device.sheets);
    const [activeSheet, setActiveSheet] = useState<string>(allSheetKeys[0] || '');
    const [isAddingSheet, setIsAddingSheet] = useState(false);
    const [newSheetName, setNewSheetName] = useState('');
    const [newColumnNames, setNewColumnNames] = useState<Record<string, string>>({});

    const createSheetMutation = useCreateSheetMutation();
    const updateCellMutation = useUpdateCellMutation();
    const addRowMutation = useAddRowMutation();
    const addColumnMutation = useAddColumnMutation();

    const sheetIdMap = (device as any).sheetIdMap || {}; // Fallback if type missing

    return (
        <div className="flex flex-col h-full">
            {/* Sheet Tabs Bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
                <div className="flex-1 min-w-0">
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
                <div className="border-l pl-2 ml-2">
                    {isAddingSheet ? (
                        <form
                            className="flex items-center gap-1"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newSheetName.trim()) {
                                    createSheetMutation.mutate({
                                        deviceId: device.id,
                                        sheetName: newSheetName,
                                    });
                                    setNewSheetName('');
                                }
                                setIsAddingSheet(false);
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsAddingSheet(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Sheet Content */}
            <div className="flex-1 bg-background relative overflow-hidden">
                {allSheetKeys.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
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
                                            const sheetId = sheetIdMap[activeSheet];
                                            if (sheetId) {
                                                updateCellMutation.mutate({
                                                    deviceId: device.id,
                                                    sheetId,
                                                    sheetName: activeSheet,
                                                    rowIndex,
                                                    columnKey: column,
                                                    value
                                                });
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center border rounded-md border-dashed m-4 bg-muted/5 p-8">
                                        <p className="text-sm text-muted-foreground mb-4">Sheet trống</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                const sheetId = sheetIdMap[activeSheet];
                                                if (sheetId) addRowMutation.mutate({ deviceId: device.id, sheetId });
                                            }}>
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
    );
}
