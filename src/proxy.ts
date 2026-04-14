import { AsyncLocalStorage } from "node:async_hooks";
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";

const AGENT_CACHE_MAX = 50;
const SUPPORTED_SCHEMES = new Set(["http:", "https:", "socks5:"]);

const asyncStore = new AsyncLocalStorage<string[]>();
const directAgent = new https.Agent({ keepAlive: true });
const agentCache = new Map<string, HttpsProxyAgent<string>>();

function getOrCreateAgent(url: string): HttpsProxyAgent<string> {
  let agent = agentCache.get(url);
  if (!agent) {
    if (agentCache.size >= AGENT_CACHE_MAX) {
      const oldest = agentCache.keys().next().value!;
      agentCache.delete(oldest);
    }
    agent = new HttpsProxyAgent(url, { keepAlive: true });
    agentCache.set(url, agent);
  }
  return agent;
}

let roundRobinIndex = 0;

/**
 * Returns the right HTTPS agent for the current request:
 * - Per-request proxies (URL/header) take priority
 * - Falls back to CLI --proxy args
 * - Direct connection if nothing configured
 */
export function getAgent(cliProxies: string[]): https.Agent | HttpsProxyAgent<string> {
  const requestProxies = asyncStore.getStore();
  const proxies = requestProxies && requestProxies.length > 0 ? requestProxies : cliProxies;

  if (proxies.length === 0) return directAgent;

  const url = proxies[roundRobinIndex % proxies.length];
  roundRobinIndex++;
  return getOrCreateAgent(url);
}

/**
 * Run a function with request-scoped proxy configuration.
 */
export function runWithProxies<T>(proxies: string[], fn: () => T): T {
  return asyncStore.run(proxies, fn);
}

/**
 * Parse and validate proxy URLs from a raw string (comma-separated or single value).
 * Rejects URLs with unsupported schemes.
 */
export function parseProxyString(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => {
      try {
        const scheme = new URL(s).protocol;
        return SUPPORTED_SCHEMES.has(scheme);
      } catch {
        return false;
      }
    });
}
