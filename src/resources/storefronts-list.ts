import { STOREFRONTS } from "../storefronts.js";

const content = JSON.stringify(
  Object.entries(STOREFRONTS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, id]) => ({ country: code, storefrontId: id })),
  null,
  2,
);

export const storefrontsResource = {
  uri: "data://storefronts" as const,
  name: "Supported Country Codes",
  description:
    "All 155 supported App Store country codes (ISO 3166-1 alpha-2) with their Apple storefront IDs. " +
    "Use this to find valid country codes for API calls.",
  mimeType: "application/json" as const,
  async load() {
    return { text: content };
  },
};
