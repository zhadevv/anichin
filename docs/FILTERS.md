# Advanced Search Filters

`scraper.advancedsearch('image', filter, page)` accepts an
`AdvancedSearchFilter` object (see `src/types/filters.ts`). Every field is
optional — pass only what you need.

```ts
interface AdvancedSearchFilter {
    status?: string;      // e.g. 'ongoing' | 'completed'
    type?: string;        // e.g. 'donghua' | 'movie'
    order?: string;       // e.g. 'latest' | 'popular' | 'az' | 'za'
    sub?: string;         // e.g. 'subtitle-indonesia'
    genres?: string[];    // e.g. ['action', 'fantasy']
    studios?: string[];   // e.g. ['motion-magic']
    seasons?: string[];   // e.g. ['2025']
    per_page?: number;
}
```

The exact set of valid `status` / `type` / `order` / `sub` / `genres` /
`studios` / `seasons` values changes over time on Anichin's end and isn't
hardcoded in this library — call `quickfilter()` to get the current live
option list instead of guessing:

```ts
const options = await scraper.quickfilter();
options.data.checkbox_filters.genre.items     // [{ value, label }, ...]
options.data.radio_filters.status.items
options.data.radio_filters.order.items
```

Use the `.value` field from those items as the values you pass into
`AdvancedSearchFilter`.

## Example

```ts
const res = await scraper.advancedsearch('image', {
    status: 'ongoing',
    genres: ['action', 'fantasy'],
    seasons: ['2025'],
    per_page: 24,
}, 1);
```

`genres`, `studios`, and `seasons` are sent as repeated query params
(`genre[]=action&genre[]=fantasy`), matching how Anichin's own filter form
submits multi-select fields.

## Text mode

`advancedsearch('text')` ignores `filter` and `page` entirely — it scrapes
Anichin's list-mode page (`/seri/list-mode/`), which returns every series
grouped alphabetically rather than paginated:

```ts
const res = await scraper.advancedsearch('text');
res.data.results.A   // series whose titles start with "A"
res.data.results.hash // series grouped under "#" (non-alphabetic titles)
```
