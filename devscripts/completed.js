const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const res = await scraper.completed(1);
    await saveResponse('response_examples/completed/page-1.json', res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
