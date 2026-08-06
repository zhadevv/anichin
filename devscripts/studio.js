const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const slug = process.argv[2] || 'motion-magic';
    const res = await scraper.studio(slug, 1);
    await saveResponse(`response_examples/studios/${slug}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
