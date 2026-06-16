import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseAnonkey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonkey);