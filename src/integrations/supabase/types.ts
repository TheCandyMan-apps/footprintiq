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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_grant_attempts: {
        Row: {
          created_at: string
          id: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      admin_grant_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          condition: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_channels: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          condition: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_channels?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          condition?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_channels?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          method: string
          response_time_ms: number | null
          status_code: number | null
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_id?: string
        }
        Relationships: []
      }
      automated_removals: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json | null
          next_attempt_at: string | null
          source_id: string
          status: string | null
          success_at: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          next_attempt_at?: string | null
          source_id: string
          status?: string | null
          success_at?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          next_attempt_at?: string | null
          source_id?: string
          status?: string | null
          success_at?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      case_evidence: {
        Row: {
          case_id: string
          content: Json
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          case_id: string
          content?: Json
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: Json
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          is_important: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          scan_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          scan_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          scan_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          file_url: string | null
          generated_at: string | null
          id: string
          organization_id: string | null
          report_data: Json
          report_type: string
          status: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          file_url?: string | null
          generated_at?: string | null
          id?: string
          organization_id?: string | null
          report_data: Json
          report_type: string
          status?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          file_url?: string | null
          generated_at?: string | null
          id?: string
          organization_id?: string | null
          report_data?: Json
          report_type?: string
          status?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          regulation_type: string
          template_data: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          regulation_type: string
          template_data: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          regulation_type?: string
          template_data?: Json
        }
        Relationships: []
      }
      compromised_credentials: {
        Row: {
          breach_date: string | null
          breach_name: string
          created_at: string | null
          data_classes: string[]
          email: string
          id: string
          is_verified: boolean | null
          notified_at: string | null
          user_id: string
        }
        Insert: {
          breach_date?: string | null
          breach_name: string
          created_at?: string | null
          data_classes: string[]
          email: string
          id?: string
          is_verified?: boolean | null
          notified_at?: string | null
          user_id: string
        }
        Update: {
          breach_date?: string | null
          breach_name?: string
          created_at?: string | null
          data_classes?: string[]
          email?: string
          id?: string
          is_verified?: boolean | null
          notified_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      darkweb_findings: {
        Row: {
          data_exposed: string[]
          discovered_at: string | null
          finding_type: string
          id: string
          is_verified: boolean | null
          metadata: Json | null
          severity: string
          source_url: string | null
          user_id: string
        }
        Insert: {
          data_exposed: string[]
          discovered_at?: string | null
          finding_type: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          severity: string
          source_url?: string | null
          user_id: string
        }
        Update: {
          data_exposed?: string[]
          discovered_at?: string | null
          finding_type?: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          severity?: string
          source_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          category: string
          data_found: string[]
          first_seen: string
          id: string
          last_checked: string
          metadata: Json | null
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          scan_id: string
          url: string
        }
        Insert: {
          category: string
          data_found?: string[]
          first_seen?: string
          id?: string
          last_checked?: string
          metadata?: Json | null
          name: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          scan_id: string
          url: string
        }
        Update: {
          category?: string
          data_found?: string[]
          first_seen?: string
          id?: string
          last_checked?: string
          metadata?: Json | null
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          scan_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      email_rate_limit: {
        Row: {
          created_at: string
          id: string
          ip: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
        }
        Relationships: []
      }
      evidence_collections: {
        Row: {
          case_id: string | null
          chain_of_custody: Json | null
          collection_type: string
          created_at: string | null
          description: string | null
          id: string
          is_sealed: boolean | null
          name: string
          sealed_at: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          chain_of_custody?: Json | null
          collection_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sealed?: boolean | null
          name: string
          sealed_at?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          chain_of_custody?: Json | null
          collection_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sealed?: boolean | null
          name?: string
          sealed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_catalog: {
        Row: {
          category: string
          config_schema: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          provider: string
        }
        Insert: {
          category: string
          config_schema?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          provider: string
        }
        Update: {
          category?: string
          config_schema?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          provider?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_synced: number | null
          status: string
          sync_type: string
          user_integration_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          status?: string
          sync_type: string
          user_integration_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          status?: string
          sync_type?: string
          user_integration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_user_integration_id_fkey"
            columns: ["user_integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          metadata: Json | null
          scan_id: string | null
          schedule_id: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metadata?: Json | null
          scan_id?: string | null
          schedule_id?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metadata?: Json | null
          scan_id?: string | null
          schedule_id?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "monitoring_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_schedules: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean | null
          last_run: string | null
          next_run: string
          notification_email: string | null
          notification_enabled: boolean | null
          scan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run: string
          notification_email?: string | null
          notification_enabled?: boolean | null
          scan_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          next_run?: string
          notification_email?: string | null
          notification_enabled?: boolean | null
          scan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_schedules_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      removal_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          failed_removals: number | null
          id: string
          name: string
          status: string | null
          success_rate: number | null
          successful_removals: number | null
          target_sources: string[]
          total_requests: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          failed_removals?: number | null
          id?: string
          name: string
          status?: string | null
          success_rate?: number | null
          successful_removals?: number | null
          target_sources: string[]
          total_requests?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          failed_removals?: number | null
          id?: string
          name?: string
          status?: string | null
          success_rate?: number | null
          successful_removals?: number | null
          target_sources?: string[]
          total_requests?: number | null
          user_id?: string
        }
        Relationships: []
      }
      removal_requests: {
        Row: {
          completed_at: string | null
          id: string
          notes: string | null
          requested_at: string
          scan_id: string
          source_id: string
          source_name: string
          source_type: string
          status: Database["public"]["Enums"]["removal_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          scan_id: string
          source_id: string
          source_name: string
          source_type: string
          status?: Database["public"]["Enums"]["removal_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          scan_id?: string
          source_id?: string
          source_name?: string
          source_type?: string
          status?: Database["public"]["Enums"]["removal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "removal_requests_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      removal_templates: {
        Row: {
          body_template: string
          follow_up_days: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          platform: string
          subject_template: string | null
          success_rate: number | null
          template_type: string
        }
        Insert: {
          body_template: string
          follow_up_days?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          platform: string
          subject_template?: string | null
          success_rate?: number | null
          template_type: string
        }
        Update: {
          body_template?: string
          follow_up_days?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          platform?: string
          subject_template?: string | null
          success_rate?: number | null
          template_type?: string
        }
        Relationships: []
      }
      scan_comparisons: {
        Row: {
          created_at: string
          first_scan_id: string
          id: string
          improvement_percentage: number | null
          latest_scan_id: string
          sources_removed: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          first_scan_id: string
          id?: string
          improvement_percentage?: number | null
          latest_scan_id: string
          sources_removed?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          first_scan_id?: string
          id?: string
          improvement_percentage?: number | null
          latest_scan_id?: string
          sources_removed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_comparisons_first_scan_id_fkey"
            columns: ["first_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_comparisons_latest_scan_id_fkey"
            columns: ["latest_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          high_risk_count: number | null
          id: string
          last_name: string | null
          low_risk_count: number | null
          medium_risk_count: number | null
          phone: string | null
          privacy_score: number | null
          scan_type: Database["public"]["Enums"]["scan_type"]
          total_sources_found: number | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          high_risk_count?: number | null
          id?: string
          last_name?: string | null
          low_risk_count?: number | null
          medium_risk_count?: number | null
          phone?: string | null
          privacy_score?: number | null
          scan_type: Database["public"]["Enums"]["scan_type"]
          total_sources_found?: number | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          high_risk_count?: number | null
          id?: string
          last_name?: string | null
          low_risk_count?: number | null
          medium_risk_count?: number | null
          phone?: string | null
          privacy_score?: number | null
          scan_type?: Database["public"]["Enums"]["scan_type"]
          total_sources_found?: number | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      shared_reports: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          password_hash: string | null
          scan_id: string
          share_token: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          scan_id: string
          share_token: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string | null
          scan_id?: string
          share_token?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      siem_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          exported_at: string | null
          id: string
          integration_id: string | null
          is_exported: boolean | null
          raw_data: Json | null
          severity: string
          source: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          exported_at?: string | null
          id?: string
          integration_id?: string | null
          is_exported?: boolean | null
          raw_data?: Json | null
          severity: string
          source: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          exported_at?: string | null
          id?: string
          integration_id?: string | null
          is_exported?: boolean | null
          raw_data?: Json | null
          severity?: string
          source?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "siem_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_profiles: {
        Row: {
          account_id: string | null
          account_type: string | null
          avatar_url: string | null
          bio: string | null
          first_seen: string
          followers: string | null
          found: boolean
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_active: string | null
          metadata: Json | null
          platform: string
          profile_url: string
          scan_id: string
          username: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          first_seen?: string
          followers?: string | null
          found?: boolean
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_active?: string | null
          metadata?: Json | null
          platform: string
          profile_url: string
          scan_id: string
          username: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          first_seen?: string
          followers?: string | null
          found?: boolean
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_active?: string | null
          metadata?: Json | null
          platform?: string
          profile_url?: string
          scan_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_profiles_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          attachments: Json | null
          created_at: string
          email: string
          id: string
          issue_type: string
          message: string
          name: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          email: string
          id?: string
          issue_type: string
          message: string
          name: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          email?: string
          id?: string
          issue_type?: string
          message?: string
          name?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: []
      }
      threat_feeds: {
        Row: {
          created_at: string | null
          feed_type: string
          id: string
          is_active: boolean | null
          last_updated: string | null
          metadata: Json | null
          name: string
          source: string
        }
        Insert: {
          created_at?: string | null
          feed_type: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          name: string
          source: string
        }
        Update: {
          created_at?: string | null
          feed_type?: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          name?: string
          source?: string
        }
        Relationships: []
      }
      threat_indicators: {
        Row: {
          confidence_score: number | null
          first_seen: string | null
          id: string
          indicator_type: string
          indicator_value: string
          last_seen: string | null
          metadata: Json | null
          source: string
          tags: string[] | null
          threat_level: string
        }
        Insert: {
          confidence_score?: number | null
          first_seen?: string | null
          id?: string
          indicator_type: string
          indicator_value: string
          last_seen?: string | null
          metadata?: Json | null
          source: string
          tags?: string[] | null
          threat_level: string
        }
        Update: {
          confidence_score?: number | null
          first_seen?: string | null
          id?: string
          indicator_type?: string
          indicator_value?: string
          last_seen?: string | null
          metadata?: Json | null
          source?: string
          tags?: string[] | null
          threat_level?: string
        }
        Relationships: []
      }
      ticket_integrations: {
        Row: {
          case_id: string | null
          created_at: string | null
          external_ticket_id: string
          id: string
          integration_id: string
          metadata: Json | null
          priority: string | null
          status: string
          ticket_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          external_ticket_id: string
          id?: string
          integration_id: string
          metadata?: Json | null
          priority?: string | null
          status: string
          ticket_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          external_ticket_id?: string
          id?: string
          integration_id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string
          ticket_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_integrations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          config: Json
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          integration_id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_id: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          subscription_expires_at: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          subscription_expires_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_scan_pii: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      grant_admin_role: {
        Args: { _caller_token?: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      has_subscription_tier: {
        Args: { _required_tier: string; _user_id: string }
        Returns: boolean
      }
      update_user_subscription: {
        Args: {
          _expires_at?: string
          _new_tier: Database["public"]["Enums"]["subscription_tier"]
          _user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      removal_status: "pending" | "in_progress" | "completed" | "failed"
      risk_level: "low" | "medium" | "high"
      scan_type: "username" | "personal_details" | "both"
      subscription_tier: "free" | "premium" | "family"
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
      removal_status: ["pending", "in_progress", "completed", "failed"],
      risk_level: ["low", "medium", "high"],
      scan_type: ["username", "personal_details", "both"],
      subscription_tier: ["free", "premium", "family"],
    },
  },
} as const
