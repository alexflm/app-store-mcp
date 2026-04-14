# app-store-mcp

MCP server that gives AI agents live access to App Store data. Search apps, explore keyword autocomplete, and see what ranks for any keyword — all through public Apple APIs, no keys required.

Use it to research keywords, analyze competitors, and find opportunities for App Store Optimization. The agent discovers what users actually search for, checks who ranks for those terms, and studies what the top apps do differently.

## Tools

| Tool | What it does | What you learn |
|------|-------------|----------------|
| `get_search_autocomplete` | Autocomplete from the App Store search bar | What users actually search for — real demand, long-tail keywords, market vocabulary |
| `search_apps` | Ranked search results for a keyword | Who ranks for a keyword, how tough the competition is, what naming patterns win |
| `get_app_details` | Full metadata for an app by ID | How the app positions itself — title, description, ratings, pricing, screenshots, update history |

The three tools form a research loop: **discover** keywords → **check** competition → **analyze** winners.

## Setup

```bash
pnpm install && pnpm build
```

### Claude Desktop / Claude Code

Add to your MCP config (`claude_desktop_config.json` or `.claude/mcp.json`):

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

### Cursor

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

### Manus / remote clients

Start the server in HTTP mode:

```bash
MCP_TRANSPORT=httpStream PORT=8080 pnpm start
```

Then point your client to:
- `http://your-host:8080/mcp` — HTTP Streaming
- `http://your-host:8080/sse` — SSE (legacy)

## Proxy (optional)

Apple may rate-limit requests from cloud IPs. Proxies help when running the server remotely or doing bulk research. Supports HTTP, HTTPS, and SOCKS5. Multiple proxies rotate round-robin.

Without proxy config, all requests go direct — this works fine for local use.

**CLI flag** — for local stdio mode:

```json
{
  "mcpServers": {
    "app-store": {
      "command": "node",
      "args": ["dist/index.js", "--proxy", "http://proxy1:8080"]
    }
  }
}
```

**URL query param** — for remote clients where you can only set a URL:

```
https://your-server.run.app/mcp?proxy=http://proxy1:8080&proxy=http://proxy2:3128
```

**Header** — for clients that support custom headers:

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

## License

MIT
