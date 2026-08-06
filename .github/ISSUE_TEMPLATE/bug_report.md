---
name: Bug report
about: Something scraped incorrectly, or a method threw/returned success:false unexpectedly
title: "[BUG] "
labels: bug
---

**Method and arguments**
e.g. `scraper.watch('release-that-witch', 8)`

**Expected behavior**
What you expected `data` to contain.

**Actual behavior**
What you got instead. If `success` was `false`, include the full
`message` field.

**Library version**
Output of `require('@zhadev/anichin/package.json').version` or the version
pinned in your `package.json`.

**Anichin URL involved (if known)**
The specific page this maps to on anichin.cafe, if you know it — this
speeds up reproducing a markup change on Anichin's end.

**Additional context**
Anything else relevant — was this working before and just broke? Does it
happen for every slug/episode, or just one?
