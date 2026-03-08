'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppLoader } from '@/components/ui/app-loader'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SmartCombobox } from '@/components/ui/smart-combobox'

import { EndUserWithDevice, EndUserInsert, EndUserUpdate } from '@/types/end-user'
import type { Position } from '@/types/department'
import {
  useCreateEndUserMutation,
  useUpdateEndUserMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from '@/hooks/mutations/endUserMutations'

import { DeviceAssignmentSelector } from './DeviceAssignmentSelector'

const endUserFormSchema = z.object({
  full_name: z.string().min(1, 'Họ tên không được để trống').max(100),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+\-\s()]{7,15}$/.test(val), {
      message: 'Số điện thoại không hợp lệ (7-15 ký tự)',
    }),
  department_id: z.string().min(1, 'Phòng ban là bắt buộc'),
  position_id: z.string().min(1, 'Chức vụ là bắt buộc'),
  notes: z.string().optional(),
})

type EndUserFormValues = z.infer<typeof endUserFormSchema>

interface Option {
  label: string
  value: string
}

interface DeviceOption {
  id: string
  name: string
  type: string | null
}

interface EndUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userToEdit: EndUserWithDevice | null
  departments: Option[]
  positions: Option[]
  rawPositions: Position[]
  selectableDevices: DeviceOption[]
  onSuccess: () => void
}

