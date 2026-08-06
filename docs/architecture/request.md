# Request Layer

## `client/RequestClient.ts`

`createRequestClient(config)` builds one axios instance per
`AnichinScraper` and returns `{ client, baseUrl }`. It is the only place
that touches axios directly.

- **Headers** (`network/headers.ts`) — a browser-like header set
  (`Accept`, `Accept-Language`, `Sec-Fetch-*`, `Referer`, `Origin`, etc.)
  is attached to every request, seeded from `DEFAULT_USER_AGENTS` unless
  `config.userAgent` is set.
- **`validateStatus: status < 500`** — a 4xx response resolves normally
  instead of throwing. This is deliberate: `watch()` depends on being able
  to inspect a 404 response directly rather than catching an axios error,
  to decide whether to retry with the `-tamat-` URL.
- **Proxy** (`config.proxy`) — when set, builds an `HttpsProxyAgent` or
  `SocksProxyAgent` (depending on `protocol`) and attaches it as both
  `httpAgent` and `httpsAgent`.

## `network/retry.ts`

Two interceptors are attached to every client:

- **Rate limiting** (request interceptor) — before each request, waits out
  whatever's left of `requestDelay` since the last request made by this
  client, then rotates the `User-Agent` header via `getRandomUserAgent()`.
- **Retry** (response interceptor) — on a rejected request (network error,
  5xx if you've changed `validateStatus`, timeout), retries up to
  `maxRetries` times with a linear backoff (`retryDelay * attemptNumber`
  ms) before letting the rejection propagate.

Neither interceptor retries on a plain 404 — that's a normal, resolved
response under `validateStatus: status < 500`, not a rejection.

## `watch()` and the tamat fallback

This is the behavior added in v0.0.5. Anichin serves the *final* episode
of a completed series at a different URL than every other episode:

| Episode state | URL pattern |
|---|---|
| Ongoing / any non-final episode | `/{slug}-episode-{NN}-subtitle-indonesia/` |
| The final episode of a completed series | `/{slug}-episode-{NN}-tamat-subtitle-indonesia/` |

`api/watch.ts` always tries the regular pattern first:

```ts
let response = await ctx.client.get(regularPath);
let resolvedPath = regularPath;
let isFinalEpisode = false;

if (response.status === 404) {
    const tamatResponse = await ctx.client.get(tamatPath);
    if (tamatResponse.status !== 404) {
        response = tamatResponse;
        resolvedPath = tamatPath;
        isFinalEpisode = true;
    }
}
```

Consequences of this design:

- **Ongoing episodes cost exactly one request** — the common case never
  pays for the fallback. Verified in
  `test/api/watch.test.ts` ("makes only one request when the regular URL
  succeeds").
- **A genuinely final episode costs two requests** — unavoidable, since
  there's no way to know in advance from just `slug` + `episode` whether
  it's the last one without first checking the series detail page (which
  would itself cost a request, and can go stale between the check and the
  watch request if an episode airs in between).
- **A nonexistent episode still costs two requests** before returning
  `success: false` — both URL shapes get a fair try before giving up.

`resolvedPath` is used to build `data.watch.url`, so the response always
reflects the URL that actually served the content — not the URL initially
guessed.

## Why `extractSlug` needed a matching fix

Some parsed fields on other watch pages (e.g. `related_episodes[].url`) can
point at a `-tamat-` URL for a *different* episode. Before v0.0.5,
`extractSlug`'s regex (`/-episode-\d+-subtitle-indonesia.*/`) didn't match
`-tamat-` URLs at all, so the trailing episode segment was left attached to
the "slug" for those specific links. The regex is now
`/-episode-\d+(-tamat)?-subtitle-indonesia.*/`, and `test/utils/slug.test.ts`
covers both URL shapes directly.

## Note: Anichin's WordPress REST API

Anichin runs on WordPress with its default REST API exposed at
`/wp-json/wp/v2/`. Real sample responses are stored in
`test/fixtures/wp-json/` for reference. Two endpoints are notable:

- `GET /wp-json/wp/v2/posts?slug[]=a&slug[]=b` — accepts multiple `slug`
  values and returns only the posts that actually exist, in one request.
  This means the two watch-URL candidates (regular and `-tamat-`) could in
  principle be checked in a single round trip instead of the current
  try-then-fallback sequence.
- `GET /wp-json/wp/v2/posts/{id}` — returns metadata (`slug`, `link`,
  `date`, `categories`) for a specific post id, which lines up with the
  numeric id this library already extracts from the `shortlink` `<link>`
  tag (`?p={id}`) on both `series()` and `watch()` pages.

This library does not use the REST API today — `content.rendered` comes
back empty for these post types (the actual episode/streaming markup only
exists in the rendered HTML page, not the REST payload), so a full switch
to the REST API isn't possible without still scraping the HTML page for
the actual content. It's documented here as a possible future
optimization for the discovery step only — see `ROADMAP.md`.
