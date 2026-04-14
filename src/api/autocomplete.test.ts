import { describe, it, expect } from "vitest";
import { getStorefrontId, parseHintsXml, decodeXmlEntities } from "./autocomplete.js";

describe("getStorefrontId", () => {
  it("returns storefront ID for a known country", () => {
    expect(getStorefrontId("us")).toBe("143441");
  });

  it("is case-insensitive", () => {
    expect(getStorefrontId("US")).toBe("143441");
    expect(getStorefrontId("Gb")).toBe("143444");
  });

  it("throws for an unknown country code", () => {
    expect(() => getStorefrontId("xx")).toThrow('Unknown country code: "xx"');
  });

  it("returns correct IDs for major markets", () => {
    expect(getStorefrontId("jp")).toBe("143462");
    expect(getStorefrontId("de")).toBe("143443");
    expect(getStorefrontId("ru")).toBe("143469");
    expect(getStorefrontId("cn")).toBe("143465");
  });
});

describe("decodeXmlEntities", () => {
  it("decodes standard XML entities", () => {
    expect(decodeXmlEntities("&amp;&lt;&gt;&apos;&quot;")).toBe('&<>\'\"');
  });

  it("decodes decimal character references", () => {
    expect(decodeXmlEntities("&#72;&#101;&#108;&#108;&#111;")).toBe("Hello");
  });

  it("decodes hex character references", () => {
    expect(decodeXmlEntities("&#x48;&#x65;&#x6C;&#x6C;&#x6F;")).toBe("Hello");
  });

  it("passes through plain text unchanged", () => {
    expect(decodeXmlEntities("fitness tracker")).toBe("fitness tracker");
  });

  it("handles mixed entities and text", () => {
    expect(decodeXmlEntities("rock &amp; roll")).toBe("rock & roll");
  });
});

describe("parseHintsXml", () => {
  it("extracts terms from Apple hints XML", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>hints</key><array>
<dict><key>term</key><string>fitness tracker</string></dict>
<dict><key>term</key><string>fitness app</string></dict>
</array></dict></plist>`;

    expect(parseHintsXml(xml)).toEqual(["fitness tracker", "fitness app"]);
  });

  it("returns empty array for XML with no terms", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><plist><dict></dict></plist>`;
    expect(parseHintsXml(xml)).toEqual([]);
  });

  it("decodes XML entities in terms", () => {
    const xml = `<dict><key>term</key><string>rock &amp; roll</string></dict>`;
    expect(parseHintsXml(xml)).toEqual(["rock & roll"]);
  });

  it("handles whitespace between key and string tags", () => {
    const xml = `<key>term</key>
    <string>spaced term</string>`;
    expect(parseHintsXml(xml)).toEqual(["spaced term"]);
  });
});
