import { STOREFRONTS } from "../storefronts.js";

const countryCodes = Object.keys(STOREFRONTS).sort();

export const storefrontTemplate = {
  uriTemplate: "data://storefront/{country}" as const,
  name: "Storefront Details",
  description:
    "Look up the Apple storefront ID for a specific country code. " +
    "Returns the country code, storefront ID, and the X-Apple-Store-Front header value used in API calls.",
  mimeType: "application/json" as const,
  arguments: [
    {
      name: "country" as const,
      description: "ISO 3166-1 alpha-2 country code (e.g. us, gb, de, jp)",
      required: true as const,
      complete: async (value: string) => {
        const lower = value.toLowerCase();
        return {
          values: countryCodes.filter((code) => code.startsWith(lower)),
        };
      },
    },
  ],
  async load({ country }: { country: string }) {
    const code = country.toLowerCase();
    const storefrontId = STOREFRONTS[code];

    if (!storefrontId) {
      throw new Error(
        `Unknown country code: "${country}". Use a valid ISO 3166-1 alpha-2 code (e.g. us, gb, jp, de).`,
      );
    }

    return {
      text: JSON.stringify(
        {
          country: code,
          storefrontId,
          storefrontHeader: `${storefrontId}-1,29`,
        },
        null,
        2,
      ),
    };
  },
};
