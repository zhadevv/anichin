# Changelog
---

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
