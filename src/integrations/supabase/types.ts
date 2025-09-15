export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blood_banks: {
        Row: {
          accreditation: string[] | null
          address: string
          capacity_daily: number | null
          city: string | null
          created_at: string
          district: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_inspection_date: string | null
          latitude: number | null
          license_number: string | null
          longitude: number | null
          name: string
          next_inspection_date: string | null
          operating_hours: string | null
          phone: string
          services: string[] | null
          state: string | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accreditation?: string[] | null
          address: string
          capacity_daily?: number | null
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_inspection_date?: string | null
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          name: string
          next_inspection_date?: string | null
          operating_hours?: string | null
          phone: string
          services?: string[] | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accreditation?: string[] | null
          address?: string
          capacity_daily?: number | null
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_inspection_date?: string | null
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          name?: string
          next_inspection_date?: string | null
          operating_hours?: string | null
          phone?: string
          services?: string[] | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      blood_donation_camps: {
        Row: {
          actual_units: number | null
          address: string
          city: string
          contact_email: string | null
          contact_phone: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          end_date: string
          expected_units: number | null
          id: string
          latitude: number | null
          longitude: number | null
          max_participants: number | null
          name: string
          organizer_id: string | null
          organizer_name: string
          registration_required: boolean | null
          start_date: string
          state: string
          status: string | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          actual_units?: number | null
          address: string
          city: string
          contact_email?: string | null
          contact_phone: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date: string
          expected_units?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          name: string
          organizer_id?: string | null
          organizer_name: string
          registration_required?: boolean | null
          start_date: string
          state: string
          status?: string | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          actual_units?: number | null
          address?: string
          city?: string
          contact_email?: string | null
          contact_phone?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string
          expected_units?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          name?: string
          organizer_id?: string | null
          organizer_name?: string
          registration_required?: boolean | null
          start_date?: string
          state?: string
          status?: string | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_donation_camps_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_inventory: {
        Row: {
          blood_bank_id: string
          blood_group: string
          expiry_date: string | null
          id: string
          last_updated: string
          units_available: number | null
        }
        Insert: {
          blood_bank_id: string
          blood_group: string
          expiry_date?: string | null
          id?: string
          last_updated?: string
          units_available?: number | null
        }
        Update: {
          blood_bank_id?: string
          blood_group?: string
          expiry_date?: string | null
          id?: string
          last_updated?: string
          units_available?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_blood_bank_id_fkey"
            columns: ["blood_bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          additional_notes: string | null
          blood_group: string
          contact_phone: string
          created_at: string
          hospital_address: string
          hospital_name: string
          id: string
          needed_by: string | null
          patient_name: string
          status: string | null
          units_needed: number | null
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          blood_group: string
          contact_phone: string
          created_at?: string
          hospital_address: string
          hospital_name: string
          id?: string
          needed_by?: string | null
          patient_name: string
          status?: string | null
          units_needed?: number | null
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          blood_group?: string
          contact_phone?: string
          created_at?: string
          hospital_address?: string
          hospital_name?: string
          id?: string
          needed_by?: string | null
          patient_name?: string
          status?: string | null
          units_needed?: number | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      camp_registrations: {
        Row: {
          blood_group: string | null
          camp_id: string
          created_at: string | null
          donor_email: string
          donor_name: string
          donor_phone: string
          id: string
          notes: string | null
          registration_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blood_group?: string | null
          camp_id: string
          created_at?: string | null
          donor_email: string
          donor_name: string
          donor_phone: string
          id?: string
          notes?: string | null
          registration_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blood_group?: string | null
          camp_id?: string
          created_at?: string | null
          donor_email?: string
          donor_name?: string
          donor_phone?: string
          id?: string
          notes?: string | null
          registration_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_registrations_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "blood_donation_camps"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_records: {
        Row: {
          adverse_reactions: string[] | null
          blood_bank_id: string | null
          blood_group: string
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          camp_id: string | null
          collection_method: string | null
          collection_time_minutes: number | null
          component_type: string | null
          created_at: string | null
          donation_date: string
          donor_id: string
          height_cm: number | null
          hemoglobin_level: number | null
          id: string
          notes: string | null
          phlebotomist_id: string | null
          phlebotomist_name: string | null
          pulse_rate: number | null
          status: string | null
          temperature: number | null
          test_results: Json | null
          units_collected: number | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          adverse_reactions?: string[] | null
          blood_bank_id?: string | null
          blood_group: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          camp_id?: string | null
          collection_method?: string | null
          collection_time_minutes?: number | null
          component_type?: string | null
          created_at?: string | null
          donation_date: string
          donor_id: string
          height_cm?: number | null
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          phlebotomist_id?: string | null
          phlebotomist_name?: string | null
          pulse_rate?: number | null
          status?: string | null
          temperature?: number | null
          test_results?: Json | null
          units_collected?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          adverse_reactions?: string[] | null
          blood_bank_id?: string | null
          blood_group?: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          camp_id?: string | null
          collection_method?: string | null
          collection_time_minutes?: number | null
          component_type?: string | null
          created_at?: string | null
          donation_date?: string
          donor_id?: string
          height_cm?: number | null
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          phlebotomist_id?: string | null
          phlebotomist_name?: string | null
          pulse_rate?: number | null
          status?: string | null
          temperature?: number | null
          test_results?: Json | null
          units_collected?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_records_blood_bank_id_fkey"
            columns: ["blood_bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_records_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "blood_donation_camps"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_requests: {
        Row: {
          blood_group: string
          campaign_name: string
          contact_phone: string
          created_at: string | null
          description: string | null
          event_date: string | null
          hospital_id: string
          id: string
          location: string | null
          status: string | null
          units_needed: number | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          blood_group: string
          campaign_name: string
          contact_phone: string
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          hospital_id: string
          id?: string
          location?: string | null
          status?: string | null
          units_needed?: number | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          blood_group?: string
          campaign_name?: string
          contact_phone?: string
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          hospital_id?: string
          id?: string
          location?: string | null
          status?: string | null
          units_needed?: number | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_certificates: {
        Row: {
          achievement_level: string | null
          blood_group: string | null
          certificate_number: string
          certificate_type: string | null
          created_at: string | null
          donor_name: string
          expires_at: string | null
          generated_at: string | null
          id: string
          is_active: boolean | null
          pledge_date: string | null
          total_donations: number | null
          user_id: string
        }
        Insert: {
          achievement_level?: string | null
          blood_group?: string | null
          certificate_number: string
          certificate_type?: string | null
          created_at?: string | null
          donor_name: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          pledge_date?: string | null
          total_donations?: number | null
          user_id: string
        }
        Update: {
          achievement_level?: string | null
          blood_group?: string | null
          certificate_number?: string
          certificate_type?: string | null
          created_at?: string | null
          donor_name?: string
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          pledge_date?: string | null
          total_donations?: number | null
          user_id?: string
        }
        Relationships: []
      }
      eligible_donors: {
        Row: {
          address: string
          age: number
          availability_notes: string | null
          blood_group: string
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          city: string
          created_at: string | null
          eligibility_notes: string | null
          email: string
          full_name: string
          gender: string
          has_medical_conditions: boolean | null
          has_tattoos: boolean | null
          height_cm: number | null
          hemoglobin_level: number | null
          id: string
          is_available: boolean | null
          is_eligible: boolean | null
          is_verified: boolean | null
          last_donation_date: string | null
          last_eligibility_check: string | null
          latitude: number | null
          longitude: number | null
          phone: string
          pulse_rate: number | null
          rbc_count: number | null
          recent_illness: boolean | null
          recent_surgery: boolean | null
          taking_medications: boolean | null
          total_donations: number | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          weight_kg: number | null
        }
        Insert: {
          address: string
          age: number
          availability_notes?: string | null
          blood_group: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          city: string
          created_at?: string | null
          eligibility_notes?: string | null
          email: string
          full_name: string
          gender: string
          has_medical_conditions?: boolean | null
          has_tattoos?: boolean | null
          height_cm?: number | null
          hemoglobin_level?: number | null
          id?: string
          is_available?: boolean | null
          is_eligible?: boolean | null
          is_verified?: boolean | null
          last_donation_date?: string | null
          last_eligibility_check?: string | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          pulse_rate?: number | null
          rbc_count?: number | null
          recent_illness?: boolean | null
          recent_surgery?: boolean | null
          taking_medications?: boolean | null
          total_donations?: number | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          weight_kg?: number | null
        }
        Update: {
          address?: string
          age?: number
          availability_notes?: string | null
          blood_group?: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          city?: string
          created_at?: string | null
          eligibility_notes?: string | null
          email?: string
          full_name?: string
          gender?: string
          has_medical_conditions?: boolean | null
          has_tattoos?: boolean | null
          height_cm?: number | null
          hemoglobin_level?: number | null
          id?: string
          is_available?: boolean | null
          is_eligible?: boolean | null
          is_verified?: boolean | null
          last_donation_date?: string | null
          last_eligibility_check?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          pulse_rate?: number | null
          rbc_count?: number | null
          recent_illness?: boolean | null
          recent_surgery?: boolean | null
          taking_medications?: boolean | null
          total_donations?: number | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      emergency_locations: {
        Row: {
          address: string
          city: string
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          id: string
          is_24_hours: boolean | null
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          operating_hours: string | null
          phone: string
          services: string[] | null
          state: string
          type: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_24_hours?: boolean | null
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          operating_hours?: string | null
          phone: string
          services?: string[] | null
          state: string
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_24_hours?: boolean | null
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          operating_hours?: string | null
          phone?: string
          services?: string[] | null
          state?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hospital_staff: {
        Row: {
          created_at: string | null
          hospital_id: string
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_staff_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          age: number | null
          blood_group: string | null
          city: string | null
          created_at: string
          distance_km: number | null
          email: string
          full_name: string
          gender: string | null
          health_report_url: string | null
          hospital_license: string | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          is_verified_hospital: boolean | null
          last_donation_date: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          medical_conditions: boolean | null
          phone: string | null
          recent_illness: boolean | null
          taking_medications: boolean | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          city?: string | null
          created_at?: string
          distance_km?: number | null
          email: string
          full_name: string
          gender?: string | null
          health_report_url?: string | null
          hospital_license?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          is_verified_hospital?: boolean | null
          last_donation_date?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          medical_conditions?: boolean | null
          phone?: string | null
          recent_illness?: boolean | null
          taking_medications?: boolean | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          blood_group?: string | null
          city?: string | null
          created_at?: string
          distance_km?: number | null
          email?: string
          full_name?: string
          gender?: string | null
          health_report_url?: string | null
          hospital_license?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          is_verified_hospital?: boolean | null
          last_donation_date?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          medical_conditions?: boolean | null
          phone?: string | null
          recent_illness?: boolean | null
          taking_medications?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_donor_eligibility: {
        Args: { donor_id: string }
        Returns: boolean
      }
      generate_certificate_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
  public: {
    Enums: {},
  },
} as const
