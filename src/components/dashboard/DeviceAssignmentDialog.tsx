'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
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

import { assignDevice } from '@/app/actions/device-assignments'
import { getEndUsers } from '@/app/actions/end-users'
import { getAvailableDevices } from '@/app/actions/end-users' // Re-using this useful action
import { EndUserWithDevice } from '@/types/end-user'

interface DeviceAssignmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  deviceId?: string // If provided, we are assigning THIS device to a user
  userId?: string // If provided, we are assigning a device TO this user
  deviceName?: string // Display name for context
  userName?: string // Display name for context
}

export function DeviceAssignmentDialog({
  isOpen,
  onClose,
  onSuccess,
  deviceId,
  userId,
  deviceName,
  userName,
}: DeviceAssignmentDialogProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>(deviceId || '')
  const [selectedUser, setSelectedUser] = useState<string>(userId || '')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

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
            if (res.data) setUsers(res.data)
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
    }
  }, [isOpen, deviceId, userId])

  const handleAssign = async () => {
    if (!selectedDevice || !selectedUser) {
      toast.error('Vui lòng chọn đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)
    try {
      // Gọi server action với arguments (deviceId, endUserId)
      const result = await assignDevice(selectedDevice, selectedUser)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Gán thiết bị thành công')
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
      <DialogContent className="sm:max-w-[425px]">
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
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm nhân viên..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
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
                                'mr-2 h-4 w-4',
                                selectedUser === user.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{user.full_name}</span>
                              <span className="text-muted-foreground text-xs">
                                {user.email || 'No email'}
                              </span>
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
                <PopoverContent className="w-[400px] p-0">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isSubmitting || isLoadingData || !selectedUser || !selectedDevice}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
