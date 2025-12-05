
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Appointment: {
        Row: {
          createdAt: string
          duration: number
          id: string
          meetLink: string | null
          notes: string | null
          patientId: string
          psychologistId: string
          scheduledAt: string
          status: string
          telepsyConsent: boolean
          type: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          duration?: number
          id: string
          meetLink?: string | null
          notes?: string | null
          patientId: string
          psychologistId: string
          scheduledAt: string
          status?: string
          telepsyConsent?: boolean
          type?: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          duration?: number
          id?: string
          meetLink?: string | null
          notes?: string | null
          patientId?: string
          psychologistId?: string
          scheduledAt?: string
          status?: string
          telepsyConsent?: boolean
          type?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Appointment_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Appointment_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: false
            referencedRelation: "Psychologist"
            referencedColumns: ["id"]
          },
        ]
      }
      ClinicalNote: {
        Row: {
          content: string
          createdAt: string
          deletedAt: string | null
          duration: number
          id: string
          patientId: string
          psychologistId: string
          sessionDate: string
          sessionNumber: number
          sessionType: string
          updatedAt: string
        }
        Insert: {
          content: string
          createdAt?: string
          deletedAt?: string | null
          duration: number
          id: string
          patientId: string
          psychologistId: string
          sessionDate: string
          sessionNumber: number
          sessionType: string
          updatedAt: string
        }
        Update: {
          content?: string
          createdAt?: string
          deletedAt?: string | null
          duration?: number
          id?: string
          patientId?: string
          psychologistId?: string
          sessionDate?: string
          sessionNumber?: number
          sessionType?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ClinicalNote_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ClinicalNote_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: false
            referencedRelation: "Psychologist"
            referencedColumns: ["id"]
          },
        ]
      }
      Patient: {
        Row: {
          birthdate: string | null
          createdAt: string
          deletedAt: string | null
          email: string | null
          id: string
          lgpdConsent: boolean
          lgpdConsentDate: string | null
          lgpdConsentIp: string | null
          name: string
          phone: string
          psychologistId: string
          updatedAt: string
        }
        Insert: {
          birthdate?: string | null
          createdAt?: string
          deletedAt?: string | null
          email?: string | null
          id: string
          lgpdConsent?: boolean
          lgpdConsentDate?: string | null
          lgpdConsentIp?: string | null
          name: string
          phone: string
          psychologistId: string
          updatedAt: string
        }
        Update: {
          birthdate?: string | null
          createdAt?: string
          deletedAt?: string | null
          email?: string | null
          id?: string
          lgpdConsent?: boolean
          lgpdConsentDate?: string | null
          lgpdConsentIp?: string | null
          name?: string
          phone?: string
          psychologistId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Patient_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: false
            referencedRelation: "Psychologist"
            referencedColumns: ["id"]
          },
        ]
      }
      Psychologist: {
        Row: {
          asaasCustomerId: string | null
          bio: string | null
          createdAt: string
          crp: string
          id: string
          phone: string | null
          photo: string | null
          plan: string
          slug: string
          specialties: string[] | null
          trialEndsAt: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          asaasCustomerId?: string | null
          bio?: string | null
          createdAt?: string
          crp: string
          id: string
          phone?: string | null
          photo?: string | null
          plan?: string
          slug: string
          specialties?: string[] | null
          trialEndsAt?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          asaasCustomerId?: string | null
          bio?: string | null
          createdAt?: string
          crp?: string
          id?: string
          phone?: string | null
          photo?: string | null
          plan?: string
          slug?: string
          specialties?: string[] | null
          trialEndsAt?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_psychologist_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

