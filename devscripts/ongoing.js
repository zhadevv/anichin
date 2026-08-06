const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const res = await scraper.ongoing(1);
    await saveResponse('response_examples/ongoing/page-1.json', res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
