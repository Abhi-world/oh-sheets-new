export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          google_sheets_credentials: Json | null
          id: string | null
          is_paid: boolean | null
          monday_access_token: string | null
          monday_api_key: string | null
          monday_user_email: string | null
          monday_user_id: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_sheets_credentials?: Json | null
          id?: string | null
          is_paid?: boolean | null
          monday_access_token?: string | null
          monday_api_key?: string | null
          monday_user_email?: string | null
          monday_user_id: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_sheets_credentials?: Json | null
          id?: string | null
          is_paid?: boolean | null
          monday_access_token?: string | null
          monday_api_key?: string | null
          monday_user_email?: string | null
          monday_user_id?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sync_configurations: {
        Row: {
          column_mappings: Json
          created_at: string
          id: string
          sheet_id: string
          spreadsheet_id: string
          trigger_id: string | null
          updated_at: string
        }
        Insert: {
          column_mappings: Json
          created_at?: string
          id?: string
          sheet_id: string
          spreadsheet_id: string
          trigger_id?: string | null
          updated_at?: string
        }
        Update: {
          column_mappings?: Json
          created_at?: string
          id?: string
          sheet_id?: string
          spreadsheet_id?: string
          trigger_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_configurations_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          monday_user_id: string
          status: string
          trigger_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          monday_user_id: string
          status: string
          trigger_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          monday_user_id?: string
          status?: string
          trigger_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_monday_user_id_fkey"
            columns: ["monday_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["monday_user_id"]
          },
          {
            foreignKeyName: "sync_logs_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      triggers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          monday_board_id: string | null
          monday_user_id: string
          trigger_date: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          monday_board_id?: string | null
          monday_user_id: string
          trigger_date?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          monday_board_id?: string | null
          monday_user_id?: string
          trigger_date?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "triggers_monday_user_id_fkey"
            columns: ["monday_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["monday_user_id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
