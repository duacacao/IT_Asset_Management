'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPES, DEVICE_TYPE_LABELS } from '@/constants/device'
import {
  DEVICE_FIELDS_CONFIG,
  DEVICE_TEMPLATES,
  SCREEN_SIZE_OPTIONS,
  RESOLUTION_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
} from '@/constants/device-fields'
import { useCreateDeviceMutation } from '@/hooks/useDevicesQuery'
import {
  Monitor,
  Cpu,
  HardDrive,
  Laptop,
  Network,
  Printer,
  Smartphone,
  Tablet,
  Package,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateDeviceDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (deviceId: string) => void
}

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

const DEVICE_TYPE_ICONS: Record<DeviceType, React.ComponentType<{ className?: string }>> = {
  [DEVICE_TYPES.PC]: Monitor,
  [DEVICE_TYPES.LAPTOP]: Laptop,
  [DEVICE_TYPES.MONITOR]: Monitor,
  [DEVICE_TYPES.PRINTER]: Printer,
  [DEVICE_TYPES.PHONE]: Smartphone,
  [DEVICE_TYPES.TABLET]: Tablet,
  [DEVICE_TYPES.NETWORK]: Network,
  [DEVICE_TYPES.OTHER]: Package,
}

const formSchema = z
  .object({
    name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
    type: z.enum(Object.values(DEVICE_TYPES) as [string, ...string[]]),
    os: z.string().optional(),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    architecture: z.string().optional(),
    ip: z.string().optional(),
    mac: z.string().optional(),
    status: z.enum(['active', 'broken', 'inactive'] as const),
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

type FormValues = z.infer<typeof formSchema>

const INITIAL_VALUES: FormValues = {
  name: '',
  type: 'PC',
  os: '',
  cpu: '',
  ram: '',
  architecture: '',
  ip: '',
  mac: '',
  status: 'inactive',
  screenSize: '',
  resolution: '',
  connectionType: '',
}

export function CreateDeviceDialog({ isOpen, onClose, onCreated }: CreateDeviceDialogProps) {
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const createMutation = useCreateDeviceMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: INITIAL_VALUES,
  })

  const handleTypeSelect = (type: DeviceType) => {
    setSelectedType(type)
    form.setValue('type', type)
    setShowTemplates(false)
    setStep('form')
  }

  const handleTemplateSelect = (template: { name: string; values: Record<string, string> }) => {
    Object.entries(template.values).forEach(([key, value]) => {
      form.setValue(key as keyof FormValues, value)
    })
  }

  const onSubmit = async (values: FormValues) => {
    setIsCreating(true)
    try {
      const result = await createMutation.mutateAsync({
        name: values.name,
        type: values.type as DeviceType,
        os: values.os || '',
        cpu: values.cpu || '',
        ram: values.ram || '',
        architecture: values.architecture || '',
        ip: values.ip || '',
        mac: values.mac || '',
        status: values.status as DeviceStatus,
        screenSize: values.screenSize || '',
        resolution: values.resolution || '',
        connectionType: values.connectionType || '',
      })

      handleReset()
      onClose()
      onCreated?.(result.id)
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setStep('type')
    setSelectedType(null)
    setShowTemplates(false)
    form.reset(INITIAL_VALUES)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset()
      onClose()
    }
  }

  const handleBack = () => {
    setStep('type')
    setShowTemplates(false)
    form.reset(INITIAL_VALUES)
  }

  const fieldConfig = selectedType ? DEVICE_FIELDS_CONFIG[selectedType] : null
  const templates = selectedType ? DEVICE_TEMPLATES[selectedType] : []

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'type' ? (
          <>
            <DialogHeader>
              <DialogTitle>Tạo thiết bị mới</DialogTitle>
              <DialogDescription>Bước 1/2: Chọn loại thiết bị</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="grid grid-cols-4 gap-3">
                {Object.values(DEVICE_TYPES).map((type) => {
                  const Icon = DEVICE_TYPE_ICONS[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className={cn(
                        'hover:border-primary hover:bg-primary/5 flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
                        'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none'
                      )}
                    >
                      <Icon className="text-muted-foreground h-6 w-6" />
                      <span className="text-center text-xs font-medium">
                        {DEVICE_TYPE_LABELS[type]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>
                    Tạo thiết bị mới - {selectedType && DEVICE_TYPE_LABELS[selectedType]}
                  </DialogTitle>
                  <DialogDescription>Bước 2/2: Nhập thông tin thiết bị</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                {templates.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm font-medium">Quick Templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {showTemplates ? 'ON' : 'OFF'}
                        </span>
                        <Switch checked={showTemplates} onCheckedChange={setShowTemplates} />
                      </div>
                    </div>

                    {showTemplates && (
                      <div className="flex flex-wrap gap-2">
                        {templates.map((template) => (
                          <Button
                            key={template.name}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect(template)}
                            className="text-xs"
                          >
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                          autoFocus={
                            typeof window !== 'undefined' &&
                            !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  {fieldConfig?.os?.show && (
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
                  )}

                  {fieldConfig?.architecture?.show && (
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
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fieldConfig?.cpu?.show && (
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
                  )}

                  {fieldConfig?.ram?.show && (
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
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fieldConfig?.ip?.show && (
                    <FormField
                      control={form.control}
                      name="ip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Network className="mr-1.5 inline h-3.5 w-3.5" />
                            IP
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" autoComplete="off" {...field} />
                          </FormControl>
                          <FormMessage />
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
                          <FormLabel>MAC</FormLabel>
                          <FormControl>
                            <Input placeholder="AA:BB:CC:DD:EE:FF" autoComplete="off" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {fieldConfig?.screenSize?.show && (
                    <FormField
                      control={form.control}
                      name="screenSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kích thước màn</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn kích thước" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCREEN_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                          <FormLabel>Độ phân giải</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn độ phân giải" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RESOLUTION_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {fieldConfig?.connectionType?.show && (
                  <FormField
                    control={form.control}
                    name="connectionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kết nối</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kiểu kết nối" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONNECTION_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isCreating}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreating ? 'Đang tạo…' : 'Tạo thiết bị'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
