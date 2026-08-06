# Pagination

Most listing methods (`home`, `search`, `ongoing`, `completed`, `azlist`,
`genres`, `studio`, `network`, `country`) return a `pagination` object
shaped like this (`PaginationData` in `src/types/common.ts`):

```ts
interface PaginationData {
    current_page: number;
    total_pages: number;
    has_prev: boolean;
    has_next: boolean;
    prev: { url: string; text: string };
    next: { url: string; text: string };
    pages: Array<{ number: number; url: string; is_current: boolean }>;
}
```

This is parsed directly from Anichin's pagination widget, so `total_pages`
reflects only the page numbers actually rendered on the current page (WordPress
themes commonly render a window around the current page rather than every
page number) — treat it as "at least this many pages", and use `has_next`
to decide whether to keep paging rather than looping to a hardcoded
`total_pages`.

```ts
let page = 1;
const allItems = [];

while (true) {
    const res = await scraper.ongoing(page);
    if (!res.success) break;
    allItems.push(...res.data.lists);
    if (!res.data.pagination.has_next) break;
    page++;
}
```

## Methods without pagination

- `season(slug)` has no `page` parameter — Anichin's season pages are not
  paginated (see [METHODS.md](./METHODS.md#seasonslug)).
- `schedule()` and `sidebar()` are single-page scrapes and have no
  pagination at all.
- `advancedsearch('text')` returns every result grouped alphabetically in
  one response, with no pagination.
