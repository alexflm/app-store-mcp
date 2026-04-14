import { itunes } from "./client.js";
import type { LookupResponse } from "./types.js";

export async function searchApps(
  term: string,
  country: string,
  limit: number,
): Promise<LookupResponse> {
  const { data } = await itunes.get<LookupResponse>("/search", {
    params: { term, entity: "software", country, limit },
  });
  return data;
}
