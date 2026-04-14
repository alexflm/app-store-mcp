import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAgent } from "../proxy.js";
import { parseArgs } from "./args.js";
import { RateLimitError } from "./errors.js";

const { proxies: cliProxies } = parseArgs();

const commonConfig = {
  timeout: 15_000,
  headers: {
    "User-Agent": "app-store-mcp/0.1.0",
    "Accept-Encoding": "gzip, deflate, br",
  },
};

export const itunes = axios.create({
  baseURL: "https://itunes.apple.com",
  ...commonConfig,
});

export const searchHints = axios.create({
  baseURL: "https://search.itunes.apple.com",
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
        if (status === 403 || status === 429) {
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
