# Migrating to v0.0.5

v0.0.5 is a non-breaking release. The public API (`new AnichinScraper(config)`
and all of its methods) is unchanged — you do not need to change any calling
code to upgrade.

## What changed internally

The library was rebuilt from a single ~1900-line `src/Anichin.ts` file into
a micro-architecture:

```
src/
  index.ts            entry point, re-exports AnichinScraper + types
  client/
    Anichin.ts         the public AnichinScraper class (thin, delegates to api/*)
    RequestClient.ts   axios instance creation, proxy setup, interceptors
  network/
    headers.ts          default headers / user-agent rotation
    retry.ts             rate-limit + retry interceptors
  constants/
    config.ts             default base URL, timeouts, retry settings
    version.ts            library version, creator string
  types/                  shared TypeScript interfaces
  utils/
    slug.ts                 slug extraction from URLs (see watch fix below)
    url.ts                  URL resolution helper
    number.ts                episode number formatting/parsing
    date.ts                   countdown/release-time formatting
    response.ts                 ApiResponse builder + error handler
  parser/                 pure functions that turn a loaded Cheerio document
                          into plain data (one file per page type)
  api/                    one file per endpoint; fetches the page and calls
                          the matching parser
```

Each `api/*.ts` function takes a `ScraperContext` (`{ client, baseUrl }`)
instead of relying on `this`, so any of them can be tested or reused in
isolation from the `AnichinScraper` class.

## Behavior fix: `watch()` and completed series

Previously `watch(slug, episode)` always requested:

```
/{slug}-episode-{NN}-subtitle-indonesia/
```

On Anichin, once a series finishes airing its **last** episode's page moves
to a different URL:

```
/{slug}-episode-{NN}-tamat-subtitle-indonesia/
```

Calling `watch()` for that final episode against the old URL pattern
returned a 404. As of v0.0.5, `watch()` requests the regular URL first and,
only if that 404s, automatically retries with the `-tamat-` variant. The
response now also includes `data.watch.is_final_episode: boolean` so you
can tell which pattern was actually served.

No changes are required on your end — the fallback is automatic.
