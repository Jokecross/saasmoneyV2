export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin" | "coach" | "closer";

// Types pour les invitations
export interface InvitationCode {
  id: string;
  code: string;
  closer_id: string;
  closer_name: string;
  package_type: "700" | "3000" | "5000" | "15000";
  coins_amount: number;
  used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          role: UserRole;
          coins_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          role?: UserRole;
          coins_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          coins_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          mode: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          mode?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          mode?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          content?: string;
          role?: string;
          created_at?: string;
        };
      };
      coin_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          reason: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          reason: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: string;
          reason?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      one_of_one_slots: {
        Row: {
          id: string;
          coach_id: string | null;
          date: string;
          duration: number;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id?: string | null;
          date: string;
          duration?: number;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string | null;
          date?: string;
          duration?: number;
          is_available?: boolean;
          created_at?: string;
        };
      };
      one_of_one_bookings: {
        Row: {
          id: string;
          user_id: string;
          slot_id: string;
          coins_spent: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slot_id: string;
          coins_spent: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slot_id?: string;
          coins_spent?: number;
          status?: string;
          created_at?: string;
        };
      };
      hotset_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          duration: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          duration?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          duration?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      hotset_slots: {
        Row: {
          id: string;
          coach_id: string | null;
          type_id: string;
          date: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id?: string | null;
          type_id: string;
          date: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string | null;
          type_id?: string;
          date?: string;
          is_available?: boolean;
          created_at?: string;
        };
      };
      hotset_bookings: {
        Row: {
          id: string;
          user_id: string;
          slot_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slot_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slot_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          one_of_one_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          one_of_one_cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          one_of_one_cost?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type CoinTransaction = Database["public"]["Tables"]["coin_transactions"]["Row"];
export type OneOfOneSlot = Database["public"]["Tables"]["one_of_one_slots"]["Row"];
export type OneOfOneBooking = Database["public"]["Tables"]["one_of_one_bookings"]["Row"];
export type HotsetType = Database["public"]["Tables"]["hotset_types"]["Row"];
export type HotsetSlot = Database["public"]["Tables"]["hotset_slots"]["Row"];
export type HotsetBooking = Database["public"]["Tables"]["hotset_bookings"]["Row"];
export type AppSettings = Database["public"]["Tables"]["app_settings"]["Row"];

// Extended types with relations
export interface OneOfOneSlotWithCoach extends OneOfOneSlot {
  coach?: Profile;
}

export interface OneOfOneBookingWithDetails extends OneOfOneBooking {
  slot?: OneOfOneSlotWithCoach;
  user?: Profile;
}

export interface HotsetSlotWithDetails extends HotsetSlot {
  coach?: Profile;
  type?: HotsetType;
}

export interface HotsetBookingWithDetails extends HotsetBooking {
  slot?: HotsetSlotWithDetails;
  user?: Profile;
}
