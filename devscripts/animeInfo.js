const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || 'release-that-witch';
    const res = await scraper.series(slug);
    await saveResponse(`response_examples/anime/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
