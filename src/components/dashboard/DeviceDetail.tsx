import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Trash2, Calendar, HardDrive, Cpu, Network, Laptop, SlidersHorizontal, Monitor, Pencil, Check, X, Plus, Copy, Eye, CheckCircle2 } from 'lucide-react';
import { Device, DeviceInfo, DeviceStatus, DEVICE_STATUS_CONFIG, SHEET_NAMES } from '@/types/device';
import { STATUS_DOT_COLORS } from '@/constants/device';
import { SheetTable } from './SheetTable';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect } from 'react';
import {
    useDeviceDetailQuery,
    useUpdateDeviceMutation,
    useUpdateStatusMutation,
    useUpdateCellMutation,
    useCreateSheetMutation,
    useRenameSheetMutation,
    useDeleteSheetMutation,
    useReorderSheetsMutation,
    useAddRowMutation,
    useDeleteRowMutation,
    useAddColumnMutation,
    useUpdateDeviceVisibleSheetsMutation,
} from '@/hooks/useDevicesQuery';
import { SheetTabsCarousel } from '@/components/carousel/SheetTabsCarousel';
import { InfoRow, EditField, SortableTab, DatabaseIcon } from './DeviceDetailHelpers';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
    DndContext, closestCenter,
    PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DeviceDetailProps {
    device: Device | null;
    isOpen: boolean;
    mode?: 'view' | 'edit';
    onClose: () => void;
    onExport: (device: Device) => void;
    onDelete: (deviceId: string) => void;
}

