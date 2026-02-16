'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  User,
  Eye,
  Laptop,
  Building,
  Briefcase,
  FileText,
  MoreHorizontal,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SmartCombobox } from '@/components/ui/smart-combobox'
import { EndUserWithDevice, EndUserInsert, EndUserUpdate } from '@/types/end-user'
import {
  useEndUsersQuery,
  useDepartmentsQuery,
  usePositionsQuery,
  useCreateEndUserMutation,
  useUpdateEndUserMutation,
  useDeleteEndUserMutation,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from '@/hooks/useEndUsersQuery'

const endUserFormSchema = z.object({
  full_name: z.string().min(1, 'Họ tên không được để trống').max(100),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().optional(),
  department_id: z.string().min(1, 'Phòng ban là bắt buộc'),
  position_id: z.string().min(1, 'Chức vụ là bắt buộc'),
  notes: z.string().optional(),
})

type EndUserFormValues = z.infer<typeof endUserFormSchema>

function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    IT: 'bg-purple-100 text-purple-700 border-purple-200',
    'Kế toán': 'bg-green-100 text-green-700 border-green-200',
    'Nhân sự': 'bg-pink-100 text-pink-700 border-pink-200',
    'Kinh doanh': 'bg-orange-100 text-orange-700 border-orange-200',
    Marketing: 'bg-blue-100 text-blue-700 border-blue-200',
    'Kỹ thuật': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Hành chính': 'bg-gray-100 text-gray-700 border-gray-200',
    'Tài chính': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Pháp lý': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Vận hành': 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return colors[department] || 'bg-slate-100 text-slate-700 border-slate-200'
}

