# Getting Started

## Install

```
npm install @zhadev/anichin
```

## Basic usage

```ts
import AnichinScraper from '@zhadev/anichin';

const scraper = new AnichinScraper();

async function main() {
    const home = await scraper.home(1);
    console.log(home.data.home.latest_release.length, 'items on page 1');
}

main();
```

## Configuring the client

`new AnichinScraper(config)` accepts an optional config object. Every field
is optional; the defaults live in `src/constants/config.ts`.

```ts
const scraper = new AnichinScraper({
    baseUrl: 'https://anichin.cafe',   // default
    timeout: 30000,                     // ms, default 30000
    maxRetries: 3,                      // default 3
    retryDelay: 1000,                   // ms, base backoff, default 1000
    requestDelay: 1000,                 // ms, min gap between requests, default 1000
    userAgent: 'my-custom-agent/1.0',   // overrides the default rotation seed
    proxy: {
        host: '127.0.0.1',
        port: 8080,
        protocol: 'http',               // 'http' | 'https' | 'socks' | 'socks5'
        auth: { username: 'user', password: 'pass' },
    },
});
```

- `requestDelay` is enforced client-side between consecutive requests made
  through the same `AnichinScraper` instance, to avoid hammering Anichin.
- `maxRetries` / `retryDelay` control automatic retry-with-backoff on failed
  requests (network errors or a rejected promise from axios); a 404 is
  **not** retried, since `watch()` relies on 404 to detect that it should
  try the tamat URL variant instead.

## Response shape

Every method returns a promise resolving to the same envelope:

```ts
interface ApiResponse<T> {
    success: boolean;
    creator: string;
    data: T | null;
    metadata: any;
    message: string | null;   // set when success is false
}
```

Check `success` before reading `data`. See [ERRORS.md](./ERRORS.md) for the
failure cases each method can return.

## Next steps

- [METHODS.md](./METHODS.md) — full method reference
- [FILTERS.md](./FILTERS.md) — `advancedsearch()` filter object reference
- [PAGINATION.md](./PAGINATION.md) — how pagination is shaped across methods
- [architecture/project.md](./architecture/project.md) — how the library is organized internally
