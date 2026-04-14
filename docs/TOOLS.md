# Tools

app-store-mcp provides three tools. Together they cover the core ASO research loop: discover keywords, check who ranks for them, and study what the top apps are doing.

---

## get_app_details

**What it does.** Returns the full public profile of an app — everything a user would see on its App Store page, plus some fields only available through the API.

**What you can learn from it.**

- How the app positions itself — title, subtitle, and the first lines of the description shape first impressions and drive conversion.
- Rating health — average rating and total review count show user satisfaction and social proof at a glance.
- Update cadence — version number, release notes, and release date reveal how actively the app is maintained.
- Monetization model — price, in-app purchases flag, and supported devices tell you about the business strategy.
- Visual strategy — screenshot URLs and artwork let you understand how the app sells itself visually.
- Localization choices — querying the same app across different country codes shows which markets the developer prioritizes.

**Typical use.** Start here when analyzing a specific app — either your own or a competitor. Fetch several apps at once by passing comma-separated IDs.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `appId` | yes | One or more App Store IDs, comma-separated |
| `country` | no | Two-letter country code (default: `us`) |

---

## get_search_autocomplete

**What it does.** Returns autocomplete suggestions — the dropdown that appears as users type in the App Store search bar.

**What you can learn from it.**

- Real search demand — Apple surfaces these terms based on actual user search behavior, so they reflect what people are looking for right now.
- Long-tail variations — a single seed term expands into specific phrases that reveal user intent (e.g. "fitness" → "fitness tracker for women", "fitness games for kids").
- Market vocabulary — the language users actually use often differs from what developers assume. Autocomplete shows the user's words, not the marketer's.
- Keyword tree mapping — calling this iteratively (autocomplete a result, then autocomplete each of its results) builds a branching map of the entire search landscape around a topic.

**Typical use.** Use early in keyword research. Start with a broad term related to your app's category, then drill into the suggestions to find specific, less competitive keywords.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `term` | yes | Search query to autocomplete (partial or full) |
| `country` | no | Two-letter country code (default: `us`) |

---

## search_apps

**What it does.** Searches the App Store by keyword and returns the ranked list of results — the same order users see.

**What you can learn from it.**

- Keyword competition — how many strong apps rank for a term, and how high-quality they are (ratings, review counts).
- Ranking position — if your app appears in results, you know your current rank for that keyword. If it doesn't, the keyword needs work.
- Naming patterns — what titles and subtitles the top apps use reveals which keywords Apple's algorithm rewards.
- Category saturation — lots of results with high ratings means a crowded space; fewer results or lower ratings signal opportunity.
- Pricing landscape — whether the top results are free, freemium, or paid tells you about user expectations in that niche.

**Typical use.** After finding promising keywords through autocomplete, search for each to see who you'd be competing against and how strong they are.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `term` | yes | Search keyword or phrase |
| `country` | no | Two-letter country code (default: `us`) |
| `limit` | no | Number of results, 1–200 (default: `10`) |

---

## How the tools work together

The three tools form a research loop:

```
  get_search_autocomplete        search_apps           get_app_details
  ┌─────────────────────┐    ┌──────────────────┐    ┌─────────────────┐
  │ "fitness"            │    │ keyword:          │    │ App #1 deep     │
  │   → fitness tracker  │───►│ "fitness tracker" │───►│ dive: metadata, │
  │   → fitness app      │    │   → App #1        │    │ screenshots,    │
  │   → fitness games    │    │   → App #2        │    │ ratings,        │
  │   → ...              │    │   → App #3        │    │ description     │
  └─────────────────────┘    └──────────────────┘    └─────────────────┘
      discover keywords        check competition        analyze winners
```

1. **Discover** — autocomplete expands a seed term into real keywords.
2. **Compete** — search shows who ranks for each keyword and how strong they are.
3. **Analyze** — app details reveals what the winners do differently.

Repeat across markets by changing the `country` parameter.
