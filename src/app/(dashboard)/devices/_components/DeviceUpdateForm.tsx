'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Device, DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_TYPES, DEVICE_TYPE_LABELS, DEVICE_STATUS_CONFIG } from '@/constants/device'
import {
    DEVICE_FIELDS_CONFIG,
    SCREEN_SIZE_OPTIONS,
    RESOLUTION_OPTIONS,
    CONNECTION_TYPE_OPTIONS,
} from '@/constants/device-fields'
import { useUpdateDeviceMutation } from '@/hooks/useDevicesQuery'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AppLoader } from '@/components/ui/app-loader'
import { Separator } from '@/components/ui/separator'
import { Monitor, Laptop, Cpu, HardDrive, Network, Info, Server, Layers } from 'lucide-react'

export interface DeviceUpdateFormProps {
    device: Device
    onClose: () => void
}

const IP_REGEX =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

const updateDeviceSchema = z
    .object({
        name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
        type: z.enum(Object.values(DEVICE_TYPES) as [string, ...string[]]),
        status: z.enum(['active', 'broken', 'inactive'] as const),
        os: z.string().optional(),
        cpu: z.string().optional(),
        ram: z.string().optional(),
        architecture: z.string().optional(),
        ip: z.string().optional(),
        mac: z.string().optional(),
        screenSize: z.string().optional(),
        resolution: z.string().optional(),
        connectionType: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type !== 'Monitor') {
            if (data.ip && !IP_REGEX.test(data.ip)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Địa chỉ IP không hợp lệ (VD: 192.168.1.1)',
                    path: ['ip'],
                })
            }
            if (data.mac && !MAC_REGEX.test(data.mac)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Địa chỉ MAC không hợp lệ (VD: AA:BB:CC:DD:EE:FF)',
                    path: ['mac'],
                })
            }
        }
    })

type UpdateFormValues = z.infer<typeof updateDeviceSchema>

