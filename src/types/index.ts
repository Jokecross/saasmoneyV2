// Re-export types from Supabase for convenience
export type {
  Profile,
  Conversation,
  Message,
  CoinTransaction,
  OneOfOneBooking,
  HotsetType,
  HotsetBooking,
  AppSettings,
} from "@/lib/supabase/types";

// User type that extends Profile with email
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  coins_balance: number;
  created_at: string;
  updated_at: string;
}

// Extended OneOfOneSlot with coach info
export interface OneOfOneSlot {
  id: string;
  date: Date | string;
  duration: number;
  isAvailable: boolean;
  is_available?: boolean; // Supabase naming
  coachId?: string;
  coach_id?: string; // Supabase naming
  coachName?: string; // For display
  createdAt?: Date;
  created_at?: string;
  updatedAt?: Date;
}

// Extended HotsetSlot with coach info
export interface HotsetSlot {
  id: string;
  typeId: string;
  type_id?: string; // Supabase naming
  date: Date | string;
  isAvailable: boolean;
  is_available?: boolean;
  coachId?: string;
  coach_id?: string;
  coachName?: string;
  type?: HotsetType;
  createdAt?: Date;
  created_at?: string;
  updatedAt?: Date;
}

// Re-export HotsetType from supabase
export type { HotsetType } from "@/lib/supabase/types";

// Alias for backwards compatibility in components
export type ConversationMode = "coach" | "growth" | "produit" | "copywriting";
