const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const query = process.argv[2] || 'release that witch';
    const res = await scraper.search(query, 1);
    await saveResponse(`response_examples/search/${query.replace(/\s+/g, '-')}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
