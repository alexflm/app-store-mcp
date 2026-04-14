import { RateLimitError } from "../api/errors.js";

export interface McpErrorResponse {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
}

export function formatToolError(err: unknown): McpErrorResponse {
  if (err instanceof RateLimitError) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: err.message,
            suggestions: [
              "Too many requests — Apple API rate limit reached",
              "Wait 30–60 seconds before retrying",
              "Add a proxy to avoid rate limits: --proxy http://proxy:8080 (stdio) or ?proxy=http://proxy:8080 (remote)",
              "Multiple proxies rotate requests and multiply your effective rate limit",
            ],
          }),
        },
      ],
      isError: true,
    };
  }

  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          error: message,
          suggestions: [
            "If this keeps happening, the Apple API may be temporarily unavailable — retry in a few seconds",
          ],
        }),
      },
    ],
    isError: true,
  };
}
