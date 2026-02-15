"use client"

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getProfile, updateProfile } from "@/app/actions/profile"
import { createClient } from "@/utils/supabase/client"
import { Loader2, User, Calendar, Shield } from 'lucide-react'

const accountFormSchema = z.object({
  full_name: z.string().min(1, "Tên không được để trống").max(100, "Tên quá dài"),
  email: z.string().email().readonly(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

interface UserData {
  email: string
  full_name: string
  role: string | null
  created_at: string
}

export default function AccountSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  })

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy thông tin từ Supabase Auth
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
          toast.error("Chưa đăng nhập")
          return
        }

        // Lấy thông tin từ Profile table
        const { data: profile, error } = await getProfile()

        if (error) {
          console.error("Lỗi lấy profile:", error)
          toast.error("Không thể tải thông tin tài khoản")
          return
        }

        const userData: UserData = {
          email: authUser.email || "",
          full_name: profile?.full_name || authUser.user_metadata?.full_name || "",
          role: profile?.role || "user",
          created_at: authUser.created_at || "",
        }

        setUserData(userData)

        // Fill form
        form.reset({
          email: userData.email,
          full_name: userData.full_name,
        })
      } catch (error) {
        console.error("Lỗi fetch user data:", error)
        toast.error("Không thể tải thông tin tài khoản")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [form])

  async function onSubmit(data: AccountFormValues) {
    setIsSaving(true)
    try {
      const { error } = await updateProfile({
        full_name: data.full_name,
      })

      if (error) {
        toast.error("Lỗi cập nhật: " + error)
        return
      }

      // Update local state
      setUserData(prev => prev ? { ...prev, full_name: data.full_name } : null)

      toast.success("Cập nhật thông tin thành công!")
    } catch (error) {
      console.error("Lỗi save:", error)
      toast.error("Không thể lưu thay đổi")
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin tài khoản của bạn.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin tài khoản
              </CardTitle>
              <CardDescription>
                Thông tin cơ bản của tài khoản đăng nhập.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled 
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <FormLabel className="text-muted-foreground">Vai trò</FormLabel>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={userData?.role === "admin" ? "default" : "secondary"}>
                      {userData?.role === "admin" ? "Admin" : "Người dùng"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-muted-foreground">Ngày tạo</FormLabel>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(userData?.created_at || "")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="cursor-pointer">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
