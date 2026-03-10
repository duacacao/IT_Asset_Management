export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          device_id: string | null
          id: number
          organization_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          device_id?: string | null
          id?: number
          organization_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          device_id?: string | null
          id?: number
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activity_logs_device_id_devices_id_fk'
            columns: ['device_id']
            isOneToOne: false
            referencedRelation: 'devices'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_logs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activity_logs_user_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'departments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      device_assignments: {
        Row: {
          assigned_at: string
          created_at: string
          device_id: string
          end_user_id: string
          id: string
          notes: string | null
          organization_id: string
          returned_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          device_id: string
          end_user_id: string
          id?: string
          notes?: string | null
          organization_id: string
          returned_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          device_id?: string
          end_user_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          returned_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'device_assignments_device_id_fkey'
            columns: ['device_id']
            isOneToOne: false
            referencedRelation: 'devices'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'device_assignments_end_user_id_fkey'
            columns: ['end_user_id']
            isOneToOne: false
            referencedRelation: 'end_users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'device_assignments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      device_sheets: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          sheet_data: Json | null
          sheet_name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          sheet_data?: Json | null
          sheet_name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          sheet_data?: Json | null
          sheet_name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'device_sheets_device_id_fkey'
            columns: ['device_id']
            isOneToOne: false
            referencedRelation: 'devices'
            referencedColumns: ['id']
          },
        ]
      }
      devices: {
        Row: {
          code: string | null
          created_at: string
          deleted_at: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          organization_id: string
          owner_id: string | null
          purchase_date: string | null
          specs: Json | null
          status: string
          type: string
          updated_at: string
          warranty_exp: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          organization_id: string
          owner_id?: string | null
          purchase_date?: string | null
          specs?: Json | null
          status?: string
          type: string
          updated_at?: string
          warranty_exp?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          purchase_date?: string | null
          specs?: Json | null
          status?: string
          type?: string
          updated_at?: string
          warranty_exp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'devices_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'devices_owner_id_profiles_id_fk'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      end_users: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          department_id: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          organization_id: string
          phone: string | null
          position_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          department_id: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          position_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          position_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'end_users_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'end_users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'end_users_position_id_fkey'
            columns: ['position_id']
            isOneToOne: false
            referencedRelation: 'positions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'end_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          department_id: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          department_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'positions_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'positions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'positions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_current_organization_id_fkey'
            columns: ['current_organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_org_id: { Args: Record<string, never>; Returns: string }
      get_my_org_role: { Args: Record<string, never>; Returns: string }
      add_sheet_row: {
        Args: { p_row_data: Json; p_sheet_id: string }
        Returns: Tables<'device_sheets'>
      }
      delete_sheet_row: {
        Args: { p_row_index: number; p_sheet_id: string }
        Returns: Tables<'device_sheets'>
      }
      merge_profile_settings: {
        Args: { p_settings: Json; p_user_id: string }
        Returns: undefined
      }
      reorder_sheets: { Args: { p_orders: Json }; Returns: undefined }
      set_device_visible_sheets: {
        Args: { p_device_id: string; p_visible_sheets: Json }
        Returns: undefined
      }
      update_sheet_cell: {
        Args: {
          p_key: string
          p_row_index: number
          p_sheet_id: string
          p_value: Json
        }
        Returns: Tables<'device_sheets'>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================
// Helper types — dùng trong Server Actions
// ============================================

type DefaultSchema = Database['public']

// Lấy Row type từ table name
export type Tables<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Row']

// Lấy Insert type từ table name
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Insert']

// Lấy Update type từ table name
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Update']

// Convenience aliases
export type Profile = Tables<'profiles'>
export type Device = Tables<'devices'>
export type DeviceSheet = Tables<'device_sheets'>
export type ActivityLog = Tables<'activity_logs'>
export type EndUsers = Tables<'end_users'>
export type Organization = Tables<'organizations'>
export type OrganizationMember = Tables<'organization_members'>

export type DeviceInsert = TablesInsert<'devices'>
export type DeviceUpdate = TablesUpdate<'devices'>
export type DeviceSheetInsert = TablesInsert<'device_sheets'>
export type DeviceSheetUpdate = TablesUpdate<'device_sheets'>
