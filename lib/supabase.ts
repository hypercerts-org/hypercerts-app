import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/hypercerts-data-database";

const SUPABASE_DATA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_DATA_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_DATA_URL || !SUPABASE_DATA_ANON_KEY) {
  throw new Error("Missing env variables for Supabase");
}

export const supabaseData = createClient<Database>(
  SUPABASE_DATA_URL,
  SUPABASE_DATA_ANON_KEY,
);
