import { loadEnvConfig } from "@next/env";

import { recalculateAllSimilarities } from "../src/lib/similarity/recalculate-all-similarities";

loadEnvConfig(process.cwd());

async function main() {
  const result = await recalculateAllSimilarities();
  console.log(
    `Recalculated similarities for ${result.userCount} users (${result.pairCount} pairs).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
