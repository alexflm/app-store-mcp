export const alphabetCrawlPrompt = {
  name: "alphabet-crawl",
  description:
    "Exhaustively expand a keyword by appending a-z (and optionally 0-9) to discover " +
    "every autocomplete suggestion Apple surfaces. Reveals long-tail keywords that " +
    "a simple autocomplete would miss.",
  arguments: [
    {
      name: "term",
      description: "Base keyword to expand (e.g. 'fitness', 'photo editor')",
      required: true,
    },
    {
      name: "country",
      description: "Target market country code (default: us)",
      required: false,
    },
    {
      name: "include_digits",
      description: "Also append 0-9 to the seed (default: false)",
      required: false,
      enum: ["true", "false"],
    },
  ],
  load: async (params: Record<string, string | undefined>) => {
    const term = params.term ?? "";
    const country = params.country || "us";
    const includeDigits = params.include_digits === "true";
    const suffixes = "abcdefghijklmnopqrstuvwxyz" + (includeDigits ? "0123456789" : "");

    return `Run an alphabet crawl on "${term}" in market: ${country}

Run get_search_autocomplete for each of these queries:
${suffixes
  .split("")
  .map((ch) => `- "${term} ${ch}"`)
  .join("\n")}

After collecting all results:
1. Deduplicate the combined suggestions.
2. Remove irrelevant noise (brand names, unrelated categories).
3. Group by theme or intent (e.g. features, audiences, use cases).
4. For the top 5-10 most promising keywords, run search_apps to check competition.

Deliver a structured keyword map grouped by theme, with notes on search volume signal (number of related autocomplete hits) and competition level for checked terms.`;
  },
};
