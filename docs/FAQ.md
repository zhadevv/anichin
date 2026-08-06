# FAQ

**Does this library make any requests I didn't ask for?**
No. Each method issues exactly the HTTP request(s) needed for that call.
The one exception is `watch()`, which issues a second request only when
the first one 404s (see
[architecture/request.md](./architecture/request.md#watch-and-the-tamat-fallback)) —
it never issues a request speculatively.

**Why did `watch()` return `success: false` for an episode I know exists?**
Check `res.message`. If it says both the regular and tamat URL formats
were tried, either the episode number is wrong, the series slug is wrong,
or Anichin genuinely doesn't have that episode yet. If it's a generic
`Failed to parse watch: ...` message, it's likely a network-level issue —
check your `timeout`/`proxy` config.

**Can I use this in the browser?**
The package ships a browser bundle (`dist/javascript/browser.js` /
`browser.min.js`, see the `browser`/`unpkg`/`jsdelivr` fields in
`package.json`) that exposes `window.AnichinScraper`. Note that scraping
Anichin directly from a browser will generally be blocked by CORS unless
you proxy the requests through your own backend.

**Does it respect `robots.txt`?**
This library does not read or enforce `robots.txt` itself. Configure
`requestDelay` conservatively and use it responsibly.

**Why does `season()` not take a `page` argument, unlike the other
taxonomy methods?**
Anichin's `/season/{slug}/` pages render every series in the season on one
page with no pagination widget — there's nothing to paginate. See
[PAGINATION.md](./PAGINATION.md#methods-without-pagination).

**Is the response shape stable across versions?**
Within a major/minor version, yes — see `CHANGELOG.md` for what changed in
each release. v0.0.5 is fully backward-compatible with v0.0.4 aside from
the new `is_final_episode` field, which is additive.
