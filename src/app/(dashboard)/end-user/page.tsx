"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, User, Laptop, Building, Briefcase, FileText, MoreHorizontal, Eye } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ComboBox } from "@/components/ui/combobox"
import { EndUserWithDevice, EndUserInsert, EndUserUpdate } from '@/types/end-user'
import { getEndUsers, createEndUser, updateEndUser, deleteEndUser, getAvailableDevices } from '@/app/actions/end-users'

const endUserFormSchema = z.object({
  full_name: z.string().min(1, "Họ tên không được để trống").max(100),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
  device_id: z.string().optional(),
})

type EndUserFormValues = z.infer<typeof endUserFormSchema>

function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    'IT': 'bg-purple-100 text-purple-700 border-purple-200',
    'Kế toán': 'bg-green-100 text-green-700 border-green-200',
    'Nhân sự': 'bg-pink-100 text-pink-700 border-pink-200',
    'Kinh doanh': 'bg-orange-100 text-orange-700 border-orange-200',
    'Marketing': 'bg-blue-100 text-blue-700 border-blue-200',
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
  const [endUsers, setEndUsers] = useState<EndUserWithDevice[]>([])
  const [availableDevices, setAvailableDevices] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([])
  const [positions, setPositions] = useState<{ label: string; value: string }[]>([])
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    position: "",
  })

  const form = useForm<EndUserFormValues>({
    resolver: zodResolver(endUserFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      notes: "",
      device_id: "",
    },
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [usersResult, devicesResult] = await Promise.all([
        getEndUsers(),
        getAvailableDevices()
      ])

      if (usersResult.error) {
        console.log("Lỗi tải end-users:", usersResult.error)
        setEndUsers([])
        setDepartments([])
        setPositions([])
      } else {
        const users = usersResult.data || []
        setEndUsers(users)
        
        const deptSet = new Set(users.map(u => u.department).filter(Boolean) as string[])
        const posSet = new Set(users.map(u => u.position).filter(Boolean) as string[])
        
        setDepartments(Array.from(deptSet).map(d => ({ label: d, value: d })).sort((a, b) => a.label.localeCompare(b.label)))
        setPositions(Array.from(posSet).map(p => ({ label: p, value: p })).sort((a, b) => a.label.localeCompare(b.label)))
      }

      if (devicesResult.error) {
        console.log("Lỗi tải thiết bị:", devicesResult.error)
        setAvailableDevices([])
      } else {
        setAvailableDevices(devicesResult.data || [])
      }
    } catch (error) {
      console.error("Lỗi fetch:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenDialog = (user?: EndUserWithDevice) => {
    if (user) {
      setEditingId(user.id)
      form.reset({
        full_name: user.full_name,
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        position: user.position || "",
        notes: user.notes || "",
        device_id: user.device_id || "",
      })
    } else {
      setEditingId(null)
      form.reset({
        full_name: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        notes: "",
        device_id: "",
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
        department: data.department || undefined,
        position: data.position || undefined,
        notes: data.notes || undefined,
        device_id: data.device_id || undefined,
      }

      let result
      if (editingId) {
        const updatePayload: EndUserUpdate = { ...payload }
        result = await updateEndUser(editingId, updatePayload)
      } else {
        const createPayload: EndUserInsert = payload
        result = await createEndUser(createPayload)
      }

      if (result.error) {
        toast.error("Lỗi: " + result.error)
        return
      }

      toast.success(editingId ? "Cập nhật thành công!" : "Thêm mới thành công!")
      handleCloseDialog()
      fetchData()
    } catch (error) {
      console.error("Lỗi save:", error)
      toast.error("Không thể lưu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const result = await deleteEndUser(deletingId)
      if (result.error) {
        toast.error("Lỗi xóa: " + result.error)
        return
      }
      toast.success("Xóa thành công!")
      setDeletingId(null)
      fetchData()
    } catch (error) {
      console.error("Lỗi delete:", error)
      toast.error("Không thể xóa")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    try {
      const deletePromises = Array.from(selectedIds).map(id => deleteEndUser(id))
      const results = await Promise.all(deletePromises)
      
      const hasError = results.some(r => r.error)
      if (hasError) {
        toast.error("Một số xóa thất bại")
      } else {
        toast.success(`Đã xóa ${selectedIds.size} end-user`)
      }
      
      setSelectedIds(new Set())
      fetchData()
    } catch (error) {
      console.error("Lỗi bulk delete:", error)
      toast.error("Không thể xóa")
    }
  }

  const filteredUsers = endUsers.filter(user => {
    const matchSearch = !filters.search || 
      user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone?.includes(filters.search)
    const matchDepartment = !filters.department || user.department === filters.department
    const matchPosition = !filters.position || user.position === filters.position
    return matchSearch && matchDepartment && matchPosition
  })

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">End-Users</h1>
          <p className="text-muted-foreground">
            Quản lý người dùng cuối sử dụng thiết bị.
          </p>
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
                    Bạn có chắc muốn xóa {selectedIds.size} end-user? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
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

      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <Input
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          className="max-w-[300px]"
        />
        <Select 
          value={filters.department || "__all__"} 
          onValueChange={(v) => setFilters(f => ({ ...f, department: v === "__all__" ? "" : v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả phòng ban</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={filters.position || "__all__"} 
          onValueChange={(v) => setFilters(f => ({ ...f, position: v === "__all__" ? "" : v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả chức vụ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả chức vụ</SelectItem>
            {positions.map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filters.search || filters.department || filters.position) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFilters({ search: "", department: "", position: "" })}
          >
            Xóa lọc
          </Button>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {filteredUsers.length} / {endUsers.length} kết quả
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : endUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <User className="h-12 w-12 mb-4" />
          <p>Chưa có end-user nào</p>
          <Button variant="link" onClick={() => handleOpenDialog()}>
            Thêm end-user đầu tiên
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size > 0 && selectedIds.size === endUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(new Set(endUsers.map(u => u.id)))
                      } else {
                        setSelectedIds(new Set())
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-[180px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        Họ tên
                        {filters.search && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">●</Badge>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <div className="p-2">
                        <Input
                          placeholder="Tìm kiếm..."
                          value={filters.search}
                          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                      {filters.search && (
                        <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, search: "" }))}>
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
                      <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        Phòng ban
                        {filters.department && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">●</Badge>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, department: "" }))}>
                        Tất cả
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {departments.map(dept => (
                        <DropdownMenuItem key={dept.value} onClick={() => setFilters(f => ({ ...f, department: dept.value }))}>
                          {dept.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[100px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                        Chức vụ
                        {filters.position && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px]">●</Badge>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, position: "" }))}>
                        Tất cả
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {positions.map(pos => (
                        <DropdownMenuItem key={pos.value} onClick={() => setFilters(f => ({ ...f, position: pos.value }))}>
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
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium truncate">{user.full_name}</span>
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
                        {user.device_type && <span className="text-muted-foreground">({user.device_type})</span>}
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa End-User?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn xóa "{user.full_name}"? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Sửa End-User" : "Thêm End-User"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "Cập nhật thông tin người dùng." : "Thêm người dùng cuối mới."}
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
                  name="department"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Phòng ban</FormLabel>
                      <FormControl>
                        <ComboBox
                          value={field.value}
                          onValueChange={field.onChange}
                          options={departments}
                          placeholder="Chọn phòng ban..."
                          creatable
                          createLabel="Thêm phòng ban mới"
                          onCreateNew={(value) => {
                            const newDept = { label: value, value }
                            setDepartments([...departments, newDept].sort((a, b) => a.label.localeCompare(b.label)))
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Chức vụ</FormLabel>
                      <FormControl>
                        <ComboBox
                          value={field.value}
                          onValueChange={field.onChange}
                          options={positions}
                          placeholder="Chọn chức vụ..."
                          creatable
                          createLabel="Thêm chức vụ mới"
                          onCreateNew={(value) => {
                            const newPos = { label: value, value }
                            setPositions([...positions, newPos].sort((a, b) => a.label.localeCompare(b.label)))
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thiết bị</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "__none__" ? undefined : val)} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thiết bị..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Chưa assign</SelectItem>
                        {availableDevices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({device.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                    "Lưu"
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
            const user = endUsers.find(u => u.id === viewingId)
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
                  <label className="text-sm font-medium">Thiết bị</label>
                  <Input 
                    value={user.device_name ? `${user.device_name} (${user.device_type || 'N/A'})` : 'Chưa assign'} 
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
            <Button type="button" onClick={() => {
              const user = endUsers.find(u => u.id === viewingId)
              if (user) {
                setViewingId(null)
                handleOpenDialog(user)
              }
            }} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
