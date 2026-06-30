export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      areas: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          is_system_admin: boolean | null
          area_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_system_admin?: boolean | null
          area_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_system_admin?: boolean | null
          area_id?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role_id: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role_id?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role_id?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          company: string | null
          email: string | null
          phone: string | null
          location: string | null
          notes: string | null
          status: string | null
          assigned_salesperson_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          notes?: string | null
          status?: string | null
          assigned_salesperson_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          notes?: string | null
          status?: string | null
          assigned_salesperson_id?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          code: string | null
          title: string
          description: string | null
          client_id: string | null
          assigned_salesperson_id: string | null
          status: string | null
          expected_revenue: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code?: string | null
          title: string
          description?: string | null
          client_id?: string | null
          assigned_salesperson_id?: string | null
          status?: string | null
          expected_revenue?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string | null
          title?: string
          description?: string | null
          client_id?: string | null
          assigned_salesperson_id?: string | null
          status?: string | null
          expected_revenue?: number | null
          created_at?: string
        }
      }
      proformas: {
        Row: {
          id: string
          code: string | null
          project_id: string | null
          items: Json | null
          total: number | null
          expiration_date: string | null
          issue_date: string | null
          status: string | null
          generated_file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code?: string | null
          project_id?: string | null
          items?: Json | null
          total?: number | null
          expiration_date?: string | null
          issue_date?: string | null
          status?: string | null
          generated_file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string | null
          project_id?: string | null
          items?: Json | null
          total?: number | null
          expiration_date?: string | null
          issue_date?: string | null
          status?: string | null
          generated_file_url?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          price: number
          stock: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          price: number
          stock?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number | null
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          type: string
          event_date: string
          user_id: string | null
          related_project_id: string | null
          target_role_id: string | null
          target_area_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          event_date: string
          user_id?: string | null
          related_project_id?: string | null
          target_role_id?: string | null
          target_area_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          event_date?: string
          user_id?: string | null
          related_project_id?: string | null
          target_role_id?: string | null
          target_area_id?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          message: string
          type: string
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          message: string
          type: string
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          message?: string
          type?: string
          read?: boolean | null
          created_at?: string
        }
      }
    }
  }
}
