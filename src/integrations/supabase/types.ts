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
      content_items: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
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
        Relationships: []
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
          latitude: number | null
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
          latitude?: number | null
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
          latitude?: number | null
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
          slug: string
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
          slug: string
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
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
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
      gallery_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
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
          id: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          filename: string
          id?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
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
          status?: string
          thought?: string
          updated_at?: string
          user_id?: string | null
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
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          recipes: string | null
          slug: string
          status: string | null
          stories: string | null
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
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          recipes?: string | null
          slug: string
          status?: string | null
          stories?: string | null
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
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          recipes?: string | null
          slug?: string
          status?: string | null
          stories?: string | null
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
      [_ in never]: never
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
      district_content_category: "Festival" | "Food" | "Place" | "Culture"
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
      ],
      district_content_category: ["Festival", "Food", "Place", "Culture"],
    },
  },
} as const
