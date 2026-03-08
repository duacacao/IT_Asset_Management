export interface Department {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
}

export interface DepartmentInsert {
  user_id?: string
  name: string
  parent_id?: string | null
}

export interface Position {
  id: string
  user_id: string
  name: string
  department_id?: string | null
  created_at: string
}

export interface PositionInsert {
  user_id?: string
  name: string
  department_id?: string | null
}
