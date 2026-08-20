import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

function assertServiceRoleKey(key: string): void {
  if (!key.startsWith("eyJ") || key.split(".").length !== 3) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY が不正です。Supabase ダッシュボードの Project Settings → API → service_role (secret) を .env.local に設定してください（anon key ではありません）。",
    );
  }
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY と NEXT_PUBLIC_SUPABASE_URL が必要です。",
    );
  }

  assertServiceRoleKey(serviceRoleKey);

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
