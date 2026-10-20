import { createClient } from "@/lib/supabase/server";

export type ReviewCountSummary = {
  total: number;
  addedThisMonth: number;
};

function startOfCurrentMonthIso(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}-01T00:00:00+09:00`;
}

async function countReviews(since?: string): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("is_deleted", false);

  if (since) {
    query = query.gte("created_at", since);
  }

  const { count, error } = await query;
  if (error) {
    console.error("countReviews:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getReviewCountSummary(): Promise<ReviewCountSummary> {
  const [total, addedThisMonth] = await Promise.all([
    countReviews(),
    countReviews(startOfCurrentMonthIso()),
  ]);

  return { total, addedThisMonth };
}
