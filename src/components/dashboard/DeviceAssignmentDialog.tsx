'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLoader } from '@/components/ui/app-loader'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { assignDevice, type AssignDeviceResult } from '@/app/actions/device-assignments'
import { getEndUsers } from '@/app/actions/end-users'
import { getAvailableDevices } from '@/app/actions/end-users'
import { EndUserWithDevice } from '@/types/end-user'
import { queryKeys } from '@/hooks/queries/queryKeys'

interface DeviceAssignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  deviceId?: string // If provided, we are assigning THIS device to a user
  userId?: string // If provided, we are assigning a device TO this user
  deviceName?: string // Display name for context
  userName?: string // Display name for context
  currentEndUserId?: string // ID nhân viên đang giữ thiết bị (để highlight trong dropdown)
}

export function DeviceAssignmentDialog({
  isOpen,
  onClose,
  onSuccess,
  deviceId,
  userId,
  deviceName,
  userName,
  currentEndUserId,
}: DeviceAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const [selectedDevice, setSelectedDevice] = useState<string>(deviceId || '')
  const [selectedUser, setSelectedUser] = useState<string>(userId || '')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // State cho smart reassign confirm
  const [reassignInfo, setReassignInfo] = useState<{
    needsConfirm: boolean
    currentEndUserName: string | null
  }>({ needsConfirm: false, currentEndUserName: null })

  // Data for selection
  const [users, setUsers] = useState<EndUserWithDevice[]>([])
  const [availableDevices, setAvailableDevices] = useState<
    { id: string; name: string; type: string }[]
  >([])

  const [openUserCombobox, setOpenUserCombobox] = useState(false)
  const [openDeviceCombobox, setOpenDeviceCombobox] = useState(false)

  // Fetch data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setIsLoadingData(true)
        try {
          // If we need to select a user (assigning a device)
          if (deviceId && !userId) {
            const res = await getEndUsers()
            if (res.data) setUsers(res.data.endUsers || [])
          }

          // If we need to select a device (assigning to a user)
          if (userId && !deviceId) {
            const res = await getAvailableDevices()
            if (res.data) setAvailableDevices(res.data)
          }
        } catch (error) {
          console.error('Error loading assignment data:', error)
          toast.error('Không thể tải dữ liệu danh sách')
        } finally {
          setIsLoadingData(false)
        }
      }

      loadData()
      // Reset form
      if (!deviceId) setSelectedDevice('')
      if (!userId) setSelectedUser('')
      if (deviceId) setSelectedDevice(deviceId)
      if (userId) setSelectedUser(userId)
      setNotes('')
      // Reset reassign confirm state khi dialog mở lại
      setReassignInfo({ needsConfirm: false, currentEndUserName: null })
    }
  }, [isOpen, deviceId, userId])

  // Hàm invalidate tất cả query liên quan sau khi assign thành công
  // Optimistic update: device cache đã được update, chỉ invalidate endUsers và availableDevices
  const invalidateRelatedQueries = () => {
    // Bỏ refetchType: 'all' - device cache đã update rồi, chỉ refetch queries đang hiển thị
    queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.all })
  }

  // Optimistic update: Update cache trực tiếp trước khi invalidate
  const updateDeviceCacheOptimistically = (
    deviceId: string,
    userId: string,
    userName: string,
    userEmail?: string | null
  ) => {
    const now = new Date().toISOString()
    const newAssignment = {
      id: `temp-${Date.now()}`, // Temporary ID sẽ được server overwrite
      end_user_id: userId,
      assignee_name: userName,
      assignee_email: userEmail,
      assigned_at: now,
    }

    // Update devices.detail cache — cấu trúc: { device: Device, sheetIdMap, rawSheets }
    queryClient.setQueryData(queryKeys.devices.detail(deviceId), (old: any) => {
      if (!old?.device) return old
      return {
        ...old,
        device: {
          ...old.device,
          assignment: newAssignment,
          status: 'active',
        },
      }
    })

    // Update devices.list cache (là array, không phải pages object)
    queryClient.setQueryData(queryKeys.devices.list(), (old: any) => {
      if (!old || !Array.isArray(old)) return old
      return old.map((device: any) =>
        device.id === deviceId
          ? { ...device, assignment: newAssignment, status: 'active' }
          : device
      )
    })
  }

  // Xử lý assign — hỗ trợ smart reassign
  const handleAssign = async (forceReassign: boolean = false) => {
    if (!selectedDevice || !selectedUser) {
      toast.error('Vui lòng chọn đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)
    try {
      const result: AssignDeviceResult = await assignDevice(
        selectedDevice,
        selectedUser,
        forceReassign
      )

      // Trường hợp cần xác nhận chuyển thiết bị
      if (result.needsReassign && !forceReassign) {
        setReassignInfo({
          needsConfirm: true,
          currentEndUserName: result.currentEndUserName || 'Unknown',
        })
        setIsSubmitting(false)
        return
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        const msg = forceReassign ? 'Đã chuyển thiết bị thành công' : 'Gán thiết bị thành công'
        toast.success(msg)
        // Optimistic update cache trước
        const selectedUserData = users.find((u) => u.id === selectedUser)
        updateDeviceCacheOptimistically(
          selectedDevice,
          selectedUser,
          selectedUserData?.full_name || 'Unknown',
          selectedUserData?.email
        )
        // Self-invalidate React Query cache → UI tự refresh
        invalidateRelatedQueries()
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error(error)
      toast.error('Đã có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine mode
  const isAssigningToUser = !!userId
  const isAssigningDevice = !!deviceId

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-border/50 shadow-lg">
        <DialogHeader>
          <DialogTitle>Gán thiết bị</DialogTitle>
          <DialogDescription>
            {isAssigningDevice
              ? `Gán thiết bị "${deviceName || 'này'}" cho nhân viên.`
              : `Chọn thiết bị cho nhân viên "${userName || 'này'}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* USER SELECTION (Show if assigning a device) */}
          {isAssigningDevice && !userId && (
            <div className="grid gap-2">
              <Label>Nhân viên</Label>
              <Popover open={openUserCombobox} onOpenChange={setOpenUserCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openUserCombobox}
                    className="w-full justify-between"
                  >
                    {selectedUser
                      ? users.find((u) => u.id === selectedUser)?.full_name
                      : 'Chọn nhân viên...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 rounded-xl border-border/50 shadow-md">
                  <Command>
                    <CommandInput placeholder="Tìm nhân viên..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => {
                          const isCurrentHolder = currentEndUserId === user.id
                          return (
                            <CommandItem
                              key={user.id}
                              value={user.full_name}
                              onSelect={() => {
                                setSelectedUser(user.id)
                                setOpenUserCombobox(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 shrink-0',
                                  selectedUser === user.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span>{user.full_name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {user.email || 'No email'}
                                </span>
                              </div>
                              {isCurrentHolder && (
                                <Check className="ml-auto h-4 w-4 shrink-0 text-green-600" />
                              )}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* DEVICE SELECTION (Show if assigning to a user) */}
          {isAssigningToUser && !deviceId && (
            <div className="grid gap-2">
              <Label>Thiết bị</Label>
              <Popover open={openDeviceCombobox} onOpenChange={setOpenDeviceCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDeviceCombobox}
                    className="w-full justify-between"
                  >
                    {selectedDevice
                      ? availableDevices.find((d) => d.id === selectedDevice)?.name
                      : 'Chọn thiết bị...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 rounded-xl border-border/50 shadow-md">
                  <Command>
                    <CommandInput placeholder="Tìm thiết bị..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy thiết bị khả dụng.</CommandEmpty>
                      <CommandGroup>
                        {availableDevices.map((device) => (
                          <CommandItem
                            key={device.id}
                            value={device.name}
                            onSelect={() => {
                              setSelectedDevice(device.id)
                              setOpenDeviceCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedDevice === device.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{device.name}</span>
                              <span className="text-muted-foreground text-xs">{device.type}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tình trạng thiết bị khi bàn giao..."
            />
          </div>

          {/* Cảnh báo khi thiết bị đang được bàn giao cho người khác */}
          {reassignInfo.needsConfirm && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Thiết bị đang được bàn giao
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Thiết bị này hiện đang được gán cho{' '}
                    <strong className="text-foreground">{reassignInfo.currentEndUserName}</strong>.
                    Xác nhận sẽ <strong>tự động thu hồi</strong> từ người này và gán cho người mới.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>

          {/* Nút thay đổi tuỳ theo trạng thái reassign */}
          {reassignInfo.needsConfirm ? (
            <Button
              variant="destructive"
              onClick={() => handleAssign(true)}
              disabled={isSubmitting}
            >
              {isSubmitting && <AppLoader layout="horizontal" hideText className="mr-2" />}
              Chuyển thiết bị
            </Button>
          ) : (
            <Button
              onClick={() => handleAssign(false)}
              disabled={isSubmitting || isLoadingData || !selectedUser || !selectedDevice}
            >
              {isSubmitting && <AppLoader layout="horizontal" hideText className="mr-2" />}
              Xác nhận
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
