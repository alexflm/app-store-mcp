import { describe, it, expect } from "vitest";
import { appDetailsTool } from "./app-details.js";
import { searchAutocompleteTool } from "./search-autocomplete.js";
import { searchAppsTool } from "./search-apps.js";

describe("appDetailsTool schema", () => {
  const schema = appDetailsTool.parameters;

  it("accepts a single numeric ID", () => {
    expect(schema.parse({ appId: "544007664" })).toMatchObject({ appId: "544007664" });
  });

  it("accepts comma-separated IDs", () => {
    expect(schema.parse({ appId: "544007664,389801252" })).toMatchObject({
      appId: "544007664,389801252",
    });
  });

  it("rejects non-numeric IDs", () => {
    expect(() => schema.parse({ appId: "com.google.ios.youtube" })).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => schema.parse({ appId: "" })).toThrow();
  });

  it("rejects trailing comma", () => {
    expect(() => schema.parse({ appId: "544007664," })).toThrow();
  });

  it("defaults country to us", () => {
    const result = schema.parse({ appId: "544007664" });
    expect(result.country).toBe("us");
  });

  it("rejects country code that is not 2 chars", () => {
    expect(() => schema.parse({ appId: "544007664", country: "usa" })).toThrow();
  });

  it("has correct annotations", () => {
    expect(appDetailsTool.annotations.readOnlyHint).toBe(true);
    expect(appDetailsTool.annotations.destructiveHint).toBe(false);
  });
});

describe("searchAutocompleteTool schema", () => {
  const schema = searchAutocompleteTool.parameters;

  it("accepts a valid term", () => {
    expect(schema.parse({ term: "fitness" })).toMatchObject({ term: "fitness" });
  });

  it("rejects empty term", () => {
    expect(() => schema.parse({ term: "" })).toThrow();
  });

  it("defaults country to us", () => {
    expect(schema.parse({ term: "test" }).country).toBe("us");
  });
});

describe("searchAppsTool schema", () => {
  const schema = searchAppsTool.parameters;

  it("accepts valid params with defaults", () => {
    const result = schema.parse({ term: "calculator" });
    expect(result.term).toBe("calculator");
    expect(result.country).toBe("us");
    expect(result.limit).toBe(10);
  });

  it("accepts custom limit", () => {
    expect(schema.parse({ term: "test", limit: 50 }).limit).toBe(50);
  });

  it("rejects limit above 200", () => {
    expect(() => schema.parse({ term: "test", limit: 201 })).toThrow();
  });

  it("rejects limit below 1", () => {
    expect(() => schema.parse({ term: "test", limit: 0 })).toThrow();
  });

  it("rejects non-integer limit", () => {
    expect(() => schema.parse({ term: "test", limit: 5.5 })).toThrow();
  });
});
