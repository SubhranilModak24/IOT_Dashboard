export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'client' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  thingspeak_channel_id: string | null;
  thingspeak_read_key: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelemetryLog {
  id: number;
  user_id: string;
  entry_id: number;
  soil_moisture: number | null; // Field 1: Soil Moisture (%)
  ambient_temp: number | null; // Field 2: Ambient Temp (°C)
  humidity: number | null; // Field 3: Humidity (%)
  water_level: number | null; // Field 4: Water Tank Level (%)
  battery_level: number | null; // Field 5: LiFePO4 Battery (%)
  solar_voltage: number | null; // Field 6: Solar Panel Voltage (V)
  pump_status: boolean; // Field 7: Irrigation Pump (true/false)
  bot_status: string; // Field 8: Bot State (ACTIVE, STANDBY, IRRIGATION, ERROR)
  recorded_at: string;
  created_at?: string;
}

export interface ThingSpeakFeedItem {
  created_at: string;
  entry_id: number;
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
}

export interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    field1?: string;
    field2?: string;
    field3?: string;
    field4?: string;
    field5?: string;
    field6?: string;
    field7?: string;
    field8?: string;
    created_at?: string;
    updated_at?: string;
    last_entry_id?: number;
  };
  feeds: ThingSpeakFeedItem[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      telemetry_logs: {
        Row: TelemetryLog;
        Insert: Omit<TelemetryLog, 'id'> & { id?: number };
        Update: Partial<TelemetryLog>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
