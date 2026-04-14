import { itunes } from "./client.js";
import type { LookupResponse } from "./types.js";

export async function lookupApps(
  appId: string,
  country: string,
): Promise<LookupResponse> {
  const { data } = await itunes.get<LookupResponse>("/lookup", {
    params: { id: appId, country },
  });
  return data;
}
