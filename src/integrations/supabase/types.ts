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
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          summary: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          summary: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          summary?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_impersonations: {
        Row: {
          created_at: string
          end_ip: unknown
          end_ua: string | null
          ended_at: string | null
          id: string
          impersonated_user_id: string
          reason: string | null
          session_token: string | null
          start_ip: unknown
          start_ua: string | null
          started_at: string
          super_admin_id: string
        }
        Insert: {
          created_at?: string
          end_ip?: unknown
          end_ua?: string | null
          ended_at?: string | null
          id?: string
          impersonated_user_id: string
          reason?: string | null
          session_token?: string | null
          start_ip?: unknown
          start_ua?: string | null
          started_at?: string
          super_admin_id: string
        }
        Update: {
          created_at?: string
          end_ip?: unknown
          end_ua?: string | null
          ended_at?: string | null
          id?: string
          impersonated_user_id?: string
          reason?: string | null
          session_token?: string | null
          start_ip?: unknown
          start_ua?: string | null
          started_at?: string
          super_admin_id?: string
        }
        Relationships: []
      }
      admin_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          requested_role: Database["public"]["Enums"]["app_role"]
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_section_visits: {
        Row: {
          created_at: string
          id: string
          section: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          section: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          section?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_bulk_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_log: Json | null
          estimated_cost_usd: number | null
          failed_items: number
          id: string
          job_type: string
          processed_items: number
          status: string
          successful_items: number
          target_ids: string[]
          target_section: string
          total_items: number
          total_tokens_used: number
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          estimated_cost_usd?: number | null
          failed_items?: number
          id?: string
          job_type: string
          processed_items?: number
          status?: string
          successful_items?: number
          target_ids?: string[]
          target_section: string
          total_items?: number
          total_tokens_used?: number
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          estimated_cost_usd?: number | null
          failed_items?: number
          id?: string
          job_type?: string
          processed_items?: number
          status?: string
          successful_items?: number
          target_ids?: string[]
          target_section?: string
          total_items?: number
          total_tokens_used?: number
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_config: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          action_type: string
          content_type: string | null
          created_at: string
          error_message: string | null
          estimated_cost_usd: number | null
          id: string
          input_tokens: number | null
          model_used: string
          output_tokens: number | null
          request_metadata: Json | null
          status: string
          total_tokens: number | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          content_type?: string | null
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          model_used?: string
          output_tokens?: number | null
          request_metadata?: Json | null
          status?: string
          total_tokens?: number | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          content_type?: string | null
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          id?: string
          input_tokens?: number | null
          model_used?: string
          output_tokens?: number | null
          request_metadata?: Json | null
          status?: string
          total_tokens?: number | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_alert_configs: {
        Row: {
          comparison_period: string | null
          condition: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metric: string
          name: string
          notification_channels: Json | null
          page_filter: string | null
          recipient_emails: string[] | null
          recipient_phones: string[] | null
          threshold: number
          updated_at: string | null
        }
        Insert: {
          comparison_period?: string | null
          condition: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric: string
          name: string
          notification_channels?: Json | null
          page_filter?: string | null
          recipient_emails?: string[] | null
          recipient_phones?: string[] | null
          threshold: number
          updated_at?: string | null
        }
        Update: {
          comparison_period?: string | null
          condition?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric?: string
          name?: string
          notification_channels?: Json | null
          page_filter?: string | null
          recipient_emails?: string[] | null
          recipient_phones?: string[] | null
          threshold?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_alert_logs: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_config_id: string | null
          comparison_value: number | null
          id: string
          message: string | null
          metric_value: number | null
          notification_status: Json | null
          threshold_value: number | null
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_config_id?: string | null
          comparison_value?: number | null
          id?: string
          message?: string | null
          metric_value?: number | null
          notification_status?: Json | null
          threshold_value?: number | null
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_config_id?: string | null
          comparison_value?: number | null
          id?: string
          message?: string | null
          metric_value?: number | null
          notification_status?: Json | null
          threshold_value?: number | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_alert_logs_alert_config_id_fkey"
            columns: ["alert_config_id"]
            isOneToOne: false
            referencedRelation: "analytics_alert_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_bigquery_exports: {
        Row: {
          bigquery_job_id: string | null
          completed_at: string | null
          created_at: string | null
          date_from: string
          date_to: string
          error_message: string | null
          export_type: string
          id: string
          records_exported: number | null
          status: string | null
        }
        Insert: {
          bigquery_job_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_from: string
          date_to: string
          error_message?: string | null
          export_type: string
          id?: string
          records_exported?: number | null
          status?: string | null
        }
        Update: {
          bigquery_job_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          date_from?: string
          date_to?: string
          error_message?: string | null
          export_type?: string
          id?: string
          records_exported?: number | null
          status?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      analytics_funnel_results: {
        Row: {
          conversion_rate: number | null
          created_at: string
          funnel_id: string | null
          id: string
          result_date: string
          step_results: Json
          total_sessions: number | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          funnel_id?: string | null
          id?: string
          result_date?: string
          step_results?: Json
          total_sessions?: number | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          funnel_id?: string | null
          id?: string
          result_date?: string
          step_results?: Json
          total_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_funnel_results_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "analytics_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_funnels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      analytics_geo_aggregates: {
        Row: {
          aggregate_date: string
          city: string | null
          conversions: number | null
          country: string | null
          created_at: string | null
          id: string
          page_views: number | null
          sessions: number | null
          state: string | null
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          aggregate_date: string
          city?: string | null
          conversions?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          page_views?: number | null
          sessions?: number | null
          state?: string | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          aggregate_date?: string
          city?: string | null
          conversions?: number | null
          country?: string | null
          created_at?: string | null
          id?: string
          page_views?: number | null
          sessions?: number | null
          state?: string | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_report_history: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          executed_at: string | null
          file_size: number | null
          file_url: string | null
          id: string
          records_count: number | null
          scheduled_report_id: string | null
          status: string | null
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          records_count?: number | null
          scheduled_report_id?: string | null
          status?: string | null
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          records_count?: number | null
          scheduled_report_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_report_history_scheduled_report_id_fkey"
            columns: ["scheduled_report_id"]
            isOneToOne: false
            referencedRelation: "analytics_scheduled_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_retention_cohorts: {
        Row: {
          cohort_date: string
          cohort_size: number | null
          created_at: string
          id: string
          retention_data: Json
          updated_at: string
        }
        Insert: {
          cohort_date: string
          cohort_size?: number | null
          created_at?: string
          id?: string
          retention_data?: Json
          updated_at?: string
        }
        Update: {
          cohort_date?: string
          cohort_size?: number | null
          created_at?: string
          id?: string
          retention_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      analytics_scheduled_reports: {
        Row: {
          bigquery_dataset: string | null
          bigquery_table: string | null
          created_at: string | null
          created_by: string | null
          date_range: string | null
          day_of_month: number | null
          day_of_week: number | null
          delivery_method: string | null
          description: string | null
          export_format: string | null
          filters: Json | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipient_emails: string[] | null
          report_type: string
          schedule: string
          storage_path: string | null
          time_of_day: string | null
          updated_at: string | null
        }
        Insert: {
          bigquery_dataset?: string | null
          bigquery_table?: string | null
          created_at?: string | null
          created_by?: string | null
          date_range?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          delivery_method?: string | null
          description?: string | null
          export_format?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipient_emails?: string[] | null
          report_type: string
          schedule: string
          storage_path?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Update: {
          bigquery_dataset?: string | null
          bigquery_table?: string | null
          created_at?: string | null
          created_by?: string | null
          date_range?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          delivery_method?: string | null
          description?: string | null
          export_format?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipient_emails?: string[] | null
          report_type?: string
          schedule?: string
          storage_path?: string | null
          time_of_day?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_session_paths: {
        Row: {
          created_at: string
          duration_seconds: number | null
          entry_page: string | null
          exit_page: string | null
          has_conversion: boolean | null
          id: string
          is_bounce: boolean | null
          page_count: number | null
          path_sequence: string[]
          session_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          entry_page?: string | null
          exit_page?: string | null
          has_conversion?: boolean | null
          id?: string
          is_bounce?: boolean | null
          page_count?: number | null
          path_sequence?: string[]
          session_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          entry_page?: string | null
          exit_page?: string | null
          has_conversion?: boolean | null
          id?: string
          is_bounce?: boolean | null
          page_count?: number | null
          path_sequence?: string[]
          session_id?: string
        }
        Relationships: []
      }
      analytics_settings: {
        Row: {
          ad_personalization_enabled: boolean
          aggregate_retention_days: number | null
          analytics_enabled: boolean
          anonymize_ip: boolean
          created_at: string
          enable_click_tracking: boolean | null
          enable_heatmaps: boolean | null
          enable_scroll_tracking: boolean | null
          heatmap_sampling_rate: number | null
          id: string
          opt_out_cookie_name: string | null
          raw_event_retention_days: number | null
          updated_at: string
        }
        Insert: {
          ad_personalization_enabled?: boolean
          aggregate_retention_days?: number | null
          analytics_enabled?: boolean
          anonymize_ip?: boolean
          created_at?: string
          enable_click_tracking?: boolean | null
          enable_heatmaps?: boolean | null
          enable_scroll_tracking?: boolean | null
          heatmap_sampling_rate?: number | null
          id?: string
          opt_out_cookie_name?: string | null
          raw_event_retention_days?: number | null
          updated_at?: string
        }
        Update: {
          ad_personalization_enabled?: boolean
          aggregate_retention_days?: number | null
          analytics_enabled?: boolean
          anonymize_ip?: boolean
          created_at?: string
          enable_click_tracking?: boolean | null
          enable_heatmaps?: boolean | null
          enable_scroll_tracking?: boolean | null
          heatmap_sampling_rate?: number | null
          id?: string
          opt_out_cookie_name?: string | null
          raw_event_retention_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_notify_audit: {
        Row: {
          after_value: Json | null
          before_value: Json | null
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          ip: unknown
          setting_id: string | null
          template_id: string | null
          user_agent: string | null
        }
        Insert: {
          after_value?: Json | null
          before_value?: Json | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          setting_id?: string | null
          template_id?: string | null
          user_agent?: string | null
        }
        Update: {
          after_value?: Json | null
          before_value?: Json | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          setting_id?: string | null
          template_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_notify_audit_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "booking_notify_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_notify_audit_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "booking_notify_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_notify_consent: {
        Row: {
          booking_id: string
          consent_at: string
          consent_ip: unknown
          consent_ua: string | null
          id: string
          user_id: string
        }
        Insert: {
          booking_id: string
          consent_at?: string
          consent_ip?: unknown
          consent_ua?: string | null
          id?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          consent_at?: string
          consent_ip?: unknown
          consent_ua?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_notify_settings: {
        Row: {
          admin_fallback_email: string | null
          admin_fallback_phone: string | null
          allow_server_fallback: boolean
          config_version: number
          created_at: string
          created_by: string | null
          default_language: string
          email_label: string
          enabled_email: boolean
          enabled_whatsapp: boolean
          id: string
          phone_min_digits: number
          position_order: Json
          server_fallback_rate_limit_per_hour: number
          show_confirm_question: boolean
          singleton_flag: boolean
          updated_at: string
          updated_by: string | null
          visibility: Json
          whatsapp_label: string
        }
        Insert: {
          admin_fallback_email?: string | null
          admin_fallback_phone?: string | null
          allow_server_fallback?: boolean
          config_version?: number
          created_at?: string
          created_by?: string | null
          default_language?: string
          email_label?: string
          enabled_email?: boolean
          enabled_whatsapp?: boolean
          id?: string
          phone_min_digits?: number
          position_order?: Json
          server_fallback_rate_limit_per_hour?: number
          show_confirm_question?: boolean
          singleton_flag?: boolean
          updated_at?: string
          updated_by?: string | null
          visibility?: Json
          whatsapp_label?: string
        }
        Update: {
          admin_fallback_email?: string | null
          admin_fallback_phone?: string | null
          allow_server_fallback?: boolean
          config_version?: number
          created_at?: string
          created_by?: string | null
          default_language?: string
          email_label?: string
          enabled_email?: boolean
          enabled_whatsapp?: boolean
          id?: string
          phone_min_digits?: number
          position_order?: Json
          server_fallback_rate_limit_per_hour?: number
          show_confirm_question?: boolean
          singleton_flag?: boolean
          updated_at?: string
          updated_by?: string | null
          visibility?: Json
          whatsapp_label?: string
        }
        Relationships: []
      }
      booking_notify_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          key: string
          template: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          template: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          template?: string
          version?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          adults: number | null
          children: number | null
          city: string | null
          created_at: string
          currency: string | null
          email: string
          end_date: string | null
          id: string
          listing_id: string | null
          name: string
          nights: number | null
          notes: string | null
          package_id: string | null
          payment_status: string | null
          phone: string
          pincode: string | null
          product_id: string | null
          quantity: number | null
          shipping_address: string | null
          source: string | null
          start_date: string | null
          status: string | null
          total_price: number | null
          type: string
          unit_price: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          adults?: number | null
          children?: number | null
          city?: string | null
          created_at?: string
          currency?: string | null
          email: string
          end_date?: string | null
          id?: string
          listing_id?: string | null
          name: string
          nights?: number | null
          notes?: string | null
          package_id?: string | null
          payment_status?: string | null
          phone: string
          pincode?: string | null
          product_id?: string | null
          quantity?: number | null
          shipping_address?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          total_price?: number | null
          type: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          adults?: number | null
          children?: number | null
          city?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          end_date?: string | null
          id?: string
          listing_id?: string | null
          name?: string
          nights?: number | null
          notes?: string | null
          package_id?: string | null
          payment_status?: string | null
          phone?: string
          pincode?: string | null
          product_id?: string | null
          quantity?: number | null
          shipping_address?: string | null
          source?: string | null
          start_date?: string | null
          status?: string | null
          total_price?: number | null
          type?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "tourism_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "travel_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "local_products"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings_summary: {
        Row: {
          booking_type: string | null
          created_at: string
          device: string | null
          id: string
          listing_id: string | null
          package_id: string | null
          product_id: string | null
          referrer: string | null
          url: string | null
        }
        Insert: {
          booking_type?: string | null
          created_at?: string
          device?: string | null
          id?: string
          listing_id?: string | null
          package_id?: string | null
          product_id?: string | null
          referrer?: string | null
          url?: string | null
        }
        Update: {
          booking_type?: string | null
          created_at?: string
          device?: string | null
          id?: string
          listing_id?: string | null
          package_id?: string | null
          product_id?: string | null
          referrer?: string | null
          url?: string | null
        }
        Relationships: []
      }
      cms_content_sections: {
        Row: {
          body: string | null
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          section_image: string | null
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          section_image?: string | null
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          section_image?: string | null
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_events: {
        Row: {
          banner_image_url: string | null
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          is_featured: boolean
          lat: number | null
          lng: number | null
          location: string | null
          map_visible: boolean | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          location?: string | null
          map_visible?: boolean | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          location?: string | null
          map_visible?: boolean | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_footer_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_external: boolean
          label: string
          page_slug: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_external?: boolean
          label: string
          page_slug?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_external?: boolean
          label?: string
          page_slug?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_title: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          created_at: string
          email_admin: string | null
          email_collabs: string | null
          email_contact: string | null
          email_copyright: string | null
          email_info: string | null
          email_post: string | null
          email_promotions: string | null
          email_support: string | null
          email_team: string | null
          facebook_url: string | null
          hero_background_image: string | null
          id: string
          instagram_url: string | null
          logo_image: string | null
          meta_description: string
          meta_title: string
          primary_cta_text: string
          primary_cta_url: string
          secondary_cta_text: string
          secondary_cta_url: string
          site_name: string
          tagline: string
          twitter_url: string | null
          updated_at: string
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          email_admin?: string | null
          email_collabs?: string | null
          email_contact?: string | null
          email_copyright?: string | null
          email_info?: string | null
          email_post?: string | null
          email_promotions?: string | null
          email_support?: string | null
          email_team?: string | null
          facebook_url?: string | null
          hero_background_image?: string | null
          id?: string
          instagram_url?: string | null
          logo_image?: string | null
          meta_description?: string
          meta_title?: string
          primary_cta_text?: string
          primary_cta_url?: string
          secondary_cta_text?: string
          secondary_cta_url?: string
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          email_admin?: string | null
          email_collabs?: string | null
          email_contact?: string | null
          email_copyright?: string | null
          email_info?: string | null
          email_post?: string | null
          email_promotions?: string | null
          email_support?: string | null
          email_team?: string | null
          facebook_url?: string | null
          hero_background_image?: string | null
          id?: string
          instagram_url?: string | null
          logo_image?: string | null
          meta_description?: string
          meta_title?: string
          primary_cta_text?: string
          primary_cta_url?: string
          secondary_cta_text?: string
          secondary_cta_url?: string
          site_name?: string
          tagline?: string
          twitter_url?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      cms_stories: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_submissions: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          linked_content_item_id: string | null
          linked_gallery_item_id: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          target_section: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          linked_content_item_id?: string | null
          linked_gallery_item_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_section: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          linked_content_item_id?: string | null
          linked_gallery_item_id?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          target_section?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_submissions_linked_content_item_id_fkey"
            columns: ["linked_content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_submissions_linked_gallery_item_id_fkey"
            columns: ["linked_gallery_item_id"]
            isOneToOne: false
            referencedRelation: "gallery_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          district_id: string | null
          hero_image: string | null
          icon: string | null
          id: string
          name: string
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          sort_order: number | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          name: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          sort_order?: number | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          name?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          sort_order?: number | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          district_id: string | null
          excerpt: string | null
          id: string
          main_image_url: string | null
          meta_json: Json | null
          published_at: string | null
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          district_id?: string | null
          excerpt?: string | null
          id?: string
          main_image_url?: string | null
          meta_json?: Json | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          district_id?: string | null
          excerpt?: string | null
          id?: string
          main_image_url?: string | null
          meta_json?: Json | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          hero_image: string | null
          icon: string | null
          id: string
          name: string
          seo_description: string | null
          seo_image_url: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          name: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          name?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          change_description: string | null
          content_data: Json
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string | null
          id: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          content_data: Json
          content_id: string
          content_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number: number
        }
        Update: {
          change_description?: string | null
          content_data?: Json
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number?: number
        }
        Relationships: []
      }
      cookie_consent_settings: {
        Row: {
          accept_all_text: string | null
          banner_description: string | null
          banner_position: string | null
          banner_title: string | null
          categories: Json | null
          consent_expiry_days: number | null
          cookie_policy_url: string | null
          created_at: string | null
          force_reconsent: boolean | null
          id: string
          manage_text: string | null
          policy_version: number | null
          privacy_policy_url: string | null
          reject_all_text: string | null
          save_text: string | null
          singleton_flag: boolean | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          accept_all_text?: string | null
          banner_description?: string | null
          banner_position?: string | null
          banner_title?: string | null
          categories?: Json | null
          consent_expiry_days?: number | null
          cookie_policy_url?: string | null
          created_at?: string | null
          force_reconsent?: boolean | null
          id?: string
          manage_text?: string | null
          policy_version?: number | null
          privacy_policy_url?: string | null
          reject_all_text?: string | null
          save_text?: string | null
          singleton_flag?: boolean | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          accept_all_text?: string | null
          banner_description?: string | null
          banner_position?: string | null
          banner_title?: string | null
          categories?: Json | null
          consent_expiry_days?: number | null
          cookie_policy_url?: string | null
          created_at?: string | null
          force_reconsent?: boolean | null
          id?: string
          manage_text?: string | null
          policy_version?: number | null
          privacy_policy_url?: string | null
          reject_all_text?: string | null
          save_text?: string | null
          singleton_flag?: boolean | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cookie_consent_stats: {
        Row: {
          accepted_all: number | null
          analytics_accepted: number | null
          consent_date: string
          created_at: string | null
          customized: number | null
          id: string
          marketing_accepted: number | null
          preferences_accepted: number | null
          rejected_all: number | null
          updated_at: string | null
        }
        Insert: {
          accepted_all?: number | null
          analytics_accepted?: number | null
          consent_date?: string
          created_at?: string | null
          customized?: number | null
          id?: string
          marketing_accepted?: number | null
          preferences_accepted?: number | null
          rejected_all?: number | null
          updated_at?: string | null
        }
        Update: {
          accepted_all?: number | null
          analytics_accepted?: number | null
          consent_date?: string
          created_at?: string | null
          customized?: number | null
          id?: string
          marketing_accepted?: number | null
          preferences_accepted?: number | null
          rejected_all?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cultural_content: {
        Row: {
          category_id: string
          consumption_occasions: string | null
          created_at: string
          created_by: string | null
          cultural_significance: string | null
          district_id: string
          dos_and_donts: string | null
          entry_fee: string | null
          famous_places: Json | null
          faqs: Json | null
          fun_facts: string | null
          google_maps_url: string | null
          hero_image: string | null
          historical_significance: string | null
          how_to_reach: Json | null
          id: string
          image_gallery: string[] | null
          ingredients: Json | null
          is_featured: boolean | null
          is_highlighted: boolean | null
          latitude: number | null
          local_customs: string | null
          longitude: number | null
          origin_history: string | null
          preparation_method: string | null
          price_range: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          shelf_life_tips: string | null
          short_intro: string | null
          slug: string
          sort_order: number | null
          spiritual_significance: string | null
          status: string
          subcategory_id: string | null
          taste_description: string | null
          things_to_do: string[] | null
          timings: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category_id: string
          consumption_occasions?: string | null
          created_at?: string
          created_by?: string | null
          cultural_significance?: string | null
          district_id: string
          dos_and_donts?: string | null
          entry_fee?: string | null
          famous_places?: Json | null
          faqs?: Json | null
          fun_facts?: string | null
          google_maps_url?: string | null
          hero_image?: string | null
          historical_significance?: string | null
          how_to_reach?: Json | null
          id?: string
          image_gallery?: string[] | null
          ingredients?: Json | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          latitude?: number | null
          local_customs?: string | null
          longitude?: number | null
          origin_history?: string | null
          preparation_method?: string | null
          price_range?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          shelf_life_tips?: string | null
          short_intro?: string | null
          slug: string
          sort_order?: number | null
          spiritual_significance?: string | null
          status?: string
          subcategory_id?: string | null
          taste_description?: string | null
          things_to_do?: string[] | null
          timings?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category_id?: string
          consumption_occasions?: string | null
          created_at?: string
          created_by?: string | null
          cultural_significance?: string | null
          district_id?: string
          dos_and_donts?: string | null
          entry_fee?: string | null
          famous_places?: Json | null
          faqs?: Json | null
          fun_facts?: string | null
          google_maps_url?: string | null
          hero_image?: string | null
          historical_significance?: string | null
          how_to_reach?: Json | null
          id?: string
          image_gallery?: string[] | null
          ingredients?: Json | null
          is_featured?: boolean | null
          is_highlighted?: boolean | null
          latitude?: number | null
          local_customs?: string | null
          longitude?: number | null
          origin_history?: string | null
          preparation_method?: string | null
          price_range?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          shelf_life_tips?: string | null
          short_intro?: string | null
          slug?: string
          sort_order?: number | null
          spiritual_significance?: string | null
          status?: string
          subcategory_id?: string | null
          taste_description?: string | null
          things_to_do?: string[] | null
          timings?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cultural_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_content_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cultural_content_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "content_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_guides: {
        Row: {
          best_time_to_visit: string | null
          created_at: string
          created_by: string | null
          district_id: string | null
          hero_image: string | null
          id: string
          ideal_duration: string | null
          is_featured: boolean | null
          latitude: number | null
          local_customs_etiquette: string | null
          local_people_culture: string | null
          longitude: number | null
          name: string
          region: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          short_introduction: string | null
          slug: string
          sort_order: number | null
          status: string
          temperature_info: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          best_time_to_visit?: string | null
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          hero_image?: string | null
          id?: string
          ideal_duration?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          local_customs_etiquette?: string | null
          local_people_culture?: string | null
          longitude?: number | null
          name: string
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_introduction?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          temperature_info?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          best_time_to_visit?: string | null
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          hero_image?: string | null
          id?: string
          ideal_duration?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          local_customs_etiquette?: string | null
          local_people_culture?: string | null
          longitude?: number | null
          name?: string
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_introduction?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          temperature_info?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_guides_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_places: {
        Row: {
          approx_duration: string | null
          best_visiting_time: string | null
          category: string
          created_at: string
          created_by: string | null
          destination_id: string
          entry_fee: string | null
          google_maps_url: string | null
          historical_significance: string | null
          how_to_reach: Json | null
          id: string
          image_gallery: string[] | null
          is_highlighted: boolean | null
          latitude: number | null
          local_customs_rituals: string | null
          longitude: number | null
          main_image: string | null
          name: string
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          short_summary: string | null
          slug: string
          sort_order: number | null
          spiritual_significance: string | null
          status: string
          things_to_do: string[] | null
          timings: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approx_duration?: string | null
          best_visiting_time?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          destination_id: string
          entry_fee?: string | null
          google_maps_url?: string | null
          historical_significance?: string | null
          how_to_reach?: Json | null
          id?: string
          image_gallery?: string[] | null
          is_highlighted?: boolean | null
          latitude?: number | null
          local_customs_rituals?: string | null
          longitude?: number | null
          main_image?: string | null
          name: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_summary?: string | null
          slug: string
          sort_order?: number | null
          spiritual_significance?: string | null
          status?: string
          things_to_do?: string[] | null
          timings?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approx_duration?: string | null
          best_visiting_time?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          destination_id?: string
          entry_fee?: string | null
          google_maps_url?: string | null
          historical_significance?: string | null
          how_to_reach?: Json | null
          id?: string
          image_gallery?: string[] | null
          is_highlighted?: boolean | null
          latitude?: number | null
          local_customs_rituals?: string | null
          longitude?: number | null
          main_image?: string | null
          name?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_summary?: string | null
          slug?: string
          sort_order?: number | null
          spiritual_significance?: string | null
          status?: string
          things_to_do?: string[] | null
          timings?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destination_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      district_content: {
        Row: {
          category: Database["public"]["Enums"]["district_content_category"]
          created_at: string
          description: string
          district_id: string
          google_map_link: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["district_content_category"]
          created_at?: string
          description: string
          district_id: string
          google_map_link?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["district_content_category"]
          created_at?: string
          description?: string
          district_id?: string
          google_map_link?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_content_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_festivals: {
        Row: {
          created_at: string
          description: string | null
          district_id: string
          end_month: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_spotlight: boolean | null
          month: string | null
          name: string
          sort_order: number
          start_month: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          district_id: string
          end_month?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_spotlight?: boolean | null
          month?: string | null
          name: string
          sort_order?: number
          start_month?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          district_id?: string
          end_month?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_spotlight?: boolean | null
          month?: string | null
          name?: string
          sort_order?: number
          start_month?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_festivals_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_foods: {
        Row: {
          created_at: string
          description: string | null
          district_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          district_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          district_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_foods_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_highlights: {
        Row: {
          created_at: string
          description: string | null
          district_id: string
          id: string
          image_url: string | null
          name: string
          status: string | null
          tags: string[] | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          district_id: string
          id?: string
          image_url?: string | null
          name: string
          status?: string | null
          tags?: string[] | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          district_id?: string
          id?: string
          image_url?: string | null
          name?: string
          status?: string | null
          tags?: string[] | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_highlights_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_hotels: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string
          description: string | null
          district_id: string
          id: string
          image_url: string | null
          lat: number | null
          latitude: number | null
          lng: number | null
          location: string | null
          longitude: number | null
          name: string
          price_range: string | null
          rating: number | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string
          description?: string | null
          district_id: string
          id?: string
          image_url?: string | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string
          description?: string | null
          district_id?: string
          id?: string
          image_url?: string | null
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "district_hotels_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_places: {
        Row: {
          created_at: string
          district_id: string
          full_description: string | null
          google_maps_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_highlighted: boolean
          map_lat: number | null
          map_lng: number | null
          name: string
          short_description: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_id: string
          full_description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_highlighted?: boolean
          map_lat?: number | null
          map_lng?: number | null
          name: string
          short_description?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_id?: string
          full_description?: string | null
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_highlighted?: boolean
          map_lat?: number | null
          map_lng?: number | null
          name?: string
          short_description?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_places_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          banner_image: string | null
          best_time_to_visit: string | null
          connectivity: string | null
          created_at: string
          cultural_identity: string | null
          famous_specialties: string | null
          geography: string | null
          highlights: string | null
          id: string
          image_url: string | null
          latitude: number | null
          local_languages: string | null
          longitude: number | null
          name: string
          overview: string
          population: string | null
          region: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          sort_order: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          best_time_to_visit?: string | null
          connectivity?: string | null
          created_at?: string
          cultural_identity?: string | null
          famous_specialties?: string | null
          geography?: string | null
          highlights?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          local_languages?: string | null
          longitude?: number | null
          name: string
          overview: string
          population?: string | null
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          best_time_to_visit?: string | null
          connectivity?: string | null
          created_at?: string
          cultural_identity?: string | null
          famous_specialties?: string | null
          geography?: string | null
          highlights?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          local_languages?: string | null
          longitude?: number | null
          name?: string
          overview?: string
          population?: string | null
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      entity_share_preview: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          image_url: string | null
          locale: string | null
          og_type: string | null
          templates: Json | null
          title: string | null
          twitter_card: string | null
          updated_at: string | null
          updated_by: string | null
          use_default: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          image_url?: string | null
          locale?: string | null
          og_type?: string | null
          templates?: Json | null
          title?: string | null
          twitter_card?: string | null
          updated_at?: string | null
          updated_by?: string | null
          use_default?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          image_url?: string | null
          locale?: string | null
          og_type?: string | null
          templates?: Json | null
          title?: string | null
          twitter_card?: string | null
          updated_at?: string | null
          updated_by?: string | null
          use_default?: boolean | null
        }
        Relationships: []
      }
      event_audit_log: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          changed_by: string | null
          created_at: string | null
          event_id: string
          id: string
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          changed_by?: string | null
          created_at?: string | null
          event_id: string
          id?: string
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          changed_by?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_audit_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          message: string | null
          name: string
          occurrence_id: string | null
          phone: string | null
          seats_requested: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          message?: string | null
          name: string
          occurrence_id?: string | null
          phone?: string | null
          seats_requested?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          message?: string | null
          name?: string
          occurrence_id?: string | null
          phone?: string | null
          seats_requested?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_inquiries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_inquiries_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "event_occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      event_occurrences: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_cancelled: boolean | null
          occurrence_end: string | null
          occurrence_start: string
          override_description: string | null
          override_title: string | null
          override_venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_cancelled?: boolean | null
          occurrence_end?: string | null
          occurrence_start: string
          override_description?: string | null
          override_title?: string | null
          override_venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_cancelled?: boolean | null
          occurrence_end?: string | null
          occurrence_start?: string
          override_description?: string | null
          override_title?: string | null
          override_venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_occurrences_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_occurrences_override_venue_id_fkey"
            columns: ["override_venue_id"]
            isOneToOne: false
            referencedRelation: "event_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      event_promotions: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          event_id: string
          id: string
          item_id: string
          item_type: string
          priority: number | null
          promo_code: string | null
          promote: boolean | null
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          event_id: string
          id?: string
          item_id: string
          item_type: string
          priority?: number | null
          promo_code?: string | null
          promote?: boolean | null
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          event_id?: string
          id?: string
          item_id?: string
          item_type?: string
          priority?: number | null
          promo_code?: string | null
          promote?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_promotions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tag_links: {
        Row: {
          event_id: string
          id: string
          tag_id: string
        }
        Insert: {
          event_id: string
          id?: string
          tag_id: string
        }
        Update: {
          event_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tag_links_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "event_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      event_venues: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          district_id: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          updated_at: string | null
          village_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          updated_at?: string | null
          village_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          village_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_venues_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_venues_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          capacity: number | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          district_id: string | null
          end_at: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          is_recurring: boolean | null
          map_visible: boolean | null
          organizer_id: string | null
          published_at: string | null
          recurrence_end_at: string | null
          recurrence_rule: string | null
          seats_booked: number | null
          short_description: string | null
          slug: string
          start_at: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          ticket_price: number | null
          ticket_url: string | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue_id: string | null
          village_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_recurring?: boolean | null
          map_visible?: boolean | null
          organizer_id?: string | null
          published_at?: string | null
          recurrence_end_at?: string | null
          recurrence_rule?: string | null
          seats_booked?: number | null
          short_description?: string | null
          slug: string
          start_at: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          ticket_url?: string | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
          village_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          capacity?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          district_id?: string | null
          end_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"] | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          is_recurring?: boolean | null
          map_visible?: boolean | null
          organizer_id?: string | null
          published_at?: string | null
          recurrence_end_at?: string | null
          recurrence_rule?: string | null
          seats_booked?: number | null
          short_description?: string | null
          slug?: string
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          ticket_price?: number | null
          ticket_url?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "tourism_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "event_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_cards: {
        Row: {
          ab_test_tag: string | null
          created_at: string
          created_by: string | null
          cta_label: Json
          cta_url: Json
          end_at: string | null
          gradient_color: string | null
          icon_name: string | null
          id: string
          image_alt: Json | null
          image_url: string | null
          is_published: boolean
          is_sample: boolean
          order_index: number
          slug: string
          start_at: string | null
          subtitle: Json
          title: Json
          updated_at: string
          updated_by: string | null
          visible_on_homepage: boolean
        }
        Insert: {
          ab_test_tag?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: Json
          cta_url?: Json
          end_at?: string | null
          gradient_color?: string | null
          icon_name?: string | null
          id?: string
          image_alt?: Json | null
          image_url?: string | null
          is_published?: boolean
          is_sample?: boolean
          order_index?: number
          slug: string
          start_at?: string | null
          subtitle?: Json
          title?: Json
          updated_at?: string
          updated_by?: string | null
          visible_on_homepage?: boolean
        }
        Update: {
          ab_test_tag?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: Json
          cta_url?: Json
          end_at?: string | null
          gradient_color?: string | null
          icon_name?: string | null
          id?: string
          image_alt?: Json | null
          image_url?: string | null
          is_published?: boolean
          is_sample?: boolean
          order_index?: number
          slug?: string
          start_at?: string | null
          subtitle?: Json
          title?: Json
          updated_at?: string
          updated_by?: string | null
          visible_on_homepage?: boolean
        }
        Relationships: []
      }
      featured_content_config: {
        Row: {
          auto_rotation_enabled: boolean
          created_at: string
          id: string
          items_per_section: number
          last_rotation_at: string | null
          rotation_frequency: string
          singleton_flag: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_rotation_enabled?: boolean
          created_at?: string
          id?: string
          items_per_section?: number
          last_rotation_at?: string | null
          rotation_frequency?: string
          singleton_flag?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_rotation_enabled?: boolean
          created_at?: string
          id?: string
          items_per_section?: number
          last_rotation_at?: string | null
          rotation_frequency?: string
          singleton_flag?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      featured_content_history: {
        Row: {
          content_id: string
          created_at: string
          featured_date: string
          id: string
          section_key: string
          was_manual: boolean
        }
        Insert: {
          content_id: string
          created_at?: string
          featured_date?: string
          id?: string
          section_key: string
          was_manual?: boolean
        }
        Update: {
          content_id?: string
          created_at?: string
          featured_date?: string
          id?: string
          section_key?: string
          was_manual?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_history_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cultural_content"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content_slots: {
        Row: {
          content_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_manual: boolean
          priority: number
          section_key: string
          start_date: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_manual?: boolean
          priority?: number
          section_key: string
          start_date?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_manual?: boolean
          priority?: number
          section_key?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_content_slots_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cultural_content"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_highlights: {
        Row: {
          button_link: string
          button_text: string
          created_at: string
          description: string
          gradient_color: string
          id: string
          image_url: string
          order_position: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          button_link: string
          button_text: string
          created_at?: string
          description: string
          gradient_color: string
          id?: string
          image_url: string
          order_position: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          button_link?: string
          button_text?: string
          created_at?: string
          description?: string
          gradient_color?: string
          id?: string
          image_url?: string
          order_position?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      festivals: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          month: number
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          month: number
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          month?: number
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ga_events: {
        Row: {
          client_id: string | null
          created_at: string
          event_name: string
          ga_response: Json | null
          id: string
          payload: Json
          retry_count: number
          sent_at: string | null
          status: string
          user_id_hash: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          event_name: string
          ga_response?: Json | null
          id?: string
          payload?: Json
          retry_count?: number
          sent_at?: string | null
          status?: string
          user_id_hash?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          event_name?: string
          ga_response?: Json | null
          id?: string
          payload?: Json
          retry_count?: number
          sent_at?: string | null
          status?: string
          user_id_hash?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean
          location: string | null
          tags: string[] | null
          taken_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean
          location?: string | null
          tags?: string[] | null
          taken_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          location?: string | null
          tags?: string[] | null
          taken_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      geocode_cache: {
        Row: {
          address: string
          created_at: string
          expires_at: string
          formatted_address: string | null
          id: string
          latitude: number | null
          longitude: number | null
          place_id: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          expires_at?: string
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          expires_at?: string
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_ctas: {
        Row: {
          background_color: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          open_in_new_tab: boolean | null
          position: string
          size: string | null
          text_color: string | null
          updated_at: string | null
          url: string
          variant: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          open_in_new_tab?: boolean | null
          position?: string
          size?: string | null
          text_color?: string | null
          updated_at?: string | null
          url: string
          variant?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          open_in_new_tab?: boolean | null
          position?: string
          size?: string | null
          text_color?: string | null
          updated_at?: string | null
          url?: string
          variant?: string | null
        }
        Relationships: []
      }
      homepage_visits: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          ip: string | null
          language: string | null
          screen_resolution: string | null
          session_id: string | null
          timezone: string | null
          ua: string | null
          visitor_key: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip?: string | null
          language?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timezone?: string | null
          ua?: string | null
          visitor_key: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip?: string | null
          language?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timezone?: string | null
          ua?: string | null
          visitor_key?: string
        }
        Relationships: []
      }
      internal_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      local_product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      local_products: {
        Row: {
          category_id: string | null
          created_at: string
          full_description: string | null
          gallery_images: string[] | null
          id: string
          is_active: boolean
          is_featured: boolean
          lat: number | null
          lng: number | null
          map_visible: boolean | null
          name: string
          price: number
          price_currency: string
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          short_description: string | null
          slug: string
          stock_status: string
          tags: string[] | null
          thumbnail_image_url: string | null
          unit_label: string | null
          updated_at: string
          village_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          map_visible?: boolean | null
          name: string
          price?: number
          price_currency?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          slug: string
          stock_status?: string
          tags?: string[] | null
          thumbnail_image_url?: string | null
          unit_label?: string | null
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          lat?: number | null
          lng?: number | null
          map_visible?: boolean | null
          name?: string
          price?: number
          price_currency?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          slug?: string
          stock_status?: string
          tags?: string[] | null
          thumbnail_image_url?: string | null
          unit_label?: string | null
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "local_product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_products_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      map_highlights: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          coordinates: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          excerpt: string | null
          fill_color: string | null
          geometry_type: string
          highlight_type: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          linked_districts: string[] | null
          linked_villages: string[] | null
          priority: number | null
          radius_meters: number | null
          slug: string
          status: string | null
          stroke_color: string | null
          stroke_width: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          coordinates?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          excerpt?: string | null
          fill_color?: string | null
          geometry_type?: string
          highlight_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          linked_districts?: string[] | null
          linked_villages?: string[] | null
          priority?: number | null
          radius_meters?: number | null
          slug: string
          status?: string | null
          stroke_color?: string | null
          stroke_width?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          coordinates?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          excerpt?: string | null
          fill_color?: string | null
          geometry_type?: string
          highlight_type?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          linked_districts?: string[] | null
          linked_villages?: string[] | null
          priority?: number | null
          radius_meters?: number | null
          slug?: string
          status?: string | null
          stroke_color?: string | null
          stroke_width?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      map_poi_cache: {
        Row: {
          cached_at: string | null
          category: string | null
          district_id: string | null
          district_name: string | null
          entity_id: string
          entity_type: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          lat: number
          lng: number
          price_max: number | null
          price_min: number | null
          properties: Json | null
          rating: number | null
          slug: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          village_id: string | null
          village_name: string | null
        }
        Insert: {
          cached_at?: string | null
          category?: string | null
          district_id?: string | null
          district_name?: string | null
          entity_id: string
          entity_type: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          lat: number
          lng: number
          price_max?: number | null
          price_min?: number | null
          properties?: Json | null
          rating?: number | null
          slug?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          village_id?: string | null
          village_name?: string | null
        }
        Update: {
          cached_at?: string | null
          category?: string | null
          district_id?: string | null
          district_name?: string | null
          entity_id?: string
          entity_type?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          lat?: number
          lng?: number
          price_max?: number | null
          price_min?: number | null
          properties?: Json | null
          rating?: number | null
          slug?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          village_id?: string | null
          village_name?: string | null
        }
        Relationships: []
      }
      map_settings: {
        Row: {
          api_key_status: string | null
          created_at: string
          default_lat: number
          default_lng: number
          default_zoom: number
          enable_clustering: boolean
          enable_street_view: boolean
          id: string
          last_api_test: string | null
          map_style: string | null
          maps_enabled: boolean
          show_on_districts: boolean
          show_on_homepage: boolean
          show_on_hotels: boolean
          show_on_marketplace: boolean
          show_on_travel_packages: boolean
          show_on_villages: boolean
          singleton_flag: boolean
          updated_at: string
        }
        Insert: {
          api_key_status?: string | null
          created_at?: string
          default_lat?: number
          default_lng?: number
          default_zoom?: number
          enable_clustering?: boolean
          enable_street_view?: boolean
          id?: string
          last_api_test?: string | null
          map_style?: string | null
          maps_enabled?: boolean
          show_on_districts?: boolean
          show_on_homepage?: boolean
          show_on_hotels?: boolean
          show_on_marketplace?: boolean
          show_on_travel_packages?: boolean
          show_on_villages?: boolean
          singleton_flag?: boolean
          updated_at?: string
        }
        Update: {
          api_key_status?: string | null
          created_at?: string
          default_lat?: number
          default_lng?: number
          default_zoom?: number
          enable_clustering?: boolean
          enable_street_view?: boolean
          id?: string
          last_api_test?: string | null
          map_style?: string | null
          maps_enabled?: boolean
          show_on_districts?: boolean
          show_on_homepage?: boolean
          show_on_hotels?: boolean
          show_on_marketplace?: boolean
          show_on_travel_packages?: boolean
          show_on_villages?: boolean
          singleton_flag?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          created_by: string | null
          credit: string | null
          entity_id: string | null
          entity_type: string | null
          exif: Json | null
          filename: string
          fingerprint: string | null
          geolat: number | null
          geolng: number | null
          height: number | null
          id: string
          is_published: boolean | null
          job_id: string | null
          mime_type: string | null
          optimized_paths: Json | null
          original_filename: string
          phash: string | null
          publish_status: string | null
          size_bytes: number | null
          storage_path: string
          tags: string[] | null
          thumbnail_path: string | null
          title: string | null
          updated_at: string | null
          validation_errors: Json | null
          validation_status: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          entity_id?: string | null
          entity_type?: string | null
          exif?: Json | null
          filename: string
          fingerprint?: string | null
          geolat?: number | null
          geolng?: number | null
          height?: number | null
          id?: string
          is_published?: boolean | null
          job_id?: string | null
          mime_type?: string | null
          optimized_paths?: Json | null
          original_filename: string
          phash?: string | null
          publish_status?: string | null
          size_bytes?: number | null
          storage_path: string
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          entity_id?: string | null
          entity_type?: string | null
          exif?: Json | null
          filename?: string
          fingerprint?: string | null
          geolat?: number | null
          geolng?: number | null
          height?: number | null
          id?: string
          is_published?: boolean | null
          job_id?: string | null
          mime_type?: string | null
          optimized_paths?: Json | null
          original_filename?: string
          phash?: string | null
          publish_status?: string | null
          size_bytes?: number | null
          storage_path?: string
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string | null
          validation_errors?: Json | null
          validation_status?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "media_import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folder_assignments: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          media_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          media_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_folder_assignments_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_folder_assignments_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_system: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_system?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_import_audit: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          job_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          job_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          job_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_import_audit_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "media_import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_import_errors: {
        Row: {
          asset_id: string | null
          created_at: string | null
          error_code: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          filename: string
          id: string
          is_recoverable: boolean | null
          job_id: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          filename: string
          id?: string
          is_recoverable?: boolean | null
          job_id: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          filename?: string
          id?: string
          is_recoverable?: boolean | null
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_import_errors_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_import_errors_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "media_import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_import_jobs: {
        Row: {
          committed_at: string | null
          committed_by: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          csv_mapping: Json | null
          error_count: number | null
          id: string
          processed_files: number | null
          rolled_back_at: string | null
          rolled_back_by: string | null
          settings: Json | null
          started_at: string | null
          status: string
          success_count: number | null
          total_files: number | null
          updated_at: string | null
          warning_count: number | null
        }
        Insert: {
          committed_at?: string | null
          committed_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          csv_mapping?: Json | null
          error_count?: number | null
          id?: string
          processed_files?: number | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          total_files?: number | null
          updated_at?: string | null
          warning_count?: number | null
        }
        Update: {
          committed_at?: string | null
          committed_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          csv_mapping?: Json | null
          error_count?: number | null
          id?: string
          processed_files?: number | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          success_count?: number | null
          total_files?: number | null
          updated_at?: string | null
          warning_count?: number | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_size: number | null
          file_type: string
          file_url: string
          filename: string
          height: number | null
          id: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          filename: string
          height?: number | null
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          height?: number | null
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_usage: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string
          field_name: string | null
          id: string
          media_id: string
          page_slug: string | null
          updated_at: string
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          media_id: string
          page_slug?: string | null
          updated_at?: string
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          media_id?: string
          page_slug?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          status: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          status?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          status?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      page_settings: {
        Row: {
          bottom_seo_text: string | null
          created_at: string
          custom_section_cta_label: string | null
          custom_section_cta_link: string | null
          custom_section_description: string | null
          custom_section_title: string | null
          extra_data: Json | null
          faqs: Json | null
          hero_bullets: Json | null
          hero_cta_label: string | null
          hero_cta_link: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          intro_text: string | null
          meta_description: string | null
          meta_title: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          bottom_seo_text?: string | null
          created_at?: string
          custom_section_cta_label?: string | null
          custom_section_cta_link?: string | null
          custom_section_description?: string | null
          custom_section_title?: string | null
          extra_data?: Json | null
          faqs?: Json | null
          hero_bullets?: Json | null
          hero_cta_label?: string | null
          hero_cta_link?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          intro_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          bottom_seo_text?: string | null
          created_at?: string
          custom_section_cta_label?: string | null
          custom_section_cta_link?: string | null
          custom_section_description?: string | null
          custom_section_title?: string | null
          extra_data?: Json | null
          faqs?: Json | null
          hero_bullets?: Json | null
          hero_cta_label?: string | null
          hero_cta_link?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          intro_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          count: number
          id: string
          page: string
          updated_at: string
        }
        Insert: {
          count?: number
          id?: string
          page: string
          updated_at?: string
        }
        Update: {
          count?: number
          id?: string
          page?: string
          updated_at?: string
        }
        Relationships: []
      }
      place_guides: {
        Row: {
          about_the_place: string | null
          category: string | null
          cover_image: string | null
          created_at: string | null
          district_id: string | null
          emergency_info: Json | null
          gallery_images: string[] | null
          google_maps_url: string | null
          has_full_guide: boolean | null
          how_to_reach: Json | null
          id: string
          is_featured: boolean | null
          latitude: number | null
          local_tips: string | null
          longitude: number | null
          name: string
          routes_transport: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          status: string | null
          things_to_do: string[] | null
          updated_at: string | null
          village_id: string | null
          weather_info: string | null
        }
        Insert: {
          about_the_place?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          district_id?: string | null
          emergency_info?: Json | null
          gallery_images?: string[] | null
          google_maps_url?: string | null
          has_full_guide?: boolean | null
          how_to_reach?: Json | null
          id?: string
          is_featured?: boolean | null
          latitude?: number | null
          local_tips?: string | null
          longitude?: number | null
          name: string
          routes_transport?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          status?: string | null
          things_to_do?: string[] | null
          updated_at?: string | null
          village_id?: string | null
          weather_info?: string | null
        }
        Update: {
          about_the_place?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          district_id?: string | null
          emergency_info?: Json | null
          gallery_images?: string[] | null
          google_maps_url?: string | null
          has_full_guide?: boolean | null
          how_to_reach?: Json | null
          id?: string
          is_featured?: boolean | null
          latitude?: number | null
          local_tips?: string | null
          longitude?: number | null
          name?: string
          routes_transport?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          status?: string | null
          things_to_do?: string[] | null
          updated_at?: string | null
          village_id?: string | null
          weather_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_guides_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_guides_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_order_requests: {
        Row: {
          admin_notes: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          local_product_id: string | null
          message: string | null
          phone: string | null
          pincode: string | null
          preferred_delivery: string | null
          quantity: number | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          local_product_id?: string | null
          message?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_delivery?: string | null
          quantity?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          local_product_id?: string | null
          message?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_delivery?: string | null
          quantity?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_order_requests_local_product_id_fkey"
            columns: ["local_product_id"]
            isOneToOne: false
            referencedRelation: "local_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_active_at: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_packages: {
        Row: {
          created_at: string
          deliverables: string | null
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          price_currency: string
          slug: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliverables?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          price_currency?: string
          slug: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliverables?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          price_currency?: string
          slug?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_requests: {
        Row: {
          admin_notes: string | null
          business_name: string
          business_type: string | null
          city: string | null
          contact_person: string
          created_at: string
          email: string
          id: string
          instagram_handle: string | null
          message: string | null
          phone: string | null
          promotion_package_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          instagram_handle?: string | null
          message?: string | null
          phone?: string | null
          promotion_package_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          instagram_handle?: string | null
          message?: string | null
          phone?: string | null
          promotion_package_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_requests_promotion_package_id_fkey"
            columns: ["promotion_package_id"]
            isOneToOne: false
            referencedRelation: "promotion_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      route_categories: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          route_type: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          route_type?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          route_type?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_category_districts: {
        Row: {
          created_at: string | null
          district_id: string
          id: string
          route_category_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          district_id: string
          id?: string
          route_category_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          district_id?: string
          id?: string
          route_category_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_category_districts_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_category_districts_route_category_id_fkey"
            columns: ["route_category_id"]
            isOneToOne: false
            referencedRelation: "route_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      search_documents: {
        Row: {
          body_text: string | null
          category: string | null
          clicks_count: number | null
          content_type: string
          conversions_count: number | null
          created_at: string | null
          district_id: string | null
          district_name: string | null
          embedding: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_promoted: boolean | null
          is_published: boolean | null
          lat: number | null
          lng: number | null
          price_max: number | null
          price_min: number | null
          rating: number | null
          search_vector: unknown
          source_created_at: string | null
          source_id: string
          source_updated_at: string | null
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url_slug: string | null
          views_count: number | null
          village_id: string | null
          village_name: string | null
        }
        Insert: {
          body_text?: string | null
          category?: string | null
          clicks_count?: number | null
          content_type: string
          conversions_count?: number | null
          created_at?: string | null
          district_id?: string | null
          district_name?: string | null
          embedding?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_promoted?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          search_vector?: unknown
          source_created_at?: string | null
          source_id: string
          source_updated_at?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url_slug?: string | null
          views_count?: number | null
          village_id?: string | null
          village_name?: string | null
        }
        Update: {
          body_text?: string | null
          category?: string | null
          clicks_count?: number | null
          content_type?: string
          conversions_count?: number | null
          created_at?: string | null
          district_id?: string | null
          district_name?: string | null
          embedding?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_promoted?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          search_vector?: unknown
          source_created_at?: string | null
          source_id?: string
          source_updated_at?: string | null
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url_slug?: string | null
          views_count?: number | null
          village_id?: string | null
          village_name?: string | null
        }
        Relationships: []
      }
      search_feedback: {
        Row: {
          created_at: string | null
          document_id: string | null
          feedback_type: string
          id: string
          query_log_id: string | null
          result_position: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          feedback_type: string
          id?: string
          query_log_id?: string | null
          result_position?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          feedback_type?: string
          id?: string
          query_log_id?: string | null
          result_position?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_feedback_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "search_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_feedback_query_log_id_fkey"
            columns: ["query_log_id"]
            isOneToOne: false
            referencedRelation: "search_query_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      search_query_logs: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          lexical_ms: number | null
          query_normalized: string | null
          query_text: string
          result_ids: string[] | null
          results_count: number | null
          session_id: string | null
          total_ms: number | null
          user_id: string | null
          user_location: Json | null
          vector_ms: number | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          lexical_ms?: number | null
          query_normalized?: string | null
          query_text: string
          result_ids?: string[] | null
          results_count?: number | null
          session_id?: string | null
          total_ms?: number | null
          user_id?: string | null
          user_location?: Json | null
          vector_ms?: number | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          lexical_ms?: number | null
          query_normalized?: string | null
          query_text?: string
          result_ids?: string[] | null
          results_count?: number | null
          session_id?: string | null
          total_ms?: number | null
          user_id?: string | null
          user_location?: Json | null
          vector_ms?: number | null
        }
        Relationships: []
      }
      search_suggestions: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          search_count: number | null
          suggestion_text: string
          suggestion_type: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          search_count?: number | null
          suggestion_text: string
          suggestion_type: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          search_count?: number | null
          suggestion_text?: string
          suggestion_type?: string
        }
        Relationships: []
      }
      search_synonyms: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          language: string | null
          scope: string | null
          synonyms: string[]
          term: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          scope?: string | null
          synonyms: string[]
          term: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          scope?: string | null
          synonyms?: string[]
          term?: string
        }
        Relationships: []
      }
      share_clicks: {
        Row: {
          channel: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          short_link_id: string | null
          user_agent: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          short_link_id?: string | null
          user_agent?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          short_link_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_clicks_short_link_id_fkey"
            columns: ["short_link_id"]
            isOneToOne: false
            referencedRelation: "short_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          platform: string
          referrer: string | null
          url: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          platform: string
          referrer?: string | null
          url: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          platform?: string
          referrer?: string | null
          url?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      share_preview_audit: {
        Row: {
          action: string
          actor_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      share_referrals: {
        Row: {
          created_at: string | null
          full_url: string
          id: string
          ip_hash: string | null
          page_id: string | null
          page_type: string
          ref_source: string
          user_agent: string | null
          visited_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_url: string
          id?: string
          ip_hash?: string | null
          page_id?: string | null
          page_type: string
          ref_source: string
          user_agent?: string | null
          visited_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_url?: string
          id?: string
          ip_hash?: string | null
          page_id?: string | null
          page_type?: string
          ref_source?: string
          user_agent?: string | null
          visited_at?: string | null
        }
        Relationships: []
      }
      share_template_audit: {
        Row: {
          after_value: Json | null
          before_value: Json | null
          change_type: string
          changed_by: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          after_value?: Json | null
          before_value?: Json | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          after_value?: Json | null
          before_value?: Json | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      short_links: {
        Row: {
          click_count: number | null
          created_at: string | null
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          hash: string
          id: string
          ref: string | null
          target_url: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          hash: string
          id?: string
          ref?: string | null
          target_url: string
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          hash?: string
          id?: string
          ref?: string | null
          target_url?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          key: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          key: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_share_preview: {
        Row: {
          created_at: string | null
          default_description: string
          default_image_url: string | null
          default_title: string
          id: string
          og_type: string | null
          singleton_flag: boolean | null
          templates: Json | null
          twitter_card: string | null
          twitter_site: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          default_description?: string
          default_image_url?: string | null
          default_title?: string
          id?: string
          og_type?: string | null
          singleton_flag?: boolean | null
          templates?: Json | null
          twitter_card?: string | null
          twitter_site?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          default_description?: string
          default_image_url?: string | null
          default_title?: string
          id?: string
          og_type?: string | null
          singleton_flag?: boolean | null
          templates?: Json | null
          twitter_card?: string | null
          twitter_site?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      site_share_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          ip_hash: string | null
          raw_referrer: string | null
          referrer: string | null
          section: string | null
          url: string
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip_hash?: string | null
          raw_referrer?: string | null
          referrer?: string | null
          section?: string | null
          url: string
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip_hash?: string | null
          raw_referrer?: string | null
          referrer?: string | null
          section?: string | null
          url?: string
        }
        Relationships: []
      }
      social_share_settings: {
        Row: {
          button_position: string | null
          created_at: string | null
          custom_icons: Json | null
          default_message: string | null
          id: string
          is_enabled: boolean | null
          share_title: string | null
          singleton_flag: boolean | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          button_position?: string | null
          created_at?: string | null
          custom_icons?: Json | null
          default_message?: string | null
          id?: string
          is_enabled?: boolean | null
          share_title?: string | null
          singleton_flag?: boolean | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          button_position?: string | null
          created_at?: string | null
          custom_icons?: Json | null
          default_message?: string | null
          id?: string
          is_enabled?: boolean | null
          share_title?: string | null
          singleton_flag?: boolean | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      thought_likes: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          thought_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          thought_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          thought_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thought_likes_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_tag_relations: {
        Row: {
          tag_id: string
          thought_id: string
        }
        Insert: {
          tag_id: string
          thought_id: string
        }
        Update: {
          tag_id?: string
          thought_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thought_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "thought_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thought_tag_relations_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      thoughts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          likes_count: number
          location: string
          name: string
          photo_url: string | null
          sentiment: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          status: string
          thought: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          location: string
          name: string
          photo_url?: string | null
          sentiment?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          status?: string
          thought: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          location?: string
          name?: string
          photo_url?: string | null
          sentiment?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          status?: string
          thought?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tourism_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          listing_id: string | null
          message: string | null
          phone: string | null
          preferred_dates: string | null
          provider_id: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          listing_id?: string | null
          message?: string | null
          phone?: string | null
          preferred_dates?: string | null
          provider_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          phone?: string | null
          preferred_dates?: string | null
          provider_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourism_inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "tourism_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_inquiries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tourism_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_listings: {
        Row: {
          base_price: number | null
          category: string
          created_at: string
          district_id: string | null
          full_description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_sample: boolean
          lat: number | null
          lng: number | null
          map_featured: boolean | null
          map_visible: boolean | null
          price_unit: string | null
          provider_id: string
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          short_description: string | null
          sort_order: number
          title: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string
          created_at?: string
          district_id?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_sample?: boolean
          lat?: number | null
          lng?: number | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          price_unit?: string | null
          provider_id: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string
          created_at?: string
          district_id?: string | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_sample?: boolean
          lat?: number | null
          lng?: number | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          price_unit?: string | null
          provider_id?: string
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_listings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_listings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tourism_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_listings_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_providers: {
        Row: {
          contact_name: string | null
          created_at: string
          description: string | null
          district_id: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_local: boolean | null
          is_sample: boolean
          is_verified: boolean
          lat: number | null
          lng: number | null
          map_featured: boolean | null
          map_visible: boolean | null
          name: string
          phone: string | null
          rating: number | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          source: string
          type: string
          updated_at: string
          village_id: string | null
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_local?: boolean | null
          is_sample?: boolean
          is_verified?: boolean
          lat?: number | null
          lng?: number | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          name: string
          phone?: string | null
          rating?: number | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          source?: string
          type?: string
          updated_at?: string
          village_id?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_local?: boolean | null
          is_sample?: boolean
          is_verified?: boolean
          lat?: number | null
          lng?: number | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          name?: string
          phone?: string | null
          rating?: number | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          source?: string
          type?: string
          updated_at?: string
          village_id?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_providers_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_providers_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_booking_requests: {
        Row: {
          admin_notes: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          month_or_season: string | null
          number_of_travellers: number | null
          phone: string | null
          preferred_start_date: string | null
          status: string
          travel_package_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          month_or_season?: string | null
          number_of_travellers?: number | null
          phone?: string | null
          preferred_start_date?: string | null
          status?: string
          travel_package_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          month_or_season?: string | null
          number_of_travellers?: number | null
          phone?: string | null
          preferred_start_date?: string | null
          status?: string
          travel_package_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_booking_requests_travel_package_id_fkey"
            columns: ["travel_package_id"]
            isOneToOne: false
            referencedRelation: "travel_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_packages: {
        Row: {
          best_season: string | null
          created_at: string
          destination: string | null
          difficulty_level: string | null
          duration_days: number | null
          ending_point: string | null
          exclusions: string | null
          full_description: string | null
          gallery_images: string[] | null
          id: string
          inclusions: string | null
          is_active: boolean
          is_featured: boolean
          itinerary: string | null
          map_featured: boolean | null
          map_visible: boolean | null
          price_currency: string
          price_per_person: number
          region: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          short_description: string | null
          slug: string
          start_lat: number | null
          start_lng: number | null
          starting_point: string | null
          stops: Json | null
          thumbnail_image_url: string | null
          title: string
          updated_at: string
          village_ids: string[] | null
        }
        Insert: {
          best_season?: string | null
          created_at?: string
          destination?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          ending_point?: string | null
          exclusions?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          inclusions?: string | null
          is_active?: boolean
          is_featured?: boolean
          itinerary?: string | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          price_currency?: string
          price_per_person?: number
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          slug: string
          start_lat?: number | null
          start_lng?: number | null
          starting_point?: string | null
          stops?: Json | null
          thumbnail_image_url?: string | null
          title: string
          updated_at?: string
          village_ids?: string[] | null
        }
        Update: {
          best_season?: string | null
          created_at?: string
          destination?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          ending_point?: string | null
          exclusions?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          inclusions?: string | null
          is_active?: boolean
          is_featured?: boolean
          itinerary?: string | null
          map_featured?: boolean | null
          map_visible?: boolean | null
          price_currency?: string
          price_per_person?: number
          region?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          short_description?: string | null
          slug?: string
          start_lat?: number | null
          start_lng?: number | null
          starting_point?: string | null
          stops?: Json | null
          thumbnail_image_url?: string | null
          title?: string
          updated_at?: string
          village_ids?: string[] | null
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
      user_submissions: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string
          file_url: string | null
          id: string
          location: string | null
          message: string
          name: string
          reason: string | null
          replied_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email: string
          file_url?: string | null
          id?: string
          location?: string | null
          message: string
          name: string
          reason?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string
          file_url?: string | null
          id?: string
          location?: string | null
          message?: string
          name?: string
          reason?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      village_link_audit: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          changed_by: string | null
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          reason: string | null
          village_id: string
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          reason?: string | null
          village_id: string
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          reason?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_link_audit_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_link_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          mode: string
          radius_meters: number | null
          status: string
          suggestion_count: number | null
          village_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          mode: string
          radius_meters?: number | null
          status?: string
          suggestion_count?: number | null
          village_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          mode?: string
          radius_meters?: number | null
          status?: string
          suggestion_count?: number | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_link_jobs_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_link_suggestions: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          job_id: string | null
          match_method: string
          status: string
          village_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          job_id?: string | null
          match_method: string
          status?: string
          village_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          job_id?: string | null
          match_method?: string
          status?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_link_suggestions_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          item_type: string
          priority: number | null
          promote: boolean | null
          status: string
          updated_at: string | null
          village_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          item_type: string
          priority?: number | null
          promote?: boolean | null
          status?: string
          updated_at?: string | null
          village_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          item_type?: string
          priority?: number | null
          promote?: boolean | null
          status?: string
          updated_at?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_links_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          artisans: string | null
          created_at: string
          district_id: string
          festivals: string | null
          foods: string | null
          gallery_images: string[] | null
          handicrafts: string | null
          history: string | null
          id: string
          introduction: string
          lat: number | null
          latitude: number | null
          lng: number | null
          longitude: number | null
          map_featured: boolean | null
          map_priority: number | null
          map_visible: boolean | null
          name: string
          population: number | null
          recipes: string | null
          seo_description: string | null
          seo_image_url: string | null
          seo_schema: Json | null
          seo_title: string | null
          share_templates: Json | null
          slug: string
          status: string | null
          stories: string | null
          tehsil: string | null
          thumbnail_url: string | null
          traditions: string | null
          travel_tips: string | null
          updated_at: string
        }
        Insert: {
          artisans?: string | null
          created_at?: string
          district_id: string
          festivals?: string | null
          foods?: string | null
          gallery_images?: string[] | null
          handicrafts?: string | null
          history?: string | null
          id?: string
          introduction: string
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          map_featured?: boolean | null
          map_priority?: number | null
          map_visible?: boolean | null
          name: string
          population?: number | null
          recipes?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug: string
          status?: string | null
          stories?: string | null
          tehsil?: string | null
          thumbnail_url?: string | null
          traditions?: string | null
          travel_tips?: string | null
          updated_at?: string
        }
        Update: {
          artisans?: string | null
          created_at?: string
          district_id?: string
          festivals?: string | null
          foods?: string | null
          gallery_images?: string[] | null
          handicrafts?: string | null
          history?: string | null
          id?: string
          introduction?: string
          lat?: number | null
          latitude?: number | null
          lng?: number | null
          longitude?: number | null
          map_featured?: boolean | null
          map_priority?: number | null
          map_visible?: boolean | null
          name?: string
          population?: number | null
          recipes?: string | null
          seo_description?: string | null
          seo_image_url?: string | null
          seo_schema?: Json | null
          seo_title?: string | null
          share_templates?: Json | null
          slug?: string
          status?: string | null
          stories?: string | null
          tehsil?: string | null
          thumbnail_url?: string | null
          traditions?: string | null
          travel_tips?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "villages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      homepage_visits_summary: {
        Row: {
          today: number | null
          total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_reset_user_password: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hybrid_search: {
        Args: {
          content_types?: string[]
          district_filter?: string
          lexical_weight?: number
          match_count?: number
          max_price?: number
          min_price?: number
          promoted_only?: boolean
          query_embedding?: string
          query_text: string
          semantic_weight?: number
        }
        Returns: {
          category: string
          content_type: string
          district_name: string
          excerpt: string
          final_score: number
          id: string
          image_url: string
          is_featured: boolean
          is_promoted: boolean
          lat: number
          lexical_score: number
          lng: number
          price_min: number
          rating: number
          semantic_score: number
          source_id: string
          subtitle: string
          title: string
          url_slug: string
          village_name: string
        }[]
      }
      increment_consent_stat: {
        Args: { p_categories?: string[]; p_stat_type: string }
        Returns: undefined
      }
      refresh_map_poi_cache: { Args: never; Returns: undefined }
      user_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "moderator"
        | "user"
        | "super_admin"
        | "content_editor"
        | "content_manager"
        | "author"
        | "reviewer"
        | "media_manager"
        | "seo_manager"
        | "support_agent"
        | "analytics_viewer"
        | "viewer"
        | "developer"
      district_content_category: "Festival" | "Food" | "Place" | "Culture"
      event_status: "draft" | "pending" | "published" | "archived" | "cancelled"
      event_type:
        | "festival"
        | "fair"
        | "cultural"
        | "religious"
        | "music"
        | "food"
        | "sports"
        | "workshop"
        | "exhibition"
        | "other"
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
      app_role: [
        "admin",
        "editor",
        "moderator",
        "user",
        "super_admin",
        "content_editor",
        "content_manager",
        "author",
        "reviewer",
        "media_manager",
        "seo_manager",
        "support_agent",
        "analytics_viewer",
        "viewer",
        "developer",
      ],
      district_content_category: ["Festival", "Food", "Place", "Culture"],
      event_status: ["draft", "pending", "published", "archived", "cancelled"],
      event_type: [
        "festival",
        "fair",
        "cultural",
        "religious",
        "music",
        "food",
        "sports",
        "workshop",
        "exhibition",
        "other",
      ],
    },
  },
} as const
