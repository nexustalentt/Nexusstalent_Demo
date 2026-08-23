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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      application_events: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["application_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["application_status"] | null
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["application_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["application_status"] | null
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["application_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["application_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          candidate_name: string
          email: string
          experience: string | null
          id: string
          job_id: string | null
          location: string | null
          notes: string | null
          phone: string | null
          resume_url: string | null
          skills: string[]
          source: string
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          candidate_name: string
          email: string
          experience?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[]
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          candidate_name?: string
          email?: string
          experience?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[]
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      exam_answers: {
        Row: {
          answer: Json | null
          attempt_id: string
          awarded_marks: number | null
          created_at: string
          feedback: string | null
          graded: boolean
          id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          attempt_id: string
          awarded_marks?: number | null
          created_at?: string
          feedback?: string | null
          graded?: boolean
          id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          attempt_id?: string
          awarded_marks?: number | null
          created_at?: string
          feedback?: string | null
          graded?: boolean
          id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          auto_score: number
          candidate_id: string
          created_at: string
          exam_id: string
          expires_at: string
          id: string
          manual_score: number
          passed: boolean | null
          percentage: number | null
          session_token: string
          started_at: string
          status: string
          submitted_at: string | null
          total_marks: number
          total_score: number
          updated_at: string
        }
        Insert: {
          auto_score?: number
          candidate_id: string
          created_at?: string
          exam_id: string
          expires_at: string
          id?: string
          manual_score?: number
          passed?: boolean | null
          percentage?: number | null
          session_token: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_marks?: number
          total_score?: number
          updated_at?: string
        }
        Update: {
          auto_score?: number
          candidate_id?: string
          created_at?: string
          exam_id?: string
          expires_at?: string
          id?: string
          manual_score?: number
          passed?: boolean | null
          percentage?: number | null
          session_token?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_marks?: number
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "exam_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_candidates: {
        Row: {
          created_at: string
          email: string | null
          exam_id: string
          full_name: string | null
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          exam_id: string
          full_name?: string | null
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          exam_id?: string
          full_name?: string | null
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_candidates_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_options: Json
          created_at: string
          exam_id: string
          expected_answer: string | null
          id: string
          marks: number
          options: Json
          position: number
          prompt: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_options?: Json
          created_at?: string
          exam_id: string
          expected_answer?: string | null
          id?: string
          marks?: number
          options?: Json
          position?: number
          prompt: string
          question_type: string
          updated_at?: string
        }
        Update: {
          correct_options?: Json
          created_at?: string
          exam_id?: string
          expected_answer?: string | null
          id?: string
          marks?: number
          options?: Json
          position?: number
          prompt?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          instructions: string | null
          passing_percentage: number
          public_token: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          passing_percentage?: number
          public_token?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          passing_percentage?: number
          public_token?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          google_form_url: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          google_form_url: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          google_form_url?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_method: string
          benefits: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          employment_type: string | null
          experience_max: number | null
          experience_min: number | null
          form_id: string | null
          google_form_url: string | null
          id: string
          is_sample: boolean
          job_code: string | null
          location: string | null
          preferred_qualifications: string | null
          published_at: string | null
          requirements: string | null
          responsibilities: string | null
          salary: string | null
          short_description: string | null
          skills: string[]
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          updated_by: string | null
          work_mode: string | null
        }
        Insert: {
          application_method?: string
          benefits?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          form_id?: string | null
          google_form_url?: string | null
          id?: string
          is_sample?: boolean
          job_code?: string | null
          location?: string | null
          preferred_qualifications?: string | null
          published_at?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary?: string | null
          short_description?: string | null
          skills?: string[]
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          work_mode?: string | null
        }
        Update: {
          application_method?: string
          benefits?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          form_id?: string | null
          google_form_url?: string | null
          id?: string
          is_sample?: boolean
          job_code?: string | null
          location?: string | null
          preferred_qualifications?: string | null
          published_at?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary?: string | null
          short_description?: string | null
          skills?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_form_fk"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          business_hours: string | null
          company_email: string | null
          company_name: string
          enterprise_clients: string | null
          id: boolean
          linkedin_url: string | null
          notify_on_interview: boolean
          notify_on_new_application: boolean
          notify_on_selected: boolean
          notify_on_shortlist: boolean
          phone: string | null
          professionals_placed: string | null
          recruitment_email: string | null
          seo_description: string | null
          seo_title: string | null
          successful_projects: string | null
          twitter_url: string | null
          updated_at: string
          years_experience: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          company_email?: string | null
          company_name?: string
          enterprise_clients?: string | null
          id?: boolean
          linkedin_url?: string | null
          notify_on_interview?: boolean
          notify_on_new_application?: boolean
          notify_on_selected?: boolean
          notify_on_shortlist?: boolean
          phone?: string | null
          professionals_placed?: string | null
          recruitment_email?: string | null
          seo_description?: string | null
          seo_title?: string | null
          successful_projects?: string | null
          twitter_url?: string | null
          updated_at?: string
          years_experience?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          company_email?: string | null
          company_name?: string
          enterprise_clients?: string | null
          id?: boolean
          linkedin_url?: string | null
          notify_on_interview?: boolean
          notify_on_new_application?: boolean
          notify_on_selected?: boolean
          notify_on_shortlist?: boolean
          phone?: string | null
          professionals_placed?: string | null
          recruitment_email?: string | null
          seo_description?: string | null
          seo_title?: string | null
          successful_projects?: string | null
          twitter_url?: string | null
          updated_at?: string
          years_experience?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
      application_status:
        | "new"
        | "under_review"
        | "shortlisted"
        | "interview"
        | "selected"
        | "rejected"
      job_status: "draft" | "active" | "closed" | "archived"
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
    Enums: {
      app_role: ["admin", "editor"],
      application_status: [
        "new",
        "under_review",
        "shortlisted",
        "interview",
        "selected",
        "rejected",
      ],
      job_status: ["draft", "active", "closed", "archived"],
    },
  },
} as const
