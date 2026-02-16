export interface Department {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface DepartmentInsert {
  user_id?: string
  name: string
}

export interface Position {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface PositionInsert {
  user_id?: string
  name: string
}
