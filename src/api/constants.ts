export const ITUNES_BASE_URL = "https://itunes.apple.com";
export const SEARCH_HINTS_BASE_URL = "https://search.itunes.apple.com";
export const SEARCH_HINTS_PATH = "/WebObjects/MZSearchHints.woa/wa/hints";

/** Apple uses this value to filter autocomplete to App Store apps only */
export const HINTS_CLIENT_APPLICATION = "Software";

/**
 * Suffix appended to storefront ID in the X-Apple-Store-Front header.
 * Format: "{storefrontId}-{platformId},{version}"
 * -1 = iPhone/iPad platform, 29 = current store version
 */
export const STOREFRONT_HEADER_SUFFIX = "-1,29";

export const REQUEST_TIMEOUT_MS = 15_000;
export const DEFAULT_SEARCH_LIMIT = 10;
export const MAX_SEARCH_LIMIT = 200;
export const DEFAULT_COUNTRY = "us";
export const DEFAULT_PORT = 8080;

export const RATE_LIMIT_STATUS_CODES = new Set([403, 429]);

export const PROXY_HEADER = "x-proxy";
