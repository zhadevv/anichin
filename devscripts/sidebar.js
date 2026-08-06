const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();
    const res = await scraper.sidebar();
    await saveResponse('response_examples/sidebar/sidebar.json', res);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
