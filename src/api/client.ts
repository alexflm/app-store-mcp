import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAgent } from "../proxy.js";
import { RateLimitError } from "./errors.js";
import {
  ITUNES_BASE_URL,
  SEARCH_HINTS_BASE_URL,
  REQUEST_TIMEOUT_MS,
  RATE_LIMIT_STATUS_CODES,
} from "./constants.js";

let cliProxies: string[] = [];

const commonConfig = {
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Accept-Encoding": "gzip, deflate, br",
  },
};

export const itunes = axios.create({
  baseURL: ITUNES_BASE_URL,
  ...commonConfig,
});

export const searchHints = axios.create({
  baseURL: SEARCH_HINTS_BASE_URL,
  ...commonConfig,
});

function attachInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.httpsAgent = getAgent(cliProxies);
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (RATE_LIMIT_STATUS_CODES.has(status)) {
          const endpoint = error.config?.url ?? "unknown";
          throw new RateLimitError(status, endpoint);
        }
      }
      throw error;
    },
  );
}

attachInterceptors(itunes);
attachInterceptors(searchHints);

/**
 * Configure the HTTP clients with runtime settings.
 * Call once from the entry point before handling any requests.
 */
export function configure(opts: { proxies: string[]; version: string }): void {
  cliProxies = opts.proxies;
  const ua = `app-store-mcp/${opts.version}`;
  itunes.defaults.headers.common["User-Agent"] = ua;
  searchHints.defaults.headers.common["User-Agent"] = ua;
}
