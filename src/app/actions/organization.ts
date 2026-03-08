'use server'

import { requireAuth } from '@/lib/auth'

// ============================================
// Types for Organization Hierarchy
// ============================================

export interface OrgDepartment {
  id: string
  name: string
  parent_id: string | null
  positions: OrgPosition[]
}

export interface OrgPosition {
  id: string
  name: string
  employee_count: number
}

export interface OrganizationData {
  departments: OrgDepartment[]
  error: string | null
}

// ============================================
// Server Action: Fetch organization hierarchy
// Positions don't have department_id directly.
// We derive the mapping via end_users table which
// has both department_id and position_id.
// ============================================

export async function getOrganizationHierarchy(): Promise<OrganizationData> {
  try {
    const { supabase, user } = await requireAuth()

    // 1. Fetch departments (non-deleted) with parent_id
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name, parent_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (deptError) {
      console.error('Error fetching departments:', deptError)
      return { departments: [], error: deptError.message }
    }

    // 2. Fetch positions (non-deleted) — no department_id column
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('id, name')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (posError) {
      console.error('Error fetching positions:', posError)
      return { departments: [], error: posError.message }
    }

    // 3. Fetch end_users to derive position ↔ department mapping + counts
    const { data: endUsers, error: euError } = await supabase
      .from('end_users')
      .select('department_id, position_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (euError) {
      console.error('Error fetching end_users:', euError)
      return { departments: [], error: euError.message }
    }

    // Build position name lookup
    const positionNameMap = new Map<string, string>()
    for (const pos of positions || []) {
      positionNameMap.set(pos.id, pos.name)
    }

    // Build: department_id → { position_id → employee_count }
    const deptPositionMap = new Map<string, Map<string, number>>()
    for (const eu of endUsers || []) {
      if (!deptPositionMap.has(eu.department_id)) {
        deptPositionMap.set(eu.department_id, new Map())
      }
      const posMap = deptPositionMap.get(eu.department_id)!
      posMap.set(eu.position_id, (posMap.get(eu.position_id) || 0) + 1)
    }

    // 4. Build department hierarchy with positions grouped
    const orgDepartments: OrgDepartment[] = (departments || []).map((dept) => {
      const posMap = deptPositionMap.get(dept.id) || new Map()
      const deptPositions: OrgPosition[] = []

      for (const [posId, count] of posMap) {
        const posName = positionNameMap.get(posId)
        if (posName) {
          deptPositions.push({
            id: posId,
            name: posName,
            employee_count: count,
          })
        }
      }

      // Sort: highest employee count first (manager-like roles first)
      deptPositions.sort((a, b) => b.employee_count - a.employee_count)

      return {
        id: dept.id,
        name: dept.name,
        parent_id: dept.parent_id,
        positions: deptPositions,
      }
    })

    return { departments: orgDepartments, error: null }
  } catch (error) {
    console.error('Error in getOrganizationHierarchy:', error)
    return { departments: [], error: 'Unauthorized' }
  }
}
