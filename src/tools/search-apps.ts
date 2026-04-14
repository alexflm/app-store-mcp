import { z } from "zod";
import { searchApps } from "../api/index.js";
import { DEFAULT_COUNTRY, DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT } from "../api/constants.js";
import { formatToolError } from "./error-handler.js";

export const searchAppsTool = {
  name: "search_apps",
  description:
    "Search the App Store by keyword and get the ranked list of apps that appear in results. " +
    "The result order matches what users see — position #1 is the top-ranked app for that keyword. " +
    "Use this to understand keyword competition: who ranks for a term, how saturated it is, " +
    "and what the top apps have in common (ratings, pricing, naming patterns). " +
    "Each result includes full app metadata, so you can analyze titles, descriptions, and ratings " +
    "without additional lookups.",
  annotations: {
    title: "App Store Search",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  parameters: z.object({
    term: z
      .string()
      .min(1, "Search term must not be empty")
      .describe("Search keyword or phrase — exactly what a user would type in the App Store search bar"),
    country: z
      .string()
      .length(2)
      .default(DEFAULT_COUNTRY)
      .describe("ISO 3166-1 alpha-2 country code — search rankings differ by market (e.g. us, gb, ru, jp, de)"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_SEARCH_LIMIT)
      .default(DEFAULT_SEARCH_LIMIT)
      .describe("Number of results to return (1–200). Use higher values to see deeper into search results."),
  }),
  execute: async (args: { term: string; country: string; limit: number }) => {
    try {
      const data = await searchApps(args.term, args.country, args.limit);

      if (data.resultCount === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                result: "empty",
                term: args.term,
                country: args.country,
                suggestions: [
                  "Try a broader or more common keyword",
                  "Check spelling — the search API requires close matches",
                  "This keyword may have no apps in this country's store",
                  "Use get_search_autocomplete to find valid keywords first",
                ],
              }),
            },
          ],
        };
      }

      return JSON.stringify(data.results, null, 2);
    } catch (err) {
      return formatToolError(err);
    }
  },
} as const;
