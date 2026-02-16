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
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          device_id?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          device_id?: string | null
          id?: number
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
            foreignKeyName: 'activity_logs_user_id_profiles_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          sheet_data?: Json | null
          sheet_name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          sheet_data?: Json | null
          sheet_name?: string
          sort_order?: number | null
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
      device_assignments: {
        Row: {
          id: string
          device_id: string
          end_user_id: string
          user_id: string
          assigned_at: string
          returned_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          end_user_id: string
          user_id: string
          assigned_at?: string
          returned_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          end_user_id?: string
          user_id?: string
          assigned_at?: string
          returned_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'device_assignments_device_id_fkey'
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
          id: string
          location: string | null
          name: string
          notes: string | null
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
          id?: string
          location?: string | null
          name: string
          notes?: string | null
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
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
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
            foreignKeyName: 'devices_owner_id_profiles_id_fk'
            columns: ['owner_id']
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
          email: string
          full_name: string | null
          id: string
          role: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

export type DeviceInsert = TablesInsert<'devices'>
export type DeviceUpdate = TablesUpdate<'devices'>
export type DeviceSheetInsert = TablesInsert<'device_sheets'>
export type DeviceSheetUpdate = TablesUpdate<'device_sheets'>
