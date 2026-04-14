export const keywordResearchPrompt = {
  name: "keyword-research",
  description:
    "Guided keyword research for an app or niche. Discovers what users search for, " +
    "evaluates competition, and produces a prioritized keyword list. " +
    "Provide seed keywords or an App Store ID to start.",
  arguments: [
    {
      name: "seed",
      description:
        "Starting point: seed keywords (comma-separated), an app name, or an App Store ID",
      required: true,
    },
    {
      name: "country",
      description: "Target market country code (default: us)",
      required: false,
    },
    {
      name: "depth",
      description: "Research depth: quick (1 level), standard (2 levels), deep (3+ levels with alphabet crawl)",
      required: false,
      enum: ["quick", "standard", "deep"],
    },
  ],
  load: async (params: Record<string, string | undefined>) => {
    const seed = params.seed ?? "";
    const country = params.country || "us";
    const depth = params.depth || "standard";

    return `Perform ${depth} keyword research for: ${seed}
Target market: ${country}

Follow this workflow:
1. If the seed looks like an App Store ID (numeric), start with get_app_details to understand the app, then extract keywords from its title and subtitle.
2. Run get_search_autocomplete for each seed keyword to discover what users actually search for.${depth !== "quick" ? "\n3. Autocomplete the most promising suggestions (second level) to expand the keyword tree." : ""}${depth === "deep" ? "\n4. Run an alphabet crawl on the top 2-3 base terms: append a-z to each and autocomplete." : ""}
${depth !== "quick" ? `${depth === "deep" ? "5" : "3"}. For the top 5-10 keywords, run search_apps to check competition (who ranks, rating counts, naming patterns).` : "3. For the top 3-5 keywords, run search_apps to check competition."}
${depth !== "quick" ? `${depth === "deep" ? "6" : "4"}. Batch get_app_details for the strongest competitors found across searches.` : ""}

Deliver a prioritized keyword list:
- **High priority**: Appears in autocomplete AND in competitor titles/subtitles, achievable competition
- **Medium priority**: Appears in autocomplete OR competitor metadata, not both
- **Explore**: Found in deep autocomplete or descriptions, needs more data

For each keyword, note: autocomplete confirmation (yes/no), estimated competition level, and suggested placement (title / subtitle / keyword field).`;
  },
};
