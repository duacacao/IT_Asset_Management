'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  useCreatePositionMutation,
  useDeletePositionMutation,
} from '@/hooks/mutations/endUserMutations'
import type { Department, Position } from '@/types/department'

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
  positions: Position[]
}

export function DepartmentDialog({ open, onOpenChange, deptToEdit, departments, positions }: DepartmentDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [newPositionName, setNewPositionName] = useState('')
  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()
  const createPosMutation = useCreatePositionMutation()
  const deletePosMutation = useDeletePositionMutation()

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
      setNewPositionName('')
    }
  }, [open, deptToEdit, form])

  // Positions belonging to this department
  const deptPositions = deptToEdit
    ? positions.filter((p) => p.department_id === deptToEdit.id)
    : []

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

  async function handleAddPosition() {
    const trimmed = newPositionName.trim()
    if (!trimmed || !deptToEdit) return
    try {
      await createPosMutation.mutateAsync({ name: trimmed, department_id: deptToEdit.id })
      setNewPositionName('')
    } catch {
      // Error handled by mutation
    }
  }

  async function handleRemovePosition(posId: string) {
    try {
      await deletePosMutation.mutateAsync(posId)
    } catch {
      // Error handled by mutation
    }
  }

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
              {deptToEdit ? 'Đang chỉnh sửa' : 'Tạo mới'}
            </span>
          </div>
          <SheetTitle>{deptToEdit ? 'Sửa phòng ban' : 'Thêm phòng ban'}</SheetTitle>
          <SheetDescription>
            {deptToEdit
              ? 'Cập nhật thông tin phòng ban.'
              : 'Tạo phòng ban mới trong tổ chức.'}
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
                        <FormLabel>Trực thuộc</FormLabel>
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

                  {/* Chức vụ — chỉ hiển thị khi sửa phòng ban (đã có ID) */}
                  {deptToEdit && (
                    <div className="space-y-2">
                      <FormLabel>Chức vụ</FormLabel>
                      {deptPositions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {deptPositions.map((p) => (
                            <Badge
                              key={p.id}
                              variant="secondary"
                              className="gap-1 rounded-lg pr-1 text-xs"
                            >
                              {p.name}
                              <button
                                type="button"
                                onClick={() => handleRemovePosition(p.id)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
                                title="Xóa chức vụ"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Chưa có chức vụ nào</p>
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tên chức vụ mới..."
                          className="rounded-xl border-border/50 text-sm"
                          value={newPositionName}
                          onChange={(e) => setNewPositionName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddPosition()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddPosition}
                          disabled={!newPositionName.trim() || createPosMutation.isPending}
                          className="cursor-pointer rounded-xl shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
                    ) : deptToEdit ? (
                      <span>Cập nhật</span>
                    ) : (
                      <span>Tạo mới</span>
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
