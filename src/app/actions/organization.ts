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
// Chuyển từ user_id → organization_id
// ============================================

export async function getOrganizationHierarchy(): Promise<OrganizationData> {
  try {
    const { supabase, organization } = await requireAuth()

    // 1. Fetch departments (non-deleted) with parent_id
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name, parent_id')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (deptError) {
      console.error('Error fetching departments:', deptError)
      return { departments: [], error: deptError.message }
    }

    // 2. Fetch positions with department_id
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('id, name, department_id')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (posError) {
      console.error('Error fetching positions:', posError)
      return { departments: [], error: posError.message }
    }

    // 3. Fetch end_users to count employees per position
    const { data: endUsers, error: euError } = await supabase
      .from('end_users')
      .select('position_id')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)

    if (euError) {
      console.error('Error fetching end_users:', euError)
      return { departments: [], error: euError.message }
    }

    // Build: position_id → employee_count
    const posEmployeeCount = new Map<string, number>()
    for (const eu of endUsers || []) {
      if (eu.position_id) {
        posEmployeeCount.set(eu.position_id, (posEmployeeCount.get(eu.position_id) || 0) + 1)
      }
    }

    // Build: department_id → positions[]
    const deptPositionsMap = new Map<string, OrgPosition[]>()
    for (const pos of positions || []) {
      if (!pos.department_id) continue
      if (!deptPositionsMap.has(pos.department_id)) {
        deptPositionsMap.set(pos.department_id, [])
      }
      deptPositionsMap.get(pos.department_id)!.push({
        id: pos.id,
        name: pos.name,
        employee_count: posEmployeeCount.get(pos.id) || 0,
      })
    }

    // 4. Build department hierarchy with positions grouped
    const orgDepartments: OrgDepartment[] = (departments || []).map((dept) => {
      const deptPositions = deptPositionsMap.get(dept.id) || []

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
