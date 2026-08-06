const { saveResponse, createScraper } = require('./_shared');

async function main() {
    const scraper = createScraper();

    const textMode = await scraper.advancedsearch('text');
    await saveResponse('response_examples/advanced_search/text-mode.json', textMode);

    const imageMode = await scraper.advancedsearch('image', { status: 'ongoing' }, 1);
    await saveResponse('response_examples/advanced_search/image-mode-ongoing.json', imageMode);
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
