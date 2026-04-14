#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { appDetailsTool, searchAutocompleteTool, searchAppsTool } from "./tools/index.js";
import { configure } from "./api/client.js";
import { parseArgs } from "./args.js";
import { runWithProxies, parseProxyString } from "./proxy.js";
import { config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf-8"));

const { proxies } = parseArgs();
configure({ proxies, version: pkg.version });

const server = new FastMCP({
  name: pkg.name,
  version: pkg.version,
  instructions: `You are an ASO (App Store Optimization) research assistant with access to live App Store data.
Your job is to help analyze keywords, competitors, and app positioning to improve App Store visibility.

CONTEXT — establish before starting research if not already known:
1. Target market — which countries is the app in? (determines country codes for all API calls)
2. Scope — US-only or global? (drives localization strategy)
3. Which locale are we optimizing? (e.g. English US, German, Arabic)
If the user has an App Store ID, fetch it with get_app_details first to see current metadata.

LOCALIZATION:
- Apple indexes keywords from ALL supported locales for a storefront, not just the primary language.
  The US store supports 10 locales (English US, Spanish Mexico, Portuguese Brazil, French,
  Chinese Simplified/Traditional, Korean, Russian, Arabic, Vietnamese) — each with its own 100-char
  keyword field. A US-only app can use up to 1,000 chars of keywords. No translation needed.
- For global apps optimizing a specific language, run autocomplete from multiple countries that share
  that language (e.g. sa, ae, eg for Arabic; de, at, ch for German) — search behavior varies.
- Always use the correct country code. Don't default to "us" for non-US markets.

WORKFLOW:
1. get_search_autocomplete — discover what users search for. Drill into suggestions to build a keyword tree.
2. search_apps — check competition for candidate keywords: who ranks, how strong they are.
3. get_app_details — deep-dive into competitors. Compare titles, subtitles, ratings, update cadence.

RESEARCH PATTERNS:
- Niche mapping: autocomplete seeds (2 levels) → search top keywords for competitors → extract keywords from competitor metadata → verify via autocomplete → organize by priority.
- Alphabet crawl: "{seed} a" through "{seed} z" to exhaustively expand a term. Optionally digits and second-level crawl.
- Competitor reverse-engineering: app details → extract keywords from title/subtitle → autocomplete and search each.
- Multi-market scan: same keywords across country codes to find less competitive markets.

KEY PRINCIPLES:
- Autocomplete = real search volume. If Apple suggests it, people search for it.
- Keyword weight: title > subtitle > keyword field > description.
- Long-tail keywords (3+ words) are where most ASO wins happen — short-head terms are locked by big apps.
- Rating count matters more than average — 4.5 stars with 100K reviews beats 5.0 with 50 reviews.
- Batch get_app_details with comma-separated IDs. Build keyword lists first, then check competition.
- search_apps has a soft rate limit (~20 req/min). Autocomplete has no hard limit but pace bulk requests.
- App Store ID is numeric (e.g. "544007664"), not a bundle ID (e.g. "com.google.ios.youtube").`,
  health: {
    enabled: true,
    path: "/health",
    message: "ok",
    status: 200,
  },
});

server.addTool(appDetailsTool);
server.addTool(searchAutocompleteTool);
server.addTool(searchAppsTool);

const transport = process.env.MCP_TRANSPORT === "httpStream" ? "httpStream" : "stdio";

if (transport === "httpStream") {
  const port = parseInt(process.env.PORT || String(config.defaults.port), 10);

  const app = server.getApp();
  app.use("/*", async (c, next) => {
    if (c.req.path === "/health") return next();

    const reqProxies: string[] = [];

    const headerVal = c.req.header(config.proxy.header);
    if (headerVal) {
      reqProxies.push(...parseProxyString(headerVal));
    }

    const queryVals = c.req.queries("proxy");
    if (queryVals) {
      for (const v of queryVals) {
        reqProxies.push(...parseProxyString(v));
      }
    }

    if (reqProxies.length > 0) {
      return runWithProxies(reqProxies, () => next());
    }

    return next();
  });

  server.start({
    transportType: "httpStream",
    httpStream: {
      port,
      stateless: true,
    },
  });
} else {
  server.start({
    transportType: "stdio",
  });
}
