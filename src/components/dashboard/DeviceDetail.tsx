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
import { Download, Trash2, Calendar, HardDrive, Cpu, Network, Laptop, SlidersHorizontal, Monitor, Pencil, Check, X, Plus, Copy, MoreVertical, Eye, CheckCircle2 } from 'lucide-react';
import { Device, DeviceInfo, DeviceStatus, DEVICE_STATUS_CONFIG, SHEET_NAMES } from '@/types/device';
import { SheetTable } from './SheetTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useCallback, useEffect } from 'react';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { SheetTabsCarousel } from '@/components/carousel/SheetTabsCarousel';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
    DndContext, closestCenter, KeyboardSensor,
    PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Dot colors cho status selector
const STATUS_DOT_COLORS: Record<DeviceStatus, string> = {
    active: 'bg-emerald-500',
    broken: 'bg-red-500',
    inactive: 'bg-gray-400',
};

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
    const updateDeviceVisibleSheets = useDeviceStore((s) => s.updateDeviceVisibleSheets);
    const setDeviceStatus = useDeviceStore((s) => s.setDeviceStatus);
    const updateSheetCell = useDeviceStore((s) => s.updateSheetCell);
    const updateDeviceInfo = useDeviceStore((s) => s.updateDeviceInfo);
    const duplicateDevice = useDeviceStore((s) => s.duplicateDevice);
    const addSheet = useDeviceStore((s) => s.addSheet);
    const removeSheet = useDeviceStore((s) => s.removeSheet);
    const renameSheet = useDeviceStore((s) => s.renameSheet);
    const addSheetRow = useDeviceStore((s) => s.addSheetRow);
    const removeSheetRows = useDeviceStore((s) => s.removeSheetRows);
    const addSheetColumn = useDeviceStore((s) => s.addSheetColumn);
    const reorderSheets = useDeviceStore((s) => s.reorderSheets);

    // Đồng bộ mode khi mở modal hoặc đổi initialMode
    useEffect(() => {
        setCurrentMode(initialMode);
        setIsEditing(false);
        setEditForm({});
        setActiveSheet(null); // Reset sheet khi đổi device
    }, [initialMode, isOpen]);

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
        if (!device) return;
        setEditForm({ ...device.deviceInfo });
        setIsEditing(true);
    }, [device]);

    const saveEditing = useCallback(() => {
        if (!device) return;
        updateDeviceInfo(device.id, editForm);
        setIsEditing(false);
    }, [device, editForm, updateDeviceInfo]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setEditForm({});
    }, []);

    // Kéo thả sắp xếp tabs
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (!device) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const keys = Object.keys(device.sheets);
        const oldIndex = keys.indexOf(active.id as string);
        const newIndex = keys.indexOf(over.id as string);
        if (oldIndex === -1 || newIndex === -1) return;
        reorderSheets(device.id, arrayMove(keys, oldIndex, newIndex));
    }, [device, reorderSheets]);

    if (!device) return null;

    const allSheetKeys = Object.keys(device.sheets);
    const visibleSheets = device.metadata.visibleSheets ?? allSheetKeys;
    const displayedSheets = allSheetKeys.filter((s) => visibleSheets.includes(s));

    const toggleSheetVisibility = (sheet: string) => {
        const current = device.metadata.visibleSheets ?? allSheetKeys;
        const updated = current.includes(sheet)
            ? current.filter((s) => s !== sheet)
            : [...current, sheet];
        if (updated.length === 0) return;
        updateDeviceVisibleSheets(device.id, updated);
    };

    const status = device.status ?? 'active';
    const statusConfig = DEVICE_STATUS_CONFIG[status];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] w-full h-[90vh] flex flex-row p-0 gap-0 overflow-hidden overscroll-contain">
                {/* Accessible title — ẩn cho screen reader */}
                <VisuallyHidden.Root>
                    <DialogTitle>{device.deviceInfo.name}</DialogTitle>
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

                {/* Edit mode — Save + Cancel bar ở góc trên trái */}
                {isEditMode && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                        <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                                if (isEditing) saveEditing();
                                setCurrentMode('view');
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
                                if (isEditing) cancelEditing();
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
                                        value={editForm.name ?? ''}
                                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                        className="text-base font-bold h-8"
                                    />
                                ) : (
                                    <h2 className="text-base font-bold leading-snug break-words">
                                        {device.deviceInfo.name}
                                    </h2>
                                )}
                            </div>
                            {/* Status — selector khi Edit, label khi View */}
                            {isEditMode ? (
                                <Select
                                    value={status}
                                    onValueChange={(val) => setDeviceStatus(device.id, val as DeviceStatus)}
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

                        {/* Thông tin thiết bị — view / edit mode */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin</p>
                                {isEditMode && (
                                    isEditing ? (
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveEditing} aria-label="Lưu thay đổi">
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEditing} aria-label="Hủy thay đổi">
                                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={startEditing} aria-label="Chỉnh sửa thông tin">
                                            <Pencil className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    )
                                )}
                            </div>
                            {isEditing ? (
                                <div className="space-y-2.5">
                                    <EditField icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={editForm.os ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, os: v }))} />
                                    <EditField icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={editForm.cpu ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, cpu: v }))} />
                                    <EditField icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={editForm.ram ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, ram: v }))} />
                                    <EditField icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={editForm.architecture ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, architecture: v }))} />
                                    <EditField icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={editForm.mac ?? ''} onChange={(v) => setEditForm((f) => ({ ...f, mac: v }))} />
                                </div>
                            ) : (
                                <>
                                    <InfoRow icon={<Laptop className="h-3.5 w-3.5" />} label="OS" value={device.deviceInfo.os} />
                                    <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={device.deviceInfo.cpu} />
                                    <InfoRow icon={<HardDrive className="h-3.5 w-3.5" />} label="RAM" value={device.deviceInfo.ram} />
                                    <InfoRow icon={<Monitor className="h-3.5 w-3.5" />} label="Arch" value={device.deviceInfo.architecture} />
                                    <InfoRow icon={<Network className="h-3.5 w-3.5" />} label="MAC" value={device.deviceInfo.mac || 'Không có'} />
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
                                    <span className="text-xs">{device.deviceInfo.lastUpdate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DatabaseIcon className="h-3.5 w-3.5" />
                                    <span className="text-xs">{device.metadata.fileSize}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span className="text-xs">{device.metadata.totalSheets} sheet • {device.metadata.totalRows} dòng</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions — Export, Duplicate, Delete */}
                        <div className="space-y-2">
                            <div className={`grid gap-2 ${isEditMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => onExport(device)}>
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    Xuất file
                                </Button>
                                {isEditMode && (
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => duplicateDevice(device.id)}>
                                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                                        Nhân bản
                                    </Button>
                                )}
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
                                                onDelete(device.id);
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
                                                        count={device.sheets[sheetName]?.length ?? 0}
                                                        isActive={(activeSheet || displayedSheets[0]) === sheetName}
                                                        onRename={() => {
                                                            const newName = prompt('Đổi tên sheet:', sheetName);
                                                            if (newName) {
                                                                renameSheet(device.id, sheetName, newName);
                                                                // Cập nhật activeSheet nếu rename sheet đang active
                                                                if (activeSheet === sheetName) setActiveSheet(newName);
                                                            }
                                                        }}
                                                        onDelete={allSheetKeys.length > 1 ? () => {
                                                            if (confirm(`Xóa sheet "${getDisplayName(sheetName)}"?`)) {
                                                                removeSheet(device.id, sheetName);
                                                                // Reset activeSheet nếu đang xóa sheet đang hiển thị
                                                                if (activeSheet === sheetName) setActiveSheet(null);
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
                                                                addSheet(device.id, newSheetName);
                                                                setNewSheetName('');
                                                            }
                                                            setIsAddingSheet(false);
                                                        }}
                                                    >
                                                        <Input
                                                            value={newSheetName}
                                                            onChange={(e) => setNewSheetName(e.target.value)}
                                                            placeholder="Tên sheet…"
                                                            className="h-7 w-28 text-xs"
                                                            autoFocus
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
                                        getCount={(sheet) => device.sheets[sheet]?.length ?? 0}
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
                                            {device.sheets[sheetName]?.length > 0 ? (
                                                <SheetTable
                                                    data={device.sheets[sheetName]}
                                                    sheetName={sheetName}
                                                    deviceId={device.id}
                                                    readOnly={!isEditMode}
                                                    onCellUpdate={(rowIndex, column, value) =>
                                                        updateSheetCell(device.id, sheetName, rowIndex, column, value)
                                                    }
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
                                                                        addSheetColumn(device.id, sheetName, newColumnName);
                                                                        addSheetRow(device.id, sheetName);
                                                                        setNewColumnName('');
                                                                    }
                                                                    setAddingColumnSheet(null);
                                                                }}
                                                            >
                                                                <Input
                                                                    value={newColumnName}
                                                                    onChange={(e) => setNewColumnName(e.target.value)}
                                                                    placeholder="Tên cột…"
                                                                    className="h-8 w-40 text-sm"
                                                                    autoFocus
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
                                        {isEditMode && device.sheets[sheetName]?.length > 0 && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => addSheetRow(device.id, sheetName)}
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
                                                                addSheetColumn(device.id, sheetName, newColumnName);
                                                                setNewColumnName('');
                                                            }
                                                            setAddingColumnSheet(null);
                                                        }}
                                                    >
                                                        <Input
                                                            value={newColumnName}
                                                            onChange={(e) => setNewColumnName(e.target.value)}
                                                            placeholder="Tên cột…"
                                                            className="h-7 w-28 text-xs"
                                                            autoFocus
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

// Row thông tin trong sidebar — label trên, value dưới
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2 py-1">
            <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none mb-1">{label}</p>
                <p className="text-sm font-medium leading-snug break-words">{value || 'Không có'}</p>
            </div>
        </div>
    );
}

// Edit mode — Input field trong sidebar
function EditField({ icon, label, value, onChange }: {
    icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <Label className="text-[11px] text-muted-foreground">{label}</Label>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 text-sm mt-0.5"
                />
            </div>
        </div>
    );
}

// Sortable tab — click để view, kebab menu, long press để drag
function SortableTab({ id, label, count, isActive, onRename, onDelete }: {
    id: string; label: string; count: number; isActive?: boolean;
    onRename: () => void; onDelete?: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center flex-shrink-0 group rounded-full border transition-colors ${isActive
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
        >
            {/* Tab content — click để chọn sheet */}
            <TabsTrigger
                value={id}
                className="bg-transparent border-none shadow-none rounded-full px-3.5 h-8 whitespace-nowrap flex-shrink-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
                {label}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </TabsTrigger>
            {/* Kebab menu — 3-dot để mở Rename/Delete */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-6 rounded-full -ml-1 mr-0.5 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100 hover:bg-transparent"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Tùy chọn sheet"
                    >
                        <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={onRename}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Đổi tên
                    </DropdownMenuItem>
                    {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Xóa
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function DatabaseIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    )
}
