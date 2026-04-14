export interface CliArgs {
  proxies: string[];
}

/**
 * Parse --proxy flags from process.argv.
 * Supports multiple formats:
 *   --proxy http://proxy1:8080 --proxy http://proxy2:3128
 *   --proxy http://proxy1:8080,http://proxy2:3128
 */
export function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const proxies: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--proxy" && i + 1 < args.length) {
      const value = args[i + 1];
      proxies.push(
        ...value.split(",").map((s) => s.trim()).filter(Boolean),
      );
      i++;
    }
  }

  return { proxies };
}
