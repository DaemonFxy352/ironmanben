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
          author_phone: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          note?: string | null;
          lat: number;
          lng: number;
          created_at?: string;
          source: "gps" | "manual";
          author_phone?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          note?: string | null;
          lat?: number;
          lng?: number;
          created_at?: string;
          source?: "gps" | "manual";
          author_phone?: string | null;
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
          author_phone: string | null;
        };
        Insert: {
          id?: string;
          author: string;
          message: string;
          location?: string | null;
          type: "ben" | "parking" | "food" | "meetup" | "help" | "general";
          created_at?: string;
          author_phone?: string | null;
        };
        Update: {
          id?: string;
          author?: string;
          message?: string;
          location?: string | null;
          type?: "ben" | "parking" | "food" | "meetup" | "help" | "general";
          created_at?: string;
          author_phone?: string | null;
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
      notification_subscribers: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          phone_e164: string;
          display_name: string;
          notify_sightings: boolean | null;
          notify_meetup: boolean | null;
          notify_finish: boolean | null;
          notify_crew: boolean | null;
          is_active: boolean | null;
          last_notified_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          phone_e164: string;
          display_name: string;
          notify_sightings?: boolean | null;
          notify_meetup?: boolean | null;
          notify_finish?: boolean | null;
          notify_crew?: boolean | null;
          is_active?: boolean | null;
          last_notified_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          phone_e164?: string;
          display_name?: string;
          notify_sightings?: boolean | null;
          notify_meetup?: boolean | null;
          notify_finish?: boolean | null;
          notify_crew?: boolean | null;
          is_active?: boolean | null;
          last_notified_at?: string | null;
        };
        Relationships: [];
      };
      sms_log: {
        Row: {
          id: string;
          created_at: string | null;
          recipient_count: number;
          message_type: "sighting" | "checkin" | "meetup" | "finish" | "general" | "auth";
          status: string;
          textlocal_batch_id: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          recipient_count?: number;
          message_type?: "sighting" | "checkin" | "meetup" | "finish" | "general" | "auth";
          status?: string;
          textlocal_batch_id?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          recipient_count?: number;
          message_type?: "sighting" | "checkin" | "meetup" | "finish" | "general" | "auth";
          status?: string;
          textlocal_batch_id?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_subscriber_phones: {
        Args: {
          notification_type: string;
        };
        Returns: Array<{
          phone_e164: string;
          display_name: string;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
