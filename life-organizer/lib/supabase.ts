import { createClient } from '@supabase/supabase-js';

// 单例 Supabase 客户端
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '请在 .env 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabaseClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return supabaseClient;
}
