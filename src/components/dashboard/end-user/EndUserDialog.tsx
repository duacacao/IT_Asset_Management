'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppLoader } from '@/components/ui/app-loader'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  phone: z.string().optional(),
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
  selectableDevices: DeviceOption[]
  onSuccess: () => void
}

export function EndUserDialog({
  open,
  onOpenChange,
  userToEdit,
  departments,
  positions,
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
        toast.success('Cập nhật thành công')
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
        toast.success('Tạo mới thành công')
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Lỗi save:', error)
      toast.error('Không thể lưu')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Sửa End-User' : 'Thêm End-User'}</DialogTitle>
          <DialogDescription>
            {userToEdit ? 'Cập nhật thông tin người dùng.' : 'Thêm người dùng cuối mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      onValueChange={field.onChange}
                      options={departments}
                      placeholder="Chọn phòng ban..."
                      searchPlaceholder="Tìm kiếm phòng ban..."
                      emptyText="Không tìm thấy phòng ban nào."
                      creatable
                      createLabel="Thêm phòng ban mới"
                      onCreate={async (value) => {
                        const result = await createDeptMutation.mutateAsync(value)
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
                      options={positions}
                      placeholder="Chọn chức vụ..."
                      searchPlaceholder="Tìm kiếm chức vụ..."
                      emptyText="Không tìm thấy chức vụ nào."
                      creatable
                      createLabel="Thêm chức vụ mới"
                      onCreate={async (value) => {
                        const result = await createPosMutation.mutateAsync(value)
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className="cursor-pointer">
                {isSaving ? (
                  <>
                    <AppLoader layout="horizontal" hideText className="mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
