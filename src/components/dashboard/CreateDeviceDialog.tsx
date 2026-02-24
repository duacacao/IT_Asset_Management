'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { DeviceFormFields } from '@/components/dashboard/device-form-fields'
import { DeviceType, DeviceStatus } from '@/types/device'
import { DEVICE_TYPES, DEVICE_TYPE_LABELS } from '@/constants/device'
import { DEVICE_FIELDS_CONFIG, DEVICE_TEMPLATES } from '@/constants/device-fields'
import { useCreateDeviceMutation } from '@/hooks/useDevicesQuery'
import {
  deviceFormSchema,
  DEVICE_FORM_INITIAL_VALUES,
  type DeviceFormValues,
} from '@/lib/validations/device'
import {
  Monitor,
  Laptop,
  Network,
  Printer,
  Smartphone,
  Tablet,
  Package,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLoader } from '@/components/ui/app-loader'
import { toast } from 'sonner'

interface CreateDeviceSheetProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (deviceId: string) => void
}

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

export function CreateDeviceSheet({ isOpen, onClose, onCreated }: CreateDeviceSheetProps) {
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<DeviceType | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const createMutation = useCreateDeviceMutation()

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: DEVICE_FORM_INITIAL_VALUES,
  })

  const handleTypeSelect = (type: DeviceType) => {
    setSelectedType(type)
    form.setValue('type', type)
    setShowTemplates(false)
    setStep('form')
  }

  const handleTemplateSelect = (template: { name: string; values: Record<string, string> }) => {
    Object.entries(template.values).forEach(([key, value]) => {
      form.setValue(key as keyof DeviceFormValues, value)
    })
  }

  const onSubmit = async (values: DeviceFormValues) => {
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
        gpu: values.gpu || '',
        storage: values.storage || '',
        activationStatus: values.activationStatus || '',
      })

      handleReset()
      onClose()
      onCreated?.(result.id)
    } catch (error) {
      toast.error('Tạo thiết bị thất bại', {
        description: error instanceof Error ? error.message : 'Lỗi không xác định',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setStep('type')
    setSelectedType(null)
    setShowTemplates(false)
    form.reset(DEVICE_FORM_INITIAL_VALUES)
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
    form.reset(DEVICE_FORM_INITIAL_VALUES)
  }

  const fieldConfig = selectedType ? DEVICE_FIELDS_CONFIG[selectedType] : null
  const templates = selectedType ? DEVICE_TEMPLATES[selectedType] : []

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="flex w-full flex-col sm:m-2 sm:h-[calc(100vh-1rem)] sm:max-w-xl sm:rounded-lg sm:border sm:shadow-2xl"
      >
        {step === 'type' ? (
          <>
            <SheetHeader className="mb-2 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium tracking-wider">
                  Tạo thiết bị mới
                </span>
              </div>
              <SheetTitle>Chọn loại thiết bị</SheetTitle>
              <SheetDescription>Bước 1/2: Chọn loại thiết bị cần tạo</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12">
              <div className="grid grid-cols-3 gap-4">
                {Object.values(DEVICE_TYPES).map((type) => {
                  const Icon = DEVICE_TYPE_ICONS[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className={cn(
                        'hover:border-primary hover:bg-primary/5 flex h-28 flex-col items-center justify-center gap-2.5 rounded-xl border p-4 transition-all',
                        'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        'hover:-translate-y-0.5 hover:shadow-sm'
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
            <SheetHeader className="mb-0 pb-0 space-y-1">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-semibold tracking-wider">
                  Tạo thiết bị mới
                </span>
              </div>
              <SheetTitle>{selectedType && DEVICE_TYPE_LABELS[selectedType]}</SheetTitle>
              <SheetDescription>Bước 2/2: Nhập thông tin thiết bị</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="bg-muted/10 flex h-full flex-col overflow-hidden rounded-lg p-1"
                >
                  {/* Scrollable Content Area with Fade Mask */}
                  <div
                    className="flex-1 overflow-y-auto pl-4 pr-3"
                    style={{
                      maskImage: 'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                    }}
                  >
                    <div className="pt-2 pb-6 space-y-6">
                      {templates.length > 0 && (
                        <div className="space-y-3 pb-2">
                          <div className="flex items-center justify-between mx-1">
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
                            <div className="flex flex-wrap gap-2 pt-1 mx-1">
                              {templates.map((template) => (
                                <Button
                                  key={template.name}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTemplateSelect(template)}
                                  className="text-xs transition-colors hover:border-primary/50"
                                >
                                  {template.name}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <DeviceFormFields form={form} fieldConfig={fieldConfig} autoFocusName />
                    </div>
                  </div>

                  {/* Fixed Sticky Footer */}
                  <div className="border-border/40 bg-background/50 -mx-1 -mb-1 mt-auto flex-shrink-0 rounded-b-lg border-t px-6 py-3 backdrop-blur-md">
                    <div className="flex items-center justify-end space-x-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenChange(false)}
                        disabled={isCreating}
                        className="text-muted-foreground hover:text-foreground font-medium"
                      >
                        Hủy bỏ
                      </Button>
                      <Button type="submit" disabled={isCreating} className="min-w-[80px] font-medium shadow-md">
                        {isCreating ? (
                          <>
                            <AppLoader layout="horizontal" hideText className="mr-2 h-4 w-4" />
                            <span>Đang tạo…</span>
                          </>
                        ) : (
                          <span>Tạo</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
