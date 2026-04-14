import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = readFileSync(resolve(__dirname, "..", "..", "docs", "TOOLS.md"), "utf-8");

export const toolsReferenceResource = {
  uri: "docs://tools" as const,
  name: "Tools Reference",
  description:
    "Detailed reference for all three tools (get_app_details, get_search_autocomplete, search_apps): " +
    "what each returns, what you can learn from it, parameters, and how they work together in a research loop.",
  mimeType: "text/markdown" as const,
  async load() {
    return { text: content };
  },
};
