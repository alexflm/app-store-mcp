import { z } from "zod";
import { getAutocomplete } from "../api/index.js";
import { DEFAULT_COUNTRY } from "../api/constants.js";
import { formatToolError } from "./error-handler.js";

export const searchAutocompleteTool = {
  name: "get_search_autocomplete",
  description:
    "Get the autocomplete suggestions that the App Store shows when a user types a search term. " +
    "This reflects real user search behavior — the terms Apple suggests are driven by actual search volume. " +
    "Use this to discover what users actually search for, find long-tail keyword variations, " +
    "and map out the keyword space around a topic. " +
    "Calling this iteratively (autocomplete a term, then autocomplete each result) builds a keyword tree " +
    "that reveals the full search landscape for a niche.",
  annotations: {
    title: "Search Autocomplete",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  parameters: z.object({
    term: z
      .string()
      .min(1, "Search term must not be empty")
      .describe("The beginning of a search query to autocomplete — can be a partial word or full phrase"),
    country: z
      .string()
      .length(2)
      .default(DEFAULT_COUNTRY)
      .describe("ISO 3166-1 alpha-2 country code — autocomplete results vary by market (e.g. us, gb, ru, jp, de)"),
  }),
  execute: async (args: { term: string; country: string }) => {
    try {
      const terms = await getAutocomplete(args.term, args.country);

      if (terms.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                result: "empty",
                term: args.term,
                country: args.country,
                suggestions: [
                  "Try a shorter or broader term — autocomplete works best with 2-4 characters",
                  "Check spelling — Apple only returns exact prefix matches",
                  "This term may have no search volume in this country",
                ],
              }),
            },
          ],
        };
      }

      return JSON.stringify(terms, null, 2);
    } catch (err) {
      return formatToolError(err);
    }
  },
} as const;
