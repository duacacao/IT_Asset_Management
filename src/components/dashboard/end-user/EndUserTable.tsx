'use client'

import { memo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react'

import { EndUserWithDevice } from '@/types/end-user'
import { getDepartmentColor, getPositionColor } from '@/constants/end-user'

interface EndUserTableProps {
  data: EndUserWithDevice[]
  selectedIds: string[]
  onSelectId: (id: string, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  onEdit: (user: EndUserWithDevice) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

// Move helper outside component to prevent recreation
const getDeviceIcon = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'laptop':
      return <Laptop className="h-3 w-3" />
    case 'smartphone':
    case 'mobile':
      return <Smartphone className="h-3 w-3" />
    case 'tablet':
      return <Tablet className="h-3 w-3" />
    case 'monitor':
    case 'desktop':
      return <Monitor className="h-3 w-3" />
    default:
      return <Laptop className="h-3 w-3" />
  }
}

export const EndUserTable = memo(function EndUserTable({
  data,
  selectedIds,
  onSelectId,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
}: EndUserTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead className="w-[30%] min-w-[250px]">Tên</TableHead>
            <TableHead className="w-[12%] whitespace-nowrap">Phòng ban</TableHead>
            <TableHead className="w-[12%] whitespace-nowrap">Chức vụ</TableHead>
            <TableHead className="w-[25%]">Thiết bị</TableHead>
            <TableHead className="w-[120px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow
                key={user.id}
                data-state={selectedIds.includes(user.id) ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => onSelectId(user.id, checked === true)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 py-1 pr-12">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="font-medium">
                        {user.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">{user.full_name}</span>
                      {user.email && (
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getDepartmentColor(user.department || '')}>
                    {user.department || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getPositionColor(user.position || '')}>
                    {user.position || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.devices && user.devices.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Show first device fully */}
                      <div className="bg-muted/50 flex items-center gap-2 rounded-md border px-2 py-1">
                        {getDeviceIcon(user.devices[0].type)}
                        <span className="text-xs font-medium">{user.devices[0].name}</span>
                      </div>

                      {/* Show +N for others */}
                      {user.devices.length > 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="h-auto cursor-help px-2 py-1 text-xs"
                              >
                                +{user.devices.length - 1}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex flex-col gap-1 p-1">
                                {user.devices.slice(1).map((d) => (
                                  <div key={d.id} className="flex items-center gap-2 text-xs">
                                    {getDeviceIcon(d.type)}
                                    <span>{d.name}</span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onView(user.id)}
                      title="Xem chi tiết"
                    >
                      <Eye className="text-muted-foreground h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(user)}
                      title="Sửa"
                    >
                      <Pencil className="text-muted-foreground h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(user.id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
})