function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    'Giám đốc': 'bg-red-100 text-red-700 border-red-200',
    'Trưởng phòng': 'bg-orange-100 text-orange-700 border-orange-200',
    'Phó phòng': 'bg-amber-100 text-amber-700 border-amber-200',
    'Trưởng nhóm': 'bg-violet-100 text-violet-700 border-violet-200',
    'Nhân viên': 'bg-blue-100 text-blue-700 border-blue-200',
    'Thực tập': 'bg-green-100 text-green-700 border-green-200',
    'Kế toán trưởng': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Kỹ sư': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  }
  return colors[position] || 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function EndUsersPage() {
  const router = useRouter()

  // React Query Hooks
  const { data: endUsers = [], isLoading: isLoadingUsers } = useEndUsersQuery()
  const { data: departments = [] } = useDepartmentsQuery()
  const { data: positions = [] } = usePositionsQuery()

  // Mutations
  const createMutation = useCreateEndUserMutation()
  const updateMutation = useUpdateEndUserMutation()
  const deleteMutation = useDeleteEndUserMutation()
  const createDeptMutation = useCreateDepartmentMutation()
  const updateDeptMutation = useUpdateDepartmentMutation()
  const deleteDeptMutation = useDeleteDepartmentMutation()
  const createPosMutation = useCreatePositionMutation()
  const updatePosMutation = useUpdatePositionMutation()
  const deletePosMutation = useDeletePositionMutation()

  // Local UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    position: '',
  })

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

  const handleOpenDialog = (user?: EndUserWithDevice) => {
    if (user) {
      setEditingId(user.id)
      form.reset({
        full_name: user.full_name,
        email: user.email || '',
        phone: user.phone || '',
        department_id: user.department_id || '',
        position_id: user.position_id || '',
        notes: user.notes || '',
      })
    } else {
      setEditingId(null)
      form.reset({
        full_name: '',
        email: '',
        phone: '',
        department_id: '',
        position_id: '',
        notes: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingId(null)
    form.reset()
  }

  async function onSubmit(data: EndUserFormValues) {
    setIsSaving(true)
    try {
      const payload = {
        full_name: data.full_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        department_id: data.department_id,
        position_id: data.position_id,
        notes: data.notes || undefined,
      }

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      handleCloseDialog()
    } catch (error) {
      console.error('Lỗi save:', error)
      toast.error('Không thể lưu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await deleteMutation.mutateAsync(deletingId)
      setDeletingId(null)
    } catch (error) {
      console.error('Lỗi delete:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    try {
      const deletePromises = Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id))
      await Promise.all(deletePromises)
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Lỗi bulk delete:', error)
    }
  }

  const filteredUsers = endUsers.filter((user) => {
    const matchSearch =
      !filters.search ||
      user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone?.includes(filters.search)
    const matchDepartment = !filters.department || user.department_id === filters.department
    const matchPosition = !filters.position || user.position_id === filters.position
    return matchSearch && matchDepartment && matchPosition
  })

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">End-Users</h1>
          <p className="text-muted-foreground">Quản lý người dùng cuối sử dụng thiết bị.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa đã chọn ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa nhiều End-User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn xóa {selectedIds.size} end-user? Hành động này không thể hoàn
                    tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Thêm End-User
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 flex items-center gap-4 rounded-lg p-4">
        <Input
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="max-w-[300px]"
        />
        <div className="flex items-center gap-1">
          <Select
            value={filters.department || '__all__'}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, department: v === '__all__' ? '' : v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả phòng ban</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Select
            value={filters.position || '__all__'}
            onValueChange={(v) => setFilters((f) => ({ ...f, position: v === '__all__' ? '' : v }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả chức vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả chức vụ</SelectItem>
              {positions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(filters.search || filters.department || filters.position) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ search: '', department: '', position: '' })}
          >
            Xóa lọc
          </Button>
        )}
        <span className="text-muted-foreground ml-auto text-sm">
          {filteredUsers.length} / {endUsers.length} kết quả
        </span>
      </div>

      {isLoadingUsers ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : endUsers.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
          <User className="mb-4 h-12 w-12" />
          <p>Chưa có end-user nào</p>
          <Button variant="link" onClick={() => handleOpenDialog()}>
            Thêm end-user đầu tiên
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size > 0 && selectedIds.size === endUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(new Set(endUsers.map((u) => u.id)))
                      } else {
                        setSelectedIds(new Set())
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-[180px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="data-[state=open]:bg-accent -ml-3 h-8"
                      >
                        Họ tên
                        {filters.search && (
                          <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                            ●
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <div className="p-2">
                        <Input
                          placeholder="Tìm kiếm..."
                          value={filters.search}
                          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                      {filters.search && (
                        <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, search: '' }))}>
                          Xóa filter
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead className="w-[120px]">Điện thoại</TableHead>
                <TableHead className="w-[180px]">Thiết bị</TableHead>
                <TableHead className="w-[110px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="data-[state=open]:bg-accent -ml-3 h-8"
                      >
                        Phòng ban
                        {filters.department && (
                          <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                            ●
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuItem
                        onClick={() => setFilters((f) => ({ ...f, department: '' }))}
                      >
                        Tất cả
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {departments.map((dept) => (
                        <DropdownMenuItem
                          key={dept.value}
                          onClick={() => setFilters((f) => ({ ...f, department: dept.value }))}
                        >
                          {dept.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[100px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="data-[state=open]:bg-accent -ml-3 h-8"
                      >
                        Chức vụ
                        {filters.position && (
                          <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">
                            ●
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, position: '' }))}>
                        Tất cả
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {positions.map((pos) => (
                        <DropdownMenuItem
                          key={pos.value}
                          onClick={() => setFilters((f) => ({ ...f, position: pos.value }))}
                        >
                          {pos.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedIds)
                        if (checked) {
                          newSet.add(user.id)
                        } else {
                          newSet.delete(user.id)
                        }
                        setSelectedIds(newSet)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate font-medium">{user.full_name}</span>
                        </TooltipTrigger>
                        <TooltipContent>{user.full_name}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.email ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate">{user.email}</span>
                        </TooltipTrigger>
                        <TooltipContent>{user.email}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate">{user.phone}</span>
                        </TooltipTrigger>
                        <TooltipContent>{user.phone}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.device_name ? (
                      <Badge variant="outline" className="gap-1">
                        <Laptop className="h-3 w-3 shrink-0" />
                        {user.device_name}
                        {user.device_type && (
                          <span className="text-muted-foreground">({user.device_type})</span>
                        )}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Chưa assign</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <Badge className={getDepartmentColor(user.department)}>
                        {user.department}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.position ? (
                      <Badge variant="outline" className={getPositionColor(user.position)}>
                        {user.position}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingId(user.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingId(user.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog Delete Single User */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa End-User?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{endUsers.find((u) => u.id === deletingId)?.full_name}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa End-User' : 'Thêm End-User'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Cập nhật thông tin người dùng.' : 'Thêm người dùng cuối mới.'}
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
                          if (result?.id) {
                            field.onChange(result.id)
                          }
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
                          if (result?.id) {
                            field.onChange(result.id)
                          }
                        }}
                        editable
                        onEdit={async (id, newValue) => {
                          if (
                            !newValue ||
                            newValue === positions.find((p) => p.value === id)?.label
                          )
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

              {/* Thiết bị được gán qua device_assignments — quản lý riêng */}

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
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSaving} className="cursor-pointer">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      <Dialog open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết End-User</DialogTitle>
          </DialogHeader>

          {(() => {
            const user = endUsers.find((u) => u.id === viewingId)
            if (!user) return null

            return (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <Input value={user.full_name} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.email || '-'} disabled />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Điện thoại</label>
                    <Input value={user.phone || '-'} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Phòng ban</label>
                    <Input value={user.department || '-'} disabled />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Chức vụ</label>
                    <Input value={user.position || '-'} disabled />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Thiết bị đang sử dụng</label>
                  <Input
                    value={
                      user.device_name
                        ? `${user.device_name} (${user.device_type || 'N/A'})`
                        : 'Chưa gán thiết bị'
                    }
                    disabled
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Ghi chú</label>
                  <Textarea value={user.notes || '-'} disabled className="min-h-[80px]" />
                </div>
              </div>
            )
          })()}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingId(null)}>
              Đóng
            </Button>
            <Button
              type="button"
              onClick={() => {
                const user = endUsers.find((u) => u.id === viewingId)
                if (user) {
                  setViewingId(null)
                  handleOpenDialog(user)
                }
              }}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
