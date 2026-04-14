export const config = {
  apple: {
    itunesBaseUrl: "https://itunes.apple.com",
    searchHintsBaseUrl: "https://search.itunes.apple.com",
    searchHintsPath: "/WebObjects/MZSearchHints.woa/wa/hints",
    /** Filters autocomplete to App Store apps only */
    hintsClientApplication: "Software",
    /**
     * Suffix for X-Apple-Store-Front header.
     * -1 = iPhone/iPad platform, 29 = current store version
     */
    storefrontHeaderSuffix: "-1,29",
    rateLimitStatusCodes: new Set([403, 429]),
  },

  defaults: {
    country: "us",
    searchLimit: 10,
    maxSearchLimit: 200,
    port: 8080,
    requestTimeoutMs: 15_000,
  },

  proxy: {
    header: "x-proxy",
  },
} as const;
