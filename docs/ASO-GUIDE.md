# ASO Guide

Reference for AI agents performing App Store Optimization research with this MCP server. Covers methodology, keyword strategy, and research patterns.

## Context to Establish First

Before starting research, it helps to know:

1. **Target market** — which countries is the app available in? This determines which country codes to use in every API call.
2. **Scope** — US-only or global? Drives completely different keyword strategies (see Localization below).
3. **Current state** — if the user has an App Store ID, fetch it with `get_app_details` to see existing metadata before suggesting changes.

## Core ASO Concepts

**Autocomplete = demand signal.** `get_search_autocomplete` returns terms Apple actively suggests to users. These are driven by real search volume — if Apple suggests it, people search for it. This is the strongest public signal for keyword demand.

**Keyword weight hierarchy:**
1. Title — strongest ranking signal (30 chars)
2. Subtitle — second strongest (30 chars)
3. Keyword field — 100 chars per locale, not visible via API but affects ranking
4. Description — minimal ranking impact, but drives conversion

**Short-head vs. long-tail:**
- Short-head ("calculator") — high volume, extreme competition, low conversion
- Long-tail ("scientific calculator for students") — lower volume, less competition, higher conversion
- Most ASO wins come from long-tail terms that established apps don't specifically target

**Competition signals** from `search_apps`:
- Top 10 apps mostly have >10K reviews → very competitive keyword
- Top 10 apps mostly have <1K reviews → opportunity
- Your app not in top 50 → you effectively don't rank for that keyword

## Localization Strategy

### US storefront cross-locale indexing

Apple indexes keywords from all supported locales for a storefront, not just the primary language. The US storefront supports 10 locales ([source](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/)): English (US), Spanish (Mexico), Portuguese (Brazil), French, Chinese (Simplified), Chinese (Traditional), Korean, Russian, Arabic, Vietnamese.

Each locale has its own 100-char keyword field. For a US-only app, this means up to 1,000 characters of keyword capacity. Keywords in secondary locale fields don't need translation — English keywords in the Spanish (Mexico) field still get indexed for US English search. No duplication across locales — Apple deduplicates automatically.

This applies to any single-market app — check Apple's localization table for the supported locales of the target storefront.

### Multi-country locale research

For global apps optimizing a specific language, search behavior varies across countries that share that language. Running autocomplete from multiple countries produces a more complete keyword picture.

Major markets by language:

| Language | Key markets |
|----------|------------|
| Arabic | `sa`, `ae`, `eg`, `kw`, `qa`, `jo` |
| German | `de`, `at`, `ch` |
| French | `fr`, `ca`, `be`, `ch` |
| Spanish | `es` (Spain locale), `mx`, `ar`, `co`, `cl` (Mexico locale) |
| Portuguese | `br` (Brazil locale), `pt` (Portugal locale) |
| Chinese (Simplified) | `cn`, `sg` |
| Chinese (Traditional) | `tw`, `hk` |
| Japanese | `jp` |
| Korean | `kr` |
| Russian | `ru` |

Keywords that appear in autocomplete across multiple countries for the same language indicate strongest demand. Terms unique to one country may reflect local-specific behavior.

For non-English markets, use local-language keywords — "calculator" won't autocomplete in Japan, but "電卓" will.

## Research Workflows

### Niche keyword collection

Build a keyword list from scratch for a niche.

1. Get seed keywords from the user (app name, category, or terms they already target).
2. `get_search_autocomplete` for each seed → collect suggestions.
3. Autocomplete the most relevant suggestions (second level) → expand the list.
4. `search_apps` for the top 3-5 keywords → identify competitors that rank repeatedly.
5. `get_app_details` for top competitors (batch with comma-separated IDs) → extract keywords from titles and subtitles.
6. Autocomplete any new terms found in competitor metadata → verify they have search volume.
7. Organize results by priority:
   - **High** — in autocomplete AND in competitor titles/subtitles
   - **Medium** — in autocomplete OR in competitor metadata, not both
   - **Explore** — found in descriptions or deep autocomplete, needs more data

### Deep keyword expansion (alphabet crawl)

Exhaustively map the keyword space around a term.

Append each letter a-z to the seed: `"{seed} a"`, `"{seed} b"`, ... `"{seed} z"`. This forces Apple to surface suggestions for every possible continuation that the base term alone wouldn't reveal. Optionally extend to digits or do a second-level crawl on the richest results.

After collecting and deduplicating, filter for relevance (many results will be noise) and check competition on the best candidates with `search_apps`.

The autocomplete endpoint has no hard rate limit. The search endpoint has a soft limit (~20 req/min) — be selective when checking competition.

### Competitor deep dive

Reverse-engineer a competitor's keyword strategy.

1. Find the app — `search_apps` by name if the user doesn't have the ID.
2. `get_app_details` — extract keywords from title, subtitle, and description opening.
3. `get_search_autocomplete` for each extracted keyword → discover related terms.
4. `search_apps` for key terms → see where the competitor ranks and who else competes.

Key fields to analyze: `trackName` (title keywords), `averageUserRating` + `userRatingCount` (rating health), `currentVersionReleaseDate` (update freshness), `primaryGenreName` (category), `languageCodesISO2A` (localization scope).

### Multi-market comparison

Compare keyword demand and competition across countries.

Run the same keywords through `get_search_autocomplete` and `search_apps` with different country codes. A keyword highly competitive in `us` might be wide open in `de` or `jp`. This helps prioritize which markets to target or find opportunities.

## Tips

- `get_app_details` accepts comma-separated IDs — always batch multiple lookups.
- Build the full keyword list first, then check competition. Don't interleave autocomplete and search calls.
- Autocomplete modifiers ("free", "for kids", "offline", "no ads") reveal what users care about.
- Suggestions containing brand names ("calculator like casio") indicate branded search — harder to rank for.
- Present intermediate results before deep dives — the user may want to steer the research direction.
- A good keyword target: appears in autocomplete, relevant to the app, achievable competition, fits naturally in title or subtitle.
