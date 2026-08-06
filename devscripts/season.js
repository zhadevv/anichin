const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || '2025';
    const res = await scraper.season(slug);
    await saveResponse(`response_examples/seasons/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
