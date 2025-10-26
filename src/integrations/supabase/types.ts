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
      analytics_aggregations: {
        Row: {
          aggregation_type: string
          calculated_at: string
          data: Json
          id: string
          period_end: string
          period_start: string
          time_period: string
          user_id: string | null
        }
        Insert: {
          aggregation_type: string
          calculated_at?: string
          data: Json
          id?: string
          period_end: string
          period_start: string
          time_period: string
          user_id?: string | null
        }
        Update: {
          aggregation_type?: string
          calculated_at?: string
          data?: Json
          id?: string
          period_end?: string
          period_start?: string
          time_period?: string
          user_id?: string | null
        }
        Relationships: []
      }
      anomalies: {
        Row: {
          anomaly_type: string
          description: string
          detected_at: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolution_notes: string | null
          scan_id: string | null
          severity: string
          user_id: string
        }
        Insert: {
          anomaly_type: string
          description: string
          detected_at?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolution_notes?: string | null
          scan_id?: string | null
          severity: string
          user_id: string
        }
        Update: {
          anomaly_type?: string
          description?: string
          detected_at?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolution_notes?: string | null
          scan_id?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
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
      chain_of_custody: {
        Row: {
          action: string
          actor_email: string
          actor_id: string
          actor_role: string
          artifact_id: string
          details: string | null
          id: string
          ip_address: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email: string
          actor_id: string
          actor_role: string
          artifact_id: string
          details?: string | null
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string
          actor_role?: string
          artifact_id?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chain_of_custody_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "evidence_artifacts"
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
      detected_patterns: {
        Row: {
          affected_scans: Json | null
          description: string
          first_detected: string
          id: string
          last_seen: string
          metadata: Json | null
          occurrence_count: number | null
          pattern_type: string
          severity: string
          user_id: string
        }
        Insert: {
          affected_scans?: Json | null
          description: string
          first_detected?: string
          id?: string
          last_seen?: string
          metadata?: Json | null
          occurrence_count?: number | null
          pattern_type: string
          severity: string
          user_id: string
        }
        Update: {
          affected_scans?: Json | null
          description?: string
          first_detected?: string
          id?: string
          last_seen?: string
          metadata?: Json | null
          occurrence_count?: number | null
          pattern_type?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
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
      entity_edges: {
        Row: {
          confidence: number | null
          created_at: string | null
          evidence: Json | null
          id: string
          metadata: Json | null
          providers: Json | null
          relationship_type: string
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          evidence?: Json | null
          id?: string
          metadata?: Json | null
          providers?: Json | null
          relationship_type: string
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          evidence?: Json | null
          id?: string
          metadata?: Json | null
          providers?: Json | null
          relationship_type?: string
          source_node_id?: string
          target_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "entity_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "entity_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_nodes: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          entity_type: string
          entity_value: string
          finding_count: number | null
          first_seen: string | null
          id: string
          last_updated: string | null
          metadata: Json | null
          provider_count: number | null
          risk_score: number | null
          severity_breakdown: Json | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          entity_type: string
          entity_value: string
          finding_count?: number | null
          first_seen?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          provider_count?: number | null
          risk_score?: number | null
          severity_breakdown?: Json | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          entity_type?: string
          entity_value?: string
          finding_count?: number | null
          first_seen?: string | null
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          provider_count?: number | null
          risk_score?: number | null
          severity_breakdown?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      evidence_artifacts: {
        Row: {
          artifact_type: string
          capture_timestamp: string
          case_id: string
          content_hash: string
          content_type: string | null
          content_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          sealed: boolean
          size_bytes: number | null
          source_provider: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          artifact_type: string
          capture_timestamp: string
          case_id: string
          content_hash: string
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          sealed?: boolean
          size_bytes?: number | null
          source_provider?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          artifact_type?: string
          capture_timestamp?: string
          case_id?: string
          content_hash?: string
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          sealed?: boolean
          size_bytes?: number | null
          source_provider?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_artifacts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
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
      graph_snapshots: {
        Row: {
          created_at: string | null
          description: string | null
          edge_count: number | null
          graph_data: Json
          id: string
          name: string
          node_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edge_count?: number | null
          graph_data: Json
          id?: string
          name: string
          node_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edge_count?: number | null
          graph_data?: Json
          id?: string
          name?: string
          node_count?: number | null
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
      legal_cases: {
        Row: {
          case_number: string
          case_type: string
          created_at: string
          description: string | null
          evidence_sealed: boolean
          hosting_contact: string | null
          id: string
          jurisdictions: string[] | null
          legal_basis: string | null
          platform_contact: string | null
          priority: Database["public"]["Enums"]["case_priority"]
          registrar_contact: string | null
          resolved_at: string | null
          sealed_at: string | null
          sealed_by: string | null
          status: Database["public"]["Enums"]["case_status"]
          submitted_at: string | null
          target_domain: string | null
          target_urls: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_number: string
          case_type: string
          created_at?: string
          description?: string | null
          evidence_sealed?: boolean
          hosting_contact?: string | null
          id?: string
          jurisdictions?: string[] | null
          legal_basis?: string | null
          platform_contact?: string | null
          priority?: Database["public"]["Enums"]["case_priority"]
          registrar_contact?: string | null
          resolved_at?: string | null
          sealed_at?: string | null
          sealed_by?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string | null
          target_domain?: string | null
          target_urls?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_number?: string
          case_type?: string
          created_at?: string
          description?: string | null
          evidence_sealed?: boolean
          hosting_contact?: string | null
          id?: string
          jurisdictions?: string[] | null
          legal_basis?: string | null
          platform_contact?: string | null
          priority?: Database["public"]["Enums"]["case_priority"]
          registrar_contact?: string | null
          resolved_at?: string | null
          sealed_at?: string | null
          sealed_by?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          submitted_at?: string | null
          target_domain?: string | null
          target_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ml_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_trained_at: string | null
          metadata: Json | null
          model_type: string
          name: string
          training_data_size: number | null
          version: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          metadata?: Json | null
          model_type: string
          name: string
          training_data_size?: number | null
          version: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          metadata?: Json | null
          model_type?: string
          name?: string
          training_data_size?: number | null
          version?: string
        }
        Relationships: []
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
      policy_audit_log: {
        Row: {
          action: string
          created_at: string | null
          gate: string
          id: string
          ip_address: unknown
          metadata: Json | null
          purpose: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          gate: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          purpose?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          gate?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          purpose?: string | null
          user_id?: string
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
      risk_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          factors: Json
          id: string
          model_id: string | null
          predicted_risk_level: string
          recommendations: Json
          scan_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          factors?: Json
          id?: string
          model_id?: string | null
          predicted_risk_level: string
          recommendations?: Json
          scan_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          factors?: Json
          id?: string
          model_id?: string | null
          predicted_risk_level?: string
          recommendations?: Json
          scan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_predictions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
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
      takedown_submissions: {
        Row: {
          body: string
          case_id: string
          created_at: string
          id: string
          recipient_email: string | null
          recipient_name: string
          recipient_type: string
          response_at: string | null
          response_received: boolean
          response_summary: string | null
          sent_at: string
          sent_by: string
          subject: string
        }
        Insert: {
          body: string
          case_id: string
          created_at?: string
          id?: string
          recipient_email?: string | null
          recipient_name: string
          recipient_type: string
          response_at?: string | null
          response_received?: boolean
          response_summary?: string | null
          sent_at?: string
          sent_by: string
          subject: string
        }
        Update: {
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          recipient_email?: string | null
          recipient_name?: string
          recipient_type?: string
          response_at?: string | null
          response_received?: boolean
          response_summary?: string | null
          sent_at?: string
          sent_by?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "takedown_submissions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "legal_cases"
            referencedColumns: ["id"]
          },
        ]
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
      trend_forecasts: {
        Row: {
          confidence_interval: Json | null
          created_at: string
          forecast_date: string
          forecast_type: string
          id: string
          model_id: string | null
          predicted_values: Json
          user_id: string
        }
        Insert: {
          confidence_interval?: Json | null
          created_at?: string
          forecast_date: string
          forecast_type: string
          id?: string
          model_id?: string | null
          predicted_values: Json
          user_id: string
        }
        Update: {
          confidence_interval?: Json | null
          created_at?: string
          forecast_date?: string
          forecast_type?: string
          id?: string
          model_id?: string | null
          predicted_values?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_forecasts_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_analytics: {
        Row: {
          behavior_type: string
          calculated_at: string
          id: string
          insights: Json
          metrics: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          behavior_type: string
          calculated_at?: string
          id?: string
          insights?: Json
          metrics?: Json
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          behavior_type?: string
          calculated_at?: string
          id?: string
          insights?: Json
          metrics?: Json
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
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
      username_sites: {
        Row: {
          check_method: string
          created_at: string | null
          enabled: boolean | null
          id: string
          profile_exists: Json | null
          rate_limit: number | null
          requires_js: boolean | null
          tags: string[] | null
          timeout_ms: number | null
          title: string
          updated_at: string | null
          url_pattern: string
        }
        Insert: {
          check_method: string
          created_at?: string | null
          enabled?: boolean | null
          id: string
          profile_exists?: Json | null
          rate_limit?: number | null
          requires_js?: boolean | null
          tags?: string[] | null
          timeout_ms?: number | null
          title: string
          updated_at?: string | null
          url_pattern: string
        }
        Update: {
          check_method?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          profile_exists?: Json | null
          rate_limit?: number | null
          requires_js?: boolean | null
          tags?: string[] | null
          timeout_ms?: number | null
          title?: string
          updated_at?: string | null
          url_pattern?: string
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
      cleanup_scan_pii: { Args: never; Returns: undefined }
      generate_case_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      grant_admin_role: {
        Args: { _caller_token?: string; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
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
      case_priority: "low" | "medium" | "high" | "critical"
      case_status: "draft" | "submitted" | "in_progress" | "resolved" | "closed"
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
      case_priority: ["low", "medium", "high", "critical"],
      case_status: ["draft", "submitted", "in_progress", "resolved", "closed"],
      removal_status: ["pending", "in_progress", "completed", "failed"],
      risk_level: ["low", "medium", "high"],
      scan_type: ["username", "personal_details", "both"],
      subscription_tier: ["free", "premium", "family"],
    },
  },
} as const