// Ten hien thi cho sheet - nhat quan voi Python output (khong dau)
const getDisplayName = (sheetKey: string): string => {
    const mapped = SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES];
    if (mapped) return mapped;
    // Fallback: thay _ bang space, chi capitalize chu dau tien
    const withSpaces = sheetKey.replace(/_/g, ' ');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export function DeviceDetail({
    device,
    isOpen,
    mode: initialMode = 'view',
    onClose,
    onExport,
    onDelete,
}: DeviceDetailProps) {
    const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(initialMode);
    const isEditMode = currentMode === 'edit';

    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<DeviceInfo>>({});
    const [newSheetName, setNewSheetName] = useState('');
    const [isAddingSheet, setIsAddingSheet] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [addingColumnSheet, setAddingColumnSheet] = useState<string | null>(null);

    // Fetch full data with sheets if we have an ID
    const { data: detailData, isLoading: isDetailLoading } = useDeviceDetailQuery(device?.id ?? null);

    // Use full device data if available, otherwise fallback to prop (incomplete)
    const fullDevice = detailData?.device ?? device;
    const sheetIdMap = detailData?.sheetIdMap ?? {};

    // React Query mutations — thay thế useDeviceStore
    const updateDeviceMutation = useUpdateDeviceMutation();
    const updateStatusMutation = useUpdateStatusMutation();
    const updateCellMutation = useUpdateCellMutation();
    const createSheetMutation = useCreateSheetMutation();
    const renameSheetMutation = useRenameSheetMutation();
    const deleteSheetMutation = useDeleteSheetMutation();
    const reorderSheetsMutation = useReorderSheetsMutation();
    const addRowMutation = useAddRowMutation();
    const deleteRowMutation = useDeleteRowMutation();
    const addColumnMutation = useAddColumnMutation();
    const updateVisibleSheetsMutation = useUpdateDeviceVisibleSheetsMutation();

    // Đồng bộ mode khi mở modal hoặc đổi initialMode
    useEffect(() => {
        setCurrentMode(initialMode);
        setIsEditing(false);
        setEditForm({});
        setActiveSheet(null); // Reset sheet khi đổi device
    }, [initialMode, isOpen]);

    // Tự động populate form khi vào Edit mode — không cần click pencil nữa
    useEffect(() => {
        if (isEditMode && fullDevice) {
            setEditForm({ ...fullDevice.deviceInfo });
            setIsEditing(true);
        }
    }, [isEditMode, fullDevice]);

    // Cảnh báo khi đóng tab/trình duyệt trong edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isEditMode]);

    // DnD sensors — chỉ bắt đầu drag sau 5px di chuyển
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    // Edit mode handlers
    const startEditing = useCallback(() => {
        if (!fullDevice) return;
        setEditForm({ ...fullDevice.deviceInfo });
        setIsEditing(true);
    }, [fullDevice]);

    const saveEditing = useCallback(() => {
        if (!fullDevice) return;
        // Gọi Server Action cập nhật thông tin thiết bị
        updateDeviceMutation.mutate({
            deviceId: fullDevice.id,
            updates: editForm,
        });
        setIsEditing(false);
    }, [fullDevice, editForm, updateDeviceMutation]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setEditForm({});
    }, []);

    // Kéo thả sắp xếp tabs
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!fullDevice) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const keys = Object.keys(fullDevice.sheets);
        const oldIndex = keys.indexOf(active.id as string);
        const newIndex = keys.indexOf(over.id as string);

        if (oldIndex === -1 || newIndex === -1) return;

        // Convert ordered names to IDs
        const newOrderNames = arrayMove(keys, oldIndex, newIndex);
        const newOrderIds = newOrderNames.map(name => sheetIdMap[name]).filter(Boolean); // Filter undefined

        if (newOrderIds.length !== newOrderNames.length) {
            console.error("Missing sheet IDs during reorder");
            return;
        }

        reorderSheetsMutation.mutate({
            deviceId: fullDevice.id,
            sheetIds: newOrderIds,
        });
    }, [fullDevice, sheetIdMap, reorderSheetsMutation]);

    if (!fullDevice) return null;

    const allSheetKeys = Object.keys(fullDevice.sheets);
    const visibleSheets = fullDevice.metadata.visibleSheets ?? allSheetKeys;
    const displayedSheets = allSheetKeys.filter((s) => visibleSheets.includes(s));

    // TODO: Implement UI for toggling sheet visibility
    /*
    const toggleSheetVisibility = (sheet: string) => {
        const current = fullDevice.metadata.visibleSheets ?? allSheetKeys;
        const updated = current.includes(sheet)
            ? current.filter((s) => s !== sheet)
            : [...current, sheet];
        if (updated.length === 0) return;
        if (updated.length === 0) return;

        updateVisibleSheetsMutation.mutate({
            deviceId: fullDevice.id,
            visibleSheets: updated,
        });
    };
    */

    const status = fullDevice.status ?? 'active';
    const statusConfig = DEVICE_STATUS_CONFIG[status];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] w-full h-[90vh] flex flex-row p-0 gap-0 overflow-hidden overscroll-contain">
                {/* Accessible title — ẩn cho screen reader */}
                <VisuallyHidden.Root>
                    <DialogTitle>{fullDevice.deviceInfo.name}</DialogTitle>
                </VisuallyHidden.Root>

                {/* Toggle View ↔ Edit — góc trên trái */}
                {!isEditMode && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 z-20 h-8 w-8"
                        onClick={() => setCurrentMode('edit')}
                        title="Chuyển sang chỉnh sửa"
                        aria-label="Chuyển sang chỉnh sửa"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}

                {/* Edit mode — Save + Cancel bar ở góc trên trái (điểm save DUY NHẤT) */}
                {isEditMode && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                        <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                                saveEditing();
                                onClose();
                            }}
                        >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Lưu
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                                cancelEditing();
                                setCurrentMode('view');
                            }}
                        >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Hủy
                        </Button>
                    </div>
                )}

                {/* ===== SIDEBAR ===== */}
                <div className="w-[300px] flex-shrink-0 border-r flex flex-col bg-muted/5 overflow-y-auto pt-10">
                    <div className="p-5 space-y-5">
                        {/* Device name + status */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                                    <Monitor className="h-5 w-5 text-primary" />
                                </div>
                                {isEditing ? (
                                    <Input
                                        name="deviceName"
                                        type="text"
                                        value={editForm.name ?? ''}
                                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                        className="text-base font-bold h-8"
                                        autoComplete="off"
                                    />
                                ) : (
                                    <h2 className="text-base font-bold leading-snug break-words">
                                        {fullDevice.deviceInfo.name}
                                    </h2>
                                )}
                            </div>
                            {/* Status — selector khi Edit, label khi View */}
                            {isEditMode ? (
                                <Select
                                    value={status}
                                    onValueChange={(val) => updateStatusMutation.mutate({ deviceId: fullDevice.id, status: val as DeviceStatus })}
                                >
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue>
                                            <span className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                                {statusConfig.label}
                                            </span>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>
                                                <span className={`mr-1.5 h-2 w-2 rounded-full ${STATUS_DOT_COLORS[key as DeviceStatus]} inline-block`} />
                                                {config.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2 px-1">
                                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                    <span className="text-xs font-medium">{statusConfig.label}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Thông tin thiết bị — tự động editable khi ở Edit mode */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin</p>
                            {isEditMode ? (
                                <div className="space-y-2.5">
                                    <EditField icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={editForm.os ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, os: v }))} />
                                    <EditField icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={editForm.cpu ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, cpu: v }))} />
                                    <EditField icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={editForm.ram ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, ram: v }))} />
                                    <EditField icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={editForm.architecture ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, architecture: v }))} />
                                    <EditField icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={editForm.mac ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, mac: v }))} />
                                </div>
                            ) : (
                                <>

                                    <InfoRow icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={fullDevice.deviceInfo.os} />
                                    <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={fullDevice.deviceInfo.cpu} />
                                    <InfoRow icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={fullDevice.deviceInfo.ram} />
                                    <InfoRow icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={fullDevice.deviceInfo.architecture} />
                                    <InfoRow icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={fullDevice.deviceInfo.mac || 'Không có'} />
                                </>
                            )}
                        </div>

                        <Separator />

                        {/* Metadata */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chi tiết</p>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-xs">{fullDevice.deviceInfo.lastUpdate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DatabaseIcon className="h-3.5 w-3.5" />
                                    <span className="text-xs">{fullDevice.metadata.fileSize}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span className="text-xs">{fullDevice.metadata.totalSheets} sheet • {fullDevice.metadata.totalRows} dòng</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions — Export, Duplicate, Delete */}
                        <div className="space-y-2">
                            <div className={`grid gap-2 ${isEditMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => onExport(fullDevice)}>
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    Xuất file
                                </Button>
                                {/* Duplicate tạm ẩn — cần Server Action riêng */}
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Xóa
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Thiết bị sẽ bị xóa vĩnh viễn. Bạn có thể dùng Undo (Ctrl+Z) để khôi phục.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={() => {
                                                onDelete(fullDevice.id);
                                                onClose();
                                            }}
                                        >
                                            Xóa
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background py-10">
                    <Tabs value={activeSheet || displayedSheets[0] || '_empty'} onValueChange={setActiveSheet} className="flex-1 flex flex-col">
                        {/* Tab bar + controls */}
                        <div className="flex items-center gap-3 px-5 py-2.5 border-b pr-14">
                            {/* Tabs — View: click bình thường, Edit: sortable + context menu */}
                            <div className="relative min-w-0 flex-shrink">
                                {isEditMode ? (
                                    /* Edit mode — drag & drop, context menu */
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={displayedSheets} strategy={horizontalListSortingStrategy}>
                                            <TabsList className="h-auto bg-transparent p-0 gap-1.5 overflow-x-auto scrollbar-none flex">
                                                {displayedSheets.map((sheetName) => (
                                                    <SortableTab
                                                        key={sheetName}
                                                        id={sheetName}
                                                        label={getDisplayName(sheetName)}
                                                        count={fullDevice.sheets[sheetName]?.length ?? 0}
                                                        isActive={(activeSheet || displayedSheets[0]) === sheetName}
                                                        onRename={() => {
                                                            const newName = prompt('Đổi tên sheet:', sheetName);
                                                            if (newName) {
                                                                const sheetId = sheetIdMap[sheetName];
                                                                if (sheetId) {
                                                                    renameSheetMutation.mutate({
                                                                        deviceId: fullDevice.id,
                                                                        sheetId: sheetId,
                                                                        newName,
                                                                    });
                                                                    if (activeSheet === sheetName) setActiveSheet(newName);
                                                                } else {
                                                                    console.error("Missing sheetId for rename");
                                                                }
                                                            }
                                                        }}
                                                        onDelete={allSheetKeys.length > 1 ? () => {
                                                            if (confirm(`Xóa sheet "${getDisplayName(sheetName)}"?`)) {
                                                                const sheetId = sheetIdMap[sheetName];
                                                                if (sheetId) {
                                                                    deleteSheetMutation.mutate({
                                                                        deviceId: fullDevice.id,
                                                                        sheetId: sheetId,
                                                                    });
                                                                    if (activeSheet === sheetName) setActiveSheet(null);
                                                                } else {
                                                                    console.error("Missing sheetId for delete");
                                                                }
                                                            }
                                                        } : undefined}
                                                    />
                                                ))}
                                                {/* Nút thêm sheet mới */}
                                                {isAddingSheet ? (
                                                    <form
                                                        className="flex items-center gap-1"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            if (newSheetName.trim()) {
                                                                createSheetMutation.mutate({
                                                                    deviceId: fullDevice.id,
                                                                    sheetName: newSheetName,
                                                                });
                                                                setNewSheetName('');
                                                            }
                                                            setIsAddingSheet(false);
                                                        }}
                                                    >
                                                        <Input
                                                            name="newSheetName"
                                                            type="text"
                                                            value={newSheetName}
                                                            onChange={(e) => setNewSheetName(e.target.value)}
                                                            placeholder="Tên sheet…"
                                                            className="h-7 w-28 text-xs"
                                                            autoComplete="off"
                                                            autoFocus={typeof window !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                                                            onBlur={() => setIsAddingSheet(false)}
                                                        />
                                                    </form>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full flex-shrink-0"
                                                        onClick={() => setIsAddingSheet(true)}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </TabsList>
                                        </SortableContext>
                                    </DndContext>
                                ) : (
                                    /* View mode — Carousel với parallax effect, giới hạn 5 tabs */
                                    <SheetTabsCarousel
                                        sheets={displayedSheets}
                                        activeSheet={activeSheet || displayedSheets[0] || ''}
                                        onSelectSheet={setActiveSheet}
                                        getDisplayName={getDisplayName}
                                        getCount={(sheet) => fullDevice.sheets[sheet]?.length ?? 0}
                                        slidesToShow={5}
                                    />
                                )}
                            </div>

                            {/* Spacer */}
                            <div className="flex-1" />


                        </div>

                        {/* Sheet content — hoặc empty state */}
                        {displayedSheets.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">Chưa có sheet nào</p>
                                <p className="text-xs text-muted-foreground mb-3">
                                    {isEditMode ? 'Thêm sheet đầu tiên để bắt đầu nhập dữ liệu' : 'Thiết bị chưa có dữ liệu sheet'}
                                </p>
                                {isEditMode && (
                                    <Button size="sm" onClick={() => setIsAddingSheet(true)}>
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Thêm sheet
                                    </Button>
                                )}
                            </div>
                        ) : (
                            displayedSheets.map((sheetName) => (
                                <TabsContent key={sheetName} value={sheetName} className="flex-1 p-0 m-0 min-h-0 data-[state=active]:flex flex-col relative">
                                    <div className="absolute inset-0 p-4 flex flex-col">
                                        <div className="flex-1 rounded-md border bg-card shadow-sm overflow-hidden">
                                            {fullDevice.sheets[sheetName]?.length > 0 ? (
                                                <SheetTable
                                                    data={fullDevice.sheets[sheetName]}
                                                    sheetName={sheetName}
                                                    deviceId={fullDevice.id}
                                                    readOnly={!isEditMode}
                                                    onCellUpdate={(rowIndex, column, value) => {
                                                        const sheetId = sheetIdMap[sheetName];
                                                        if (!sheetId) {
                                                            console.error("Missing sheetId for update cell");
                                                            return;
                                                        }
                                                        updateCellMutation.mutate({
                                                            deviceId: fullDevice.id,
                                                            sheetId: sheetId,
                                                            sheetName,
                                                            rowIndex,
                                                            columnKey: column,
                                                            value,
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {isEditMode ? 'Sheet trống — thêm columns trước' : 'Sheet trống'}
                                                    </p>
                                                    {isEditMode && (
                                                        addingColumnSheet === sheetName ? (
                                                            <form
                                                                className="flex items-center gap-2"
                                                                onSubmit={(e) => {
                                                                    e.preventDefault();
                                                                    if (newColumnName.trim()) {
                                                                        const sheetId = sheetIdMap[sheetName];
                                                                        if (!sheetId) {
                                                                            console.error("Missing sheetId for add column");
                                                                            return;
                                                                        }
                                                                        addColumnMutation.mutate({
                                                                            deviceId: fullDevice.id,
                                                                            sheetId: sheetId,
                                                                            columnName: newColumnName,
                                                                            sheetData: fullDevice.sheets[sheetName] ?? []
                                                                        });
                                                                        addRowMutation.mutate({
                                                                            deviceId: fullDevice.id,
                                                                            sheetId: sheetId,
                                                                        });
                                                                        setNewColumnName('');
                                                                    }
                                                                    setAddingColumnSheet(null);
                                                                }}
                                                            >
                                                                <Input
                                                                    name="newColumnName"
                                                                    type="text"
                                                                    value={newColumnName}
                                                                    onChange={(e) => setNewColumnName(e.target.value)}
                                                                    placeholder="Tên cột…"
                                                                    className="h-8 w-40 text-sm"
                                                                    autoComplete="off"
                                                                    autoFocus={typeof window !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                                                                />
                                                                <Button type="submit" size="sm">Thêm</Button>
                                                            </form>
                                                        ) : (
                                                            <Button size="sm" variant="outline" onClick={() => setAddingColumnSheet(sheetName)}>
                                                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                                Thêm column
                                                            </Button>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Action bar dưới table — chỉ hiện ở Edit mode */}
                                        {isEditMode && fullDevice.sheets[sheetName]?.length > 0 && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => {
                                                        const sheetId = sheetIdMap[sheetName];
                                                        if (!sheetId) {
                                                            console.error("Missing sheetId for add row");
                                                            return;
                                                        }
                                                        addRowMutation.mutate({ deviceId: fullDevice.id, sheetId: sheetId });
                                                    }}
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />
                                                    Thêm dòng
                                                </Button>
                                                {addingColumnSheet === sheetName ? (
                                                    <form
                                                        className="flex items-center gap-1"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            if (newColumnName.trim()) {
                                                                const sheetId = sheetIdMap[sheetName];
                                                                if (!sheetId) {
                                                                    console.error("Missing sheetId for add column");
                                                                    return;
                                                                }
                                                                addColumnMutation.mutate({
                                                                    deviceId: fullDevice.id,
                                                                    sheetId: sheetId,
                                                                    columnName: newColumnName,
                                                                    sheetData: fullDevice.sheets[sheetName] ?? []
                                                                });
                                                                setNewColumnName('');
                                                            }
                                                            setAddingColumnSheet(null);
                                                        }}
                                                    >
                                                        <Input
                                                            name="newColumnName"
                                                            type="text"
                                                            value={newColumnName}
                                                            onChange={(e) => setNewColumnName(e.target.value)}
                                                            placeholder="Tên cột…"
                                                            className="h-7 w-28 text-xs"
                                                            autoComplete="off"
                                                            autoFocus={typeof window !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                                                            onBlur={() => setAddingColumnSheet(null)}
                                                        />
                                                    </form>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setAddingColumnSheet(sheetName)}
                                                    >
                                                        <Plus className="mr-1 h-3 w-3" />
                                                        Thêm cột
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            ))
                        )}
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

