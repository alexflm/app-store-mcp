import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = readFileSync(resolve(__dirname, "..", "..", "docs", "ASO-GUIDE.md"), "utf-8");

export const asoGuideResource = {
  uri: "docs://aso-guide" as const,
  name: "ASO Methodology Guide",
  description:
    "Comprehensive App Store Optimization methodology: keyword strategy, " +
    "localization, research workflows (niche mapping, alphabet crawl, competitor reverse-engineering), " +
    "and best practices. Read this before starting any ASO research.",
  mimeType: "text/markdown" as const,
  async load() {
    return { text: content };
  },
};
