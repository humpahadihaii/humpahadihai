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
          location: string | null
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
          location?: string | null
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
          location?: string | null
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
      district_festivals: {
        Row: {
          created_at: string
          description: string | null
          district_id: string
          id: string
          image_url: string | null
          is_active: boolean
          month: string | null
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
          month?: string | null
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
          month?: string | null
          name?: string
          sort_order?: number
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
          slug?: string
          sort_order?: number | null
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
          name: string
          price: number
          price_currency: string
          short_description: string | null
          slug: string
          stock_status: string
          tags: string[] | null
          thumbnail_image_url: string | null
          unit_label: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price?: number
          price_currency?: string
          short_description?: string | null
          slug: string
          stock_status?: string
          tags?: string[] | null
          thumbnail_image_url?: string | null
          unit_label?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          price_currency?: string
          short_description?: string | null
          slug?: string
          stock_status?: string
          tags?: string[] | null
          thumbnail_image_url?: string | null
          unit_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "local_product_categories"
            referencedColumns: ["id"]
          },
        ]
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
          price_unit: string | null
          provider_id: string
          short_description: string | null
          sort_order: number
          title: string
          updated_at: string
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
          price_unit?: string | null
          provider_id: string
          short_description?: string | null
          sort_order?: number
          title: string
          updated_at?: string
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
          price_unit?: string | null
          provider_id?: string
          short_description?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
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
          is_sample: boolean
          is_verified: boolean
          name: string
          phone: string | null
          rating: number | null
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
          is_sample?: boolean
          is_verified?: boolean
          name: string
          phone?: string | null
          rating?: number | null
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
          is_sample?: boolean
          is_verified?: boolean
          name?: string
          phone?: string | null
          rating?: number | null
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
          price_currency: string
          price_per_person: number
          region: string | null
          short_description: string | null
          slug: string
          starting_point: string | null
          thumbnail_image_url: string | null
          title: string
          updated_at: string
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
          price_currency?: string
          price_per_person?: number
          region?: string | null
          short_description?: string | null
          slug: string
          starting_point?: string | null
          thumbnail_image_url?: string | null
          title: string
          updated_at?: string
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
          price_currency?: string
          price_per_person?: number
          region?: string | null
          short_description?: string | null
          slug?: string
          starting_point?: string | null
          thumbnail_image_url?: string | null
          title?: string
          updated_at?: string
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
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          recipes?: string | null
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
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          recipes?: string | null
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
        | "author"
        | "reviewer"
        | "media_manager"
        | "seo_manager"
        | "support_agent"
        | "analytics_viewer"
        | "viewer"
        | "developer"
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
    },
  },
} as const
