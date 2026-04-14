import { searchHints } from "./client.js";
import { STOREFRONTS } from "../storefronts.js";

export function getStorefrontId(country: string): string {
  const id = STOREFRONTS[country.toLowerCase()];
  if (!id) {
    throw new Error(
      `Unknown country code: "${country}". Supported: ${Object.keys(STOREFRONTS).join(", ")}`,
    );
  }
  return id;
}

export async function getAutocomplete(
  term: string,
  country: string,
): Promise<string[]> {
  const storefrontId = getStorefrontId(country);

  const { data } = await searchHints.get<string>(
    "/WebObjects/MZSearchHints.woa/wa/hints",
    {
      params: { clientApplication: "Software", term },
      headers: { "X-Apple-Store-Front": `${storefrontId}-1,29` },
      responseType: "text",
    },
  );

  return parseHintsXml(data);
}

/**
 * Parse the XML plist from MZSearchHints into a list of term strings.
 *
 * Response structure:
 * <plist><dict><key>hints</key><array>
 *   <dict><key>term</key><string>...</string>...</dict>
 * </array></dict></plist>
 */
function parseHintsXml(xml: string): string[] {
  const terms: string[] = [];
  const re = /<key>term<\/key>\s*<string>([^<]+)<\/string>/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(xml)) !== null) {
    terms.push(match[1]);
  }

  return terms;
}
