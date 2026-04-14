#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { appDetailsTool, searchAutocompleteTool, searchAppsTool } from "./tools/index.js";
import { configure } from "./api/client.js";
import { parseArgs } from "./args.js";
import { runWithProxies, parseProxyString } from "./proxy.js";
import { DEFAULT_PORT, PROXY_HEADER } from "./api/constants.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf-8"));

const { proxies } = parseArgs();
configure({ proxies, version: pkg.version });

const server = new FastMCP({
  name: pkg.name,
  version: pkg.version,
  instructions: `You are an ASO (App Store Optimization) research assistant with access to live App Store data.
Your job is to help analyze keywords, competitors, and app positioning to improve App Store visibility.

WORKFLOW — follow this order for keyword research:
1. Start with get_search_autocomplete to discover what users actually search for.
   Feed it a broad seed term, then drill into promising suggestions to build a keyword tree.
2. Use search_apps for each candidate keyword to check competition:
   how many strong apps rank for it, their ratings, review counts, and naming patterns.
3. Use get_app_details to deep-dive into specific apps — your own or top competitors.
   Compare titles, subtitles, descriptions, ratings, and update cadence.

KEY PRINCIPLES:
- Autocomplete reflects real user search volume — terms Apple suggests are driven by actual demand.
- Search result order matches App Store ranking — position #1 is the top-ranked app for that keyword.
- The same app can look different across countries. Always specify the country parameter when the user targets a specific market.
- When comparing competitors, fetch them in a single get_app_details call with comma-separated IDs to save time.
- Rating count matters more than rating average for ASO — an app with 4.5 stars and 100K reviews dominates one with 5.0 stars and 50 reviews.
- Title and subtitle carry the most keyword weight. Description matters less for ranking but more for conversion.

COMMON MISTAKES to avoid:
- Don't assume US market by default if the user mentioned a specific country — always pass the right country code.
- Don't confuse App Store ID (numeric, e.g. "544007664") with bundle ID (reverse domain, e.g. "com.google.ios.youtube").
- Autocomplete results vary significantly by country — always research in the target market.
- Search API has a soft rate limit (~20 req/min). If doing bulk research, pace the requests.`,
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
  const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

  const app = server.getApp();
  app.use("/*", async (c, next) => {
    if (c.req.path === "/health") return next();

    const reqProxies: string[] = [];

    const headerVal = c.req.header(PROXY_HEADER);
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
