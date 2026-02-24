'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Device, DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_FIELDS_CONFIG } from '@/constants/device-fields'
import { useUpdateDeviceMutation } from '@/hooks/useDevicesQuery'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { AppLoader } from '@/components/ui/app-loader'
import { DeviceFormFields } from '@/components/dashboard/device-form-fields'
import { deviceFormSchema, type DeviceFormValues } from '@/lib/validations/device'
import { toast } from 'sonner'

export interface DeviceUpdateFormProps {
  device: Device
  onClose: () => void
}

export function DeviceUpdateForm({ device, onClose }: DeviceUpdateFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const updateMutation = useUpdateDeviceMutation()

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
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
      gpu: device.deviceInfo?.gpu || '',
      storage: device.deviceInfo?.storage || '',
      activationStatus: device.deviceInfo?.activationStatus || '',
    },
  })

  // Theo dõi loại thiết bị để hiển thị trường tương ứng
  const watchedType = form.watch('type') as DeviceType
  const fieldConfig = DEVICE_FIELDS_CONFIG[watchedType]

  const onSubmit = async (values: DeviceFormValues) => {
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
          ...(fieldConfig?.gpu?.show && { gpu: values.gpu }),
          ...(fieldConfig?.storage?.show && { storage: values.storage }),
          ...(fieldConfig?.activationStatus?.show && { activationStatus: values.activationStatus }),
        },
      })
      onClose()
    } catch (error) {
      toast.error('Cập nhật thiết bị thất bại', {
        description: error instanceof Error ? error.message : 'Lỗi không xác định',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-muted/10 flex h-full flex-col overflow-hidden rounded-lg p-1"
        >
          {/* Scrollable Content Area with Fade Mask */}
          <div
            className="flex-1 overflow-y-auto pl-4 pr-6 sm:pr-8"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
            }}
          >
            <div className="pt-2 pb-6 space-y-6">
              <DeviceFormFields form={form} fieldConfig={fieldConfig} showTypeField />
            </div>
          </div>

          {/* Fixed Sticky Footer */}
          <div className="border-border/40 bg-background/50 -mx-1 -mb-1 mt-auto flex-shrink-0 rounded-b-lg border-t px-6 py-3 backdrop-blur-md">
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isUpdating || form.formState.isSubmitting}
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || form.formState.isSubmitting}
                className="min-w-[80px] font-medium shadow-md"
              >
                {isUpdating || form.formState.isSubmitting ? (
                  <>
                    <AppLoader layout="horizontal" hideText className="mr-2 h-4 w-4" />
                    <span>Đang ghi...</span>
                  </>
                ) : (
                  <span>Lưu</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
