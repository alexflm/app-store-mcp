import { searchHints } from "./client.js";
import { STOREFRONTS } from "../storefronts.js";
import { config } from "../config.js";

export function getStorefrontId(country: string): string {
  const id = STOREFRONTS[country.toLowerCase()];
  if (!id) {
    throw new Error(
      `Unknown country code: "${country}". Use a valid ISO 3166-1 alpha-2 code (e.g. us, gb, jp, de, ru).`,
    );
  }
  return id;
}

export async function getAutocomplete(
  term: string,
  country: string,
): Promise<string[]> {
  const storefrontId = getStorefrontId(country);

  const { data } = await searchHints.get<string>(config.apple.searchHintsPath, {
    params: { clientApplication: config.apple.hintsClientApplication, term },
    headers: { "X-Apple-Store-Front": `${storefrontId}${config.apple.storefrontHeaderSuffix}` },
    responseType: "text",
  });

  return parseHintsXml(data);
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function parseHintsXml(xml: string): string[] {
  const terms: string[] = [];
  const re = /<key>term<\/key>\s*<string>([^<]+)<\/string>/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(xml)) !== null) {
    terms.push(decodeXmlEntities(match[1]));
  }

  return terms;
}
