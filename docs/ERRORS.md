# Error Handling

This library never throws for an HTTP-level failure (404, 500, timeout,
etc.) — every method resolves to an `ApiResponse` with `success: false` and
a human-readable `message` instead. This keeps calling code simple: check
`success`, don't wrap every call in try/catch for expected failure modes.

```ts
const res = await scraper.series('a-slug-that-does-not-exist');
if (!res.success) {
    console.error(res.message);
    return;
}
console.log(res.data.detail.title);
```

## Where errors come from

`buildResponse` / `handleError` (`src/utils/response.ts`) produce the
failure envelope. There are two sources:

1. **A caught exception** — network error, DNS failure, timeout, or a
   parsing exception. `message` is `Failed to <context>: <error.message>`.
2. **An explicit not-found check** — currently only `watch()`, which
   returns `Episode {NN} for "{slug}" was not found (tried both the
   regular and the tamat/completed URL formats)` when both the regular and
   `-tamat-` URLs 404. See
   [architecture/request.md](./architecture/request.md#watch-and-the-tamat-fallback).

## What can still throw

A `try/catch` around a call is still worth having for:

- Programming errors (e.g. calling `scraper.watch(slug, NaN)`).
- `AnichinScraper` construction itself, if you pass a malformed `proxy`
  config that `https-proxy-agent`/`socks-proxy-agent` rejects synchronously.

Every method's internal HTTP call and parse step, however, is already
wrapped — a scrape failure will not throw past the method boundary.

## Retries

Network-level failures (not 4xx/5xx HTTP responses — those resolve
normally per `validateStatus: status < 500`) are retried automatically up
to `maxRetries` times with a linear backoff of `retryDelay * attemptNumber`
ms, before the error is allowed to propagate into the failure envelope.
Configure both in the constructor — see
[GETTING_STARTED.md](./GETTING_STARTED.md#configuring-the-client).
