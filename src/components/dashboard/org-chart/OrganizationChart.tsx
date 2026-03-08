'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { DepartmentNode } from './DepartmentNode'
import { getLayoutedElements } from '@/lib/org-chart-layout'
import type { OrgDepartment } from '@/app/actions/organization'
import { Search, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Register custom node types — all nodes are department type
const nodeTypes: NodeTypes = {
  department: DepartmentNode,
}

interface OrganizationChartProps {
  departments: OrgDepartment[]
}

/**
 * Transform OrgDepartment[] → React Flow nodes & edges
 * 100% data-driven: parent_id = null → root nodes, otherwise child nodes
 */
function buildFlowElements(departments: OrgDepartment[]) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Build a set of valid department IDs for edge validation
  const deptIdSet = new Set(departments.map((d) => d.id))

  departments.forEach((dept) => {
    const nodeId = `dept-${dept.id}`

    nodes.push({
      id: nodeId,
      type: 'department',
      position: { x: 0, y: 0 },
      data: {
        label: dept.name,
        positions: dept.positions,
        positionCount: dept.positions.length,
        isRoot: !dept.parent_id,
      },
    })

    // Edge: parent → child (only if parent exists in data)
    if (dept.parent_id && deptIdSet.has(dept.parent_id)) {
      const parentId = `dept-${dept.parent_id}`
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'default',
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        animated: false,
      })
    }
  })

  return getLayoutedElements(nodes, edges)
}

export function OrganizationChart({ departments }: OrganizationChartProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Build initial elements
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowElements(departments),
    [departments]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update when departments change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildFlowElements(departments)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [departments, setNodes, setEdges])

  // Search/highlight
  const highlightedNodes = useMemo(() => {
    if (!searchTerm.trim()) return new Set<string>()

    const term = searchTerm.toLowerCase()
    const matched = new Set<string>()

    departments.forEach((dept) => {
      if (dept.name.toLowerCase().includes(term)) {
        matched.add(`dept-${dept.id}`)
      }
      dept.positions.forEach((pos) => {
        if (pos.name.toLowerCase().includes(term)) {
          matched.add(`dept-${dept.id}`)
        }
      })
    })

    return matched
  }, [searchTerm, departments])

  // Apply highlight styling
  const styledNodes = useMemo(() => {
    if (highlightedNodes.size === 0) return nodes

    return nodes.map((node) => {
      const isHighlighted = highlightedNodes.has(node.id)
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isHighlighted ? 1 : 0.25,
          transition: 'opacity 0.3s ease',
        },
      }
    })
  }, [nodes, highlightedNodes])

  const styledEdges = useMemo(() => {
    if (highlightedNodes.size === 0) return edges

    return edges.map((edge) => {
      const isHighlighted =
        highlightedNodes.has(edge.target) || highlightedNodes.has(edge.source)
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isHighlighted ? 1 : 0.1,
          transition: 'opacity 0.3s ease',
        },
      }
    })
  }, [edges, highlightedNodes])

  const totalEmployees = departments.reduce(
    (sum, dept) => sum + dept.positions.reduce((s, p) => s + p.employee_count, 0),
    0
  )

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="!bg-muted/20 [&>pattern>circle]:fill-muted-foreground/15"
        />
        <Controls
          className="!rounded-xl !border !border-border/50 !bg-white !shadow-md dark:!bg-card [&_button]:!border-border/30 [&_button]:!bg-transparent [&_button_svg]:!fill-foreground"
          showInteractive={false}
        />

        {/* Search panel */}
        <Panel position="top-left">
          <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm dark:bg-card/90">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm phòng ban, chức vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-60 border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </Panel>

        {/* Stats panel */}
        <Panel position="top-right">
          <div className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-2.5 shadow-md backdrop-blur-sm dark:bg-card/90">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="font-medium text-foreground">{departments.length}</span>
              phòng ban
            </div>
            {totalEmployees > 0 && (
              <>
                <div className="h-4 w-px bg-border/60" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{totalEmployees}</span> nhân sự
                </span>
              </>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
