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
      agent_api_keys: {
        Row: {
          agent_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          permissions: Json | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_api_keys_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_configs: {
        Row: {
          agent_type: string
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          schedule: string | null
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          schedule?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          schedule?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_runs: {
        Row: {
          agent_id: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          error_message: string | null
          id: string
          query: string | null
          result: Json | null
          runtime_ms: number | null
          started_at: string | null
          status: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          query?: string | null
          result?: Json | null
          runtime_ms?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          query?: string | null
          result?: Json | null
          runtime_ms?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chunks: {
        Row: {
          chunk_id: string
          created_at: string
          entity_id: string
          id: string
          metadata: Json | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chunk_id: string
          created_at?: string
          entity_id: string
          id?: string
          metadata?: Json | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chunk_id?: string
          created_at?: string
          entity_id?: string
          id?: string
          metadata?: Json | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_explanations: {
        Row: {
          confidence: number | null
          created_at: string
          explanation: string
          id: string
          model_version: string
          override_reason: string | null
          prediction_id: string | null
          user_id: string
          weights: Json
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          explanation: string
          id?: string
          model_version: string
          override_reason?: string | null
          prediction_id?: string | null
          user_id: string
          weights?: Json
        }
        Update: {
          confidence?: number | null
          created_at?: string
          explanation?: string
          id?: string
          model_version?: string
          override_reason?: string | null
          prediction_id?: string | null
          user_id?: string
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_explanations_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "link_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_filter_logs: {
        Row: {
          confidence_improvement: number | null
          created_at: string
          filtered_count: number
          id: string
          original_count: number
          provider: string
          reasoning: string | null
          removed_count: number
          scan_id: string | null
        }
        Insert: {
          confidence_improvement?: number | null
          created_at?: string
          filtered_count: number
          id?: string
          original_count: number
          provider: string
          reasoning?: string | null
          removed_count: number
          scan_id?: string | null
        }
        Update: {
          confidence_improvement?: number | null
          created_at?: string
          filtered_count?: number
          id?: string
          original_count?: number
          provider?: string
          reasoning?: string | null
          removed_count?: number
          scan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_filter_logs_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_reports: {
        Row: {
          content: string
          generated_at: string | null
          id: string
          report_type: string
          scan_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          generated_at?: string | null
          id?: string
          report_type: string
          scan_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          generated_at?: string | null
          id?: string
          report_type?: string
          scan_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          actions: Json | null
          created_at: string
          dismissed_at: string | null
          id: string
          insight_type: string
          job_id: string | null
          message: string
          metadata: Json | null
          priority: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          insight_type: string
          job_id?: string | null
          message: string
          metadata?: Json | null
          priority: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          insight_type?: string
          job_id?: string | null
          message?: string
          metadata?: Json | null
          priority?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          model: string
          prompt_length: number
          response_length: number | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          model: string
          prompt_length: number
          response_length?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          model?: string
          prompt_length?: number
          response_length?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_rule_id: string | null
          created_at: string
          id: string
          incident_id: string | null
          message: string
          metadata: Json | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          message: string
          metadata?: Json | null
          severity: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_rule_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
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
      alert_rules_v2: {
        Row: {
          condition: Json
          cooldown_minutes: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          notification_channels: Json
          rule_type: string
          severity: string
          updated_at: string
        }
        Insert: {
          condition: Json
          cooldown_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          notification_channels?: Json
          rule_type: string
          severity?: string
          updated_at?: string
        }
        Update: {
          condition?: Json
          cooldown_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          notification_channels?: Json
          rule_type?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      analyst_metrics: {
        Row: {
          avg_resolution_time_ms: number | null
          false_positives_flagged: number | null
          findings_verified: number | null
          id: string
          last_activity_at: string | null
          scans_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_resolution_time_ms?: number | null
          false_positives_flagged?: number | null
          findings_verified?: number | null
          id?: string
          last_activity_at?: string | null
          scans_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_resolution_time_ms?: number | null
          false_positives_flagged?: number | null
          findings_verified?: number | null
          id?: string
          last_activity_at?: string | null
          scans_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analyst_reports: {
        Row: {
          case_id: string | null
          confidence: number | null
          created_at: string
          entity_ids: string[]
          id: string
          report_data: Json
          user_id: string
        }
        Insert: {
          case_id?: string | null
          confidence?: number | null
          created_at?: string
          entity_ids: string[]
          id?: string
          report_data: Json
          user_id: string
        }
        Update: {
          case_id?: string | null
          confidence?: number | null
          created_at?: string
          entity_ids?: string[]
          id?: string
          report_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyst_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
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
      analytics_snapshots: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          snapshot_date: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metrics: Json
          snapshot_date: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          snapshot_date?: string
          user_id?: string
          workspace_id?: string | null
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
          revoked_at: string | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
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
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
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
          revoked_at?: string | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      api_marketplace_listings: {
        Row: {
          base_cost: number | null
          category: string
          created_at: string
          description: string | null
          documentation_url: string | null
          endpoints: Json
          id: string
          name: string
          popularity_score: number
          pricing_model: string
          provider: string
          rate_limits: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          base_cost?: number | null
          category: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          endpoints?: Json
          id?: string
          name: string
          popularity_score?: number
          pricing_model: string
          provider: string
          rate_limits?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          base_cost?: number | null
          category?: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          endpoints?: Json
          id?: string
          name?: string
          popularity_score?: number
          pricing_model?: string
          provider?: string
          rate_limits?: Json | null
          status?: string
          updated_at?: string
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
      apify_results: {
        Row: {
          created_at: string | null
          id: string
          result: Json
          task_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          result: Json
          task_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          result?: Json
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apify_results_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "apify_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      apify_tasks: {
        Row: {
          actor_slug: string
          cost_credits: number
          created_at: string | null
          created_by: string
          finished_at: string | null
          id: string
          input: Json
          status: string | null
          task_id: string | null
          workspace_id: string
        }
        Insert: {
          actor_slug: string
          cost_credits: number
          created_at?: string | null
          created_by: string
          finished_at?: string | null
          id?: string
          input: Json
          status?: string | null
          task_id?: string | null
          workspace_id: string
        }
        Update: {
          actor_slug?: string
          cost_credits?: number
          created_at?: string | null
          created_by?: string
          finished_at?: string | null
          id?: string
          input?: Json
          status?: string | null
          task_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apify_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_activity: {
        Row: {
          action: string
          created_at: string | null
          id: string
          meta: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_activity_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          at: string
          id: string
          meta: Json | null
          target: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          at?: string
          id?: string
          meta?: Json | null
          target?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          at?: string
          id?: string
          meta?: Json | null
          target?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_results: {
        Row: {
          actual_behavior: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          expected_behavior: string | null
          id: string
          metadata: Json | null
          severity: string | null
          status: string
          test_category: string
          test_name: string
          test_suite_run_id: string
        }
        Insert: {
          actual_behavior?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          expected_behavior?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          status: string
          test_category: string
          test_name: string
          test_suite_run_id: string
        }
        Update: {
          actual_behavior?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          expected_behavior?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          status?: string
          test_category?: string
          test_name?: string
          test_suite_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_results_test_suite_run_id_fkey"
            columns: ["test_suite_run_id"]
            isOneToOne: false
            referencedRelation: "audit_suite_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_suite_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          failed: number
          id: string
          passed: number
          status: string
          success_rate: number | null
          total_tests: number
          triggered_by: string | null
          warnings: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          failed?: number
          id?: string
          passed?: number
          status?: string
          success_rate?: number | null
          total_tests?: number
          triggered_by?: string | null
          warnings?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          failed?: number
          id?: string
          passed?: number
          status?: string
          success_rate?: number | null
          total_tests?: number
          triggered_by?: string | null
          warnings?: number
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
      background_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_details: Json | null
          id: string
          job_type: string
          last_error: string | null
          max_attempts: number
          payload: Json
          priority: number
          scheduled_at: string
          started_at: string | null
          status: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          job_type: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          job_type?: string
          last_error?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      billing_audit_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          created_at: string
          id: string
          metered_scans_month: number
          period_end: string | null
          period_start: string | null
          plan: Database["public"]["Enums"]["billing_plan"]
          seats: number
          status: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metered_scans_month?: number
          period_end?: string | null
          period_start?: string | null
          plan?: Database["public"]["Enums"]["billing_plan"]
          seats?: number
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metered_scans_month?: number
          period_end?: string | null
          period_start?: string | null
          plan?: Database["public"]["Enums"]["billing_plan"]
          seats?: number
          status?: Database["public"]["Enums"]["billing_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_profiles: {
        Row: {
          created_at: string
          custom_footer: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          remove_branding: boolean | null
          secondary_color: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          custom_footer?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          remove_branding?: boolean | null
          secondary_color?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          custom_footer?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          remove_branding?: boolean | null
          secondary_color?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branding_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_logs: {
        Row: {
          case_id: string | null
          client_id: string
          content: Json
          created_at: string
          id: string
          metadata: Json | null
          opened_at: string | null
          recipients: string[] | null
          sent_at: string
          summary: string
        }
        Insert: {
          case_id?: string | null
          client_id: string
          content: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipients?: string[] | null
          sent_at?: string
          summary: string
        }
        Update: {
          case_id?: string | null
          client_id?: string
          content?: Json
          created_at?: string
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipients?: string[] | null
          sent_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      bugs: {
        Row: {
          created_at: string | null
          description: string
          error_stack: string | null
          id: string
          page_url: string
          screenshot_url: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          error_stack?: string | null
          id?: string
          page_url: string
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          error_stack?: string | null
          id?: string
          page_url?: string
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cache_entries: {
        Row: {
          cache_key: string
          cache_type: string
          cache_value: Json
          created_at: string
          expires_at: string
          hit_count: number
          id: string
          last_accessed_at: string
          ttl_seconds: number
          updated_at: string
        }
        Insert: {
          cache_key: string
          cache_type: string
          cache_value: Json
          created_at?: string
          expires_at: string
          hit_count?: number
          id?: string
          last_accessed_at?: string
          ttl_seconds?: number
          updated_at?: string
        }
        Update: {
          cache_key?: string
          cache_type?: string
          cache_value?: Json
          created_at?: string
          expires_at?: string
          hit_count?: number
          id?: string
          last_accessed_at?: string
          ttl_seconds?: number
          updated_at?: string
        }
        Relationships: []
      }
      case_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "case_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      case_comments: {
        Row: {
          case_id: string
          content: string
          created_at: string | null
          id: string
          mentions: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
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
      case_items: {
        Row: {
          added_by: string
          case_id: string
          created_at: string
          id: string
          item_id: string
          item_type: string
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          added_by: string
          case_id: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          added_by?: string
          case_id?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_items_case_id_fkey"
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
      case_templates: {
        Row: {
          category: string
          checklist_items: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          predefined_tags: string[] | null
          priority: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          checklist_items?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          predefined_tags?: string[] | null
          priority?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          checklist_items?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          predefined_tags?: string[] | null
          priority?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          image_results: Json | null
          priority: string
          results: Json[] | null
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
          image_results?: Json | null
          priority?: string
          results?: Json[] | null
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
          image_results?: Json | null
          priority?: string
          results?: Json[] | null
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
      circuit_breaker_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          failure_count: number | null
          id: string
          metadata: Json | null
          new_state: string | null
          previous_state: string | null
          provider_id: string
          success_count: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          failure_count?: number | null
          id?: string
          metadata?: Json | null
          new_state?: string | null
          previous_state?: string | null
          provider_id: string
          success_count?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          failure_count?: number | null
          id?: string
          metadata?: Json | null
          new_state?: string | null
          previous_state?: string | null
          provider_id?: string
          success_count?: number | null
        }
        Relationships: []
      }
      circuit_breaker_states: {
        Row: {
          avg_recovery_time_ms: number | null
          cooldown_period_ms: number
          created_at: string
          failure_count: number
          failure_threshold: number
          half_open_max_calls: number
          half_opened_at: string | null
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          next_attempt_at: string | null
          opened_at: string | null
          provider_id: string
          state: string
          success_count: number
          success_threshold: number
          timeout_ms: number
          total_calls_blocked: number
          total_trips: number
          updated_at: string
        }
        Insert: {
          avg_recovery_time_ms?: number | null
          cooldown_period_ms?: number
          created_at?: string
          failure_count?: number
          failure_threshold?: number
          half_open_max_calls?: number
          half_opened_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          next_attempt_at?: string | null
          opened_at?: string | null
          provider_id: string
          state?: string
          success_count?: number
          success_threshold?: number
          timeout_ms?: number
          total_calls_blocked?: number
          total_trips?: number
          updated_at?: string
        }
        Update: {
          avg_recovery_time_ms?: number | null
          cooldown_period_ms?: number
          created_at?: string
          failure_count?: number
          failure_threshold?: number
          half_open_max_calls?: number
          half_opened_at?: string | null
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          next_attempt_at?: string | null
          opened_at?: string | null
          provider_id?: string
          state?: string
          success_count?: number
          success_threshold?: number
          timeout_ms?: number
          total_calls_blocked?: number
          total_trips?: number
          updated_at?: string
        }
        Relationships: []
      }
      client_cases: {
        Row: {
          case_id: string
          client_id: string
          created_at: string
          id: string
          visibility: string
        }
        Insert: {
          case_id: string
          client_id: string
          created_at?: string
          id?: string
          visibility?: string
        }
        Update: {
          case_id?: string
          client_id?: string
          created_at?: string
          id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_cases_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reports: {
        Row: {
          client_id: string
          content: Json
          created_at: string
          file_url: string | null
          hash_manifest: string | null
          id: string
          last_generated_at: string | null
          next_generation_at: string | null
          report_type: string
          schedule: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content: Json
          created_at?: string
          file_url?: string | null
          hash_manifest?: string | null
          id?: string
          last_generated_at?: string | null
          next_generation_at?: string | null
          report_type: string
          schedule?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: Json
          created_at?: string
          file_url?: string | null
          hash_manifest?: string | null
          id?: string
          last_generated_at?: string | null
          next_generation_at?: string | null
          report_type?: string
          schedule?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string | null
          features: Json | null
          id: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          custom_domain: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
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
      connection_pool_stats: {
        Row: {
          active_connections: number
          avg_wait_time_ms: number | null
          connection_errors: number
          created_at: string
          id: string
          idle_connections: number
          max_connections: number
          pool_name: string
          waiting_requests: number
        }
        Insert: {
          active_connections: number
          avg_wait_time_ms?: number | null
          connection_errors?: number
          created_at?: string
          id?: string
          idle_connections: number
          max_connections: number
          pool_name: string
          waiting_requests?: number
        }
        Update: {
          active_connections?: number
          avg_wait_time_ms?: number | null
          connection_errors?: number
          created_at?: string
          id?: string
          idle_connections?: number
          max_connections?: number
          pool_name?: string
          waiting_requests?: number
        }
        Relationships: []
      }
      consent_history: {
        Row: {
          action: string
          consent_type: string
          created_at: string
          id: string
          ip_address: unknown
          new_value: Json | null
          previous_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          previous_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          previous_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          consent_text: string
          consent_type: string
          consented_at: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_text: string
          consent_type: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_text?: string
          consent_type?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_alert_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          threshold: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          threshold?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          threshold?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_alert_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_alerts_log: {
        Row: {
          alerted_at: string
          balance: number
          id: string
          threshold: number
          workspace_id: string
        }
        Insert: {
          alerted_at?: string
          balance: number
          id?: string
          threshold: number
          workspace_id: string
        }
        Update: {
          alerted_at?: string
          balance?: number
          id?: string
          threshold?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_alerts_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          created_at: string | null
          delta: number
          id: string
          meta: Json | null
          reason: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          delta: number
          id?: string
          meta?: Json | null
          reason: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          delta?: number
          id?: string
          meta?: Json | null
          reason?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credits_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          meta: Json | null
          reason: string
          ref_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          meta?: Json | null
          reason: string
          ref_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          meta?: Json | null
          reason?: string
          ref_id?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      custom_metrics: {
        Row: {
          calculation: Json
          created_at: string
          description: string | null
          id: string
          metric_type: string
          name: string
          threshold_critical: number | null
          threshold_warning: number | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          calculation: Json
          created_at?: string
          description?: string | null
          id?: string
          metric_type: string
          name: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          calculation?: Json
          created_at?: string
          description?: string | null
          id?: string
          metric_type?: string
          name?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          last_generated_at: string | null
          name: string
          report_type: string
          schedule: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          last_generated_at?: string | null
          name: string
          report_type: string
          schedule?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          last_generated_at?: string | null
          name?: string
          report_type?: string
          schedule?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      dark_web_findings: {
        Row: {
          created_at: string
          description: string | null
          discovered_at: string
          id: string
          raw_data: Json | null
          scan_id: string
          source_name: string
          threat_level: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discovered_at?: string
          id?: string
          raw_data?: Json | null
          scan_id: string
          source_name: string
          threat_level?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discovered_at?: string
          id?: string
          raw_data?: Json | null
          scan_id?: string
          source_name?: string
          threat_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "dark_web_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      darkweb_alert_history: {
        Row: {
          alert_type: string | null
          finding_count: number | null
          id: string
          meta: Json | null
          sent_at: string | null
          severity: string
          target_id: string
          workspace_id: string
        }
        Insert: {
          alert_type?: string | null
          finding_count?: number | null
          id?: string
          meta?: Json | null
          sent_at?: string | null
          severity: string
          target_id: string
          workspace_id: string
        }
        Update: {
          alert_type?: string | null
          finding_count?: number | null
          id?: string
          meta?: Json | null
          sent_at?: string | null
          severity?: string
          target_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "darkweb_alert_history_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "darkweb_targets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "darkweb_alert_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      darkweb_findings: {
        Row: {
          data_exposed: string[]
          discovered_at: string | null
          finding_type: string
          id: string
          is_new: boolean | null
          is_verified: boolean | null
          meta: Json | null
          metadata: Json | null
          notified_at: string | null
          observed_at: string | null
          provider: string | null
          severity: string
          source_url: string | null
          target_id: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          data_exposed: string[]
          discovered_at?: string | null
          finding_type: string
          id?: string
          is_new?: boolean | null
          is_verified?: boolean | null
          meta?: Json | null
          metadata?: Json | null
          notified_at?: string | null
          observed_at?: string | null
          provider?: string | null
          severity: string
          source_url?: string | null
          target_id?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          data_exposed?: string[]
          discovered_at?: string | null
          finding_type?: string
          id?: string
          is_new?: boolean | null
          is_verified?: boolean | null
          meta?: Json | null
          metadata?: Json | null
          notified_at?: string | null
          observed_at?: string | null
          provider?: string | null
          severity?: string
          source_url?: string | null
          target_id?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      darkweb_subscriptions: {
        Row: {
          alert_methods: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_alerted_at: string | null
          severity_threshold: string | null
          target_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          alert_methods?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_alerted_at?: string | null
          severity_threshold?: string | null
          target_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          alert_methods?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_alerted_at?: string | null
          severity_threshold?: string | null
          target_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "darkweb_subscriptions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "darkweb_targets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "darkweb_subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      darkweb_targets: {
        Row: {
          active: boolean
          created_at: string
          frequency: string
          id: string
          last_checked: string | null
          type: string
          value: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_checked?: string | null
          type: string
          value: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_checked?: string | null
          type?: string
          value?: string
          workspace_id?: string
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          category: string
          confidence_score: number | null
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
          confidence_score?: number | null
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
          confidence_score?: number | null
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
      email_notifications: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          recipient: string
          sent_at: string
          type: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          recipient: string
          sent_at?: string
          type: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          recipient?: string
          sent_at?: string
          type?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      entity_cooccurrences: {
        Row: {
          confidence: number | null
          cooccurrence_count: number | null
          created_at: string | null
          entity_a: string
          entity_b: string
          id: string
          last_seen: string | null
        }
        Insert: {
          confidence?: number | null
          cooccurrence_count?: number | null
          created_at?: string | null
          entity_a: string
          entity_b: string
          id?: string
          last_seen?: string | null
        }
        Update: {
          confidence?: number | null
          cooccurrence_count?: number | null
          created_at?: string | null
          entity_a?: string
          entity_b?: string
          id?: string
          last_seen?: string | null
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
      entity_suggestions: {
        Row: {
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          seed_entities: string[]
          suggestions: Json
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          seed_entities: string[]
          suggestions?: Json
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          seed_entities?: string[]
          suggestions?: Json
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
      explanation_cache: {
        Row: {
          context_hash: string
          created_at: string | null
          expires_at: string | null
          explanation: string
          id: string
        }
        Insert: {
          context_hash: string
          created_at?: string | null
          expires_at?: string | null
          explanation: string
          id?: string
        }
        Update: {
          context_hash?: string
          created_at?: string | null
          expires_at?: string | null
          explanation?: string
          id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          confidence_score: number | null
          created_at: string
          finding_id: string
          finding_name: string
          finding_type: string
          id: string
          item_id: string | null
          item_name: string | null
          item_type: string | null
          metadata: Json | null
          reason: string | null
          reviewed: boolean | null
          reviewer_notes: string | null
          scan_id: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          finding_id: string
          finding_name: string
          finding_type: string
          id?: string
          item_id?: string | null
          item_name?: string | null
          item_type?: string | null
          metadata?: Json | null
          reason?: string | null
          reviewed?: boolean | null
          reviewer_notes?: string | null
          scan_id: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          finding_id?: string
          finding_name?: string
          finding_type?: string
          id?: string
          item_id?: string | null
          item_name?: string | null
          item_type?: string | null
          metadata?: Json | null
          reason?: string | null
          reviewed?: boolean | null
          reviewer_notes?: string | null
          scan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      finding_enrichments: {
        Row: {
          attack_vectors: Json | null
          context: string
          created_at: string
          credits_spent: number
          enriched_by: string
          finding_id: string
          id: string
          links: Json | null
          remediation_steps: Json | null
          workspace_id: string
        }
        Insert: {
          attack_vectors?: Json | null
          context: string
          created_at?: string
          credits_spent?: number
          enriched_by: string
          finding_id: string
          id?: string
          links?: Json | null
          remediation_steps?: Json | null
          workspace_id: string
        }
        Update: {
          attack_vectors?: Json | null
          context?: string
          created_at?: string
          credits_spent?: number
          enriched_by?: string
          finding_id?: string
          id?: string
          links?: Json | null
          remediation_steps?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finding_enrichments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          confidence: number
          created_at: string | null
          evidence: Json | null
          id: string
          kind: string
          meta: Json | null
          observed_at: string
          provider: string
          scan_id: string
          severity: string
          workspace_id: string
        }
        Insert: {
          confidence: number
          created_at?: string | null
          evidence?: Json | null
          id?: string
          kind: string
          meta?: Json | null
          observed_at: string
          provider: string
          scan_id: string
          severity: string
          workspace_id: string
        }
        Update: {
          confidence?: number
          created_at?: string | null
          evidence?: Json | null
          id?: string
          kind?: string
          meta?: Json | null
          observed_at?: string
          provider?: string
          scan_id?: string
          severity?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      graph_queries: {
        Row: {
          created_at: string | null
          execution_time_ms: number | null
          generated_query: string | null
          id: string
          natural_language_query: string
          result_summary: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms?: number | null
          generated_query?: string | null
          id?: string
          natural_language_query: string
          result_summary?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number | null
          generated_query?: string | null
          id?: string
          natural_language_query?: string
          result_summary?: Json | null
          user_id?: string | null
          workspace_id?: string | null
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
      incident_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          incident_id: string
          is_public: boolean
          message: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id: string
          is_public?: boolean
          message: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          incident_id?: string
          is_public?: boolean
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          affected_services: string[] | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact: string | null
          incident_number: string
          postmortem_url: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          slack_thread_url: string | null
          started_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_services?: string[] | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          incident_number: string
          postmortem_url?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          slack_thread_url?: string | null
          started_at?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_services?: string[] | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          incident_number?: string
          postmortem_url?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          slack_thread_url?: string | null
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_catalog: {
        Row: {
          category: string
          configuration_schema: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          configuration_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          category?: string
          configuration_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          config: Json
          created_at: string
          credentials_encrypted: string | null
          error_message: string | null
          id: string
          integration_type: string
          is_active: boolean
          last_sync_at: string | null
          name: string
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          integration_type: string
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          sync_status?: string | null
          updated_at?: string
          user_id?: string
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
        Relationships: []
      }
      intel_cards: {
        Row: {
          agent_run_id: string | null
          content: string
          created_at: string | null
          id: string
          is_verified: boolean | null
          tags: string[] | null
          title: string
          topic: string | null
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
          workspace_id: string | null
        }
        Insert: {
          agent_run_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          tags?: string[] | null
          title: string
          topic?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          agent_run_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          tags?: string[] | null
          title?: string
          topic?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intel_cards_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      intel_feed_cache: {
        Row: {
          cached_at: string
          data: Json
          expires_at: string
          feed_type: string
          id: string
          source: string
        }
        Insert: {
          cached_at?: string
          data: Json
          expires_at: string
          feed_type: string
          id?: string
          source: string
        }
        Update: {
          cached_at?: string
          data?: Json
          expires_at?: string
          feed_type?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      ip_rate_limits: {
        Row: {
          attempt_count: number
          blocked_until: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          max_attempts: number
          updated_at: string
          window_size_minutes: number
          window_start: string
        }
        Insert: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address: unknown
          max_attempts?: number
          updated_at?: string
          window_size_minutes?: number
          window_start?: string
        }
        Update: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          max_attempts?: number
          updated_at?: string
          window_size_minutes?: number
          window_start?: string
        }
        Relationships: []
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
      linguistic_fingerprints: {
        Row: {
          activity_rhythm: Json | null
          confidence: number | null
          created_at: string
          entity_id: string
          features: Json
          id: string
          model_version: string
          updated_at: string
          user_id: string
          vocabulary_stats: Json | null
          writing_style: Json | null
        }
        Insert: {
          activity_rhythm?: Json | null
          confidence?: number | null
          created_at?: string
          entity_id: string
          features?: Json
          id?: string
          model_version: string
          updated_at?: string
          user_id: string
          vocabulary_stats?: Json | null
          writing_style?: Json | null
        }
        Update: {
          activity_rhythm?: Json | null
          confidence?: number | null
          created_at?: string
          entity_id?: string
          features?: Json
          id?: string
          model_version?: string
          updated_at?: string
          user_id?: string
          vocabulary_stats?: Json | null
          writing_style?: Json | null
        }
        Relationships: []
      }
      link_predictions: {
        Row: {
          created_at: string
          entity_a: string
          entity_b: string
          id: string
          probability: number
          rationale: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_a: string
          entity_b: string
          id?: string
          probability: number
          rationale?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_a?: string
          entity_b?: string
          id?: string
          probability?: number
          rationale?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maigret_monitored_usernames: {
        Row: {
          alert_email: string | null
          check_frequency_hours: number | null
          created_at: string | null
          email_alerts_enabled: boolean | null
          id: string
          last_checked_at: string | null
          sites_filter: string[] | null
          updated_at: string | null
          user_id: string | null
          username: string
          workspace_id: string | null
        }
        Insert: {
          alert_email?: string | null
          check_frequency_hours?: number | null
          created_at?: string | null
          email_alerts_enabled?: boolean | null
          id?: string
          last_checked_at?: string | null
          sites_filter?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          workspace_id?: string | null
        }
        Update: {
          alert_email?: string | null
          check_frequency_hours?: number | null
          created_at?: string | null
          email_alerts_enabled?: boolean | null
          id?: string
          last_checked_at?: string | null
          sites_filter?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maigret_monitored_usernames_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      maigret_profile_changes: {
        Row: {
          change_details: Json | null
          change_type: string
          detected_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          new_snapshot_id: string | null
          old_snapshot_id: string | null
          site: string
          username: string
          workspace_id: string | null
        }
        Insert: {
          change_details?: Json | null
          change_type: string
          detected_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          new_snapshot_id?: string | null
          old_snapshot_id?: string | null
          site: string
          username: string
          workspace_id?: string | null
        }
        Update: {
          change_details?: Json | null
          change_type?: string
          detected_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          new_snapshot_id?: string | null
          old_snapshot_id?: string | null
          site?: string
          username?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maigret_profile_changes_new_snapshot_id_fkey"
            columns: ["new_snapshot_id"]
            isOneToOne: false
            referencedRelation: "maigret_profile_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maigret_profile_changes_old_snapshot_id_fkey"
            columns: ["old_snapshot_id"]
            isOneToOne: false
            referencedRelation: "maigret_profile_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maigret_profile_changes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      maigret_profile_snapshots: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          raw_data: Json | null
          scan_id: string | null
          site: string
          status: string
          url: string | null
          username: string
          workspace_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          scan_id?: string | null
          site: string
          status: string
          url?: string | null
          username: string
          workspace_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          scan_id?: string | null
          site?: string
          status?: string
          url?: string | null
          username?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maigret_profile_snapshots_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      maigret_results: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          job_id: string
          raw: Json | null
          status: string
          summary: Json | null
          updated_at: string | null
          user_id: string | null
          username: string
          workspace_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          raw?: Json | null
          status?: string
          summary?: Json | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          workspace_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          raw?: Json | null
          status?: string
          summary?: Json | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maigret_results_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_aggregations: {
        Row: {
          aggregation_period: string
          avg: number | null
          count: number | null
          created_at: string
          dimensions: Json | null
          id: string
          max: number | null
          metric_name: string
          metric_type: string
          min: number | null
          p50: number | null
          p95: number | null
          p99: number | null
          period_end: string
          period_start: string
          sum: number | null
        }
        Insert: {
          aggregation_period: string
          avg?: number | null
          count?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          max?: number | null
          metric_name: string
          metric_type: string
          min?: number | null
          p50?: number | null
          p95?: number | null
          p99?: number | null
          period_end: string
          period_start: string
          sum?: number | null
        }
        Update: {
          aggregation_period?: string
          avg?: number | null
          count?: number | null
          created_at?: string
          dimensions?: Json | null
          id?: string
          max?: number | null
          metric_name?: string
          metric_type?: string
          min?: number | null
          p50?: number | null
          p95?: number | null
          p99?: number | null
          period_end?: string
          period_start?: string
          sum?: number | null
        }
        Relationships: []
      }
      ml_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
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
      ml_training_results: {
        Row: {
          accuracy: number | null
          created_at: string
          id: string
          model_version: string
          patterns: Json | null
          samples_processed: number
          trained_at: string
          training_type: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          id?: string
          model_version: string
          patterns?: Json | null
          samples_processed: number
          trained_at?: string
          training_type: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          id?: string
          model_version?: string
          patterns?: Json | null
          samples_processed?: number
          trained_at?: string
          training_type?: string
        }
        Relationships: []
      }
      monitor_runs: {
        Row: {
          diff_hash: string | null
          finished_at: string | null
          id: string
          metadata: Json | null
          new_findings_count: number | null
          schedule_id: string
          started_at: string
          status: string
        }
        Insert: {
          diff_hash?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          new_findings_count?: number | null
          schedule_id: string
          started_at?: string
          status?: string
        }
        Update: {
          diff_hash?: string | null
          finished_at?: string | null
          id?: string
          metadata?: Json | null
          new_findings_count?: number | null
          schedule_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_runs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "monitoring_schedules"
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_connections: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          metadata: Json | null
          provider: string
          provider_user_id: string
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          provider: string
          provider_user_id: string
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          provider?: string
          provider_user_id?: string
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          provider: string
          state: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          provider: string
          state: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          provider?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
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
      payment_errors: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_id: string | null
          error_code: string
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          payment_intent_id: string | null
          price_id: string | null
          resolved: boolean | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          error_code: string
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          price_id?: string | null
          resolved?: boolean | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          error_code?: string
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          payment_intent_id?: string | null
          price_id?: string | null
          resolved?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pdf_branding_settings: {
        Row: {
          company_name: string | null
          company_tagline: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          company_tagline?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          company_tagline?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_baselines: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_type: string
          p50_value: number
          p95_value: number
          p99_value: number
          period_end: string
          period_start: string
          resource_name: string
          sample_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_type: string
          p50_value: number
          p95_value: number
          p99_value: number
          period_end: string
          period_start: string
          resource_name: string
          sample_count: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_type?: string
          p50_value?: number
          p95_value?: number
          p99_value?: number
          period_end?: string
          period_start?: string
          resource_name?: string
          sample_count?: number
        }
        Relationships: []
      }
      persona_vectors: {
        Row: {
          confidence: number | null
          created_at: string
          entity_id: string
          id: string
          metadata: Json | null
          modality: string
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          entity_id: string
          id?: string
          metadata?: Json | null
          modality: string
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          entity_id?: string
          id?: string
          metadata?: Json | null
          modality?: string
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plugin_installations: {
        Row: {
          config: Json | null
          id: string
          installed_at: string
          is_enabled: boolean
          last_used_at: string | null
          plugin_id: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          id?: string
          installed_at?: string
          is_enabled?: boolean
          last_used_at?: string | null
          plugin_id: string
          user_id: string
        }
        Update: {
          config?: Json | null
          id?: string
          installed_at?: string
          is_enabled?: boolean
          last_used_at?: string | null
          plugin_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installations_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_installs: {
        Row: {
          config: Json
          enabled: boolean
          id: string
          installed_at: string
          plugin_id: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          config?: Json
          enabled?: boolean
          id?: string
          installed_at?: string
          plugin_id: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          config?: Json
          enabled?: boolean
          id?: string
          installed_at?: string
          plugin_id?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installs_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_manifests: {
        Row: {
          author_id: string
          category: string
          created_at: string
          description: string | null
          documentation_url: string | null
          download_count: number
          icon_url: string | null
          id: string
          manifest: Json
          name: string
          permissions: string[] | null
          published_at: string | null
          rating: number | null
          repository_url: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          author_id: string
          category: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          download_count?: number
          icon_url?: string | null
          id?: string
          manifest: Json
          name: string
          permissions?: string[] | null
          published_at?: string | null
          rating?: number | null
          repository_url?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          download_count?: number
          icon_url?: string | null
          id?: string
          manifest?: Json
          name?: string
          permissions?: string[] | null
          published_at?: string | null
          rating?: number | null
          repository_url?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      plugin_reviews: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["plugin_status"]
          id: string
          notes: string | null
          plugin_id: string
          reviewer_id: string
          security_scan: Json | null
          test_results: Json | null
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["plugin_status"]
          id?: string
          notes?: string | null
          plugin_id: string
          reviewer_id: string
          security_scan?: Json | null
          test_results?: Json | null
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["plugin_status"]
          id?: string
          notes?: string | null
          plugin_id?: string
          reviewer_id?: string
          security_scan?: Json | null
          test_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_reviews_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_usage: {
        Row: {
          calls: number
          cost_cents: number
          day: string
          errors: number
          id: string
          plugin_id: string
          revenue_cents: number
        }
        Insert: {
          calls?: number
          cost_cents?: number
          day: string
          errors?: number
          id?: string
          plugin_id: string
          revenue_cents?: number
        }
        Update: {
          calls?: number
          cost_cents?: number
          day?: string
          errors?: number
          id?: string
          plugin_id?: string
          revenue_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "plugin_usage_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugins: {
        Row: {
          author_id: string
          author_name: string
          created_at: string
          description: string | null
          documentation_url: string | null
          entry_url: string
          icon_url: string | null
          id: string
          manifest: Json
          published_at: string | null
          revenue_share_pct: number
          status: Database["public"]["Enums"]["plugin_status"]
          stripe_account_id: string | null
          support_url: string | null
          suspended_reason: string | null
          tags: string[]
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          author_id: string
          author_name: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          entry_url: string
          icon_url?: string | null
          id?: string
          manifest?: Json
          published_at?: string | null
          revenue_share_pct?: number
          status?: Database["public"]["Enums"]["plugin_status"]
          stripe_account_id?: string | null
          support_url?: string | null
          suspended_reason?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          created_at?: string
          description?: string | null
          documentation_url?: string | null
          entry_url?: string
          icon_url?: string | null
          id?: string
          manifest?: Json
          published_at?: string | null
          revenue_share_pct?: number
          status?: Database["public"]["Enums"]["plugin_status"]
          stripe_account_id?: string | null
          support_url?: string | null
          suspended_reason?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          version?: string
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
      predictive_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          id: string
          last_trained_at: string
          model_data: Json
          model_type: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          last_trained_at?: string
          model_data: Json
          model_type: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          id?: string
          last_trained_at?: string
          model_data?: Json
          model_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anon_mode_enabled: boolean | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          persona: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anon_mode_enabled?: boolean | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          persona?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anon_mode_enabled?: boolean | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          persona?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_health: {
        Row: {
          circuit_breaker_state: string | null
          circuit_breaker_trips_24h: number | null
          degradation_reason: string | null
          health_score: number
          id: string
          is_critical: boolean
          is_degraded: boolean
          is_healthy: boolean
          last_checked_at: string
          provider_id: string
          recent_avg_latency_ms: number | null
          recent_error_count: number | null
          recent_success_rate: number | null
          recent_timeout_count: number | null
          updated_at: string
        }
        Insert: {
          circuit_breaker_state?: string | null
          circuit_breaker_trips_24h?: number | null
          degradation_reason?: string | null
          health_score?: number
          id?: string
          is_critical?: boolean
          is_degraded?: boolean
          is_healthy?: boolean
          last_checked_at?: string
          provider_id: string
          recent_avg_latency_ms?: number | null
          recent_error_count?: number | null
          recent_success_rate?: number | null
          recent_timeout_count?: number | null
          updated_at?: string
        }
        Update: {
          circuit_breaker_state?: string | null
          circuit_breaker_trips_24h?: number | null
          degradation_reason?: string | null
          health_score?: number
          id?: string
          is_critical?: boolean
          is_degraded?: boolean
          is_healthy?: boolean
          last_checked_at?: string
          provider_id?: string
          recent_avg_latency_ms?: number | null
          recent_error_count?: number | null
          recent_success_rate?: number | null
          recent_timeout_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_quality_scores: {
        Row: {
          avg_error_rate_30d: number | null
          avg_error_rate_7d: number | null
          avg_f1_score_30d: number | null
          avg_f1_score_7d: number | null
          avg_p95_latency_30d: number | null
          avg_p95_latency_7d: number | null
          degradation_reason: string | null
          id: string
          is_degraded: boolean | null
          last_tested_at: string | null
          provider_id: string
          quality_rank: number | null
          reliability_rank: number | null
          speed_rank: number | null
          updated_at: string
        }
        Insert: {
          avg_error_rate_30d?: number | null
          avg_error_rate_7d?: number | null
          avg_f1_score_30d?: number | null
          avg_f1_score_7d?: number | null
          avg_p95_latency_30d?: number | null
          avg_p95_latency_7d?: number | null
          degradation_reason?: string | null
          id?: string
          is_degraded?: boolean | null
          last_tested_at?: string | null
          provider_id: string
          quality_rank?: number | null
          reliability_rank?: number | null
          speed_rank?: number | null
          updated_at?: string
        }
        Update: {
          avg_error_rate_30d?: number | null
          avg_error_rate_7d?: number | null
          avg_f1_score_30d?: number | null
          avg_f1_score_7d?: number | null
          avg_p95_latency_30d?: number | null
          avg_p95_latency_7d?: number | null
          degradation_reason?: string | null
          id?: string
          is_degraded?: boolean | null
          last_tested_at?: string | null
          provider_id?: string
          quality_rank?: number | null
          reliability_rank?: number | null
          speed_rank?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      proxy_configs: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          proxy_type: string
          proxy_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          proxy_type: string
          proxy_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          proxy_type?: string
          proxy_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quality_corpus: {
        Row: {
          artifact_type: string
          artifact_value: string
          corpus_version: string
          created_at: string
          difficulty: string | null
          expected_findings: Json
          id: string
          is_active: boolean
          notes: string | null
          provider_expectations: Json
          tags: string[] | null
          test_case_id: string
          updated_at: string
        }
        Insert: {
          artifact_type: string
          artifact_value: string
          corpus_version?: string
          created_at?: string
          difficulty?: string | null
          expected_findings?: Json
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_expectations?: Json
          tags?: string[] | null
          test_case_id: string
          updated_at?: string
        }
        Update: {
          artifact_type?: string
          artifact_value?: string
          corpus_version?: string
          created_at?: string
          difficulty?: string | null
          expected_findings?: Json
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_expectations?: Json
          tags?: string[] | null
          test_case_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quality_results: {
        Row: {
          accuracy: number | null
          avg_latency_ms: number | null
          circuit_breaker_trips: number | null
          created_at: string
          error_rate_pct: number | null
          f1_score: number | null
          failure_details: Json | null
          false_negatives: number | null
          false_positives: number | null
          id: string
          p50_latency_ms: number | null
          p95_latency_ms: number | null
          p99_latency_ms: number | null
          precision: number | null
          provider_id: string
          recall: number | null
          run_at: string
          sample_size: number
          test_cases_failed: number | null
          test_cases_passed: number | null
          test_corpus_version: string
          timeout_count: number | null
          total_cost_cents: number | null
          true_negatives: number | null
          true_positives: number | null
        }
        Insert: {
          accuracy?: number | null
          avg_latency_ms?: number | null
          circuit_breaker_trips?: number | null
          created_at?: string
          error_rate_pct?: number | null
          f1_score?: number | null
          failure_details?: Json | null
          false_negatives?: number | null
          false_positives?: number | null
          id?: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          precision?: number | null
          provider_id: string
          recall?: number | null
          run_at?: string
          sample_size?: number
          test_cases_failed?: number | null
          test_cases_passed?: number | null
          test_corpus_version?: string
          timeout_count?: number | null
          total_cost_cents?: number | null
          true_negatives?: number | null
          true_positives?: number | null
        }
        Update: {
          accuracy?: number | null
          avg_latency_ms?: number | null
          circuit_breaker_trips?: number | null
          created_at?: string
          error_rate_pct?: number | null
          f1_score?: number | null
          failure_details?: Json | null
          false_negatives?: number | null
          false_positives?: number | null
          id?: string
          p50_latency_ms?: number | null
          p95_latency_ms?: number | null
          p99_latency_ms?: number | null
          precision?: number | null
          provider_id?: string
          recall?: number | null
          run_at?: string
          sample_size?: number
          test_cases_failed?: number | null
          test_cases_passed?: number | null
          test_corpus_version?: string
          timeout_count?: number | null
          total_cost_cents?: number | null
          true_negatives?: number | null
          true_positives?: number | null
        }
        Relationships: []
      }
      query_performance: {
        Row: {
          created_at: string
          execution_time_ms: number
          id: string
          needs_optimization: boolean | null
          operation: string | null
          query_hash: string
          query_type: string
          rows_examined: number | null
          rows_returned: number | null
          table_name: string | null
          used_index: boolean | null
        }
        Insert: {
          created_at?: string
          execution_time_ms: number
          id?: string
          needs_optimization?: boolean | null
          operation?: string | null
          query_hash: string
          query_type: string
          rows_examined?: number | null
          rows_returned?: number | null
          table_name?: string | null
          used_index?: boolean | null
        }
        Update: {
          created_at?: string
          execution_time_ms?: number
          id?: string
          needs_optimization?: boolean | null
          operation?: string | null
          query_hash?: string
          query_type?: string
          rows_examined?: number | null
          rows_returned?: number | null
          table_name?: string | null
          used_index?: boolean | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          current_count: number
          endpoint: string
          id: string
          identifier: string
          identifier_type: string
          last_request_at: string
          limit_per_window: number
          total_blocked: number
          total_requests: number
          updated_at: string
          window_seconds: number
          window_start: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          endpoint: string
          id?: string
          identifier: string
          identifier_type: string
          last_request_at?: string
          limit_per_window?: number
          total_blocked?: number
          total_requests?: number
          updated_at?: string
          window_seconds?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          current_count?: number
          endpoint?: string
          id?: string
          identifier?: string
          identifier_type?: string
          last_request_at?: string
          limit_per_window?: number
          total_blocked?: number
          total_requests?: number
          updated_at?: string
          window_seconds?: number
          window_start?: string
        }
        Relationships: []
      }
      recon_ng_auto_updates: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_check_at: string | null
          last_update_at: string | null
          modules_to_watch: string[] | null
          notification_enabled: boolean
          schedule: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_check_at?: string | null
          last_update_at?: string | null
          modules_to_watch?: string[] | null
          notification_enabled?: boolean
          schedule?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_check_at?: string | null
          last_update_at?: string | null
          modules_to_watch?: string[] | null
          notification_enabled?: boolean
          schedule?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recon_ng_auto_updates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recon_ng_scans: {
        Row: {
          completed_at: string | null
          correlations: Json | null
          created_at: string
          error_message: string | null
          id: string
          modules: string[] | null
          results: Json | null
          status: string
          target: string
          target_type: string
          total_results: number | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          correlations?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          modules?: string[] | null
          results?: Json | null
          status?: string
          target: string
          target_type: string
          total_results?: number | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          correlations?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          modules?: string[] | null
          results?: Json | null
          status?: string
          target?: string
          target_type?: string
          total_results?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recon_ng_scans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recon_ng_update_history: {
        Row: {
          changelog: string | null
          error_message: string | null
          id: string
          module_name: string
          new_version: string
          old_version: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          changelog?: string | null
          error_message?: string | null
          id?: string
          module_name: string
          new_version: string
          old_version?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          changelog?: string | null
          error_message?: string | null
          id?: string
          module_name?: string
          new_version?: string
          old_version?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recon_ng_update_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          user_id: string
          uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          user_id: string
          uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          user_id?: string
          uses?: number | null
        }
        Relationships: []
      }
      referral_stats: {
        Row: {
          created_at: string | null
          pending_referrals: number | null
          successful_referrals: number | null
          total_credits_earned: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pending_referrals?: number | null
          successful_referrals?: number | null
          total_credits_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          pending_referrals?: number | null
          successful_referrals?: number | null
          total_credits_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referee_id: string
          referee_reward_credits: number | null
          referral_code: string
          referrer_id: string
          referrer_reward_credits: number | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id: string
          referee_reward_credits?: number | null
          referral_code: string
          referrer_id: string
          referrer_reward_credits?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string
          referee_reward_credits?: number | null
          referral_code?: string
          referrer_id?: string
          referrer_reward_credits?: number | null
          rewarded_at?: string | null
          status?: string
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
      report_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          format: string
          id: string
          report_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          format: string
          id?: string
          report_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          format?: string
          id?: string
          report_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
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
      risk_valuations: {
        Row: {
          calculated_at: string
          client_id: string | null
          confidence: number
          currency: string
          entity_id: string
          id: string
          impact_value: number
          metadata: Json | null
          probability: number
          risk_type: string
        }
        Insert: {
          calculated_at?: string
          client_id?: string | null
          confidence: number
          currency?: string
          entity_id: string
          id?: string
          impact_value: number
          metadata?: Json | null
          probability: number
          risk_type: string
        }
        Update: {
          calculated_at?: string
          client_id?: string | null
          confidence?: number
          currency?: string
          entity_id?: string
          id?: string
          impact_value?: number
          metadata?: Json | null
          probability?: number
          risk_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_valuations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_runs: {
        Row: {
          artifact_type: string | null
          bytes_returned: number | null
          created_at: string
          error_message: string | null
          findings_count: number | null
          id: string
          latency_ms: number
          plugin_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          artifact_type?: string | null
          bytes_returned?: number | null
          created_at?: string
          error_message?: string | null
          findings_count?: number | null
          id?: string
          latency_ms: number
          plugin_id: string
          status: string
          user_id?: string | null
        }
        Update: {
          artifact_type?: string | null
          bytes_returned?: number | null
          created_at?: string
          error_message?: string | null
          findings_count?: number | null
          id?: string
          latency_ms?: number
          plugin_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_reports: {
        Row: {
          created_at: string
          filters: Json
          id: string
          title: string
          updated_at: string
          user_id: string
          widgets: Json
          workspace_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          title: string
          updated_at?: string
          user_id: string
          widgets?: Json
          workspace_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          widgets?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_views: {
        Row: {
          columns: string[]
          created_at: string | null
          density: string
          filters: Json
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          columns: string[]
          created_at?: string | null
          density?: string
          filters: Json
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          columns?: string[]
          created_at?: string | null
          density?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          downloaded_at: string | null
          file_size_bytes: number | null
          file_url: string
          generated_at: string
          id: string
          scan_id: string
          signed_url: string | null
          signed_url_expires_at: string | null
          updated_at: string
        }
        Insert: {
          artifact_type: string
          created_at?: string
          downloaded_at?: string | null
          file_size_bytes?: number | null
          file_url: string
          generated_at?: string
          id?: string
          scan_id: string
          signed_url?: string | null
          signed_url_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          artifact_type?: string
          created_at?: string
          downloaded_at?: string | null
          file_size_bytes?: number | null
          file_url?: string
          generated_at?: string
          id?: string
          scan_id?: string
          signed_url?: string | null
          signed_url_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_artifacts_scan_id_fkey"
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
      scan_events: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          provider: string
          scan_id: string
          stage: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          scan_id: string
          stage: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          scan_id?: string
          stage?: string
          status?: string | null
        }
        Relationships: []
      }
      scan_findings: {
        Row: {
          job_id: string
          raw: Json | null
          site: string
          status: string | null
          url: string | null
        }
        Insert: {
          job_id: string
          raw?: Json | null
          site: string
          status?: string | null
          url?: string | null
        }
        Update: {
          job_id?: string
          raw?: Json | null
          site?: string
          status?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_findings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_jobs: {
        Row: {
          all_sites: boolean | null
          archived_at: string | null
          artifacts: string[] | null
          created_at: string | null
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          last_provider_update: string | null
          partial_results: Json | null
          plan: string
          providers_completed: number | null
          providers_total: number | null
          requested_by: string | null
          started_at: string | null
          status: string
          tags: string | null
          username: string
          workspace_id: string
        }
        Insert: {
          all_sites?: boolean | null
          archived_at?: string | null
          artifacts?: string[] | null
          created_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          last_provider_update?: string | null
          partial_results?: Json | null
          plan?: string
          providers_completed?: number | null
          providers_total?: number | null
          requested_by?: string | null
          started_at?: string | null
          status?: string
          tags?: string | null
          username: string
          workspace_id: string
        }
        Update: {
          all_sites?: boolean | null
          archived_at?: string | null
          artifacts?: string[] | null
          created_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          last_provider_update?: string | null
          partial_results?: Json | null
          plan?: string
          providers_completed?: number | null
          providers_total?: number | null
          requested_by?: string | null
          started_at?: string | null
          status?: string
          tags?: string | null
          username?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_progress: {
        Row: {
          completed_providers: number | null
          created_at: string | null
          current_provider: string | null
          current_providers: string[] | null
          error: boolean | null
          findings_count: number | null
          id: string
          message: string | null
          scan_id: string
          status: string
          total_providers: number | null
          updated_at: string | null
        }
        Insert: {
          completed_providers?: number | null
          created_at?: string | null
          current_provider?: string | null
          current_providers?: string[] | null
          error?: boolean | null
          findings_count?: number | null
          id?: string
          message?: string | null
          scan_id: string
          status: string
          total_providers?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_providers?: number | null
          created_at?: string | null
          current_provider?: string | null
          current_providers?: string[] | null
          error?: boolean | null
          findings_count?: number | null
          id?: string
          message?: string | null
          scan_id?: string
          status?: string
          total_providers?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scan"
            columns: ["scan_id"]
            isOneToOne: true
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_provider_events: {
        Row: {
          created_at: string
          error: Json | null
          event: string
          id: string
          message: string | null
          provider: string
          result_count: number | null
          scan_id: string
        }
        Insert: {
          created_at?: string
          error?: Json | null
          event: string
          id?: string
          message?: string | null
          provider: string
          result_count?: number | null
          scan_id: string
        }
        Update: {
          created_at?: string
          error?: Json | null
          event?: string
          id?: string
          message?: string | null
          provider?: string
          result_count?: number | null
          scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_provider_events_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_results: {
        Row: {
          job_id: string
          line_no: number
          ndjson: Json
        }
        Insert: {
          job_id: string
          line_no: number
          ndjson: Json
        }
        Update: {
          job_id?: string
          line_no?: number
          ndjson?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scan_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_templates: {
        Row: {
          category: string | null
          configuration: Json
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          configuration: Json
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          archived_at: string | null
          cache_key: string | null
          cached_from_scan_id: string | null
          completed_at: string | null
          created_at: string
          email: string | null
          first_name: string | null
          gosearch_pending: boolean
          high_risk_count: number | null
          id: string
          last_name: string | null
          low_risk_count: number | null
          medium_risk_count: number | null
          phone: string | null
          privacy_score: number | null
          provider_counts: Json | null
          scan_type: Database["public"]["Enums"]["scan_type"]
          status: string | null
          total_sources_found: number | null
          user_id: string
          username: string | null
          workspace_id: string | null
        }
        Insert: {
          archived_at?: string | null
          cache_key?: string | null
          cached_from_scan_id?: string | null
          completed_at?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gosearch_pending?: boolean
          high_risk_count?: number | null
          id?: string
          last_name?: string | null
          low_risk_count?: number | null
          medium_risk_count?: number | null
          phone?: string | null
          privacy_score?: number | null
          provider_counts?: Json | null
          scan_type: Database["public"]["Enums"]["scan_type"]
          status?: string | null
          total_sources_found?: number | null
          user_id: string
          username?: string | null
          workspace_id?: string | null
        }
        Update: {
          archived_at?: string | null
          cache_key?: string | null
          cached_from_scan_id?: string | null
          completed_at?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gosearch_pending?: boolean
          high_risk_count?: number | null
          id?: string
          last_name?: string | null
          low_risk_count?: number | null
          medium_risk_count?: number | null
          phone?: string | null
          privacy_score?: number | null
          provider_counts?: Json | null
          scan_type?: Database["public"]["Enums"]["scan_type"]
          status?: string | null
          total_sources_found?: number | null
          user_id?: string
          username?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_cached_from_scan_id_fkey"
            columns: ["cached_from_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_scan_findings: {
        Row: {
          created_at: string | null
          findings_count: number
          findings_snapshot: Json | null
          id: string
          new_findings_count: number
          scan_id: string
          scheduled_scan_id: string
        }
        Insert: {
          created_at?: string | null
          findings_count?: number
          findings_snapshot?: Json | null
          id?: string
          new_findings_count?: number
          scan_id: string
          scheduled_scan_id: string
        }
        Update: {
          created_at?: string | null
          findings_count?: number
          findings_snapshot?: Json | null
          id?: string
          new_findings_count?: number
          scan_id?: string
          scheduled_scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_scan_findings_scheduled_scan_id_fkey"
            columns: ["scheduled_scan_id"]
            isOneToOne: false
            referencedRelation: "scheduled_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_scans: {
        Row: {
          created_at: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_scan_id: string | null
          next_run_at: string
          notify_on_new_findings: boolean | null
          options: Json | null
          providers: Json | null
          scan_type: string
          target_value: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_scan_id?: string | null
          next_run_at: string
          notify_on_new_findings?: boolean | null
          options?: Json | null
          providers?: Json | null
          scan_type: string
          target_value: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_scan_id?: string | null
          next_run_at?: string
          notify_on_new_findings?: boolean | null
          options?: Json | null
          providers?: Json | null
          scan_type?: string
          target_value?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_scans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          check_type: string
          checked_at: string
          details: Json | null
          id: string
          message: string
          severity: string
        }
        Insert: {
          check_type: string
          checked_at?: string
          details?: Json | null
          id?: string
          message: string
          severity: string
        }
        Update: {
          check_type?: string
          checked_at?: string
          details?: Json | null
          id?: string
          message?: string
          severity?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          endpoint: string
          event_type: string
          id: string
          ip_address: unknown
          message: string
          payload: Json | null
          severity: string
          threat_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          event_type: string
          id?: string
          ip_address?: unknown
          message: string
          payload?: Json | null
          severity: string
          threat_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          message?: string
          payload?: Json | null
          severity?: string
          threat_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sensitive_consents: {
        Row: {
          categories: string[]
          id: string
          noted_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          categories: string[]
          id?: string
          noted_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          categories?: string[]
          id?: string
          noted_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      share_links: {
        Row: {
          access_count: number | null
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          last_accessed_at: string | null
          scan_id: string
          share_token: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          last_accessed_at?: string | null
          scan_id: string
          share_token: string
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          scan_id?: string
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      slo_definitions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          measurement_window: string
          name: string
          severity: string
          slo_type: string
          target_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          measurement_window?: string
          name: string
          severity?: string
          slo_type: string
          target_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          measurement_window?: string
          name?: string
          severity?: string
          slo_type?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      slo_measurements: {
        Row: {
          created_at: string
          id: string
          is_violation: boolean
          measured_at: string
          measured_value: number
          metadata: Json | null
          slo_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_violation?: boolean
          measured_at?: string
          measured_value: number
          metadata?: Json | null
          slo_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_violation?: boolean
          measured_at?: string
          measured_value?: number
          metadata?: Json | null
          slo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slo_measurements_slo_id_fkey"
            columns: ["slo_id"]
            isOneToOne: false
            referencedRelation: "slo_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      social_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          last_scan_at: string | null
          metadata: Json | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          last_scan_at?: string | null
          metadata?: Json | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          last_scan_at?: string | null
          metadata?: Json | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_findings: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          discovered_at: string | null
          finding_type: string
          id: string
          integration_id: string
          platform: string
          risk_level: string | null
          title: string
          updated_at: string | null
          url: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          finding_type: string
          id?: string
          integration_id: string
          platform: string
          risk_level?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          discovered_at?: string | null
          finding_type?: string
          id?: string
          integration_id?: string
          platform?: string
          risk_level?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_findings_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "social_integrations"
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
          confidence_score: number | null
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
          source: string | null
          username: string
        }
        Insert: {
          account_id?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          confidence_score?: number | null
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
          source?: string | null
          username: string
        }
        Update: {
          account_id?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          confidence_score?: number | null
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
          source?: string | null
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
      source_credibility: {
        Row: {
          confidence: number | null
          created_at: string | null
          credibility_score: number | null
          data_quality_score: number | null
          id: string
          provider_name: string
          reasoning: string | null
          scan_id: string | null
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          credibility_score?: number | null
          data_quality_score?: number | null
          id?: string
          provider_name: string
          reasoning?: string | null
          scan_id?: string | null
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          credibility_score?: number | null
          data_quality_score?: number | null
          id?: string
          provider_name?: string
          reasoning?: string | null
          scan_id?: string | null
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_credibility_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      spiderfoot_scans: {
        Row: {
          completed_at: string | null
          correlations: Json | null
          created_at: string
          credits_used: number | null
          error: string | null
          id: string
          modules: string[] | null
          results: Json | null
          scan_id: string | null
          started_at: string | null
          status: string
          target: string
          target_type: string
          total_events: number | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          completed_at?: string | null
          correlations?: Json | null
          created_at?: string
          credits_used?: number | null
          error?: string | null
          id?: string
          modules?: string[] | null
          results?: Json | null
          scan_id?: string | null
          started_at?: string | null
          status?: string
          target: string
          target_type: string
          total_events?: number | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          completed_at?: string | null
          correlations?: Json | null
          created_at?: string
          credits_used?: number | null
          error?: string | null
          id?: string
          modules?: string[] | null
          results?: Json | null
          scan_id?: string | null
          started_at?: string | null
          status?: string
          target?: string
          target_type?: string
          total_events?: number | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiderfoot_scans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events_processed: {
        Row: {
          event_id: string
          processed_at: string
        }
        Insert: {
          event_id: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          processed_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          scan_limit_monthly: number
          scans_used_monthly: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          scan_limit_monthly?: number
          scans_used_monthly?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          scan_limit_monthly?: number
          scans_used_monthly?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: Json | null
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          last_reply_at: string | null
          priority: string
          status: string
          subject: string
          ticket_number: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          last_reply_at?: string | null
          priority?: string
          status?: string
          subject: string
          ticket_number?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          last_reply_at?: string | null
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_logs: {
        Row: {
          ai_summary: string | null
          audit_type: string
          created_at: string
          details: Json
          duration_ms: number
          id: string
          issues_fixed: number
          issues_found: number
          prioritized_issues: Json | null
          severity_breakdown: Json
        }
        Insert: {
          ai_summary?: string | null
          audit_type: string
          created_at?: string
          details?: Json
          duration_ms: number
          id?: string
          issues_fixed?: number
          issues_found?: number
          prioritized_issues?: Json | null
          severity_breakdown?: Json
        }
        Update: {
          ai_summary?: string | null
          audit_type?: string
          created_at?: string
          details?: Json
          duration_ms?: number
          id?: string
          issues_fixed?: number
          issues_found?: number
          prioritized_issues?: Json | null
          severity_breakdown?: Json
        }
        Relationships: []
      }
      system_audit_results: {
        Row: {
          ai_priority: string | null
          ai_summary: string | null
          audit_type: string
          component: string | null
          created_at: string
          details: Json | null
          failure_rate: number | null
          id: string
          metadata: Json | null
          recommendations: string[] | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          ai_priority?: string | null
          ai_summary?: string | null
          audit_type: string
          component?: string | null
          created_at?: string
          details?: Json | null
          failure_rate?: number | null
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          resolved_at?: string | null
          resolved_by?: string | null
          status: string
        }
        Update: {
          ai_priority?: string | null
          ai_summary?: string | null
          audit_type?: string
          component?: string | null
          created_at?: string
          details?: Json | null
          failure_rate?: number | null
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      system_errors: {
        Row: {
          created_at: string
          error_code: string
          error_message: string
          function_name: string | null
          id: string
          metadata: Json | null
          provider: string | null
          scan_id: string | null
          severity: string
          stack_trace: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          error_code: string
          error_message: string
          function_name?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          scan_id?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string
          error_message?: string
          function_name?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          scan_id?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
          workspace_id?: string | null
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
      template_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      template_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          usage_count?: number | null
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
      threat_forecasts: {
        Row: {
          confidence_intervals: Json | null
          created_at: string
          forecast_horizon_days: number
          forecast_type: string
          id: string
          model_used: string
          prediction_data: Json
          user_id: string
          valid_until: string
        }
        Insert: {
          confidence_intervals?: Json | null
          created_at?: string
          forecast_horizon_days?: number
          forecast_type: string
          id?: string
          model_used: string
          prediction_data: Json
          user_id: string
          valid_until: string
        }
        Update: {
          confidence_intervals?: Json | null
          created_at?: string
          forecast_horizon_days?: number
          forecast_type?: string
          id?: string
          model_used?: string
          prediction_data?: Json
          user_id?: string
          valid_until?: string
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
      user_achievements: {
        Row: {
          badges: Json | null
          created_at: string | null
          current_streak: number | null
          id: string
          last_scan_date: string | null
          longest_streak: number | null
          total_removals: number | null
          total_scans: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_scan_date?: string | null
          longest_streak?: number | null
          total_removals?: number | null
          total_scans?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_scan_date?: string | null
          longest_streak?: number | null
          total_removals?: number | null
          total_scans?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: unknown
          revoked_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          plan: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          plan?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          plan?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          configuration: Json
          created_at: string | null
          id: string
          integration_id: string
          is_active: boolean | null
          last_sync_at: string | null
          user_id: string
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          id?: string
          integration_id: string
          is_active?: boolean | null
          last_sync_at?: string | null
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          id?: string
          integration_id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
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
      user_preferences: {
        Row: {
          ai_preferred_model: string | null
          user_id: string
        }
        Insert: {
          ai_preferred_model?: string | null
          user_id: string
        }
        Update: {
          ai_preferred_model?: string | null
          user_id?: string
        }
        Relationships: []
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
      username_site_cache: {
        Row: {
          last_seen: string | null
          last_status: string | null
          last_url: string | null
          raw: Json | null
          site: string
          username: string
        }
        Insert: {
          last_seen?: string | null
          last_status?: string | null
          last_url?: string | null
          raw?: Json | null
          site: string
          username: string
        }
        Update: {
          last_seen?: string | null
          last_status?: string | null
          last_url?: string | null
          raw?: Json | null
          site?: string
          username?: string
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
      warehouse_connectors: {
        Row: {
          config: Json
          connector_type: string
          created_at: string
          enabled: boolean
          id: string
          last_sync_at: string | null
          name: string
          sync_status: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          config: Json
          connector_type: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_sync_at?: string | null
          name: string
          sync_status?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          config?: Json
          connector_type?: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_sync_at?: string | null
          name?: string
          sync_status?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      watchlist_members: {
        Row: {
          added_at: string | null
          added_by: string | null
          entity_id: string
          id: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          entity_id: string
          id?: string
          watchlist_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          entity_id?: string
          id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_members_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entity_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_members_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          rules: Json | null
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rules?: Json | null
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rules?: Json | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_endpoints: {
        Row: {
          connector_type: string
          created_at: string
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          signing_secret: string
          success_count: number
          updated_at: string
          url: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          connector_type: string
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          signing_secret: string
          success_count?: number
          updated_at?: string
          url: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          connector_type?: string
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          signing_secret?: string
          success_count?: number
          updated_at?: string
          url?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      worker_health_checks: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          response_time_ms: number | null
          status: string
          worker_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          status: string
          worker_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          status?: string
          worker_name?: string
        }
        Relationships: []
      }
      worker_status: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_check_at: string | null
          last_success_at: string | null
          metadata: Json | null
          response_time_ms: number | null
          status: string
          updated_at: string | null
          worker_name: string
          worker_type: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_check_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          status?: string
          updated_at?: string | null
          worker_name: string
          worker_type: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_check_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          status?: string
          updated_at?: string | null
          worker_name?: string
          worker_type?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          trigger_type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          trigger_type: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_name: string
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_name: string
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_name?: string
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_features_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_rate_limits: {
        Row: {
          created_at: string
          current_count: number
          id: string
          max_allowed: number
          rate_limit_type: string
          updated_at: string
          window_size_seconds: number
          window_start: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          id?: string
          max_allowed?: number
          rate_limit_type: string
          updated_at?: string
          window_size_seconds?: number
          window_start?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          current_count?: number
          id?: string
          max_allowed?: number
          rate_limit_type?: string
          updated_at?: string
          window_size_seconds?: number
          window_start?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_rate_limits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_settings: {
        Row: {
          auto_refill_enabled: boolean | null
          auto_refill_package: string | null
          auto_refill_threshold: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          auto_refill_enabled?: boolean | null
          auto_refill_package?: string | null
          auto_refill_threshold?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          auto_refill_enabled?: boolean | null
          auto_refill_package?: string | null
          auto_refill_threshold?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          plan: string | null
          scan_limit_monthly: number | null
          scans_used_monthly: number | null
          settings: Json | null
          slug: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string | null
          scan_limit_monthly?: number | null
          scans_used_monthly?: number | null
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string | null
          scan_limit_monthly?: number | null
          scans_used_monthly?: number | null
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          _amount: number
          _description: string
          _transaction_type?: string
          _workspace_id: string
        }
        Returns: Json
      }
      check_ip_rate_limit: {
        Args: {
          _endpoint: string
          _ip_address: unknown
          _max_attempts?: number
        }
        Returns: boolean
      }
      check_workspace_scan_limit: {
        Args: { _rate_type?: string; _workspace_id: string }
        Returns: boolean
      }
      claim_background_job: {
        Args: { worker_id_param: string }
        Returns: {
          job_id: string
          job_type: string
          payload: Json
        }[]
      }
      cleanup_expired_cache: { Args: never; Returns: undefined }
      cleanup_expired_oauth_states: { Args: never; Returns: undefined }
      cleanup_expired_rate_limits: { Args: never; Returns: undefined }
      cleanup_scan_pii: { Args: never; Returns: undefined }
      generate_case_number: { Args: never; Returns: string }
      generate_incident_number: { Args: never; Returns: string }
      generate_referral_code: { Args: { _user_id: string }; Returns: string }
      generate_support_ticket_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      get_credits_balance: { Args: { _workspace_id: string }; Returns: number }
      get_stuck_scans: {
        Args: { minutes_threshold?: number }
        Returns: {
          created_at: string
          scan_id: string
          scan_type: string
          status: string
          stuck_minutes: number
          target_value: string
          workspace_id: string
        }[]
      }
      get_system_audit_failure_rate: {
        Args: { _audit_type?: string; _hours_back?: number }
        Returns: number
      }
      get_workspace_role: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
      grant_admin_role: {
        Args: { _caller_token?: string; _user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_subscription_tier: {
        Args: { _required_tier: string; _user_id: string }
        Returns: boolean
      }
      has_workspace_permission: {
        Args: {
          _required_role: Database["public"]["Enums"]["workspace_role"]
          _user_id: string
          _workspace_id: string
        }
        Returns: boolean
      }
      increment_tag_usage: { Args: { tag_names: string[] }; Returns: undefined }
      is_organization_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user: string; _workspace: string }
        Returns: boolean
      }
      is_workspace_owner:
        | { Args: { _workspace_id: string }; Returns: boolean }
        | {
            Args: { _user_id: string; _workspace_id: string }
            Returns: boolean
          }
      log_audit_event: {
        Args: {
          _action: string
          _meta?: Json
          _target?: string
          _user_id: string
          _workspace_id: string
        }
        Returns: string
      }
      log_system_error: {
        Args: {
          p_error_code: string
          p_error_message: string
          p_function_name?: string
          p_metadata?: Json
          p_provider?: string
          p_scan_id?: string
          p_severity?: string
          p_user_id?: string
          p_workspace_id?: string
        }
        Returns: string
      }
      process_referral_reward: {
        Args: { _referral_id: string }
        Returns: boolean
      }
      reset_expired_rate_limits: { Args: never; Returns: undefined }
      reset_monthly_scans: { Args: never; Returns: undefined }
      reset_monthly_workspace_scans: { Args: never; Returns: undefined }
      spend_credits: {
        Args: {
          _cost: number
          _meta: Json
          _reason: string
          _workspace_id: string
        }
        Returns: boolean
      }
      update_referral_stats: { Args: { _user_id: string }; Returns: undefined }
      update_user_streak: { Args: { _user_id: string }; Returns: undefined }
      update_user_subscription: {
        Args: {
          _expires_at?: string
          _new_tier: Database["public"]["Enums"]["subscription_tier"]
          _user_id: string
        }
        Returns: Json
      }
      user_is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      workspace_has_feature: {
        Args: { _feature_name: string; _workspace_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "viewer" | "analyst" | "admin"
      billing_plan: "analyst" | "pro" | "enterprise"
      billing_status: "active" | "past_due" | "canceled" | "trialing"
      case_priority: "low" | "medium" | "high" | "critical"
      case_status: "draft" | "submitted" | "in_progress" | "resolved" | "closed"
      plugin_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "suspended"
      removal_status: "pending" | "in_progress" | "completed" | "failed"
      risk_level: "low" | "medium" | "high"
      scan_type: "username" | "personal_details" | "both"
      subscription_tier: "free" | "premium" | "family" | "basic" | "enterprise"
      workspace_role: "viewer" | "analyst" | "admin"
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
      app_role: ["viewer", "analyst", "admin"],
      billing_plan: ["analyst", "pro", "enterprise"],
      billing_status: ["active", "past_due", "canceled", "trialing"],
      case_priority: ["low", "medium", "high", "critical"],
      case_status: ["draft", "submitted", "in_progress", "resolved", "closed"],
      plugin_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "suspended",
      ],
      removal_status: ["pending", "in_progress", "completed", "failed"],
      risk_level: ["low", "medium", "high"],
      scan_type: ["username", "personal_details", "both"],
      subscription_tier: ["free", "premium", "family", "basic", "enterprise"],
      workspace_role: ["viewer", "analyst", "admin"],
    },
  },
} as const
