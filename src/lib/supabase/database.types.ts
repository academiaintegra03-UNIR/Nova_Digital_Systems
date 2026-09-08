/**
 * Hand-written to match web/supabase/migrations/*.sql, following the shape
 * `supabase gen types typescript` would produce (Views/Functions/Enums/
 * CompositeTypes and each table's Relationships are required by
 * @supabase/supabase-js's generics — omitting them collapses query results
 * to `never`). Once `supabase login` is set up locally, replace with:
 *   pnpm dlx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole =
  | "estudiante"
  | "acudiente"
  | "colegio"
  | "tutor"
  | "administrador";

export type PlanType = "individual" | "grupal" | "institucional";
export type PaymentStatus = "pending" | "approved" | "declined" | "error" | "voided";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type DocumentType = "CC" | "TI" | "CE" | "PA" | "NIT";
export type PlanBillingType = "pago_unico" | "mensual" | "prueba_gratis";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          nombre: string;
          colegio_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          nombre: string;
          colegio_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          nombre?: string;
          colegio_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guardian_students: {
        Row: { guardian_id: string; student_id: string; created_at: string };
        Insert: { guardian_id: string; student_id: string; created_at?: string };
        Update: { guardian_id?: string; student_id?: string; created_at?: string };
        Relationships: [];
      };
      grupos: {
        Row: {
          id: string;
          name: string;
          colegio_id: string | null;
          tutor_id: string | null;
          es_default_colegio: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          colegio_id?: string | null;
          tutor_id?: string | null;
          es_default_colegio?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          colegio_id?: string | null;
          tutor_id?: string | null;
          es_default_colegio?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grupo_estudiantes: {
        Row: { grupo_id: string; student_id: string; created_at: string };
        Insert: { grupo_id: string; student_id: string; created_at?: string };
        Update: { grupo_id?: string; student_id?: string; created_at?: string };
        Relationships: [];
      };
      profile_contacto: {
        Row: {
          profile_id: string;
          telefono: string | null;
          tipo_documento: DocumentType | null;
          numero_documento: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          telefono?: string | null;
          tipo_documento?: DocumentType | null;
          numero_documento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          telefono?: string | null;
          tipo_documento?: DocumentType | null;
          numero_documento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_logs: {
        Row: {
          id: string;
          created_at: string;
          source: string;
          success: boolean;
          error_reason: string | null;
          latency_ms: number | null;
          user_message_length: number | null;
          prompt_tokens: number | null;
          candidate_tokens: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          source?: string;
          success: boolean;
          error_reason?: string | null;
          latency_ms?: number | null;
          user_message_length?: number | null;
          prompt_tokens?: number | null;
          candidate_tokens?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          source?: string;
          success?: boolean;
          error_reason?: string | null;
          latency_ms?: number | null;
          user_message_length?: number | null;
          prompt_tokens?: number | null;
          candidate_tokens?: number | null;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string;
          type: PlanType;
          price_cop: number;
          seat_limit: number | null;
          period: string;
          badge: string | null;
          features: string[];
          group_label: string | null;
          active: boolean;
          allow_subgrupos: boolean;
          allow_acudientes: boolean;
          billing_type: PlanBillingType;
          duration_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          type: PlanType;
          price_cop: number;
          seat_limit?: number | null;
          period: string;
          badge?: string | null;
          features?: string[];
          group_label?: string | null;
          active?: boolean;
          allow_subgrupos?: boolean;
          allow_acudientes?: boolean;
          billing_type?: PlanBillingType;
          duration_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          type?: PlanType;
          price_cop?: number;
          seat_limit?: number | null;
          period?: string;
          badge?: string | null;
          features?: string[];
          group_label?: string | null;
          active?: boolean;
          allow_subgrupos?: boolean;
          allow_acudientes?: boolean;
          billing_type?: PlanBillingType;
          duration_days?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          reference: string;
          plan_id: string;
          email: string;
          nombre: string;
          wompi_transaction_id: string | null;
          amount_cop: number;
          status: PaymentStatus;
          raw_webhook: unknown;
          profile_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          plan_id: string;
          email: string;
          nombre: string;
          wompi_transaction_id?: string | null;
          amount_cop: number;
          status?: PaymentStatus;
          raw_webhook?: unknown;
          profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference?: string;
          plan_id?: string;
          email?: string;
          nombre?: string;
          wompi_transaction_id?: string | null;
          amount_cop?: number;
          status?: PaymentStatus;
          raw_webhook?: unknown;
          profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          plan_id: string;
          profile_id: string;
          status: SubscriptionStatus;
          started_at: string;
          expires_at: string | null;
          seat_limit_override: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          profile_id: string;
          status?: SubscriptionStatus;
          started_at?: string;
          expires_at?: string | null;
          seat_limit_override?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          profile_id?: string;
          status?: SubscriptionStatus;
          started_at?: string;
          expires_at?: string | null;
          seat_limit_override?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      materias: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      clases: {
        Row: {
          id: string;
          grupo_id: string;
          materia_id: string;
          tutor_id: string | null;
          nombre: string;
          scheduled_at: string;
          duration_minutes: number | null;
          meeting_link: string | null;
          recording_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grupo_id: string;
          materia_id: string;
          tutor_id?: string | null;
          nombre: string;
          scheduled_at: string;
          duration_minutes?: number | null;
          meeting_link?: string | null;
          recording_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grupo_id?: string;
          materia_id?: string;
          tutor_id?: string | null;
          nombre?: string;
          scheduled_at?: string;
          duration_minutes?: number | null;
          meeting_link?: string | null;
          recording_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grupo_materias: {
        Row: { id: string; grupo_id: string; materia_id: string; tutor_id: string | null; created_at: string };
        Insert: {
          id?: string;
          grupo_id: string;
          materia_id: string;
          tutor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          grupo_id?: string;
          materia_id?: string;
          tutor_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      actividades: {
        Row: {
          id: string;
          grupo_id: string;
          materia_id: string;
          tutor_id: string | null;
          titulo: string;
          descripcion: string | null;
          fecha_limite: string | null;
          recurso_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grupo_id: string;
          materia_id: string;
          tutor_id?: string | null;
          titulo: string;
          descripcion?: string | null;
          fecha_limite?: string | null;
          recurso_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grupo_id?: string;
          materia_id?: string;
          tutor_id?: string | null;
          titulo?: string;
          descripcion?: string | null;
          fecha_limite?: string | null;
          recurso_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      actividad_entregas: {
        Row: {
          id: string;
          actividad_id: string;
          tutor_id: string | null;
          student_id: string;
          estado: "pendiente" | "entregada";
          respuesta_link: string | null;
          entregado_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          actividad_id: string;
          tutor_id?: string | null;
          student_id: string;
          estado?: "pendiente" | "entregada";
          respuesta_link?: string | null;
          entregado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          actividad_id?: string;
          tutor_id?: string | null;
          student_id?: string;
          estado?: "pendiente" | "entregada";
          respuesta_link?: string | null;
          entregado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      foro_hilos: {
        Row: {
          id: string;
          grupo_id: string;
          materia_id: string;
          tutor_id: string | null;
          autor_id: string | null;
          titulo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grupo_id: string;
          materia_id: string;
          tutor_id?: string | null;
          autor_id?: string | null;
          titulo: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grupo_id?: string;
          materia_id?: string;
          tutor_id?: string | null;
          autor_id?: string | null;
          titulo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      foro_mensajes: {
        Row: {
          id: string;
          hilo_id: string;
          tutor_id: string | null;
          autor_id: string | null;
          mensaje: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hilo_id: string;
          tutor_id?: string | null;
          autor_id?: string | null;
          mensaje: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hilo_id?: string;
          tutor_id?: string | null;
          autor_id?: string | null;
          mensaje?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      diagnosticos: {
        Row: {
          id: string;
          created_at: string;
          banco_id: string;
          grado: string | null;
          profile_id: string | null;
          estudiante_nombre: string;
          estudiante_edad: number | null;
          estudiante_email: string | null;
          colegio: string | null;
          acudiente_email: string | null;
          acudiente_telefono: string | null;
          aciertos: number;
          total_preguntas: number;
          puntaje_global: number;
          enfoque_score: number;
          desenfoques_count: number;
          perfil_dominante: string | null;
          desglose_materias: Json;
          analisis_ia: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          banco_id: string;
          grado?: string | null;
          profile_id?: string | null;
          estudiante_nombre: string;
          estudiante_edad?: number | null;
          estudiante_email?: string | null;
          colegio?: string | null;
          acudiente_email?: string | null;
          acudiente_telefono?: string | null;
          aciertos: number;
          total_preguntas: number;
          puntaje_global: number;
          enfoque_score: number;
          desenfoques_count?: number;
          perfil_dominante?: string | null;
          desglose_materias?: Json;
          analisis_ia?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          banco_id?: string;
          grado?: string | null;
          profile_id?: string | null;
          estudiante_nombre?: string;
          estudiante_edad?: number | null;
          estudiante_email?: string | null;
          colegio?: string | null;
          acudiente_email?: string | null;
          acudiente_telefono?: string | null;
          aciertos?: number;
          total_preguntas?: number;
          puntaje_global?: number;
          enfoque_score?: number;
          desenfoques_count?: number;
          perfil_dominante?: string | null;
          desglose_materias?: Json;
          analisis_ia?: string | null;
        };
        Relationships: [];
      };
      materia_recursos: {
        Row: {
          id: string;
          grupo_id: string;
          materia_id: string;
          tutor_id: string | null;
          titulo: string;
          tipo: "pdf" | "link";
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          grupo_id: string;
          materia_id: string;
          tutor_id?: string | null;
          titulo: string;
          tipo?: "pdf" | "link";
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          grupo_id?: string;
          materia_id?: string;
          tutor_id?: string | null;
          titulo?: string;
          tipo?: "pdf" | "link";
          url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      plan_type: PlanType;
    };
    CompositeTypes: Record<string, never>;
  };
}
