# Method Reference

All methods are async and return an `ApiResponse<T>` (see
[GETTING_STARTED.md](./GETTING_STARTED.md#response-shape)). `slug` values are
the path segment Anichin uses for a series/genre/studio/etc — the same
string you get back from any listing method's `.slug` fields.

---

## `sidebar()`

Scrapes the sidebar shown on every Anichin page: quick-filter options,
ongoing series list, popular series (weekly/monthly/all-time), new movies,
genre list, and season list.

```ts
const res = await scraper.sidebar();
res.data.ongoing_series   // Array<{ title, slug, episode, url }>
res.data.popular_series.weekly
res.data.genres
```

## `home(page?)`

- `page` (`number`, default `1`)

Scrapes the homepage: hero slider, "Popular Today", the latest-release
grid, and the tabbed recommendation section.

```ts
const res = await scraper.home(1);
res.data.home.slider
res.data.home.popular_today
res.data.home.latest_release
res.data.home.recommendation.tabs
```

## `search(query, page?)`

- `query` (`string`, required)
- `page` (`number`, default `1`)

```ts
const res = await scraper.search('release that witch', 1);
res.data.search.items      // ListCardItem[]
res.data.search.pagination
```

## `schedule(day?)`

- `day` (`string`, optional) — one of `monday` .. `sunday` (case-insensitive)

Without `day`, returns all seven days keyed by weekday name. With `day`,
returns just that day under the same key.

```ts
const all = await scraper.schedule();
all.data.schedule.monday.list

const mon = await scraper.schedule('monday');
mon.data.monday.list
```

## `ongoing(page?)` / `completed(page?)`

- `page` (`number`, default `1`)

Paginated listing of ongoing / completed series.

```ts
const res = await scraper.ongoing(2);
res.data.lists          // ListCardItem[]
res.data.pagination
```

## `azlist(page?, letter?)`

- `page` (`number`, default `1`)
- `letter` (`string`, optional) — filters to titles starting with that
  letter (e.g. `'A'`)

```ts
const res = await scraper.azlist(1, 'A');
```

## `genres(slug, page?)` / `studio(slug, page?)` / `network(slug, page?)` / `country(slug, page?)`

- `slug` (`string`, required)
- `page` (`number`, default `1`)

Paginated listing of series under a given genre/studio/network/country.
All four share the same response shape:

```ts
const res = await scraper.genres('action', 1);
res.data.genre       // { name, slug, total_pages }  (field name matches the method: genre/studio/network/country)
res.data.lists
res.data.pagination
```

## `season(slug)`

- `slug` (`string`, required) — e.g. `'2025'` or a season+year slug as used
  in Anichin's `/season/{slug}/` URLs

Unlike the other taxonomy methods, the season page is **not paginated**, so
this method takes no `page` argument (see `docs/architecture/project.md`
for why).

```ts
const res = await scraper.season('2025');
res.data.season   // { year, slug }
res.data.lists
```

## `series(slug)`

Full detail page for a single series: cover art, rating, synopsis,
genres, download batches, and the full episode list.

```ts
const res = await scraper.series('release-that-witch');
res.data.detail.title
res.data.detail.episodes            // full episode list
res.data.detail.episode_nav.first_episode
res.data.detail.episode_nav.new_episode
```

## `watch(slug, episode)`

- `slug` (`string`, required)
- `episode` (`number`, required)

Fetches a single episode's watch page: video servers, download links,
episode navigation (prev/all/next), and the parent series summary.

As of v0.0.5, this method automatically detects and follows the URL
Anichin uses for a series' **final** episode (the `-tamat-` URL pattern) —
you don't need to know ahead of time whether `episode` is the last one.

```ts
const res = await scraper.watch('release-that-witch', 8);
res.data.watch.servers
res.data.watch.downloads
res.data.watch.is_final_episode   // true if this episode was served at the "-tamat-" URL
```

See [architecture/request.md](./architecture/request.md#watch-and-the-tamat-fallback)
for details on how the fallback request works.

## `advancedsearch(mode?, filter?, page?)`

- `mode` (`'image' | 'text'`, default `'image'`)
- `filter` (`AdvancedSearchFilter`, optional, image mode only) — see
  [FILTERS.md](./FILTERS.md)
- `page` (`number`, default `1`, image mode only)

```ts
const res = await scraper.advancedsearch('image', {
    status: 'ongoing',
    genres: ['action', 'fantasy'],
    seasons: ['2025'],
});

const az = await scraper.advancedsearch('text');
az.data.results.A     // grouped by first letter
```

## `quickfilter()`

Returns the raw filter option sets (genre/studio/season checkboxes,
status/type/order/sub radios) available on the advanced search page —
useful for building a search UI without hardcoding the option list.

```ts
const res = await scraper.quickfilter();
res.data.checkbox_filters.genre.items
res.data.radio_filters.status.items
```
