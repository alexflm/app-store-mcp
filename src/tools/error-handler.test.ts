import { describe, it, expect } from "vitest";
import { formatToolError } from "./error-handler.js";
import { RateLimitError } from "../api/errors.js";

describe("formatToolError", () => {
  it("formats a RateLimitError with suggestions", () => {
    const err = new RateLimitError(429, "/search");
    const result = formatToolError(err);

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toContain("429");
    expect(parsed.error).toContain("/search");
    expect(parsed.suggestions).toContain("Too many requests — Apple API rate limit reached");
  });

  it("formats a 403 RateLimitError", () => {
    const err = new RateLimitError(403, "/lookup");
    const result = formatToolError(err);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toContain("403");
  });

  it("formats a generic Error", () => {
    const err = new Error("Something went wrong");
    const result = formatToolError(err);

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("Something went wrong");
    expect(parsed.suggestions).toHaveLength(1);
  });

  it("formats a non-Error value", () => {
    const result = formatToolError("string error");

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("string error");
  });

  it("formats undefined", () => {
    const result = formatToolError(undefined);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBe("undefined");
  });
});
