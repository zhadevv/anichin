const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || 'action';
    const res = await scraper.genres(slug, 1);
    await saveResponse(`response_examples/genres/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
