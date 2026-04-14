import { describe, it, expect } from "vitest";
import { keywordResearchPrompt } from "./keyword-research.js";
import { competitorAnalysisPrompt } from "./competitor-analysis.js";
import { alphabetCrawlPrompt } from "./alphabet-crawl.js";
import { multiMarketScanPrompt } from "./multi-market-scan.js";

describe("keywordResearchPrompt", () => {
  it("has required metadata", () => {
    expect(keywordResearchPrompt.name).toBe("keyword-research");
    expect(keywordResearchPrompt.description).toBeTruthy();
    expect(keywordResearchPrompt.arguments.length).toBe(3);
  });

  it("generates standard-depth prompt by default", async () => {
    const result = await keywordResearchPrompt.load({ seed: "fitness" });
    expect(result).toContain("fitness");
    expect(result).toContain("standard");
    expect(result).toContain("us");
  });

  it("respects country parameter", async () => {
    const result = await keywordResearchPrompt.load({ seed: "fitness", country: "de" });
    expect(result).toContain("de");
  });

  it("generates quick-depth prompt", async () => {
    const result = await keywordResearchPrompt.load({ seed: "calc", depth: "quick" });
    expect(result).toContain("quick");
    expect(result).not.toContain("second level");
  });

  it("generates deep-depth prompt with alphabet crawl mention", async () => {
    const result = await keywordResearchPrompt.load({ seed: "calc", depth: "deep" });
    expect(result).toContain("deep");
    expect(result).toContain("alphabet crawl");
  });
});

describe("competitorAnalysisPrompt", () => {
  it("has required metadata", () => {
    expect(competitorAnalysisPrompt.name).toBe("competitor-analysis");
    expect(competitorAnalysisPrompt.arguments.length).toBe(2);
  });

  it("generates prompt for a named competitor", async () => {
    const result = await competitorAnalysisPrompt.load({ competitor: "Spotify" });
    expect(result).toContain("Spotify");
    expect(result).toContain('search_apps for "Spotify"');
  });

  it("detects numeric App Store ID and uses get_app_details", async () => {
    const result = await competitorAnalysisPrompt.load({ competitor: "544007664" });
    expect(result).toContain("get_app_details for ID 544007664");
  });
});

describe("alphabetCrawlPrompt", () => {
  it("has required metadata", () => {
    expect(alphabetCrawlPrompt.name).toBe("alphabet-crawl");
    expect(alphabetCrawlPrompt.arguments.length).toBe(3);
  });

  it("generates 26 letter queries by default", async () => {
    const result = await alphabetCrawlPrompt.load({ term: "photo" });
    expect(result).toContain('"photo a"');
    expect(result).toContain('"photo z"');
    expect(result).not.toContain('"photo 0"');
  });

  it("includes digits when requested", async () => {
    const result = await alphabetCrawlPrompt.load({ term: "photo", include_digits: "true" });
    expect(result).toContain('"photo 0"');
    expect(result).toContain('"photo 9"');
  });
});

describe("multiMarketScanPrompt", () => {
  it("has required metadata", () => {
    expect(multiMarketScanPrompt.name).toBe("multi-market-scan");
    expect(multiMarketScanPrompt.arguments.length).toBe(2);
  });

  it("uses default markets when none specified", async () => {
    const result = await multiMarketScanPrompt.load({ keywords: "fitness,gym" });
    expect(result).toContain("us");
    expect(result).toContain("gb");
    expect(result).toContain("de");
    expect(result).toContain("jp");
  });

  it("uses custom markets when specified", async () => {
    const result = await multiMarketScanPrompt.load({
      keywords: "fitness",
      countries: "ru,ua,kz",
    });
    expect(result).toContain("ru");
    expect(result).toContain("ua");
    expect(result).toContain("kz");
    expect(result).not.toContain("us,");
  });

  it("splits and includes all keywords", async () => {
    const result = await multiMarketScanPrompt.load({ keywords: "calculator,math,algebra" });
    expect(result).toContain("calculator");
    expect(result).toContain("math");
    expect(result).toContain("algebra");
  });
});
