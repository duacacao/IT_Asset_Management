import {
    Dialog,
    DialogContent,
    DialogHeader,
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
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Download, Trash2, Calendar, HardDrive, Cpu, Network, Laptop, Search, SlidersHorizontal, Tag, X, Plus } from 'lucide-react';
import { Device, DeviceStatus, DEVICE_STATUS_CONFIG, SHEET_NAMES } from '@/types/device';
import { SheetTable } from './SheetTable';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { useDeviceStore } from '@/stores/useDeviceStore';

interface DeviceDetailProps {
    device: Device | null;
    isOpen: boolean;
    onClose: () => void;
    onExport: (device: Device) => void;
    onDelete: (deviceId: string) => void;
}

// Tên hiển thị đẹp cho sheet
const getDisplayName = (sheetKey: string): string => {
    const mapped = SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES];
    if (mapped) return mapped;
    return sheetKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function DeviceDetail({
    device,
    isOpen,
    onClose,
    onExport,
    onDelete,
}: DeviceDetailProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [newTag, setNewTag] = useState('');
    const updateDeviceVisibleSheets = useDeviceStore((s) => s.updateDeviceVisibleSheets);
    const setDeviceStatus = useDeviceStore((s) => s.setDeviceStatus);
    const addTag = useDeviceStore((s) => s.addTag);
    const removeTag = useDeviceStore((s) => s.removeTag);
    const updateSheetCell = useDeviceStore((s) => s.updateSheetCell);

    if (!device) return null;

    // Sheets hiện tại của device (tất cả sheet đã lưu)
    const allSheetKeys = Object.keys(device.sheets);
    // Sheets được hiển thị (per-device override hoặc tất cả)
    const visibleSheets = device.metadata.visibleSheets ?? allSheetKeys;
    const displayedSheets = allSheetKeys.filter((s) => visibleSheets.includes(s));

    const toggleSheetVisibility = (sheet: string) => {
        const current = device.metadata.visibleSheets ?? allSheetKeys;
        const updated = current.includes(sheet)
            ? current.filter((s) => s !== sheet)
            : [...current, sheet];
        // Không cho ẩn hết
        if (updated.length === 0) return;
        updateDeviceVisibleSheets(device.id, updated);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header Section */}
                <div className="p-6 border-b bg-muted/10">
                    <DialogHeader className="p-0 space-y-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <DialogTitle className="text-2xl font-bold">
                                        {device.deviceInfo.name}
                                    </DialogTitle>
                                    <Badge variant="secondary" className="px-2.5 py-0.5 text-sm font-medium">
                                        {device.deviceInfo.os}
                                    </Badge>
                                    {/* Status selector */}
                                    <Select
                                        value={device.status ?? 'active'}
                                        onValueChange={(val) => setDeviceStatus(device.id, val as DeviceStatus)}
                                    >
                                        <SelectTrigger className="w-[160px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    <span className={`mr-1.5 h-2 w-2 rounded-full ${config.color} inline-block`} />
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags editor */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                    {(device.metadata.tags ?? []).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs gap-1 pr-1">
                                            {tag}
                                            <button
                                                onClick={() => removeTag(device.id, tag)}
                                                className="ml-0.5 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <form
                                        className="flex items-center gap-1"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (newTag.trim()) {
                                                addTag(device.id, newTag);
                                                setNewTag('');
                                            }
                                        }}
                                    >
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag..."
                                            className="h-6 w-24 text-xs px-2"
                                        />
                                        <Button type="submit" variant="ghost" size="icon" className="h-6 w-6">
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </form>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">

                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Updated {device.deviceInfo.lastUpdate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DatabaseIcon className="h-4 w-4" />
                                        <span>{device.metadata.fileSize}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pr-8">
                                <Button variant="outline" onClick={() => onExport(device)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the device
                                                and remove its data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() => {
                                                    onDelete(device.id);
                                                    onClose();
                                                }}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <StatCard
                            icon={<Cpu className="h-4 w-4 text-primary" />}
                            label="Processor"
                            value={device.deviceInfo.cpu}
                        />
                        <StatCard
                            icon={<HardDrive className="h-4 w-4 text-primary" />}
                            label="Memory"
                            value={device.deviceInfo.ram}
                        />
                        <StatCard
                            icon={<Laptop className="h-4 w-4 text-primary" />}
                            label="Architecture"
                            value={device.deviceInfo.architecture}
                        />
                        <StatCard
                            icon={<Network className="h-4 w-4 text-primary" />}
                            label="MAC Address"
                            value={device.deviceInfo.mac || 'N/A'}
                        />
                    </div>
                </div>

                {/* Tabs & Content Section */}
                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <Tabs defaultValue={displayedSheets[0]} className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-2 border-b">
                            <TabsList className="h-auto bg-transparent p-0 gap-2">
                                <ScrollArea orientation="horizontal" className="w-[550px] whitespace-nowrap">
                                    <div className="flex gap-2 pb-3">
                                        {displayedSheets.map((sheetName) => (
                                            <TabsTrigger
                                                key={sheetName}
                                                value={sheetName}
                                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4 h-8 border border-transparent data-[state=active]:border-primary/20 capitalize"
                                            >
                                                {getDisplayName(sheetName)}
                                                <span className="ml-2 text-xs opacity-60">
                                                    {device.sheets[sheetName].length}
                                                </span>
                                            </TabsTrigger>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsList>

                            <div className="flex items-center gap-2">
                                {/* Toggle sheet visibility */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                                            Sheets
                                            <Badge variant="secondary" className="ml-2 px-1.5 text-xs">
                                                {displayedSheets.length}/{allSheetKeys.length}
                                            </Badge>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Hiển thị sheet</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {allSheetKeys.map((sheet) => (
                                            <DropdownMenuCheckboxItem
                                                key={sheet}
                                                checked={visibleSheets.includes(sheet)}
                                                onCheckedChange={() => toggleSheetVisibility(sheet)}
                                            >
                                                {getDisplayName(sheet)}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Search within tab */}
                                <div className="relative w-52">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter current view..."
                                        className="pl-8 h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {displayedSheets.map((sheetName) => (
                            <TabsContent key={sheetName} value={sheetName} className="flex-1 p-0 m-0 min-h-0 data-[state=active]:flex flex-col relative">
                                <div className="absolute inset-0 p-6">
                                    <div className="h-full w-full rounded-md border bg-card shadow-sm overflow-hidden">
                                        <SheetTable
                                            data={device.sheets[sheetName].filter(item =>
                                                JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
                                            )}
                                            sheetName={sheetName}
                                            deviceId={device.id}
                                            onCellUpdate={(rowIndex, column, value) =>
                                                updateSheetCell(device.id, sheetName, rowIndex, column, value)
                                            }
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </DialogContent >
        </Dialog >
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 p-3 rounded-lg border bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className="font-semibold text-sm truncate" title={value}>
                {value || 'N/A'}
            </div>
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
