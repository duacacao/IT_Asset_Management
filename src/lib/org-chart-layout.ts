import dagre from 'dagre'
import { Position, type Node, type Edge } from '@xyflow/react'

const NODE_WIDTH = 280
const NODE_HEIGHT_BASE = 80
const POSITION_ROW_HEIGHT = 32

/**
 * Calculate node height based on number of positions
 */
export function getNodeHeight(positionCount: number): number {
  if (positionCount === 0) return NODE_HEIGHT_BASE
  return NODE_HEIGHT_BASE + positionCount * POSITION_ROW_HEIGHT + 16
}

/**
 * Apply Dagre auto-layout to nodes and edges
 * Direction: Top-to-Bottom (TB)
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    edgesep: 30,
    marginx: 40,
    marginy: 40,
  })

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const height = node.data?.positionCount
      ? getNodeHeight(node.data.positionCount as number)
      : NODE_HEIGHT_BASE
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height })
  })

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Run layout
  dagre.layout(dagreGraph)

  // Apply positions back to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const height = node.data?.positionCount
      ? getNodeHeight(node.data.positionCount as number)
      : NODE_HEIGHT_BASE

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - height / 2,
      },
      style: {
        ...node.style,
        width: NODE_WIDTH,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
