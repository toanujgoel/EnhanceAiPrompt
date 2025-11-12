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
      users: {
        Row: {
          id: string
          email: string
          plan: 'ANONYMOUS' | 'FREE' | 'PREMIUM'
          bonus_uses: number
          daily_uses: number
          last_reset_date: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          plan?: 'ANONYMOUS' | 'FREE' | 'PREMIUM'
          bonus_uses?: number
          daily_uses?: number
          last_reset_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          plan?: 'ANONYMOUS' | 'FREE' | 'PREMIUM'
          bonus_uses?: number
          daily_uses?: number
          last_reset_date?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          tool_type: 'enhance' | 'humanize' | 'image' | 'speech'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_type: 'enhance' | 'humanize' | 'image' | 'speech'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_type?: 'enhance' | 'humanize' | 'image' | 'speech'
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}
