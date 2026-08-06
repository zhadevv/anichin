const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || 'china';
    const res = await scraper.country(slug, 1);
    await saveResponse(`response_examples/countries/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
