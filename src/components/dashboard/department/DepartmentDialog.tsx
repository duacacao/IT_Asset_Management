'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppLoader } from '@/components/ui/app-loader'
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from '@/hooks/mutations/endUserMutations'
import type { Department } from '@/types/department'

const deptFormSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban không được để trống').max(100, 'Tên quá dài'),
  parent_id: z.string().nullable().optional(),
})

type DeptFormValues = z.infer<typeof deptFormSchema>

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deptToEdit: Department | null
  departments: Department[]
}

export function DepartmentDialog({ open, onOpenChange, deptToEdit, departments }: DepartmentDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()

  const form = useForm<DeptFormValues>({
    resolver: zodResolver(deptFormSchema),
    defaultValues: { name: '', parent_id: null },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: deptToEdit?.name || '',
        parent_id: deptToEdit?.parent_id || null,
      })
    }
  }, [open, deptToEdit, form])

  // Exclude self and children from parent options to prevent circular references
  const availableParents = departments.filter((d) => {
    if (!deptToEdit) return true
    if (d.id === deptToEdit.id) return false
    // Check if d is a descendant of the dept being edited
    let current: Department | undefined = d
    while (current?.parent_id) {
      if (current.parent_id === deptToEdit.id) return false
      current = departments.find((dep) => dep.id === current!.parent_id)
    }
    return true
  })

  async function onSubmit(data: DeptFormValues) {
    setIsSaving(true)
    try {
      if (deptToEdit) {
        await updateMutation.mutateAsync({
          id: deptToEdit.id,
          name: data.name,
          parent_id: data.parent_id || null,
        })
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          parent_id: data.parent_id || null,
        })
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border-border/50 shadow-lg sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{deptToEdit ? 'Sửa phòng ban' : 'Thêm phòng ban'}</DialogTitle>
          <DialogDescription>
            {deptToEdit
              ? 'Cập nhật thông tin phòng ban.'
              : 'Tạo phòng ban mới trong tổ chức.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên phòng ban</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Phòng IT"
                      className="rounded-xl border-border/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban cha</FormLabel>
                  <Select
                    value={field.value || '__none__'}
                    onValueChange={(val) => field.onChange(val === '__none__' ? null : val)}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border/50">
                        <SelectValue placeholder="Không có (phòng ban gốc)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/50 shadow-md">
                      <SelectItem value="__none__">Không có (phòng ban gốc)</SelectItem>
                      {availableParents.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
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
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="cursor-pointer rounded-xl"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving} className="cursor-pointer rounded-xl">
                {isSaving ? (
                  <>
                    <AppLoader layout="horizontal" hideText className="mr-2" />
                    Đang lưu...
                  </>
                ) : deptToEdit ? (
                  'Cập nhật'
                ) : (
                  'Tạo mới'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
