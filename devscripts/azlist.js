const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const letter = process.argv[2];
    const res = await scraper.azlist(1, letter);
    await saveResponse(`response_examples/azlist/${letter || 'all'}.json`, res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
