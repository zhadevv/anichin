const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const res = await scraper.schedule();
    await saveResponse('response_examples/schedule/full-week.json', res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
