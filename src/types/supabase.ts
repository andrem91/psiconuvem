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
          billAsSession: boolean | null
          createdAt: string
          deletedAt: string | null
          duration: number
          id: string
          meetLink: string | null
          notes: string | null
          patientId: string
          paymentDate: string | null
          paymentMethod: string | null
          paymentNotes: string | null
          paymentStatus: string | null
          psychologistId: string
          scheduledAt: string
          sessionPrice: number | null
          status: string
          telepsyConsent: boolean
          type: string
          updatedAt: string
        }
        Insert: {
          billAsSession?: boolean | null
          createdAt?: string
          deletedAt?: string | null
          duration?: number
          id: string
          meetLink?: string | null
          notes?: string | null
          patientId: string
          paymentDate?: string | null
          paymentMethod?: string | null
          paymentNotes?: string | null
          paymentStatus?: string | null
          psychologistId: string
          scheduledAt: string
          sessionPrice?: number | null
          status?: string
          telepsyConsent?: boolean
          type?: string
          updatedAt: string
        }
        Update: {
          billAsSession?: boolean | null
          createdAt?: string
          deletedAt?: string | null
          duration?: number
          id?: string
          meetLink?: string | null
          notes?: string | null
          patientId?: string
          paymentDate?: string | null
          paymentMethod?: string | null
          paymentNotes?: string | null
          paymentStatus?: string | null
          psychologistId?: string
          scheduledAt?: string
          sessionPrice?: number | null
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
      FinancialRecord: {
        Row: {
          amount: number
          appointmentId: string | null
          category: string
          createdAt: string | null
          date: string
          deletedAt: string | null
          description: string
          id: string
          patientId: string | null
          psychologistId: string
          status: string
          type: string
          updatedAt: string | null
        }
        Insert: {
          amount: number
          appointmentId?: string | null
          category: string
          createdAt?: string | null
          date: string
          deletedAt?: string | null
          description: string
          id?: string
          patientId?: string | null
          psychologistId: string
          status?: string
          type: string
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          appointmentId?: string | null
          category?: string
          createdAt?: string | null
          date?: string
          deletedAt?: string | null
          description?: string
          id?: string
          patientId?: string | null
          psychologistId?: string
          status?: string
          type?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FinancialRecord_appointmentId_fkey"
            columns: ["appointmentId"]
            isOneToOne: false
            referencedRelation: "Appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FinancialRecord_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FinancialRecord_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: false
            referencedRelation: "Psychologist"
            referencedColumns: ["id"]
          },
        ]
      }
      FinancialSettings: {
        Row: {
          acceptedPaymentMethods: string[] | null
          createdAt: string | null
          currency: string | null
          defaultMonthlyPrice: number | null
          defaultPaymentDueDay: number | null
          defaultSessionPrice: number
          id: string
          psychologistId: string
          updatedAt: string | null
        }
        Insert: {
          acceptedPaymentMethods?: string[] | null
          createdAt?: string | null
          currency?: string | null
          defaultMonthlyPrice?: number | null
          defaultPaymentDueDay?: number | null
          defaultSessionPrice?: number
          id?: string
          psychologistId: string
          updatedAt?: string | null
        }
        Update: {
          acceptedPaymentMethods?: string[] | null
          createdAt?: string | null
          currency?: string | null
          defaultMonthlyPrice?: number | null
          defaultPaymentDueDay?: number | null
          defaultSessionPrice?: number
          id?: string
          psychologistId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "FinancialSettings_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: true
            referencedRelation: "Psychologist"
            referencedColumns: ["id"]
          },
        ]
      }
      MonthlyInvoice: {
        Row: {
          amount: number
          createdAt: string | null
          deletedAt: string | null
          dueDate: string
          id: string
          notes: string | null
          paidAt: string | null
          patientId: string
          paymentMethod: string | null
          psychologistId: string
          referenceMonth: string
          status: string | null
          updatedAt: string | null
        }
        Insert: {
          amount: number
          createdAt?: string | null
          deletedAt?: string | null
          dueDate: string
          id?: string
          notes?: string | null
          paidAt?: string | null
          patientId: string
          paymentMethod?: string | null
          psychologistId: string
          referenceMonth: string
          status?: string | null
          updatedAt?: string | null
        }
        Update: {
          amount?: number
          createdAt?: string | null
          deletedAt?: string | null
          dueDate?: string
          id?: string
          notes?: string | null
          paidAt?: string | null
          patientId?: string
          paymentMethod?: string | null
          psychologistId?: string
          referenceMonth?: string
          status?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MonthlyInvoice_patientId_fkey"
            columns: ["patientId"]
            isOneToOne: false
            referencedRelation: "Patient"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MonthlyInvoice_psychologistId_fkey"
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
          financialNotes: string | null
          id: string
          lastAppointmentAt: string | null
          lgpdConsent: boolean
          lgpdConsentDate: string | null
          lgpdConsentIp: string | null
          monthlyPlanPrice: number | null
          name: string
          nextAppointmentAt: string | null
          paymentDueDay: number | null
          paymentModel: string | null
          phone: string
          planStartDate: string | null
          psychologistId: string
          sessionsPerMonth: number | null
          status: Database["public"]["Enums"]["PatientStatus"] | null
          updatedAt: string
        }
        Insert: {
          birthdate?: string | null
          createdAt?: string
          deletedAt?: string | null
          email?: string | null
          financialNotes?: string | null
          id: string
          lastAppointmentAt?: string | null
          lgpdConsent?: boolean
          lgpdConsentDate?: string | null
          lgpdConsentIp?: string | null
          monthlyPlanPrice?: number | null
          name: string
          nextAppointmentAt?: string | null
          paymentDueDay?: number | null
          paymentModel?: string | null
          phone: string
          planStartDate?: string | null
          psychologistId: string
          sessionsPerMonth?: number | null
          status?: Database["public"]["Enums"]["PatientStatus"] | null
          updatedAt: string
        }
        Update: {
          birthdate?: string | null
          createdAt?: string
          deletedAt?: string | null
          email?: string | null
          financialNotes?: string | null
          id?: string
          lastAppointmentAt?: string | null
          lgpdConsent?: boolean
          lgpdConsentDate?: string | null
          lgpdConsentIp?: string | null
          monthlyPlanPrice?: number | null
          name?: string
          nextAppointmentAt?: string | null
          paymentDueDay?: number | null
          paymentModel?: string | null
          phone?: string
          planStartDate?: string | null
          psychologistId?: string
          sessionsPerMonth?: number | null
          status?: Database["public"]["Enums"]["PatientStatus"] | null
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
      ProfessionalProfile: {
        Row: {
          address: string | null
          bio: string | null
          createdAt: string | null
          heroTitle: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          mapUrl: string | null
          psychologistId: string
          slug: string
          themeColor: string | null
          updatedAt: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          createdAt?: string | null
          heroTitle?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          mapUrl?: string | null
          psychologistId: string
          slug: string
          themeColor?: string | null
          updatedAt?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          createdAt?: string | null
          heroTitle?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          mapUrl?: string | null
          psychologistId?: string
          slug?: string
          themeColor?: string | null
          updatedAt?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ProfessionalProfile_psychologistId_fkey"
            columns: ["psychologistId"]
            isOneToOne: true
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
      check_appointment_conflict: {
        Args: {
          p_duration: number
          p_exclude_id?: string
          p_psychologist_id: string
          p_scheduled_at: string
        }
        Returns: boolean
      }
      get_current_psychologist_id: { Args: never; Returns: string }
    }
    Enums: {
      PatientStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED"
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
    Enums: {
      PatientStatus: ["ACTIVE", "INACTIVE", "ARCHIVED"],
    },
  },
} as const

