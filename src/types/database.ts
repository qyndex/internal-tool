/** Supabase Database type definitions — matches the migration schema. */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      records: {
        Row: {
          id: string;
          title: string;
          status: string;
          category: string | null;
          value: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          status?: string;
          category?: string | null;
          value?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          status?: string;
          category?: string | null;
          value?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'records_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          record_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          record_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          record_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_record_id_fkey';
            columns: ['record_id'];
            isOneToOne: false;
            referencedRelation: 'records';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

/** Convenience aliases */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Record = Database['public']['Tables']['records']['Row'];
export type RecordInsert = Database['public']['Tables']['records']['Insert'];
export type RecordUpdate = Database['public']['Tables']['records']['Update'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
