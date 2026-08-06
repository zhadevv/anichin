const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || 'tencent-video';
    const res = await scraper.network(slug, 1);
    await saveResponse(`response_examples/networks/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
