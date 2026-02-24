'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Device, DeviceStatus, DeviceType } from '@/types/device'
import { DEVICE_FIELDS_CONFIG } from '@/constants/device-fields'
import { useUpdateDeviceMutation, useDeviceDetailQuery } from '@/hooks/useDevicesQuery'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { AppLoader } from '@/components/ui/app-loader'
import { DeviceFormFields } from '@/components/dashboard/device-form-fields'
import { deviceFormSchema, type DeviceFormValues } from '@/lib/validations/device'
import { toast } from 'sonner'
import { useComputedDeviceData } from '@/hooks/useComputedDeviceData'

export interface DeviceUpdateFormProps {
  device: Device
  onClose: () => void
}

export function DeviceUpdateForm({ device, onClose }: DeviceUpdateFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const updateMutation = useUpdateDeviceMutation()

  // Fetch device đầy đủ (có sheets) để useComputedDeviceData trích xuất được
  // GPU, Storage, ActivationStatus từ dữ liệu sheets.
  // Device truyền từ list view chỉ có sheets: {} (rỗng) → computed data sẽ trả 'Unknown'.
  const { data: detailData } = useDeviceDetailQuery(device.id)
  const fullDevice = detailData?.device ?? device
  const computedData = useComputedDeviceData(fullDevice)

  // Hàm an toàn: ưu tiên deviceInfo, nếu rỗng/rác thì fallback sang computedData
  const resolveField = (
    manualValue: string | null | undefined,
    computedValue: string | null
  ) => {
    const val = manualValue?.trim()
    if (val) {
      const lower = val.toLowerCase()
      if (
        lower !== 'unknown' &&
        lower !== 'n/a' &&
        lower !== '-' &&
        lower !== '0' &&
        lower !== 'none' &&
        lower !== 'khong co' &&
        lower !== 'không có'
      ) {
        return val
      }
    }

    if (computedValue) {
      const compLower = computedValue.toLowerCase().trim()
      if (
        compLower !== 'unknown' &&
        compLower !== 'n/a' &&
        compLower !== '-' &&
        compLower !== '0' &&
        compLower !== 'none'
      ) {
        return computedValue.trim()
      }
    }

    return ''
  }

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    values: {
      name: fullDevice.deviceInfo?.name || fullDevice.name || '',
      type: fullDevice.type || 'PC',
      status: fullDevice.status || 'inactive',
      os: resolveField(fullDevice.deviceInfo?.os, computedData.os),
      cpu: resolveField(fullDevice.deviceInfo?.cpu, computedData.cpu),
      ram: resolveField(fullDevice.deviceInfo?.ram, computedData.ram),
      architecture: resolveField(fullDevice.deviceInfo?.architecture, computedData.architecture),
      ip: resolveField(fullDevice.deviceInfo?.ip, computedData.ip),
      mac: resolveField(fullDevice.deviceInfo?.mac, computedData.mac),
      screenSize: resolveField(fullDevice.deviceInfo?.screenSize, computedData.screenSize),
      resolution: resolveField(fullDevice.deviceInfo?.resolution, computedData.resolution),
      connectionType: resolveField(fullDevice.deviceInfo?.connectionType, computedData.connectionType),
      gpu: resolveField(fullDevice.deviceInfo?.gpu, computedData.gpu),
      storage: resolveField(fullDevice.deviceInfo?.storage, computedData.storage),
      activationStatus: resolveField(fullDevice.deviceInfo?.activationStatus, computedData.activationStatus),
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
            className="flex-1 overflow-y-auto pl-4 pr-3"
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
