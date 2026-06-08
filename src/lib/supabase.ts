import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";
import { secureSessionStorage } from "./secureStorage";

const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTk1NzM0NTYwMH0.L_pbFfK68Bo1JVnODnmQWuWVLqLV7kJx51Eve-0qs1Q";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || localAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
