export const competitorAnalysisPrompt = {
  name: "competitor-analysis",
  description:
    "Reverse-engineer a competitor's App Store keyword strategy. " +
    "Analyzes their metadata, discovers which keywords they target, " +
    "and finds gaps you can exploit.",
  arguments: [
    {
      name: "competitor",
      description: "Competitor app name or App Store ID (numeric)",
      required: true,
    },
    {
      name: "country",
      description: "Target market country code (default: us)",
      required: false,
    },
  ],
  load: async (params: Record<string, string | undefined>) => {
    const competitor = params.competitor ?? "";
    const country = params.country || "us";
    const isId = /^\d+$/.test(competitor.trim());

    return `Perform a competitor deep-dive on: ${competitor}
Market: ${country}

Steps:
${isId ? `1. get_app_details for ID ${competitor.trim()} — analyze title, subtitle, description, ratings, update frequency.` : `1. search_apps for "${competitor}" to find the app, then get_app_details for the top match.`}
2. Extract all potential keywords from the app's title, subtitle, and opening description lines.
3. Run get_search_autocomplete for each extracted keyword — discover related terms and validate search volume.
4. Run search_apps for the top keywords — see where this competitor ranks and who else competes.
5. Batch get_app_details for other top-ranking apps in those searches — compare positioning.

Deliver:
- **Competitor profile**: Name, category, rating health (stars × count), update cadence, monetization
- **Keyword map**: Keywords the competitor likely targets (from title/subtitle), with autocomplete validation and their ranking position
- **Competitive landscape**: Other strong players in the same keyword space
- **Opportunities**: Keywords where competition is weaker, or where the competitor is vulnerable (low rank, few reviews)
- **Gaps**: Relevant autocomplete suggestions that neither the competitor nor top results are targeting`;
  },
};
