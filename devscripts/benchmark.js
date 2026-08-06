const { createScraper } = require('./_shared');

// Rough timing check for each endpoint against the live site. Not a
// substitute for real load testing — just a quick way to notice a request
// that regressed badly after a change to a parser or the request layer.
const CASES = [
    { name: 'sidebar', run: scraper => scraper.sidebar() },
    { name: 'home', run: scraper => scraper.home(1) },
    { name: 'ongoing', run: scraper => scraper.ongoing(1) },
    { name: 'completed', run: scraper => scraper.completed(1) },
    { name: 'search', run: scraper => scraper.search('release that witch', 1) },
    { name: 'series', run: scraper => scraper.series('release-that-witch') },
    { name: 'watch (regular)', run: scraper => scraper.watch('release-that-witch', 1) },
];

async function main() {
    const scraper = createScraper();
    const results = [];

    for (const testCase of CASES) {
        const start = Date.now();
        const res = await testCase.run(scraper);
        const elapsedMs = Date.now() - start;
        results.push({ name: testCase.name, success: res.success, elapsedMs });
        console.log(`${testCase.name.padEnd(20)} ${res.success ? 'ok  ' : 'FAIL'} ${elapsedMs}ms`);
    }

    const successful = results.filter(r => r.success);
    const avg = successful.reduce((sum, r) => sum + r.elapsedMs, 0) / (successful.length || 1);
    console.log(`\nAverage (successful calls): ${avg.toFixed(0)}ms`);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
