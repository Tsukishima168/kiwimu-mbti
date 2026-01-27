// Supabase Database Types
// 這個檔案定義了資料庫的型別結構
// 你可以用 Supabase CLI 自動生成：npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mbti_questions: {
        Row: {
          id: number
          question_id: number
          text: string
          image_url: string
          dimension_pair: 'EI' | 'SN' | 'TF' | 'JP' | 'AT'
          weight: 1 | 2
          option_a_label: string
          option_a_value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          option_b_label: string
          option_b_value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          question_id: number
          text: string
          image_url: string
          dimension_pair: 'EI' | 'SN' | 'TF' | 'JP' | 'AT'
          weight?: 1 | 2
          option_a_label: string
          option_a_value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          option_b_label: string
          option_b_value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          display_order: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          question_id?: number
          text?: string
          image_url?: string
          dimension_pair?: 'EI' | 'SN' | 'TF' | 'JP' | 'AT'
          weight?: 1 | 2
          option_a_label?: string
          option_a_value?: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          option_b_label?: string
          option_b_value?: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P' | 'A' | 'Turbulent'
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mbti_results: {
        Row: {
          id: string
          title: string
          summary: string
          quote: string
          keywords: string[]
          bg_color: string
          core_analysis: string
          dimension_analysis: Json
          strengths: string[]
          blind_spots: string[]
          career: Json
          relationships: Json
          social_style: string
          growth_advice: string
          soul_questions: string[]
          character_image_url: string
          dessert: Json
          version: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          summary: string
          quote: string
          keywords: string[]
          bg_color?: string
          core_analysis: string
          dimension_analysis?: Json
          strengths: string[]
          blind_spots: string[]
          career?: Json
          relationships?: Json
          social_style: string
          growth_advice: string
          soul_questions: string[]
          character_image_url: string
          dessert?: Json
          version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          quote?: string
          keywords?: string[]
          bg_color?: string
          core_analysis?: string
          dimension_analysis?: Json
          strengths?: string[]
          blind_spots?: string[]
          career?: Json
          relationships?: Json
          social_style?: string
          growth_advice?: string
          soul_questions?: string[]
          character_image_url?: string
          dessert?: Json
          version?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mbti_variant_nuances: {
        Row: {
          id: number
          mbti_type: string
          variant: 'A' | 'T'
          nuance_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          mbti_type: string
          variant: 'A' | 'T'
          nuance_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          mbti_type?: string
          variant?: 'A' | 'T'
          nuance_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      mbti_character_images: {
        Row: {
          id: number
          mbti_type: string
          image_url: string
          image_alt: string | null
          cloudinary_id: string | null
          version: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          mbti_type: string
          image_url: string
          image_alt?: string | null
          cloudinary_id?: string | null
          version?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          mbti_type?: string
          image_url?: string
          image_alt?: string | null
          cloudinary_id?: string | null
          version?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mbti_dessert_mappings: {
        Row: {
          id: number
          mbti_type: string
          dessert_name: string
          dessert_description: string
          dessert_image_url: string
          dessert_cta_link: string
          dessert_series: string | null
          dessert_quad: string | null
          drink_a: string | null
          drink_t: string | null
          alternative_desserts: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          mbti_type: string
          dessert_name: string
          dessert_description: string
          dessert_image_url: string
          dessert_cta_link: string
          dessert_series?: string | null
          dessert_quad?: string | null
          drink_a?: string | null
          drink_t?: string | null
          alternative_desserts?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          mbti_type?: string
          dessert_name?: string
          dessert_description?: string
          dessert_image_url?: string
          dessert_cta_link?: string
          dessert_series?: string | null
          dessert_quad?: string | null
          drink_a?: string | null
          drink_t?: string | null
          alternative_desserts?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dimension_explanations: {
        Row: {
          id: number
          dimension_key: string
          label: string
          explanation_text: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          dimension_key: string
          label: string
          explanation_text: string
          display_order: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          dimension_key?: string
          label?: string
          explanation_text?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      mbti_results_full: {
        Row: {
          // 這個視圖的型別會根據實際查詢結果動態生成
          [key: string]: any
        }
      }
      mbti_questions_full: {
        Row: {
          [key: string]: any
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
