## @zhadev/anichin
---

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license">
  <img src="https://img.shields.io/badge/types-TypeScript-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/npm/v/@zhadev/anichin" alt="npm version">
  <img src="https://img.shields.io/npm/dt/@zhadev/anichin" alt="npm downloads">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen" alt="node version">
</p>

**Unofficial [Anichin](https://anichin.cafe) Scraper!**

### Features
- **Api Coverage** - All Anichin pages are neatly wrapped.
- **Multi Platform** - Works in Node.js, Browser, and Typescript.
- **Fast & Efficient** - Built with Axios and Cheerio.
- **Type Safe** - Full Typescript support.
- **Customizable** - Proxy support, rate limiting, retry mechanism, etc.

### Installation
```bash
# npm
npm install @zhadev/anichin

# yarn
yarn add @zhadev/anichin

# pnpm
pnpm add @zhadev/anichin
```

### Quick Start

Node.js / Typescript
```javascript
// ES Module
import AnichinScraper from '@zhadev/anichin';

// CommonJS
const AnichinScraper = require('@zhadev/anichin').default;

// Initialize
const scraper = new AnichinScraper();
```

Browser (via CDN)
```html
<script src="https://cdn.jsdelivr.net/npm/@zhadev/anichin/dist/javascript/browser.min.js"></script>
<script>
  const scraper = new AnichinScraper();
  
  scraper.search('renegade immortal').then(result => {
    console.log(result.data.search.lists);
  });
</script>
```

With Configuration
```javascript
import AnichinScraper from '@zhadev/anichin';

const scraper = new AnichinScraper({
  baseUrl: 'https://anichin.cafe',
  userAgent: 'Custom/1.0',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 1000,
  requestDelay: 500,
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    protocol: 'http',
    auth: {
      username: 'user',
      password: 'pass'
    }
  }
});
```

### Api Reference

- **Constructor Options**
```typescript
interface ScraperConfig {
  baseUrl?: string;           // Base URL (default: 'https://anichin.cafe')
  userAgent?: string;         // Custom User-Agent
  timeout?: number;           // Request timeout in ms (default: 30000)
  maxRetries?: number;        // Max retry attempts (default: 3)
  retryDelay?: number;        // Delay between retries in ms (default: 1000)
  requestDelay?: number;      // Delay between requests in ms (default: 1000)
  proxy?: {                   // Proxy configuration
    host: string;
    port: number;
    protocol?: 'http' | 'https' | 'socks' | 'socks5';
    auth?: {
      username: string;
      password: string;
    };
  };
}
```

- **All Methods**
```javascript
// sidebar
const sidebar = await scraper.sidebar(); // returns quickfilter, popular series, ongoing series, etc.

// home
const home = await scraper.home(page?: number) // returns slider, latest release, popular today, recommendation, etc.

// search
const search = await scraper.search(query: string, page?: number); // returns query to search result.

// series detail
const detail = await scraper.series(slug: string); // returns full series info, episodes, download batch, etc.

// watching
const episode = await scraper.watch(slug: string, episodeNumber: number); // returns video servers, download links, episode navigation, etc.

// schedule
  // all days
  const schedule = await scraper.schedule();
  // specific day
  const monday = await scraper.schedule('monday'); // available: monday, tuesday, wednesday, thursday, friday, saturday, sunday

// lists
  // ongoing series
  const ongoing = await scraper.ongoing(page?: number);
  // completed series
  const completed = await scraper.completed(page?: number);
  // a-z List
    // all
    const azlist = await scraper.azlist(page?: number);
    // specific letter
    const azlist = await scraper.azlist(page?: number, letter?: string); // example: await scraper.azlist(1, 'A')

// categories
  // genres
  const action = await scraper.genres(slug: string, page?: number); // example: scrape.genres('action', 1)
  // seasons
  const winter2024 = await scraper.season(slug: string); // example: scrape.season('winter-2025')
  // studio
  const studio = await scraper.studio(slug: string, page?: number); // example: scrape.studio('motion-magic', 1)
  // networks
  const network = await scraper.network(slug: string, page?: number); // example: scrape.network('iqiyi', 1)
  // countries
  const country = await scraper.country(slug: string, page?: number); // example: scrape.country('china', 1)

// advanced search (search donghua by filters)
// text mode (a-z listing)
  const textMode = await scraper.advancedsearch('text');
// image mode
  // without filters
  const imageMode = await scraper.advancedsearch('image', page?: number);
  // with filters
  const filters = {
    status: 'ongoing',
    type: 'ona',
    order: 'latest',
    sub: 'sub',
    genres: ['action', 'adventure'],
    studios: ['studio-1', 'studio-2'],
    seasons: ['fall-2025'],
    per_page: 24
  };
  const imageMode = await scraper.advancedsearch('image', filters, page?: number);
  
// quick filter (available value for advanced search with filter)
const filters = await scraper.quickfilter(); // returns all available filter options for advanced search
```

### Response Format
All methods return a standardized response:
```typescript
interface ApiResponse {
  success: boolean;           // Whether the request was successful
  creator: string;           // Creator name ('zhadevv')
  data: any;                // The scraped data
  message: string | null;  // Error message if any
}
```

### Response Example
- All Response Example in [here](https://github.com/zhadevv/anichin/tree/main/response_examples).

Home:
```json
{
  "success": true,
  "creator": "zhadevv",
  "data": {
    "home": {
      "slider": [
        {
          "title": "Against the Sky Supreme",
          "slug": "against-the-sky-supreme",
          "thumbnail": "https://...",
          "description": "Donghua description...",
          "url": "https://anichin.cafe/seri/against-the-sky-supreme/"
        }
      ],
      "popular_today": [...],
      "latest_release": [...],
      "recommendation": {...}
    }
  },
  "metadata": {},
  "message": null
}
```

Watch:
```json
{
  "success": true,
  "creator": "zhadevv",
  "data": {
    "watch": {
      "title": "Against the Sky Supreme Episode 100",
      "slug": "against-the-sky-supreme",
      "episode_number": "100",
      "servers": [
        {
          "server_id": "0",
          "server_name": "Server 1",
          "server_url": "embed_url_here"
        }
      ],
      "downloads": [
        {
          "title": "Download Episode 100",
          "qualities": [
            {
              "quality": "480p",
              "links": [
                {
                  "name": "Google Drive",
                  "url": "download_url"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "metadata": {},
  "message": null
}
```

### Usage

Error Handling
```javascript
try {
  const result = await scraper.series('non-existent-slug');
  if (!result.success) {
    console.error('Error:', result.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

Pagination
```javascript
// Get page 2 of ongoing series
const ongoing = await scraper.ongoing(2);
// Navigate through search results
const search1 = await scraper.search('donghua', 1);
const search2 = await scraper.search('donghua', 2);
```

TypeScript Example
```typescript
import AnichinScraper, { ApiResponse } from '@zhadev/anichin';

const scraper = new AnichinScraper();

async function getDonghuaInfo(slug: string): Promise<void> {
  const response: ApiResponse = await scraper.series(slug);
  
  if (response.success) {
    const data = response.data.detail;
    console.log(`Title: ${data.title}`);
    console.log(`Episodes: ${data.episodes.length}`);
    console.log(`Genres: ${data.genres.map(g => g.name).join(', ')}`);
  }
}

getDonghuaInfo('swallowed-star');
```

### Compatibility
Supported Platforms
- Node.js: 16.0.0 or higher
- Browsers: Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+
- Frameworks: React, Vue, Angular, Svelte, Next.js, Nuxt.js

Build Targets
```json
{
  "cjs": "CommonJS for Node.js",
  "esm": "ES Modules for modern bundlers",
  "types": "TypeScript definitions",
  "browser": "UMD bundle for browsers"
}
```

### Project Structure
```
@zhadev/anichin/
├── src/
│   └── Anichin.ts          # Main library source
├── dist/
│   ├── cjs/                # CommonJS build
│   ├── esm/                # ES Module build
│   ├── types/              # TypeScript definitions
│   └── javascript/         # Browser bundles
├── examples/               # Usage examples
├── tests/                  # Test suite
├── package.json
├── tsconfig.json
└── README.md
```

### Important Notes
1. Educational Purpose: This library is for educational purposes only
2. Respect ToS: Always respect the website's Terms of Service
3. Rate Limiting: Implement proper delays to avoid overloading servers
4. Caching: Cache responses to reduce repeated requests
5. Legal Use: Use responsibly and comply with applicable laws

### Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

### Development Setup
```bash
# Clone the repository
git clone https://github.com/zhadevv/anichin.git
cd anichin

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

### License
This project is licensed under the MIT License.
```
MIT License

Copyright (c) 2025 zhadevv

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Links
- NPM Package: [@zhadev/anichin](https://www.npmjs.com/package/@zhadev/anichin?activeTab=readme)
- GitHub Repository: [zhadevv/anichin](https://github.com/zhadevv/anichin/tree/main)
- Issue Tracker: [GitHub Issues](https://github.com/zhadevv/anichin/issues)
- Change Log: [Changelogs](https://github.com/zhadevv/anichin/blob/main/CHANGELOG.md)

### Acknowledgements
- [Anichin](https://anichin.cafe) - For providing the content
- [Axios](https://axios-http.com) - Promise based HTTP client
- [Cheerio](https://cheerio.js.org) - Fast, flexible HTML parsing
- All contributors and users of this library
---
Disclaimer: This library is not affiliated with, maintained, authorized, endorsed or sponsored by Anichin or any of its affiliates. Use at your own risk.
