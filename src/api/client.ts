import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAgent } from "../proxy.js";
import { RateLimitError } from "./errors.js";
import { config as appConfig } from "../config.js";

let cliProxies: string[] = [];

const commonConfig = {
  timeout: appConfig.defaults.requestTimeoutMs,
  headers: {
    "Accept-Encoding": "gzip, deflate, br",
  },
};

export const itunes = axios.create({
  baseURL: appConfig.apple.itunesBaseUrl,
  ...commonConfig,
});

export const searchHints = axios.create({
  baseURL: appConfig.apple.searchHintsBaseUrl,
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
        if (appConfig.apple.rateLimitStatusCodes.has(status)) {
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
