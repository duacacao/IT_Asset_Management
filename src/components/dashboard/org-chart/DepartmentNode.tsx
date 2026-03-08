'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Building2, Users } from 'lucide-react'

export interface DepartmentNodeData {
  label: string
  positions: {
    id: string
    name: string
    employee_count: number
  }[]
  positionCount: number
  isRoot: boolean
  [key: string]: unknown
}

function DepartmentNodeComponent({ data }: NodeProps) {
  const { label, positions, isRoot } = data as DepartmentNodeData

  const totalEmployees = positions?.reduce((sum, pos) => sum + pos.employee_count, 0) ?? 0

  return (
    <div className="min-w-[260px] overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border/50">
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${
          isRoot
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white dark:from-blue-500 dark:to-blue-400'
            : 'border-b border-border/40 bg-muted/30'
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isRoot ? 'bg-white/20' : 'bg-blue-500/10 dark:bg-blue-400/10'
          }`}
        >
          <Building2 className={`h-4 w-4 ${isRoot ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={`truncate text-sm font-semibold leading-tight ${
              isRoot ? 'text-white' : 'text-foreground'
            }`}
          >
            {label}
          </h4>
          {totalEmployees > 0 && (
            <span
              className={`flex items-center gap-1 text-[11px] ${
                isRoot ? 'text-white/70' : 'text-muted-foreground'
              }`}
            >
              <Users className="h-3 w-3" />
              {totalEmployees} nhân sự
            </span>
          )}
        </div>
      </div>

      {/* Positions list */}
      {positions && positions.length > 0 && (
        <div className="px-3 py-2">
          {positions.map((pos, index) => (
            <div
              key={pos.id}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === 0 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-muted-foreground/30'
                  }`}
                />
                <span
                  className={`text-[13px] ${
                    index === 0
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {pos.name}
                </span>
              </div>
              {pos.employee_count > 0 && (
                <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {pos.employee_count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {(!positions || positions.length === 0) && (
        <div className="px-4 py-3">
          <p className="text-xs italic text-muted-foreground">Chưa có chức vụ</p>
        </div>
      )}

      {/* Handles */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-card !bg-blue-500 !shadow-sm dark:!bg-blue-400"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-card !bg-blue-500 !shadow-sm dark:!bg-blue-400"
      />
    </div>
  )
}

export const DepartmentNode = memo(DepartmentNodeComponent)
