# Documentation

- [Getting Started](./GETTING_STARTED.md) — install, configure, first request
- [Method Reference](./METHODS.md) — every `AnichinScraper` method
- [Filters](./FILTERS.md) — `advancedsearch()` filter object
- [Pagination](./PAGINATION.md) — how paging works across methods
- [Errors](./ERRORS.md) — the `ApiResponse` failure envelope
- [FAQ](./FAQ.md)
- [Migrating to v0.0.5](./MIGRATION-0.0.5.md) — internal restructure + the `watch()` fix
- Architecture
  - [project.md](./architecture/project.md) — how `src/` is organized and why
  - [request.md](./architecture/request.md) — the HTTP client, retries, and the `watch()` tamat fallback
  - [parser.md](./architecture/parser.md) — how HTML gets turned into data
