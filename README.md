# app-store-mcp

MCP server for App Store Optimization. Gives AI agents access to App Store search data — look up any app, explore keyword autocomplete, and see what ranks for a given keyword.

No API keys required — all endpoints are public Apple APIs.

## Tools

| Tool | What it does | What you learn |
|------|-------------|----------------|
| `get_app_details` | Full metadata for an app by ID | How the app positions itself — title, description, ratings, pricing, screenshots, update history |
| `get_search_autocomplete` | Autocomplete from the App Store search bar | What users actually search for — real demand, long-tail keywords, market vocabulary |
| `search_apps` | Ranked search results for a keyword | Who ranks for a keyword, how tough the competition is, what naming patterns win |

The three tools form a research loop: **discover** keywords → **check** competition → **analyze** winners. See [docs/TOOLS.md](docs/TOOLS.md) for detailed value description of each tool.

## API Reference

| Tool | Apple Endpoint | Auth | Rate Limit |
|------|---------------|------|------------|
| `get_search_autocomplete` | `MZSearchHints.woa/wa/hints` + header `X-Apple-Store-Front` | None | None |
| `search_apps` | `itunes.apple.com/search?entity=software` | None | Soft (~20 req/min) |
| `get_app_details` | `itunes.apple.com/lookup?id=` | None | Soft (~20 req/min) |

## Setup

```bash
npm install
npm run build
```

### Local (stdio) — for Cursor, Claude Code, etc.

```bash
npm start
```

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "app-store": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/app-store-mcp"
    }
  }
}
```

### Remote (HTTP Streaming + SSE) — for GCP, Cloud Run, etc.

```bash
MCP_TRANSPORT=httpStream PORT=8080 npm start
```

Exposes:
- `http://localhost:8080/mcp` — HTTP Streaming
- `http://localhost:8080/sse` — SSE (legacy)

### Proxy Support

Route Apple API requests through one or more proxies (HTTP, HTTPS, SOCKS5). Multiple proxies rotate round-robin. Without proxy config, requests go direct.

Three ways to configure depending on your setup:

**URL query params** — for Claude.ai and other remote clients where you can only set a URL:

```
https://your-server.run.app/mcp?proxy=http://proxy1:8080&proxy=http://proxy2:3128
```

**Header** — for Cursor and clients that support custom headers:

```json
{
  "mcpServers": {
    "app-store": {
      "url": "https://your-server.run.app/mcp",
      "headers": {
        "X-Proxy": "http://proxy1:8080,http://proxy2:3128"
      }
    }
  }
}
```

**CLI `--proxy`** — for local stdio mode (Cursor, Claude Code):

```json
{
  "mcpServers": {
    "app-store": {
      "command": "node",
      "args": ["dist/index.js", "--proxy", "http://proxy1:8080", "--proxy", "http://proxy2:3128"]
    }
  }
}
```

### Development

```bash
# Interactive CLI testing
npm run dev

# MCP Inspector (web UI)
npm run inspect
```

## Tech Stack

- **TypeScript**
- **[FastMCP](https://github.com/punkpeye/fastmcp)** — MCP server framework
- **[axios](https://github.com/axios/axios)** — HTTP client with keep-alive and compression
- **zod** — input validation

## Project Structure

```
src/
├── index.ts              # Entry point — server setup and transport
├── storefronts.ts        # Country code → Apple storefront ID mapping
├── api/
│   ├── client.ts         # Axios instances (keep-alive, gzip, timeouts)
│   ├── types.ts          # Response types
│   ├── lookup.ts         # App lookup by ID
│   ├── search.ts         # Keyword search
│   ├── autocomplete.ts   # Search autocomplete + XML parsing
│   └── index.ts          # Re-exports
└── tools/
    ├── app-details.ts    # get_app_details
    ├── search-autocomplete.ts  # get_search_autocomplete
    ├── search-apps.ts    # search_apps
    └── index.ts          # Re-exports
docs/
└── TOOLS.md              # Detailed tool documentation
```

## Example Workflows

### Keyword Research

> "Find what keywords 'Notion' ranks for and suggest alternatives"

1. `get_app_details` for Notion — grab title, subtitle, description
2. `get_search_autocomplete` for key terms from the metadata
3. `search_apps` for each autocomplete result — see competition and positioning

### Competitor Analysis

> "Compare my app with top 5 competitors for the keyword 'habit tracker'"

1. `search_apps` for "habit tracker" — get top results
2. `get_app_details` for each competitor — full metadata
3. Analyze titles, subtitles, descriptions, ratings, review counts

### Autocomplete Exploration

> "What keywords related to 'fitness' have the most autocomplete suggestions?"

1. `get_search_autocomplete` for "fitness"
2. `get_search_autocomplete` for each returned term (drill down)
3. Build a keyword tree with branching popularity

## License

MIT
