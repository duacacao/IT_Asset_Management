"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, User, Laptop, Mail, Phone, Building, Briefcase, FileText } from 'lucide-react'
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

export default function EndUsersPage() {
  const router = useRouter()
  const [endUsers, setEndUsers] = useState<EndUserWithDevice[]>([])
  const [availableDevices, setAvailableDevices] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
        toast.error("Lỗi tải dữ liệu: " + usersResult.error)
      } else {
        setEndUsers(usersResult.data || [])
      }

      if (devicesResult.error) {
        toast.error("Lỗi tải thiết bị: " + devicesResult.error)
      } else {
        setAvailableDevices(devicesResult.data || [])
      }
    } catch (error) {
      console.error("Lỗi fetch:", error)
      toast.error("Không thể tải dữ liệu")
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

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">End-Users</h1>
          <p className="text-muted-foreground">
            Quản lý người dùng cuối sử dụng thiết bị.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Thêm End-User
        </Button>
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
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {user.phone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.device_name ? (
                      <Badge variant="outline" className="gap-1">
                        <Laptop className="h-3 w-3" />
                        {user.device_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Chưa assign</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {user.department}
                        {user.position && <span className="text-muted-foreground">- {user.position}</span>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(user)}
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    </div>
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
                    <FormItem>
                      <FormLabel>Phòng ban</FormLabel>
                      <FormControl>
                        <Input placeholder="IT, Kế toán,..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chức vụ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhân viên, Trưởng phòng,..." {...field} />
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
    </div>
  )
}
