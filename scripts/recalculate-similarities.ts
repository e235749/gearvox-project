async function main() {
  const { recalculateAllSimilarities } = await import(
    "../src/lib/similarity/recalculate-all-similarities"
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      ".env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。",
    );
  }

  const result = await recalculateAllSimilarities();
  console.log(
    `Recalculated similarities for ${result.userCount} users (${result.pairCount} pairs).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
