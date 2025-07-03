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
      favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          recipe_id: string
          source: "KOBIRI" | "THEMEALDB" | "AI"
          title: string
          image: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          recipe_id: string
          source: "KOBIRI" | "THEMEALDB" | "AI"
          title: string
          image: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          recipe_id?: string
          source?: "KOBIRI" | "THEMEALDB" | "AI"
          title?: string
          image?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      market_list_items: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          amount: string
          checked: boolean
          from_recipe: string | null
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          amount: string
          checked: boolean
          from_recipe?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          amount?: string
          checked?: boolean
          from_recipe?: string | null
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_list_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
