# Project Architecture

As of v0.0.5, `src/` is split by responsibility instead of living in one
file:

```
src/
  index.ts            public entry point (exports AnichinScraper + types)
  client/
    Anichin.ts          the AnichinScraper class — one method per endpoint,
                         each just delegates to the matching api/*.ts function
    RequestClient.ts     builds the axios instance: base headers, proxy
                         setup, and wires up the network/ interceptors
  network/
    headers.ts            default request headers + user-agent rotation pool
    retry.ts               rate-limit and retry-with-backoff interceptors
  constants/
    config.ts               default base URL, timeouts, retry/delay values
    version.ts                LIBRARY_VERSION, CREATOR string
  types/                    shared TypeScript interfaces (ApiResponse,
                            ScraperConfig, AdvancedSearchFilter, ...)
  utils/                    small, dependency-free helpers: slug extraction,
                            URL resolution, episode-number formatting,
                            countdown/date formatting, response building
  parser/                   pure functions: (CheerioAPI, ...) -> plain data.
                            No I/O. One file per page type.
  api/                      one file per public endpoint. Fetches the page
                            with the shared client, then calls the matching
                            parser. Takes a ScraperContext instead of `this`.
```

## Why no separate `extractor/` layer

An earlier plan for this refactor had extraction logic split into its own
`extractor/` directory sitting between `api/` and `parser/`. In practice,
"fetch this URL" and "which parser handles the response" are a single
decision per endpoint with no meaningful logic in between, so that layer
was folded into `api/*.ts` directly — each `api/` file both builds the
request and calls its parser. Splitting it out further would have meant a
1:1 pass-through file per endpoint with no real logic in it.

## `ScraperContext`

Every `api/*.ts` function takes a `ScraperContext`:

```ts
interface ScraperContext {
    client: any;     // the shared axios instance
    baseUrl: string;
}
```

instead of being a method on a class. `AnichinScraper` (in
`client/Anichin.ts`) is a thin wrapper: it builds one `ScraperContext` in
its constructor and every public method is a one-line delegate:

```ts
async watch(slug: string, episode: number): Promise<ApiResponse> {
    return api.fetchWatch(this.ctx, slug, episode);
}
```

This means every endpoint's logic can be unit tested by calling the
`api/*.ts` function directly with a fake `{ client, baseUrl }`, without
constructing a real `AnichinScraper` or making a real HTTP request — see
`test/api/watch.test.ts` for an example.

## Shared parsers

A few endpoints share near-identical markup on Anichin's side, so their
parsing logic is centralized instead of duplicated:

- `parser/card.ts` — the `.bsx` card used in every listing grid (home,
  ongoing, completed, search, genres, studio, network, country).
- `parser/taxonomyListing.ts` + `api/taxonomy.ts` — the genre/studio/
  network/country pages share one page layout; `api/genre.ts`,
  `api/studio.ts`, `api/network.ts`, and `api/country.ts` are each a few
  lines that just supply the URL pattern and field name to
  `fetchTaxonomyListing`.
- `api/simpleListing.ts` — the plain `.listupd article.bs` grid shared by
  `ongoing`, `completed`, and `azlist`.

## Where the v0.0.5 fix lives

The `watch()` completed-episode fix (see
[request.md](./request.md#watch-and-the-tamat-fallback)) touches exactly
two files: `src/api/watch.ts` (the two-URL-attempt request logic) and
`src/utils/slug.ts` (so slugs extracted from a `-tamat-` URL — e.g. in
`related_episodes` links on other watch pages — resolve correctly). No
other endpoint's code changed.
