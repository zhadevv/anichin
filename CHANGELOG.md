# Changelog
---

### v0.0.5
- Fixed
  - async watch: Added support for completed/finished series
    - Anichin serves a series' final episode at a different URL pattern:
      `/{slug}-episode-{NN}-tamat-subtitle-indonesia/` instead of the regular
      `/{slug}-episode-{NN}-subtitle-indonesia/`
    - `watch()` now requests the regular URL first and automatically falls
      back to the `-tamat-` URL when the regular one 404s, instead of always
      assuming the series is still ongoing
    - Added `is_final_episode` field to the watch response so consumers can
      tell which URL pattern was actually used
    - Fixed `extractSlug` to correctly strip the `-tamat-` segment when
      resolving a slug from a completed-episode URL (previously left the
      episode suffix in the slug for these URLs)
- Changed
  - Rebuilt the entire `src/` layout from a single 1900+ line `Anichin.ts`
    file into a micro-architecture split across `client/`, `api/`,
    `parser/`, `network/`, `constants/`, `types/`, and `utils/`. Public
    behavior and the exported `AnichinScraper` API are unchanged; this is a
    maintainability refactor, not a breaking change
  - `@typescript-eslint/*` moved from `dependencies` to `devDependencies`
    (they were lint tooling, not runtime dependencies)
- Added
  - `@types/node` as a devDependency (several modules now use `require`
    for the browser/Node interop check)
- Notes
  - No behavior changes to any method other than `watch()`
  - All existing features remain backward compatible

### v.0.0.4
- Fixed
  - async sidebar: Fixed `ongoing_series` and `seasons` returning empty arrays
    - Fixed selector for ongoing series to correctly locate `.ongoingseries` container
    - Fixed seasons parsing to use `.mseason ul.season` selector
  - async home: Fixed `latest_releases`
    - corrected selector to use `.releases.latesthome .listupd.normal`
    - Ensures latest episodes are properly parsed
  - async series: Fixed `episode_nav` formatting
    - `first_episode.name:` Changed from "First EpisodeEpisode XX" to "Episode XX"
    - `first_episode.url:` Now generates proper URL format, from `https://anichin.cafe/#` to `https://anichin.cafe/{slug}-episode-{number}-subtitle-indonesia`
    - Episode numbers now properly formatted with leading zeros when needed
  - async watch: Fixed server parsing and indexing
    - `servers[]:` Now starts indexing from `server_id: "0"` (first server)
    - Added fallback to default iframe when no server select present
    - Improved server name extraction from option text
- Removed
  - async season: Parameter removed
    - From `season(slug, page)` to `season(slug)`
    - Why? because the season page does not have a pagination
- Notes
  - No dependency changes
  - All existing features remaining backward compatible

### v0.0.3
- Fixed schedule method countdown and release time format
- Revised advanced search image mode URL parameters 
- Watch episode format (episode 1 = 01)
- Base64 decoding for server URLs

### v0.0.2
- Fixed watch method parsing
- Added improved error handling
- Enhanced proxy support
- Better typescript definitions

### v0.0.1
- Initial release
- Basic scraping functionality
