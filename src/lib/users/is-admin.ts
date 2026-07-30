import { createClient } from "@/lib/supabase/server";

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return (data as { is_admin: boolean }).is_admin;
}
