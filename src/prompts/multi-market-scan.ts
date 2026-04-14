export const multiMarketScanPrompt = {
  name: "multi-market-scan",
  description:
    "Compare keyword demand and competition across multiple App Store markets. " +
    "Finds markets where your keywords face less competition or have untapped demand.",
  arguments: [
    {
      name: "keywords",
      description: "Keywords to compare across markets (comma-separated)",
      required: true,
    },
    {
      name: "countries",
      description:
        "Country codes to compare (comma-separated, e.g. 'us,gb,de,jp'). " +
        "Defaults to top-6 markets: us, gb, de, jp, fr, au",
      required: false,
    },
  ],
  load: async (params: Record<string, string | undefined>) => {
    const countriesRaw = params.countries;
    const countries = countriesRaw
      ? countriesRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : ["us", "gb", "de", "jp", "fr", "au"];
    const keywords = (params.keywords ?? "").split(",").map((k) => k.trim()).filter(Boolean);

    return `Compare these keywords across multiple markets:

Keywords: ${keywords.join(", ")}
Markets: ${countries.join(", ")}

For each keyword × market combination:
1. Run get_search_autocomplete — does the term autocomplete? What variations appear?
2. Run search_apps (limit 5) — who are the top results? What are their rating counts?

Then analyze:
- **Demand matrix**: Which keywords autocomplete in which markets (✓/✗ table)
- **Competition matrix**: Average review count of top-3 results per keyword per market (lower = easier)
- **Opportunities**: Markets where a keyword has demand (autocompletes) but weak competition
- **Localization notes**: Markets where local-language variants might perform better

Prioritize the best keyword × market combinations for targeting.`;
  },
};
