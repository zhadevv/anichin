# Contributing

## Setup

```
git clone https://github.com/zhadevv/anichin.git
cd anichin
npm install
```

## Project layout

See `docs/architecture/project.md` for the full breakdown. In short:
`src/api/*.ts` fetches a page and calls a matching `src/parser/*.ts`, which
turns the loaded HTML into plain data. `src/client/Anichin.ts` is a thin
class wrapping `src/api/*`.

## Making a change to a parser

1. Grab a real HTML sample of the page you're changing (from your browser's
   "View Source", or by temporarily logging `response.data` from the
   relevant `api/*.ts` file). Save it under `test/fixtures/`.
2. Update the parser in `src/parser/`.
3. Add or update the matching test in `test/parser/` against the fixture.
4. Run `npm run test:unit` and `npm run typecheck`.

## Making a change to an endpoint's request logic

Request/retry/rate-limit behavior lives in `src/client/RequestClient.ts`
and `src/network/`. If you're changing how a specific endpoint builds its
URL or handles a status code (like the `watch()` tamat fallback), that
logic belongs in the matching `src/api/*.ts` file — see
`src/api/watch.ts` for the reference example, and
`test/api/watch.test.ts` for how to test it with a fake `client` instead
of hitting the live site.

## Running things locally

- `npm run test:unit` — runs `test/**/*.test.ts` via `tsx --test`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` / `npm run format`
- `tsx examples/<name>.ts` — run a single example against the live site
- `node devscripts/<name>.js` — same, but also saves the response under
  `response_examples/`
- `npm run smoke` — quick live health check (just the homepage)
- `npm run benchmark` — rough timing across endpoints against the live site

Note: examples, devscripts, `smoke`, and `benchmark` all make real requests
to `https://anichin.cafe`. The unit test suite (`npm run test:unit`) does
not — it runs entirely against local fixtures and fake HTTP clients.

## Commit / PR conventions

- Keep parser changes and unrelated refactors in separate PRs where
  possible — it makes it much easier to tell what actually changed
  behavior.
- If a change is a response-shape change (new/removed/renamed field),
  call it out explicitly in the PR and add a `CHANGELOG.md` entry.
- See `.github/PULL_REQUEST_TEMPLATE.md` for the checklist applied to
  every PR.

## Code style

- Formatted with Prettier (`npm run format`), linted with ESLint
  (`npm run lint`) — both configured in `.prettierrc` / `.eslintrc.json`.
- No `/* */` block comments, no `#` comments, no HTML comments — use `//`
  line comments only.
- No placeholder/mock/dummy implementations. If a piece of markup can't be
  parsed without a real sample to test against, open an issue with the
  page URL instead of guessing at the shape.
