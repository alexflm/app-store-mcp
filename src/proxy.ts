import { AsyncLocalStorage } from "node:async_hooks";
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";

const asyncStore = new AsyncLocalStorage<string[]>();

const directAgent = new https.Agent({ keepAlive: true });

const agentCache = new Map<string, HttpsProxyAgent<string>>();

function getOrCreateAgent(url: string): HttpsProxyAgent<string> {
  let agent = agentCache.get(url);
  if (!agent) {
    agent = new HttpsProxyAgent(url, { keepAlive: true });
    agentCache.set(url, agent);
  }
  return agent;
}

let roundRobinIndex = 0;

/**
 * Returns the right HTTPS agent for the current request:
 * - If running inside a request with proxies set via URL/header → use those (round-robin)
 * - Otherwise fall back to CLI --proxy args
 * - If nothing configured → direct connection
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
 * Parse proxy URLs from a raw string (comma-separated or single value).
 */
export function parseProxyString(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export { directAgent };