export function EndUserDialog({
  open,
  onOpenChange,
  userToEdit,
  departments,
  positions,
  rawPositions,
  selectableDevices,
  onSuccess,
}: EndUserDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([])

  // Mutations
  const createMutation = useCreateEndUserMutation()
  const updateMutation = useUpdateEndUserMutation()

  // Department Mutations
  const createDeptMutation = useCreateDepartmentMutation()
  const updateDeptMutation = useUpdateDepartmentMutation()
  const deleteDeptMutation = useDeleteDepartmentMutation()

  // Position Mutations
  const createPosMutation = useCreatePositionMutation()
  const updatePosMutation = useUpdatePositionMutation()
  const deletePosMutation = useDeletePositionMutation()

  const form = useForm<EndUserFormValues>({
    resolver: zodResolver(endUserFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      department_id: '',
      position_id: '',
      notes: '',
    },
  })

  const selectedDeptId = form.watch('department_id')

  // Filter positions by selected department
  const filteredPositions = useMemo(() => {
    if (!selectedDeptId) return positions
    const deptPositionIds = new Set(
      rawPositions
        .filter((p) => p.department_id === selectedDeptId)
        .map((p) => p.id)
    )
    // Show positions belonging to selected dept, plus those without dept
    if (deptPositionIds.size === 0) return positions
    return positions.filter((p) => deptPositionIds.has(p.value))
  }, [selectedDeptId, positions, rawPositions])

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (userToEdit) {
        form.reset({
          full_name: userToEdit.full_name,
          email: userToEdit.email || '',
          phone: userToEdit.phone || '',
          department_id: userToEdit.department_id || '',
          position_id: userToEdit.position_id || '',
          notes: userToEdit.notes || '',
        })
        setSelectedDeviceIds(userToEdit.devices?.map((d) => d.id) || [])
      } else {
        form.reset({
          full_name: '',
          email: '',
          phone: '',
          department_id: '',
          position_id: '',
          notes: '',
        })
        setSelectedDeviceIds([])
      }
    }
  }, [open, userToEdit, form])

  async function onSubmit(data: EndUserFormValues) {
    setIsSaving(true)
    try {
      if (userToEdit) {
        // Update
        const payload: EndUserUpdate = {
          full_name: data.full_name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          department_id: data.department_id,
          position_id: data.position_id,
          notes: data.notes || undefined,
          device_ids: selectedDeviceIds,
          existing_devices: userToEdit.devices || [],
        }
        await updateMutation.mutateAsync({ id: userToEdit.id, data: payload })
      } else {
        // Create
        const payload: EndUserInsert = {
          full_name: data.full_name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          department_id: data.department_id,
          position_id: data.position_id,
          notes: data.notes || undefined,
          device_ids: selectedDeviceIds,
        }
        await createMutation.mutateAsync(payload)
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Lỗi save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="flex w-full flex-col sm:m-2 sm:h-[calc(100vh-1rem)] sm:max-w-xl sm:rounded-xl sm:border sm:border-border/50 sm:shadow-2xl"
      >
        <SheetHeader className="mb-0 space-y-1 pb-0">
          <div className="flex items-center space-x-2">
            <span className="dark:bg-card text-primary rounded-md bg-white px-2 py-0.5 text-xs font-medium tracking-wider shadow-sm">
              {userToEdit ? 'Đang chỉnh sửa' : 'Tạo mới'}
            </span>
          </div>
          <SheetTitle>{userToEdit ? 'Sửa nhân viên' : 'Thêm nhân viên'}</SheetTitle>
          <SheetDescription>
            {userToEdit ? 'Cập nhật thông tin người dùng.' : 'Thêm người dùng cuối mới.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-muted/10 flex h-full flex-col overflow-hidden rounded-lg p-1"
            >
              {/* Scrollable Content Area with Fade Mask */}
              <div
                className="flex-1 overflow-y-auto pr-3 pl-4"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent, black 8px, black calc(100% - 16px), transparent)',
                }}
              >
                <div className="space-y-6 pt-2 pb-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="0123-456-789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Phòng ban</FormLabel>
                          <SmartCombobox
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val)
                              // Reset position when department changes
                              if (val !== field.value) {
                                form.setValue('position_id', '')
                              }
                            }}
                            options={departments}
                            placeholder="Chọn phòng ban..."
                            searchPlaceholder="Tìm kiếm phòng ban..."
                            emptyText="Không tìm thấy phòng ban nào."
                            creatable
                            createLabel="Thêm phòng ban mới"
                            onCreate={async (value) => {
                              const result = await createDeptMutation.mutateAsync({ name: value })
                              if (result?.id) field.onChange(result.id)
                            }}
                            editable
                            onEdit={async (id, newValue) => {
                              if (
                                !newValue ||
                                newValue === departments.find((d) => d.value === id)?.label
                              )
                                return
                              await updateDeptMutation.mutateAsync({ id, name: newValue })
                            }}
                            deletable
                            onDelete={async (id) => {
                              await deleteDeptMutation.mutateAsync(id)
                              if (field.value === id) field.onChange('')
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Chức vụ</FormLabel>
                          <SmartCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            options={filteredPositions}
                            placeholder="Chọn chức vụ..."
                            searchPlaceholder="Tìm kiếm chức vụ..."
                            emptyText="Không tìm thấy chức vụ nào."
                            creatable
                            createLabel="Thêm chức vụ mới"
                            onCreate={async (value) => {
                              const result = await createPosMutation.mutateAsync({ name: value, department_id: selectedDeptId || undefined })
                              if (result?.id) field.onChange(result.id)
                            }}
                            editable
                            onEdit={async (id, newValue) => {
                              if (!newValue || newValue === positions.find((p) => p.value === id)?.label)
                                return
                              await updatePosMutation.mutateAsync({ id, name: newValue })
                            }}
                            deletable
                            onDelete={async (id) => {
                              await deletePosMutation.mutateAsync(id)
                              if (field.value === id) field.onChange('')
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Device Selector Component */}
                  <DeviceAssignmentSelector
                    selectedDeviceIds={selectedDeviceIds}
                    onChange={setSelectedDeviceIds}
                    selectableDevices={selectableDevices}
                    disabled={isSaving}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ghi chú thêm..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Fixed Sticky Footer */}
              <div className="border-border/40 bg-background/50 -mx-1 mt-auto -mb-1 flex-shrink-0 rounded-b-lg border-t px-6 py-3 backdrop-blur-md">
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="min-w-[80px] font-medium shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <AppLoader layout="horizontal" hideText className="mr-2 h-4 w-4" />
                        <span>Đang lưu…</span>
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
      </SheetContent>
    </Sheet>
  )
}
