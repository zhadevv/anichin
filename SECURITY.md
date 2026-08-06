# Security Policy

## Supported versions

Only the latest published version on npm receives fixes. This library has
no long-term-support branches.

## Reporting a vulnerability

If you find a security issue (for example: SSRF risk in how a URL or
proxy config is handled, prototype pollution in response parsing, or a
ReDoS-prone regex), please report it privately rather than opening a
public issue:

- Open a [GitHub Security Advisory](https://github.com/zhadevv/anichin/security/advisories/new)
  on the repository, or
- Email the maintainer directly if you can't access advisories.

Please include:

- The version affected
- A minimal reproduction (input that triggers the issue)
- The impact as you understand it

You should get an acknowledgment within a few days. This is a small,
single-maintainer project — please be patient with turnaround time on a
fix, but reports won't be ignored.

## Scope notes

This library scrapes a third-party website (anichin.cafe) and does not
handle user authentication, payments, or personal data beyond what you
choose to pass in as search queries. The main realistic risk surface is:

- The `proxy` config (`ScraperConfig.proxy`) — passed straight into
  `https-proxy-agent`/`socks-proxy-agent`
- Regexes used in `src/utils/slug.ts` and elsewhere — run only against
  HTML fetched from `baseUrl`, not arbitrary user input, under normal use
