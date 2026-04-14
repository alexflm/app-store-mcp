import { describe, it, expect } from "vitest";
import { parseProxyString } from "./proxy.js";

describe("parseProxyString", () => {
  it("parses a single HTTP proxy", () => {
    expect(parseProxyString("http://proxy:8080")).toEqual(["http://proxy:8080"]);
  });

  it("parses a single HTTPS proxy", () => {
    expect(parseProxyString("https://proxy:3128")).toEqual(["https://proxy:3128"]);
  });

  it("parses a single SOCKS5 proxy", () => {
    expect(parseProxyString("socks5://proxy:1080")).toEqual(["socks5://proxy:1080"]);
  });

  it("parses comma-separated proxies", () => {
    expect(parseProxyString("http://a:8080,https://b:3128")).toEqual([
      "http://a:8080",
      "https://b:3128",
    ]);
  });

  it("trims whitespace around entries", () => {
    expect(parseProxyString("  http://a:8080 , http://b:3128  ")).toEqual([
      "http://a:8080",
      "http://b:3128",
    ]);
  });

  it("rejects unsupported schemes", () => {
    expect(parseProxyString("ftp://proxy:21")).toEqual([]);
  });

  it("rejects invalid URLs", () => {
    expect(parseProxyString("not-a-url")).toEqual([]);
  });

  it("filters out invalid entries from a mixed list", () => {
    expect(parseProxyString("http://good:8080,garbage,https://also-good:3128")).toEqual([
      "http://good:8080",
      "https://also-good:3128",
    ]);
  });

  it("returns empty array for empty string", () => {
    expect(parseProxyString("")).toEqual([]);
  });

  it("handles proxy URLs with auth credentials", () => {
    expect(parseProxyString("http://user:pass@proxy:8080")).toEqual([
      "http://user:pass@proxy:8080",
    ]);
  });
});
