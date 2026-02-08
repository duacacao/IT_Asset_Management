"use client";

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';
import { scanSheetNames } from '@/lib/deviceUtils';
import { SHEET_NAMES } from '@/types/device';

interface SheetSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    files: File[];
    defaultSelected?: string[];
    onConfirm: (selectedSheets: string[]) => void;
}

// Map tên sheet normalized → tên hiển thị đẹp
const getDisplayName = (sheetKey: string): string => {
    const mapped = SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES];
    if (mapped) return mapped;
    // Capitalize + thay _ bằng space
    return sheetKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function SheetSelectionDialog({
    isOpen,
    onClose,
    files,
    defaultSelected,
    onConfirm,
}: SheetSelectionDialogProps) {
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Scan sheet names từ file đầu tiên khi dialog mở
    useEffect(() => {
        if (!isOpen || files.length === 0) return;

        const scan = async () => {
            setIsScanning(true);
            try {
                const sheetNames = await scanSheetNames(files[0]);
                setAvailableSheets(sheetNames);

                // Nếu có default → dùng default, nếu không → chọn tất cả
                if (defaultSelected && defaultSelected.length > 0) {
                    // Chỉ giữ sheets có trong file
                    const valid = defaultSelected.filter((s) => sheetNames.includes(s));
                    setSelectedSheets(valid.length > 0 ? valid : sheetNames);
                } else {
                    setSelectedSheets(sheetNames);
                }
            } catch {
                // Fallback: cho import không filter
                setAvailableSheets([]);
                setSelectedSheets([]);
            } finally {
                setIsScanning(false);
            }
        };

        scan();
    }, [isOpen, files, defaultSelected]);

    const toggleSheet = (sheet: string) => {
        setSelectedSheets((prev) =>
            prev.includes(sheet) ? prev.filter((s) => s !== sheet) : [...prev, sheet]
        );
    };

    const selectAll = () => setSelectedSheets([...availableSheets]);
    const deselectAll = () => setSelectedSheets([]);

    const handleConfirm = () => {
        if (selectedSheets.length === 0) return;
        onConfirm(selectedSheets);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Chọn Sheet để Import
                    </DialogTitle>
                    <DialogDescription>
                        {files.length === 1
                            ? `File: ${files[0].name}`
                            : `${files.length} files — áp dụng chung cho tất cả`}
                    </DialogDescription>
                </DialogHeader>

                {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Đang scan sheet names...</p>
                    </div>
                ) : availableSheets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Không tìm thấy sheet nào trong file.</p>
                    </div>
                ) : (
                    <>
                        {/* Select All / Deselect All */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm text-muted-foreground">
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
                                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary/30"
                                    >
                                        <Checkbox
                                            checked={selectedSheets.includes(sheet)}
                                            onCheckedChange={() => toggleSheet(sheet)}
                                        />
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className="text-sm font-medium">{getDisplayName(sheet)}</span>
                                            <Badge variant="outline" className="text-xs font-mono">
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
                    <Button
                        onClick={handleConfirm}
                        disabled={isScanning || selectedSheets.length === 0}
                    >
                        Import {selectedSheets.length > 0 ? `(${selectedSheets.length} sheets)` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
