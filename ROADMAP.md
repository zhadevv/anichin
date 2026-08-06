# Roadmap

This is a small, single-maintainer scraper library. The roadmap is a list
of real, scoped ideas — not a commitment or a timeline.

## Known gaps

- **`series().episode_nav.first_episode` doesn't check for the tamat URL
  pattern.** For a series with exactly one episode (a movie/special) that
  is already complete, the *first* episode is also the *last* one, so its
  real URL would be the `-tamat-` variant — but `parser/series.ts` still
  always builds the non-tamat URL for `first_episode`. `watch()` itself is
  unaffected (it always tries both), but a consumer who follows
  `first_episode.url` directly instead of calling `watch()` could hit a
  404 for that specific case. Fixing this would mean either giving
  `first_episode` the same try/fallback treatment as `watch()`, or making
  it always relative (unresolved) so `watch()` is the required next step
  rather than a raw URL.
- **`quickfilter()` and `sidebar()` don't cache.** Both scrape a full page
  just to read a small `#sidebar`/`.quickfilter` fragment that rarely
  changes between requests. A short-lived in-memory cache (configurable
  TTL) would cut real request volume for consumers that call these often.

## Under consideration

- **WP REST API for watch-URL discovery.** As documented in
  `docs/architecture/request.md`, Anichin's `/wp-json/wp/v2/posts?slug[]=`
  endpoint can check both the regular and `-tamat-` slug in one request
  and return which one (if either) actually exists. This wouldn't replace
  the HTML fetch for the actual watch page (the REST payload's
  `content.rendered` is empty for these post types), but could let
  `watch()` do "one discovery request encompassing both patterns, then one
  content fetch" instead of "try regular, then maybe fall back to tamat" —
  same request count for the common case, but no wasted request body for
  a 404 in the final-episode case. Not implemented because it adds a
  dependency on an endpoint that isn't guaranteed to stay enabled or
  unauthenticated on Anichin's end, and the current approach already keeps
  the common case (an ongoing episode) at one request.
- **Response-level caching option** (`ScraperConfig.cache`), so repeated
  calls for the same URL within a TTL window don't re-request. Would need
  a cache-key strategy that accounts for query params (search, filters).
- **Configurable `validateStatus`.** Currently hardcoded to `status < 500`
  in `RequestClient.ts` because `watch()` depends on seeing a 404 as a
  resolved response rather than a thrown error. Exposing this safely would
  need `watch()`'s reliance on it made explicit/opt-out first.

## Explicitly out of scope

- Authentication / account features — Anichin doesn't require an account
  to read the content this library scrapes.
- Downloading/streaming the actual video content — this library returns
  the server/download *links* Anichin's page exposes; fetching the media
  itself is left to the consumer.
- Respecting `robots.txt` automatically — see `docs/FAQ.md`.
