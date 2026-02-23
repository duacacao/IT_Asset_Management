'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEVICE_STATUS_CONFIG, DEVICE_TYPES, DEVICE_TYPE_LABELS } from '@/constants/device'
import {
  SCREEN_SIZE_OPTIONS,
  RESOLUTION_OPTIONS,
  CONNECTION_TYPE_OPTIONS,
} from '@/constants/device-fields'
import { DeviceType } from '@/types/device'
import { Info, Server, Network } from 'lucide-react'
import type { DeviceFormValues } from '@/lib/validations/device'

interface DeviceFormFieldsProps {
  form: UseFormReturn<DeviceFormValues>
  fieldConfig: Record<string, { show: boolean }> | null
  showTypeField?: boolean
  autoFocusName?: boolean
}

export function DeviceFormFields({
  form,
  fieldConfig,
  showTypeField = false,
  autoFocusName = false,
}: DeviceFormFieldsProps) {
  return (
    <>
      {/* Nhóm 1: Thông tin chung */}
      <div className="bg-background border-border/60 space-y-4 rounded-lg border p-5 shadow-sm">
        <div className="border-border/40 mb-2 flex items-center gap-2 border-b pb-2">
          <Info className="text-primary h-4 w-4" />
          <h3 className="text-muted-foreground text-xs font-bold tracking-widest">
            Thông tin chung
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs font-semibold">
                  Tên thiết bị <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="VD: PC-IT-001"
                    autoComplete="off"
                    autoFocus={
                      autoFocusName &&
                      typeof window !== 'undefined' &&
                      !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                    }
                    className="border-border/80 focus-visible:ring-primary/50 bg-muted/20 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={showTypeField ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
          {showTypeField && (
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-semibold">
                    Loại thiết bị
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger className="border-border/80 bg-muted/20 cursor-not-allowed font-medium opacity-70">
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
          )}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs font-semibold">
                  Trạng thái
                </FormLabel>
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

      {/* Nhóm 2: Thông số kỹ thuật */}
      <div className="bg-background border-border/60 space-y-4 rounded-lg border p-5 shadow-sm">
        <div className="border-border/40 mb-2 flex items-center gap-2 border-b pb-2">
          <Server className="text-primary h-4 w-4" />
          <h3 className="text-muted-foreground text-xs font-bold tracking-widest">
            Thông số kỹ thuật
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {fieldConfig?.os?.show && (
            <FormField
              control={form.control}
              name="os"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    OS
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Windows 11 Pro"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
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
                  <FormLabel className="text-muted-foreground text-xs font-medium">ARCH</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="x64"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
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
                  <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    CPU
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Intel i5-12400"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
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
                  <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    RAM
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="16 GB"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {fieldConfig?.storage?.show && (
            <FormField
              control={form.control}
              name="storage"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    Lưu trữ
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="512 GB SSD"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {fieldConfig?.gpu?.show && (
            <FormField
              control={form.control}
              name="gpu"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    GPU
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NVIDIA RTX 4060"
                      className="border-border/80 bg-muted/10 h-9 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {fieldConfig?.activationStatus?.show && (
            <FormField
              control={form.control}
              name="activationStatus"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel className="text-muted-foreground text-xs font-medium">
                    Kích hoạt Bản quyền OS
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/80 bg-muted/10 h-9 text-sm">
                        <SelectValue placeholder="Trạng thái kích hoạt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Actived" className="text-sm font-medium text-emerald-600">
                        Đã kích hoạt (Actived)
                      </SelectItem>
                      <SelectItem
                        value="Inactived"
                        className="text-destructive text-sm font-medium"
                      >
                        Chưa kích hoạt (Inactived)
                      </SelectItem>
                      <SelectItem value="Unknown" className="text-sm">
                        Chưa có thông tin (Unknown)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {fieldConfig?.screenSize?.show && (
            <FormField
              control={form.control}
              name="screenSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">
                    Kích thước
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/80 bg-muted/10 h-9 text-sm">
                        <SelectValue placeholder="Chọn cỡ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCREEN_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="text-sm">
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
                  <FormLabel className="text-muted-foreground text-xs font-medium">
                    Độ phân giải
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/80 bg-muted/10 h-9 text-sm">
                        <SelectValue placeholder="Chọn độ phân giải" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESOLUTION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="text-sm">
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
                  <FormLabel className="text-muted-foreground text-xs font-medium">
                    Cổng kết nối
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/80 bg-muted/10 h-9 text-sm">
                        <SelectValue placeholder="Chọn kết nối" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONNECTION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="text-sm">
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

      {/* Nhóm 3: Mạng & Kết nối */}
      {(fieldConfig?.ip?.show || fieldConfig?.mac?.show) && (
        <div className="bg-background border-border/60 space-y-4 rounded-lg border p-5 shadow-sm">
          <div className="border-border/40 mb-2 flex items-center gap-2 border-b pb-2">
            <Network className="text-primary h-4 w-4" />
            <h3 className="text-muted-foreground text-xs font-bold tracking-widest">
              TCP/IP & MAC Address
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {fieldConfig?.ip?.show && (
              <FormField
                control={form.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      IPv4 Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="192.168.1.xxx"
                        className="border-border/80 bg-muted/10 h-9 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                    <FormLabel className="text-muted-foreground text-xs font-medium">
                      MAC Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00:00:00:00:00:00"
                        className="border-border/80 bg-muted/10 h-9 text-center text-sm tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