export function DeviceUpdateForm({ device, onClose }: DeviceUpdateFormProps) {
    const [isUpdating, setIsUpdating] = useState(false)
    const updateMutation = useUpdateDeviceMutation()

    const form = useForm<UpdateFormValues>({
        resolver: zodResolver(updateDeviceSchema),
        defaultValues: {
            name: device.deviceInfo?.name || device.name || '',
            type: device.type || 'PC',
            status: device.status || 'inactive',
            os: device.deviceInfo?.os || '',
            cpu: device.deviceInfo?.cpu || '',
            ram: device.deviceInfo?.ram || '',
            architecture: device.deviceInfo?.architecture || '',
            ip: device.deviceInfo?.ip || '',
            mac: device.deviceInfo?.mac || '',
            screenSize: device.deviceInfo?.screenSize || '',
            resolution: device.deviceInfo?.resolution || '',
            connectionType: device.deviceInfo?.connectionType || '',
        },
    })

    // Theo dõi loại thiết bị để hiển thị trường tương ứng
    const watchedType = form.watch('type') as DeviceType
    const fieldConfig = DEVICE_FIELDS_CONFIG[watchedType]

    const onSubmit = async (values: UpdateFormValues) => {
        setIsUpdating(true)
        try {
            await updateMutation.mutateAsync({
                deviceId: device.id,
                updates: {
                    name: values.name,
                    type: values.type as DeviceType,
                    status: values.status as DeviceStatus,
                    // Extract options dynamically
                    ...(fieldConfig?.os?.show && { os: values.os }),
                    ...(fieldConfig?.cpu?.show && { cpu: values.cpu }),
                    ...(fieldConfig?.ram?.show && { ram: values.ram }),
                    ...(fieldConfig?.architecture?.show && { architecture: values.architecture }),
                    ...(fieldConfig?.ip?.show && { ip: values.ip }),
                    ...(fieldConfig?.mac?.show && { mac: values.mac }),
                    ...(fieldConfig?.screenSize?.show && { screenSize: values.screenSize }),
                    ...(fieldConfig?.resolution?.show && { resolution: values.resolution }),
                    ...(fieldConfig?.connectionType?.show && { connectionType: values.connectionType }),
                },
            })
            onClose()
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="flex h-full flex-col">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex h-full flex-col overflow-hidden bg-muted/10 rounded-lg p-1"
                >
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
                        {/* Nhóm 1: Thông tin chung */}
                        <div className="space-y-4 bg-background rounded-lg border border-border/60 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                                <Info className="w-4 h-4 text-primary" />
                                <h3 className="uppercase text-xs font-bold tracking-widest text-muted-foreground">THÔNG TIN CHUNG</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">
                                                TÊN THIẾT BỊ <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="VD: PC-IT-001"
                                                    autoComplete="off"
                                                    className="font-mono text-base border-border/80 focus-visible:ring-primary/50 bg-muted/20"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">LOẠI THIẾT BỊ</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="border-border/80 bg-muted/20 font-medium">
                                                        <SelectValue placeholder="Chọn loại thiết bị" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.values(DEVICE_TYPES).map((type) => (
                                                        <SelectItem key={type} value={type} className="font-medium">
                                                            {DEVICE_TYPE_LABELS[type as DeviceType]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">TRẠNG THÁI</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="border-border/80 bg-muted/20 font-medium">
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => (
                                                        <SelectItem key={key} value={key} className="font-medium">
                                                            {config.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Nhóm 2: Cấu hình phần cứng (Hiển thị có điều kiện) */}
                        <div className="space-y-4 bg-background rounded-lg border border-border/60 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                                <Server className="w-4 h-4 text-primary" />
                                <h3 className="uppercase text-xs font-bold tracking-widest text-muted-foreground">THÔNG SỐ KỸ THUẬT</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                {fieldConfig?.os?.show && (
                                    <FormField
                                        control={form.control}
                                        name="os"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    OS
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Windows 11 Pro" className="font-mono text-sm border-border/80 bg-muted/10 h-9" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {fieldConfig?.architecture?.show && (
                                    <FormField
                                        control={form.control}
                                        name="architecture"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-muted-foreground">ARCH</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="x64" className="font-mono text-sm border-border/80 bg-muted/10 h-9" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {fieldConfig?.cpu?.show && (
                                    <FormField
                                        control={form.control}
                                        name="cpu"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2 sm:col-span-1">
                                                <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    CPU
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Intel i5-12400" className="font-mono text-sm border-border/80 bg-muted/10 h-9" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {fieldConfig?.ram?.show && (
                                    <FormField
                                        control={form.control}
                                        name="ram"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2 sm:col-span-1">
                                                <FormLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    RAM
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="16 GB" className="font-mono text-sm border-border/80 bg-muted/10 h-9" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Thông số riêng cho Màn hình */}
                                {fieldConfig?.screenSize?.show && (
                                    <FormField
                                        control={form.control}
                                        name="screenSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-muted-foreground">KÍCH THƯỚC</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="font-mono text-sm border-border/80 bg-muted/10 h-9">
                                                            <SelectValue placeholder="Chọn cỡ" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {SCREEN_SIZE_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option} className="font-mono text-sm">
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {fieldConfig?.resolution?.show && (
                                    <FormField
                                        control={form.control}
                                        name="resolution"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-muted-foreground">ĐỘ PHÂN GIẢI</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="font-mono text-sm border-border/80 bg-muted/10 h-9">
                                                            <SelectValue placeholder="Chọn độ phân giải" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {RESOLUTION_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option} className="font-mono text-sm">
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {fieldConfig?.connectionType?.show && (
                                    <FormField
                                        control={form.control}
                                        name="connectionType"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs font-medium text-muted-foreground">CỔNG KẾT NỐI</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="font-mono text-sm border-border/80 bg-muted/10 h-9">
                                                            <SelectValue placeholder="Chọn kết nối" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {CONNECTION_TYPE_OPTIONS.map((option) => (
                                                            <SelectItem key={option} value={option} className="font-mono text-sm">
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Nhóm 3: Mạng & Kết nối (Chỉ hiện nếu config cho phép) */}
                        {(fieldConfig?.ip?.show || fieldConfig?.mac?.show) && (
                            <div className="space-y-4 bg-background rounded-lg border border-border/60 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                                    <Network className="w-4 h-4 text-primary" />
                                    <h3 className="uppercase text-xs font-bold tracking-widest text-muted-foreground">TCP/IP & MAC ADDRESS</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    {fieldConfig?.ip?.show && (
                                        <FormField
                                            control={form.control}
                                            name="ip"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium text-muted-foreground">IPv4 ADDRESS</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="192.168.1.xxx" className="font-mono text-sm border-border/80 bg-muted/10 h-9" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-xs font-mono" />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {fieldConfig?.mac?.show && (
                                        <FormField
                                            control={form.control}
                                            name="mac"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-medium text-muted-foreground">MAC ADDRESS</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="00:00:00:00:00:00" className="font-mono text-sm border-border/80 bg-muted/10 h-9 tracking-widest uppercase uppercase text-center" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-xs font-mono" />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <div className="bg-background px-4 py-4 border-t flex items-center justify-end space-x-3 rounded-b-lg">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isUpdating || form.formState.isSubmitting}
                            className="font-semibold text-muted-foreground hover:text-foreground"
                        >
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={isUpdating || form.formState.isSubmitting} className="font-bold min-w-[140px]">
                            {(isUpdating || form.formState.isSubmitting) ? (
                                <>
                                    <AppLoader layout="horizontal" hideText className="mr-2 h-4 w-4" />
                                    <span>Đang ghi...</span>
                                </>
                            ) : (
                                <span>GHI DỮ LIỆU</span>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
