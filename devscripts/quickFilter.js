const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const res = await scraper.quickfilter();
    await saveResponse('response_examples/quickfilter/quickfilter.json', res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
