# Parser Layer

Everything in `src/parser/` follows the same shape:

```ts
function parseX($: CheerioAPI, baseUrl: string, ...args): X
```

- No I/O. A parser never makes a request or touches the filesystem — it
  only reads from an already-loaded `$` (a Cheerio document) and returns
  plain data.
- No knowledge of HTTP status codes, retries, or which URL was requested —
  that's the `api/` layer's job. A parser is handed a loaded document and
  whatever context it needs (e.g. `watch`'s `resolvedPath`/`isFinalEpisode`)
  to fill in fields it can't derive from the markup itself.
- This makes every parser directly unit-testable against a static HTML
  fixture with no mocking — see `test/parser/*.test.ts`, which load real
  captured pages from `test/fixtures/`.

## File map

| File | Powers |
|---|---|
| `card.ts` | The `.bsx` listing card shared by most grids |
| `pagination.ts` | The `.pagination` / `.hpage` widget |
| `taxonomyListing.ts` | genre/studio/network/country listing pages |
| `home.ts` | Homepage: slider, popular today, latest release, recommendations |
| `schedule.ts` | One weekday's release list on `/schedule/` |
| `season.ts` | A `/season/{slug}/` page's card grid |
| `series.ts` | A `/seri/{slug}/` detail page |
| `watch.ts` | A single episode watch page (video servers, downloads, nav) |
| `sidebar.ts` | The `#sidebar` widget present on every page |
| `quickFilter.ts` | The filter checkbox/radio groups on the search page |
| `advancedSearch.ts` | Both advanced-search result modes (image grid / text index) |

## Shared helpers

Parsers lean on `src/utils/` rather than re-implementing common logic:

- `utils/slug.ts` — turns any Anichin URL into its slug, including the
  `-tamat-` episode URL variant (see
  [request.md](./request.md#why-extractslug-needed-a-matching-fix)).
- `utils/url.ts` — resolves a possibly-relative `href` against `baseUrl`.
- `utils/number.ts` — episode number padding/extraction.
- `utils/date.ts` — countdown-seconds and unix-timestamp formatting used
  by the schedule parser.

## Adding a new parser

1. Add the fixture HTML to `test/fixtures/` (a real captured page, not a
   hand-written approximation, wherever possible — see
   `test/fixtures/watch/` and `test/fixtures/series/` for examples).
2. Write `parser/yourThing.ts` exporting a pure `parseYourThing($, baseUrl, ...)`.
3. Write `test/parser/yourThing.test.ts` against the fixture.
4. Add `api/yourThing.ts` that fetches the right URL and calls the parser.
5. Wire it into `client/Anichin.ts` and `src/api/index.ts`.
