export interface LookupResponse {
  resultCount: number;
  results: AppDetails[];
}

export interface AppDetails {
  trackId: number;
  trackName: string;
  bundleId: string;
  artistName: string;
  description: string;
  price: number;
  version: string;
  averageUserRating: number;
  userRatingCount: number;
  primaryGenreName: string;
  artworkUrl512: string;
  screenshotUrls: string[];
  releaseNotes?: string;
  fileSizeBytes: string;
  minimumOsVersion: string;
  [key: string]: unknown;
}
