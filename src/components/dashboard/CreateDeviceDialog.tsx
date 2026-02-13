'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { DeviceStatus, DEVICE_STATUS_CONFIG } from '@/types/device';
import { useDeviceStore } from '@/stores/useDeviceStore';
import { Monitor, Cpu, HardDrive, Laptop, Network, Loader2 } from 'lucide-react';

interface CreateDeviceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (deviceId: string) => void;
}

// Regex patterns
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const formSchema = z.object({
    name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
    os: z.string().optional(),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    architecture: z.string().optional(),
    ip: z.string().optional().refine((val) => !val || IP_REGEX.test(val), {
        message: 'Địa chỉ IP không hợp lệ (VD: 192.168.1.1)',
    }),
    mac: z.string().optional().refine((val) => !val || MAC_REGEX.test(val), {
        message: 'Địa chỉ MAC không hợp lệ (VD: AA:BB:CC:DD:EE:FF)',
    }),
    status: z.enum(['active', 'broken', 'inactive'] as const),
});

type FormValues = z.infer<typeof formSchema>;

const INITIAL_VALUES: FormValues = {
    name: '',
    os: '',
    cpu: '',
    ram: '',
    architecture: '',
    ip: '',
    mac: '',
    status: 'active',
};

export function CreateDeviceDialog({ isOpen, onClose, onCreated }: CreateDeviceDialogProps) {
    const [isCreating, setIsCreating] = useState(false);
    const createDevice = useDeviceStore((s) => s.createDevice);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: INITIAL_VALUES,
    });

    const onSubmit = async (values: FormValues) => {
        setIsCreating(true);
        try {
            const device = createDevice({
                name: values.name,
                os: values.os,
                cpu: values.cpu,
                ram: values.ram,
                architecture: values.architecture,
                ip: values.ip,
                mac: values.mac,
            });

            // Set status nếu khác default
            if (values.status !== 'active') {
                useDeviceStore.getState().setDeviceStatus(device.id, values.status);
            }

            form.reset(INITIAL_VALUES);
            onClose();
            onCreated?.(device.id);
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            form.reset(INITIAL_VALUES);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo thiết bị mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin thiết bị. Có thể thêm sheets và dữ liệu sau.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Tên thiết bị — required */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Monitor className="h-3.5 w-3.5" />
                                        Tên thiết bị <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="VD: PC-IT-001"
                                            autoComplete="off"
                                            autoFocus={typeof window !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* OS + Architecture — 2 cột */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="os"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <Laptop className="h-3.5 w-3.5" />
                                            OS
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Windows 11 Pro" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="architecture"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Architecture</FormLabel>
                                        <FormControl>
                                            <Input placeholder="x64" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* CPU + RAM — 2 cột */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="cpu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <Cpu className="h-3.5 w-3.5" />
                                            CPU
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Intel i5-12400" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1.5">
                                            <HardDrive className="h-3.5 w-3.5" />
                                            RAM
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="16 GB" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* IP + MAC — 2 cột */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="ip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <Network className="h-3.5 w-3.5 inline mr-1.5" />
                                            IP
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="192.168.1.100" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mac"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MAC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="AA:BB:CC:DD:EE:FF" autoComplete="off" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trạng thái</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isCreating ? 'Đang tạo…' : 'Tạo thiết bị'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
