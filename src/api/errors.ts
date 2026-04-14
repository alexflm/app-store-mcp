export class RateLimitError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
  ) {
    super(`Rate limited by Apple API (HTTP ${status}) on ${endpoint}`);
    this.name = "RateLimitError";
  }
}
