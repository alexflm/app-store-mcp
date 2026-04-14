import { z } from "zod";
import { lookupApps } from "../api/index.js";
import { config } from "../config.js";
import { formatToolError } from "./error-handler.js";

export const appDetailsTool = {
  name: "get_app_details",
  description:
    "Look up one or more apps by App Store ID and get their full public metadata. " +
    "Use this to understand how an app presents itself: its name, subtitle, description, " +
    "keyword positioning, rating, review count, screenshots, pricing, size, and update history. " +
    "Comparing these fields across competitors reveals what messaging and positioning strategies " +
    "work in a given category. Pass multiple comma-separated IDs to fetch several apps at once.",
  annotations: {
    title: "App Details Lookup",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  parameters: z.object({
    appId: z
      .string()
      .regex(/^\d+(,\d+)*$/, "App Store IDs must be numeric, comma-separated (e.g. 544007664 or 544007664,389801252)")
      .describe(
        'One or more App Store IDs, comma-separated (e.g. "544007664" or "544007664,389801252")',
      ),
    country: z
      .string()
      .length(2)
      .default(config.defaults.country)
      .describe("ISO 3166-1 alpha-2 country code — determines which storefront to query (e.g. us, gb, ru, jp, de)"),
  }),
  execute: async (args: { appId: string; country: string }) => {
    try {
      const data = await lookupApps(args.appId, args.country);

      if (data.resultCount === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: `No apps found for ID: ${args.appId} in country: ${args.country}`,
                suggestions: [
                  "Verify the App Store ID is correct (numeric, e.g. 544007664)",
                  "The app may not be available in this country — try 'us' as a fallback",
                  "Don't confuse App Store ID with bundle ID (com.example.app)",
                ],
              }),
            },
          ],
          isError: true,
        };
      }

      return JSON.stringify(data.results, null, 2);
    } catch (err) {
      return formatToolError(err);
    }
  },
} as const;
