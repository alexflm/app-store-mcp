import { describe, it, expect } from "vitest";
import { asoGuideResource } from "./aso-guide.js";
import { toolsReferenceResource } from "./tools-reference.js";
import { storefrontsResource } from "./storefronts-list.js";
import { storefrontTemplate } from "./storefront-template.js";

describe("asoGuideResource", () => {
  it("has correct URI and mime type", () => {
    expect(asoGuideResource.uri).toBe("docs://aso-guide");
    expect(asoGuideResource.mimeType).toBe("text/markdown");
  });

  it("loads markdown content from docs/ASO-GUIDE.md", async () => {
    const result = await asoGuideResource.load();
    expect(result.text).toContain("# ASO Guide");
    expect(result.text).toContain("Keyword weight hierarchy");
  });
});

describe("toolsReferenceResource", () => {
  it("has correct URI and mime type", () => {
    expect(toolsReferenceResource.uri).toBe("docs://tools");
    expect(toolsReferenceResource.mimeType).toBe("text/markdown");
  });

  it("loads markdown content from docs/TOOLS.md", async () => {
    const result = await toolsReferenceResource.load();
    expect(result.text).toContain("# Tools");
    expect(result.text).toContain("get_app_details");
    expect(result.text).toContain("get_search_autocomplete");
    expect(result.text).toContain("search_apps");
  });
});

describe("storefrontsResource", () => {
  it("has correct URI and mime type", () => {
    expect(storefrontsResource.uri).toBe("data://storefronts");
    expect(storefrontsResource.mimeType).toBe("application/json");
  });

  it("loads valid JSON with all storefronts", async () => {
    const result = await storefrontsResource.load();
    const data = JSON.parse(result.text);

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(100);

    const us = data.find((s: { country: string }) => s.country === "us");
    expect(us).toEqual({ country: "us", storefrontId: "143441" });
  });

  it("returns entries sorted by country code", async () => {
    const result = await storefrontsResource.load();
    const data = JSON.parse(result.text);
    const codes = data.map((s: { country: string }) => s.country);
    expect(codes).toEqual([...codes].sort());
  });
});

describe("storefrontTemplate", () => {
  it("has correct URI template", () => {
    expect(storefrontTemplate.uriTemplate).toBe("data://storefront/{country}");
  });

  it("loads storefront info for a valid country", async () => {
    const result = await storefrontTemplate.load({ country: "us" });
    const data = JSON.parse(result.text);
    expect(data.country).toBe("us");
    expect(data.storefrontId).toBe("143441");
    expect(data.storefrontHeader).toBe("143441-1,29");
  });

  it("is case-insensitive", async () => {
    const result = await storefrontTemplate.load({ country: "US" });
    const data = JSON.parse(result.text);
    expect(data.country).toBe("us");
  });

  it("throws for an invalid country code", async () => {
    await expect(storefrontTemplate.load({ country: "xx" })).rejects.toThrow(
      'Unknown country code: "xx"',
    );
  });

  it("provides autocomplete for country codes", async () => {
    const arg = storefrontTemplate.arguments[0];
    const result = await arg.complete("u");
    expect(result.values).toContain("us");
    expect(result.values).toContain("ua");
    expect(result.values).toContain("ug");
  });

  it("autocomplete returns empty for no match", async () => {
    const arg = storefrontTemplate.arguments[0];
    const result = await arg.complete("zz");
    expect(result.values).toEqual([]);
  });
});
