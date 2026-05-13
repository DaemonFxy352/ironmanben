export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      check_ins: {
        Row: {
          id: string;
          name: string;
          note: string | null;
          lat: number;
          lng: number;
          created_at: string;
          source: "gps" | "manual";
        };
        Insert: {
          id?: string;
          name: string;
          note?: string | null;
          lat: number;
          lng: number;
          created_at?: string;
          source: "gps" | "manual";
        };
        Update: {
          id?: string;
          name?: string;
          note?: string | null;
          lat?: number;
          lng?: number;
          created_at?: string;
          source?: "gps" | "manual";
        };
        Relationships: [];
      };
      race_updates: {
        Row: {
          id: string;
          author: string;
          message: string;
          location: string | null;
          type: "ben" | "parking" | "food" | "meetup" | "help" | "general";
          created_at: string;
        };
        Insert: {
          id?: string;
          author: string;
          message: string;
          location?: string | null;
          type: "ben" | "parking" | "food" | "meetup" | "help" | "general";
          created_at?: string;
        };
        Update: {
          id?: string;
          author?: string;
          message?: string;
          location?: string | null;
          type?: "ben" | "parking" | "food" | "meetup" | "help" | "general";
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          author: string;
          message: string;
          location: string | null;
          kind: "finish" | "memorial_park" | "lunch" | "help_water";
          created_at: string;
        };
        Insert: {
          id?: string;
          author: string;
          message: string;
          location?: string | null;
          kind: "finish" | "memorial_park" | "lunch" | "help_water";
          created_at?: string;
        };
        Update: {
          id?: string;
          author?: string;
          message?: string;
          location?: string | null;
          kind?: "finish" | "memorial_park" | "lunch" | "help_water";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
